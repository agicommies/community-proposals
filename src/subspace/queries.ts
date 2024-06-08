import { useQueries, useQuery } from "@tanstack/react-query";
import { type ApiPromise } from "@polkadot/api";
import type { Header } from "@polkadot/types/interfaces";
import type { ApiDecoration } from "@polkadot/api/types";
import type { Codec } from "@polkadot/types/types";
import type { StorageKey } from "@polkadot/types/primitive";
import { type AnyTuple } from "@polkadot/types/types";
import {
  type Proposal,
  parse_proposal,
  parse_daos,
  type Dao,
  type Entry,
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type CustomProposalData,
  type CustomDataError,
} from "./types";
import { toast } from "react-toastify";
import { build_ipfs_gateway_url, parse_ipfs_uri } from "~/utils/ipfs";
import { type Result } from "~/utils";

export type nullish = null | undefined;
export type PolkaApi = ApiDecoration<"promise">;

// -> Query state freshness time constants

// TODO: benchmark query times

/**
 * Time to consider last block query un-fresh. Half block time is the expected
 * time for a new block at a random point in time, so:
 *
 * block_time / 2  ==  8 seconds / 2  ==  4 seconds
 */
export const LAST_BLOCK_STALE_TIME = (1000 * 8) / 2;

/**
 * Time to consider proposals query state un-fresh. They don't change a lot,
 * only when a new proposal is created and people should be able to see new
 * proposals fast enough.
 *
 * 1 minute (arbitrary).
 */
export const PROPOSALS_STALE_TIME = 1000 * 60;

/**
 * Time to consider stake query state un-fresh. They also don't change a lot,
 * only when people move their stake / delegation. That changes the way votes
 * are computed, but only very marginally for a given typical stake change, with
 * a small chance of a relevant difference in displayed state.
 *
 * 5 minutes (arbitrary).
 */
export const STAKE_STALE_TIME = 1000 * 60 * 5; // 5 minutes (arbitrary)

// -> Last block

/**
 * A bunch of useful values for a specific block, specially the API instance.
 */
interface AtBlock {
  block_header: Header;
  block_number: number;
  block_hash: Uint8Array;
  block_hash_hex: string;
  api: PolkaApi;
}

export async function get_last_block(api: ApiPromise): Promise<AtBlock> {
  const block_header = await api.rpc.chain.getHeader();
  const block_number = block_header.number.toNumber();
  const block_hash = block_header.hash;
  const block_hash_hex = block_hash.toHex();
  const api_at_block = await api.at(block_header.hash);
  return {
    block_header,
    block_number,
    block_hash,
    block_hash_hex,
    api: api_at_block,
  };
}

export function useLastBlock(api: ApiPromise | null) {
  return useQuery({
    queryKey: ["last_block"],
    enabled: api != null,
    queryFn: () => get_last_block(api!),
    staleTime: LAST_BLOCK_STALE_TIME, // data is considered stale after 4 seconds (half block time)
  });
}

// -> Proposals

function useGovernanceData(
  at_block: AtBlock | nullish,
  queryKeySuffix: string,
  queryFn: (
    api: PolkaApi,
  ) => () => Promise<[StorageKey<AnyTuple>, Codec][]> | undefined,
) {
  const api = at_block?.api;
  const block_number = at_block?.block_number;
  return useQuery({
    queryKey: [{ block_number }, queryKeySuffix],
    enabled: api != null,
    queryFn: queryFn(api!),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

export function useProposals(at_block: AtBlock | nullish) {
  return useGovernanceData(
    at_block,
    "proposals",
    (api) => () => api.query.governanceModule?.proposals?.entries(),
  );
}

export function useDaos(at_block: AtBlock | nullish) {
  return useGovernanceData(
    at_block,
    "daos",
    (api) => () => api.query.governanceModule?.curatorApplications?.entries(),
  );
}

interface BaseProposal {
  id: number;
  metadata: string;
}

export function useCustomProposalMetadata(
  kind: "proposal",
  at_block: AtBlock | nullish,
  proposals: BaseProposal[],
) {
  type Output = Awaited<ReturnType<typeof fetch_custom_metadata>>;
  const block_number = at_block?.block_number;
  return useQueries({
    queries: proposals.map((proposal) => {
      const id = proposal.id;
      const metadata_field = proposal.metadata;
      return {
        queryKey: [{ block_number }, "metadata", { kind, id }],
        queryFn: async (): Promise<[number, Output]> => {
          const data = await fetch_custom_metadata(
            "proposal",
            id,
            metadata_field,
          );
          return [id, data];
        },
        staleTime: Infinity,
      };
    }),
    combine: (results) => {
      type ListItem<L> = L extends (infer T)[] ? T : never;
      const outputs = new Map<number, ListItem<typeof results>>();
      results.forEach((result) => {
        const { data } = result;
        if (data != null) {
          const [id] = data;
          outputs.set(id, result);
        } else {
          console.info(
            `Missing result for proposal metadata query for ${kind} ${data}`,
          );
          // alert("Kek");
        }
      });
      return outputs;
    },
  });
}

// -> Voting

export function useNotDelegatingVotingSet(at_block: AtBlock | nullish) {
  const api = at_block?.api;
  const block_number = at_block?.block_number;
  return useQuery({
    queryKey: [{ block_number }, "not_delegating_voting_power"],
    enabled: api != null,
    queryFn: () => api!.query.governanceModule?.notDelegatingVotingPower?.(),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

export function useDaoTreasury(at_block: AtBlock | nullish) {
  const api = at_block?.api;
  const block_number = at_block?.block_number;
  return useQuery({
    queryKey: [{ block_number }, "dao_treasury"],
    enabled: api != null,
    queryFn: () => api!.query.governanceModule?.daoTreasuryAddress?.(),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

export function useSubnetUid(at_block: AtBlock | nullish) {
  const api = at_block?.api;
  const block_number = at_block?.block_number;
  return useQuery({
    queryKey: [{ block_number }, "dao_treasury"],
    enabled: api != null,
    queryFn: () => api!.query.subspaceModule?.n?.entries(),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

export function useStakeTo({ at_block }: { at_block: AtBlock | nullish }) {
  const api = at_block?.api;
  const block_number = at_block?.block_number;
  return useQuery({
    queryKey: [{ block_number }, "dao_treasury"],
    enabled: api != null,
    queryFn: () => api!.query.subspaceModule?.stakeTo?.entries(),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

// -> Handling all queries

export function useSubspaceQueries(api: ApiPromise | null) {
  // Last block with API
  const last_block_query = useLastBlock(api);
  const { data: at_block } = last_block_query;

  // Dao Treasury
  const dao_treasury_query = useDaoTreasury(at_block);
  const { data: dao_treasury } = dao_treasury_query;

  // Not Delegating Voting Power Set
  const not_delegating_voting_set_query = useNotDelegatingVotingSet(at_block);
  const { data: not_delegating_voting_set } = not_delegating_voting_set_query;

  // Netuids
  const netuids_query = useSubnetUid(at_block);
  const { data: netuids } = netuids_query;

  // StakeTo
  const stake_to_query = useStakeTo({ at_block });
  const { data: stake_to } = stake_to_query;

  // Proposals
  const proposals_query = useProposals(at_block);
  const { data: proposal_query, isLoading: is_proposals_loading } =
    proposals_query;
  const [proposals, proposals_errs] = handleProposals(proposal_query);
  for (const err of proposals_errs) {
    console.error(err);
    toast.error(err.message);
  }

  // Daos
  const daos_query = useDaos(at_block);
  const { data: dao_query, isLoading: is_dao_loading } = daos_query;
  const [daos, daos_errs] = handleDaos(dao_query);
  for (const err of daos_errs) {
    console.error(err);
    toast.error(err.message);
  }

  // Custom Metadata
  const custom_metadata_query_map = useCustomProposalMetadata(
    "proposal",
    at_block,
    proposals,
  );
  for (const entry of custom_metadata_query_map.entries()) {
    const [id, query] = entry;
    const { data } = query;
    if (data == null) {
      console.info(`Missing custom proposal metadata for proposal ${id}`);
    }
  }

  interface ProposalWithMeta extends Proposal {
    custom_data?: Result<CustomProposalData, CustomDataError>;
  }

  const proposals_with_meta = proposals.map((proposal): ProposalWithMeta => {
    const id = proposal.id;
    const metadata_query = custom_metadata_query_map.get(id);
    const data = metadata_query?.data;
    if (data == null) {
      return proposal;
    }
    const [, custom_data] = data;
    return { ...proposal, custom_data };
  });

  return {
    last_block_query,
    at_block_api: at_block?.api,
    block_number: at_block?.block_number,

    not_delegating_voting_set_query,
    not_delegating_voting_set,

    netuids_query,
    netuids,

    stake_to_query,
    stake_to,

    proposals_query,
    is_proposals_loading,
    proposals,

    daos_query,
    is_dao_loading,
    daos,

    dao_treasury_query,
    dao_treasury,

    custom_metadata_query_map,
    proposals_with_meta,
  };
}

// -> Data processing functions

export async function fetch_custom_metadata(
  kind: "proposal",
  entry_id: number,
  metadata_field: string,
): Promise<Result<CustomProposalData, CustomDataError>> {
  const cid = parse_ipfs_uri(metadata_field);
  if (cid == null) {
    const message = `Invalid IPFS URI '${metadata_field}' for ${kind} ${entry_id}`;
    console.error(message);
    return { Err: { message } };
  }

  const url = build_ipfs_gateway_url(cid);
  const response = await fetch(url);
  const obj: unknown = await response.json();

  const schema = CUSTOM_PROPOSAL_METADATA_SCHEMA;
  const validated = schema.safeParse(obj);

  if (!validated.success) {
    const message = `Invalid metadata for ${kind} ${entry_id} at ${url}`;
    console.error(message, validated.error.issues);
    return { Err: { message } };
  }

  return { Ok: validated.data };
}

function handleEntries<T>(
  rawEntries: Entry<Codec>[] | undefined,
  parser: (value: Codec) => T | null,
): [T[], Error[]] {
  const entries: T[] = [];
  const errors: Error[] = [];
  for (const entry of rawEntries ?? []) {
    const [, value_raw] = entry;
    const parsedEntry = parser(value_raw);
    if (parsedEntry == null) {
      errors.push(new Error(`Invalid entry: ${entry.toString()}`));
      continue;
    }
    entries.push(parsedEntry);
  }
  entries.reverse();
  return [entries, errors];
}

// Specific handlers using the generic function

export function handleProposals(
  rawProposals: Entry<Codec>[] | undefined,
): [Proposal[], Error[]] {
  return handleEntries(rawProposals, parse_proposal);
}

export function handleDaos(
  rawDaos: Entry<Codec>[] | undefined,
): [Dao[], Error[]] {
  return handleEntries(rawDaos, parse_daos);
}

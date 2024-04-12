import { match } from "rustie";
import {
  type Proposal,
  type CustomProposalMetadata,
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type ProposalState,
} from "./types";
import { parse_ipfs_uri, build_ipfs_gateway_url } from "./utils/ipfs";

export async function handle_custom_proposal_data(
  proposal: Proposal,
  data: string,
): Promise<CustomProposalMetadata | null> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    console.error(`Invalid IPFS URI ${data} for proposal ${proposal.id}`);
    return null;
  }
  const url = build_ipfs_gateway_url(cid);
  // TODO: render metadata loading failure

  const response = await fetch(url);
  const validated = CUSTOM_PROPOSAL_METADATA_SCHEMA.safeParse(
    await response.json(),
  );
  if (!validated.success) {
    console.error(
      `Invalid proposal data for proposal ${proposal.id} at ${url}`,
      validated.error.issues,
    );
    console.error();
    return null;
  }
  const metadata = validated.data;
  return metadata;
}

export async function handle_proposals(
  proposals: Proposal[],
  handler: (id: number, proposal_state: ProposalState) => void,
) {
  for (const proposal of proposals) {
    // const variant = flatten_enum(proposal.data);
    void match(proposal.data)({
      custom: async function (data: string) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return;
        }
        const proposal_state: ProposalState = {
          ...proposal,
          custom_data: metadata,
        };
        handler(proposal.id, proposal_state);
      },
      subnetCustom: async function ({
        // netuid,
        data,
      }: {
        netuid: number;
        data: string;
      }) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return;
        }
        const proposal_state: ProposalState = {
          ...proposal,
          custom_data: metadata,
        };
        handler(proposal.id, proposal_state);
      },
      globalParams: async function (/*v: unknown*/) {
        // ignore
      },
      subnetParams:
        async function (/*v: { netuid: number; params: unknown }*/) {
          // ignore
        },
    });
  }
}

export function get_proposal_netuid(proposal: Proposal): number | null {
  return match(proposal.data)({
    custom: function (/*v: string*/): null {
      return null;
    },
    globalParams: function (/*v: unknown*/): null {
      return null;
    },
    subnetParams: function ({ netuid }): number {
      return netuid;
    },
    subnetCustom: function ({ netuid }): number {
      return netuid;
    },
  });
}

export function is_proposal_custom(proposal: Proposal): boolean {
  return match(proposal.data)({
    custom: function (/*v: string*/): boolean {
      return true;
    },
    globalParams: function (/*v: unknown*/): boolean {
      return false;
    },
    subnetParams: function (/*{ netuid }*/): boolean {
      return false;
    },
    subnetCustom: function (/*{ netuid }*/): boolean {
      return true;
    },
  });
}

export interface ProposalStakeInfo {
  stake_for: number;
  stake_against: number;
  stake_total: number;
}

export function compute_votes(
  stake_map: Map<string, number>,
  votes_for: string[],
  votes_against: string[],
): ProposalStakeInfo {
  let stake_for = 0;
  let stake_against = 0;
  let stake_total = 0;

  for (const vote_addr of votes_for) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_for += stake;
    stake_total += stake;
  }

  for (const vote_addr of votes_against) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_against += stake;
    stake_total += stake;
  }

  return { stake_for, stake_against, stake_total };
}

import { match } from "rustie";
import {
  type Proposal,
  type CustomProposalMetadata,
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type ProposalState,
} from "./types";
import { parse_ipfs_uri, build_ipfs_gateway_url } from "./utils/ipfs";
import { assert } from "tsafe";

const DEBUG = process.env.NODE_ENV === "development";

const sum = (arr: Iterable<number>) =>
  Array.from(arr).reduce((a, b) => a + b, 0);

export interface ProposalStakeInfo {
  stake_for: number;
  stake_against: number;
  stake_voted: number;
  stake_total: number;
}

export async function handle_custom_proposal_data(
  proposal: Proposal,
  data: string,
): Promise<CustomProposalMetadata | null> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    console.error(`Invalid IPFS URI '${data}' for proposal ${proposal.id}`);
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

export function handle_custom_proposals(
  proposals: Proposal[],
  handler?: (id: number, proposal_state: ProposalState) => void,
) {
  const promises = [];
  for (const proposal of proposals) {
    const prom = match(proposal.data)({
      custom: async function (data: string) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return null;
        }
        const proposal_state: ProposalState = {
          ...proposal,
          custom_data: metadata,
        };
        if (handler != null) {
          handler(proposal.id, proposal_state);
        }
        return { id: proposal.id, custom_data: metadata };
      },
      subnetCustom: async function ({ data }) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return null;
        }
        const proposal_state: ProposalState = {
          ...proposal,
          custom_data: metadata,
        };
        if (handler != null) {
          handler(proposal.id, proposal_state);
        }
        return { id: proposal.id, custom_data: metadata };
      },
      globalParams: async function () {
        return null;
      },
      subnetParams: async function () {
        return null;
      },
    });
    promises.push(prom);
  }
  return Promise.all(promises);
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

export function compute_votes(
  stake_map: Map<string, number>,
  votes_for: string[],
  votes_against: string[],
  stake_total?: number,
): ProposalStakeInfo {
  let stake_for = 0;
  let stake_against = 0;
  let stake_voted = 0;

  if (stake_total == null) {
    stake_total = sum(stake_map.values());
  } else if (DEBUG) {
    const stake_total_check = sum(stake_map.values());
    assert(stake_total == stake_total_check && false, "stake_total mismatch");
  }

  for (const vote_addr of votes_for) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_for += stake;
    stake_voted += stake;
  }

  for (const vote_addr of votes_against) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_against += stake;
    stake_voted += stake;
  }

  return { stake_for, stake_against, stake_voted, stake_total };
}

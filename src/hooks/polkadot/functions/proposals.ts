import { match } from "rustie";
import { assert } from "tsafe";
import { build_ipfs_gateway_url, parse_ipfs_uri } from "../../../utils/ipfs";
import {
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type Dao,
  type DaoState,
  type CustomProposalDataState,
  type Proposal,
  type ProposalState,
} from "./types";

const DEBUG = process.env.NODE_ENV === "development";

const sum = (arr: Iterable<bigint>) =>
  Array.from(arr).reduce((a, b) => a + b, 0n);

export interface ProposalStakeInfo {
  stake_for: bigint;
  stake_against: bigint;
  stake_voted: bigint;
  stake_total: bigint;
}

export async function handle_custom_proposal_data(
  proposal: Proposal,
  data: string,
): Promise<CustomProposalDataState> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    const message = `Invalid IPFS URI '${data}' for proposal ${proposal.id}`;
    console.error(message);
    return { Err: { message } };
  }

  const url = build_ipfs_gateway_url(cid);
  const response = await fetch(url);
  const obj: unknown = await response.json();

  const validated = CUSTOM_PROPOSAL_METADATA_SCHEMA.safeParse(obj);
  if (!validated.success) {
    const message = `Invalid proposal data for proposal ${proposal.id} at ${url}`;
    console.error(message, validated.error.issues);
    return { Err: { message } };
  }

  return { Ok: validated.data };
}

export async function handle_custom_dao_data(
  dao: Dao,
  data: string,
): Promise<CustomProposalDataState> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    const message = `Invalid IPFS URI '${data}' for DAO ${dao.id}`;
    console.error(message);
    return { Err: { message } };
  }

  const url = build_ipfs_gateway_url(cid);
  const response = await fetch(url);
  const obj: unknown = await response.json();

  const validated = CUSTOM_PROPOSAL_METADATA_SCHEMA.safeParse(obj);
  if (!validated.success) {
    const message = `Invalid DAO data for DAO ${dao.id} at ${url}`;
    console.error(message, validated.error.issues);
    return { Err: { message } };
  }

  return { Ok: validated.data };
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
      expired: async function () {
        return null;
      },
    });
    promises.push(prom);
  }
  return Promise.all(promises);
}

export function handle_custom_daos(
  daos: Dao[],
  handler?: (id: number, dao_state: DaoState) => void,
) {
  const promises = [];
  for (const dao of daos) {
    const prom = match(dao.data)({
      custom: async function (data: string) {
        const metadata = await handle_custom_dao_data(dao, data);
        if (metadata == null) {
          console.warn(`Invalid custom DAO data for DAO ${dao.id}: ${data}`);
          return null;
        }
        const dao_state: DaoState = {
          ...dao,
          custom_data: metadata,
        };
        if (handler != null) {
          handler(dao.id, dao_state);
        }
        return { id: dao.id, custom_data: metadata };
      },
      subnetCustom: async function ({ data }) {
        const metadata = await handle_custom_dao_data(dao, data);
        if (metadata == null) {
          console.warn(`Invalid custom DAO data for DAO ${dao.id}: ${data}`);
          return null;
        }
        const dao_state: DaoState = {
          ...dao,
          custom_data: metadata,
        };
        if (handler != null) {
          handler(dao.id, dao_state);
        }
        return { id: dao.id, custom_data: metadata };
      },
      globalParams: async function () {
        return null;
      },
      subnetParams: async function () {
        return null;
      },
      expired: async function () {
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
    expired: function (): null {
      return null;
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
    expired: function (): boolean {
      return false;
    },
  });
}

export function compute_votes(
  stake_map: Map<string, bigint>,
  votes_for: string[],
  votes_against: string[],
  stake_total?: bigint,
): ProposalStakeInfo {
  let stake_for = 0n;
  let stake_against = 0n;
  let stake_voted = 0n;

  if (stake_total == null) {
    stake_total = sum(stake_map.values());
  } else if (DEBUG) {
    const stake_total_check = sum(stake_map.values());
    assert(stake_total == stake_total_check && false, "stake_total mismatch");
  }

  for (const vote_addr of votes_for) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.warn(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_for += stake;
    stake_voted += stake;
  }

  for (const vote_addr of votes_against) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.warn(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_against += stake;
    stake_voted += stake;
  }

  return { stake_for, stake_against, stake_voted, stake_total };
}

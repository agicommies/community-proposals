import { match } from "rustie";
import { assert } from "tsafe";
import { build_ipfs_gateway_url, parse_ipfs_uri } from "../../../utils/ipfs";
import {
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type Dao,
  type CustomProposalDataState,
  type Proposal,
  type ProposalState,
  CUSTOM_DAO_METADATA_SCHEMA,
  type CustomDaoDataState,
  type SS58Address,
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
): Promise<CustomProposalDataState> {
  const cid = parse_ipfs_uri(proposal.metadata);
  if (cid == null) {
    const message = `Invalid IPFS URI '${proposal.metadata}' for proposal ${proposal.id}`;
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
): Promise<CustomDaoDataState> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    const message = `Invalid IPFS URI '${data}' for dao ${dao.id}`;
    console.error(message);
    return { Err: { message } };
  }

  const url = build_ipfs_gateway_url(cid);
  const response = await fetch(url);
  const obj: unknown = await response.json();

  const validated = CUSTOM_DAO_METADATA_SCHEMA.safeParse(obj);
  if (!validated.success) {
    const message = `Invalid dao data for dao ${dao.id} at ${url}`;
    console.error(message, validated.error.issues);
    return { Err: { message } };
  }

  return { Ok: validated.data };
}

export async function handle_custom_daos(daos: Dao[]) {
  const promises = [];
  for (const dao of daos) {
    const prom = handle_custom_dao_data(dao, dao.data);
    promises.push(prom);
  }

  return Promise.all(promises);
}

export function handle_custom_proposals(
  proposals: Proposal[],
  handler?: (id: number, proposal_state: ProposalState) => void,
) {
  const promises = [];
  for (const proposal of proposals) {
    const prom = match(proposal.data)({
      GlobalCustom: async function () {
        const metadata = await handle_custom_proposal_data(proposal);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${proposal.metadata}`,
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
      SubnetCustom: async function () {
        const metadata = await handle_custom_proposal_data(proposal);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${proposal.metadata}`,
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
      GlobalParams: async function () {
        return null;
      },
      SubnetParams: async function () {
        return null;
      },
      TransferDaoTreasury: async function () {
        return null;
      },
    });
    promises.push(prom);
  }
  return Promise.all(promises);
}

export function get_proposal_netuid(proposal: Proposal): number | null {
  return match(proposal.data)({
    GlobalCustom: function (/*v: string*/): null {
      return null;
    },
    GlobalParams: function (/*v: unknown*/): null {
      return null;
    },
    SubnetCustom: function ({ subnetId }): number {
      return subnetId;
    },
    SubnetParams: function ({ subnetId }): number {
      return subnetId;
    },
    TransferDaoTreasury: function (/*{ account, amount }*/): null {
      return null;
    },
  });
}

export function is_proposal_custom(proposal: Proposal): boolean {
  return match(proposal.data)({
    GlobalCustom: function (/*v: string*/): boolean {
      return true;
    },
    GlobalParams: function (/*v: unknown*/): boolean {
      return false;
    },
    SubnetParams: function (/*{ netuid }*/): boolean {
      return false;
    },
    SubnetCustom: function (/*{ netuid }*/): boolean {
      return true;
    },
    TransferDaoTreasury: function (/*{ account, amount }*/): boolean {
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

/// If you are reading this, please not that Ed is mad.

type AccountId = SS58Address;
type SubnetId = number;

export interface PalletSubspace {
  getAccountStake: (
    voter: AccountId,
    subnetId: SubnetId | null,
  ) => Promise<number>;
  getStakeFromVector: (
    subnetId: SubnetId,
    voter: AccountId,
  ) => Promise<Array<[AccountId, number]>>;
  iterKeys: () => Promise<SubnetId[]>;
}

async function calcStake(
  delegating: Set<AccountId>,
  voter: AccountId,
  subnetId: SubnetId | null,
  palletSubspace: PalletSubspace,
): Promise<number> {
  const ownStake = delegating.has(voter)
    ? 0
    : await palletSubspace.getAccountStake(voter, subnetId);

  const calculateDelegated = async (subnetId: SubnetId): Promise<number> => {
    const stakes = await palletSubspace.getStakeFromVector(subnetId, voter);
    return stakes
      .filter(([staker, _]) => delegating.has(staker))
      .reduce((sum, [_, stake]) => sum + stake, 0);
  };

  let delegatedStake = 0;
  if (subnetId !== null) {
    delegatedStake = await calculateDelegated(subnetId);
  } else {
    const subnetIds = await palletSubspace.iterKeys();
    for (const id of subnetIds) {
      delegatedStake += await calculateDelegated(id);
    }
  }

  return ownStake + delegatedStake;
}

export async function calculateVotes(
  votesFor: AccountId[],
  votesAgainst: AccountId[],
  delegating: Set<AccountId>,
  subnetId: SubnetId | null,
  palletSubspace: PalletSubspace,
) {
  const votesForWithStake: Array<[AccountId, number]> = await Promise.all(
    votesFor.map(async (id) => {
      const stake = await calcStake(delegating, id, subnetId, palletSubspace);
      return [id, stake];
    }),
  );

  const votesAgainstWithStake: Array<[AccountId, number]> = await Promise.all(
    votesAgainst.map(async (id) => {
      const stake = await calcStake(delegating, id, subnetId, palletSubspace);
      return [id, stake];
    }),
  );

  const stakeForSum = votesForWithStake.reduce(
    (sum, [_, stake]) => sum + stake,
    0,
  );
  const stakeAgainstSum = votesAgainstWithStake.reduce(
    (sum, [_, stake]) => sum + stake,
    0,
  );

  return {
    votesForWithStake,
    votesAgainstWithStake,
    stakeForSum,
    stakeAgainstSum,
  };
}

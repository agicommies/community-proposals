import { match } from "rustie";
import { assert } from "tsafe";
import { build_ipfs_gateway_url, parse_ipfs_uri } from "../../../utils/ipfs";
import {
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type Dao,
  type CustomProposalData,
  type Proposal,
  CUSTOM_DAO_METADATA_SCHEMA,
  type CustomDaoDataState,
  type ProposalStatus,
} from "~/subspace/types";

const DEBUG = process.env.NODE_ENV === "development";

const sum = (arr: Iterable<bigint>) =>
  Array.from(arr).reduce((a, b) => a + b, 0n);

export interface ProposalStakeInfo {
  stake_for: number;
  stake_against: number;
  stake_voted: number;
  stake_total: number;
}

export async function handle_custom_proposal_data(
  proposal: Proposal,
): Promise<CustomProposalData> {
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

export function get_proposal_netuid(proposal: Proposal): number | null {
  return match(proposal.data)({
    globalCustom: function (/*v: string*/): null {
      return null;
    },
    globalParams: function (/*v: unknown*/): null {
      return null;
    },
    subnetCustom: function ({ subnetId }): number {
      return subnetId;
    },
    subnetParams: function ({ subnetId }): number {
      return subnetId;
    },
    transferDaoTreasury: function (/*{ account, amount }*/): null {
      return null;
    },
  });
}

export function is_proposal_custom(proposal: Proposal): boolean {
  return match(proposal.data)({
    globalCustom: function (/*v: string*/): boolean {
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
    transferDaoTreasury: function (/*{ account, amount }*/): boolean {
      return false;
    },
  });
}

export function handle_proposal_status_data(proposalStatus: ProposalStatus) {
  return match(proposalStatus)({
    open: function ({ votesFor, votesAgainst, stakeFor, stakeAgainst }) {
      return {
        status: "open",
        votesFor,
        votesAgainst,
        stakeFor,
        stakeAgainst,
      };
    },
    accepted: function ({ block, stakeFor, stakeAgainst }) {
      return {
        status: "accepted",
        block,
        stakeFor,
        stakeAgainst,
      };
    },
    refused: function ({ block, stakeFor, stakeAgainst }) {
      return {
        status: "refused",
        block,
        stakeFor,
        stakeAgainst,
      };
    },
    expired: function () {
      return {
        status: "expired",
      };
    },
  });
}

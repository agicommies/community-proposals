import { match } from "rustie";

import { build_ipfs_gateway_url, parse_ipfs_uri } from "../../../utils/ipfs";
import {
  type Dao,
  type Proposal,
  CUSTOM_DAO_METADATA_SCHEMA,
  type CustomMetadataState,
  type ProposalStatus,
} from "~/subspace/types";
import { bigint_division, format_token } from "~/utils";

export const sum = (arr: Iterable<bigint>) =>
  Array.from(arr).reduce((a, b) => a + b, 0n);

export interface ProposalStakeInfo {
  stake_for: number;
  stake_against: number;
  stake_voted: number;
  stake_total: number;
}

export async function handle_custom_dao_data(
  dao: Dao,
  data: string,
): Promise<CustomMetadataState> {
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

// Gets the circulating supply from the netwo

export function handle_proposal_quorum_percent(
  proposalStatus: ProposalStatus,
  totalStake: bigint,
) {
  function quorum_percent(stakeFor: bigint, stakeAgainst: bigint) {
    const percentage =
      bigint_division(stakeFor + stakeAgainst, totalStake) * 100;
    const percent_display = `${Number.isNaN(percentage) ? "—" : percentage.toFixed(1)}%`;
    return <span className="text-yellow-600">{` (${percent_display})`}</span>;
  }
  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) =>
      quorum_percent(stakeFor, stakeAgainst),
    accepted: ({ stakeFor, stakeAgainst }) =>
      quorum_percent(stakeFor, stakeAgainst),
    refused: ({ stakeFor, stakeAgainst }) =>
      quorum_percent(stakeFor, stakeAgainst),
    expired: () => {
      return <span className="text-yellow-600">{` (Expired)`}</span>;
    },
  });
}

export function handle_proposal_stake_voted(proposalStatus: ProposalStatus) {
  // TODO: extend rustie `if_let` to provid other variants on else arm
  // const txt = if_let(proposalStatus)("expired")(() => "—")(({ stakeFor }) => format_token(Number(stakeFor)));

  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) =>
      format_token(Number(stakeFor + stakeAgainst)),
    accepted: ({ stakeFor, stakeAgainst }) =>
      format_token(Number(stakeFor + stakeAgainst)),
    refused: ({ stakeFor, stakeAgainst }) =>
      format_token(Number(stakeFor + stakeAgainst)),
    expired: () => "—",
  });
}

export function handle_proposal_votes_in_favor(proposalStatus: ProposalStatus) {
  return match(proposalStatus)({
    open: ({ stakeFor }) => format_token(Number(stakeFor)),
    accepted: ({ stakeFor }) => format_token(Number(stakeFor)),
    refused: ({ stakeFor }) => format_token(Number(stakeFor)),
    expired: () => "—",
  });
}

export function handle_proposal_votes_against(proposalStatus: ProposalStatus) {
  return match(proposalStatus)({
    open: ({ stakeAgainst }) => format_token(Number(stakeAgainst)),
    accepted: ({ stakeAgainst }) => format_token(Number(stakeAgainst)),
    refused: ({ stakeAgainst }) => format_token(Number(stakeAgainst)),
    expired: () => "—",
  });
}

export function handle_proposal_finished(proposalStatus: ProposalStatus) {
  return match(proposalStatus)({
    open: () => false,
    accepted: () => true,
    refused: () => true,
    expired: () => true,
  });
}

export function calc_proposal_favorable_percent(
  proposalStatus: ProposalStatus,
) {
  function calc_stake_percent(
    stakeFor: bigint,
    stakeAgainst: bigint,
  ): number | null {
    const totalStake = stakeFor + stakeAgainst;
    if (totalStake === 0n) {
      return null;
    }
    const ratio = bigint_division(stakeFor, totalStake);
    const percentage = ratio * 100;
    return percentage;
  }
  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) =>
      calc_stake_percent(stakeFor, stakeAgainst),
    accepted: ({ stakeFor, stakeAgainst }) =>
      calc_stake_percent(stakeFor, stakeAgainst),
    refused: ({ stakeFor, stakeAgainst }) =>
      calc_stake_percent(stakeFor, stakeAgainst),
    expired: () => null,
  });
}

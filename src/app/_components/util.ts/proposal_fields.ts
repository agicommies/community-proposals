import { match } from "rustie";
import {
  type ProposalState,
  type CustomProposalDataState,
  type CustomMetadataState,
  param_name_to_display_name,
} from "~/subspace/types";

export type ProposalCardFields = {
  title: string | null;
  body: string | null;
  netuid: number | "GLOBAL";
  invalid?: boolean;
};

export type DAOCardFields = {
  title: string | null;
  body: string | null;
};

const params_to_markdown = (params: Record<string, unknown>): string => {
  const items = [];
  for (const [key, value] of Object.entries(params)) {
    const label = `**${param_name_to_display_name(key)}**`;
    const formattedValue =
      typeof value === "string" || typeof value === "number"
        ? `\`${value}\``
        : "`???`";

    items.push(`${label}: ${formattedValue}`);
  }
  return items.join(" |  ") + "\n";
};

function handle_custom_proposal_data(
  proposal_id: number,
  data_state: CustomProposalDataState | null,
  netuid: number | "GLOBAL",
): ProposalCardFields {
  if (data_state == null) {
    return {
      title: null,
      body: null,
      netuid: netuid,
    };
  }
  return match(data_state)({
    Err: function ({ message }): ProposalCardFields {
      return {
        title: `⚠️😠 Failed fetching proposal data for proposal #${proposal_id}`,
        body: `⚠️😠 Error fetching proposal data for proposal #${proposal_id}:  \n${message}`,
        netuid: netuid,
        invalid: true,
      };
    },
    Ok: function (data): ProposalCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
        netuid: netuid,
      };
    },
  });
}

export function handle_custom_dao(
  dao_id: number | null,
  data_state: CustomMetadataState | null,
): DAOCardFields {
  if (data_state == null) {
    return {
      title: null,
      body: null,
    };
  }
  return match(data_state)({
    Err: function ({ message }): DAOCardFields {
      return {
        title: `⚠️😠 Failed fetching proposal data for proposal #${dao_id}`,
        body: `⚠️😠 Error fetching proposal data for proposal #${dao_id}:  \n${message}`,
      };
    },
    Ok: function (data): DAOCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
      };
    },
  });
}

function handle_proposal_params(
  proposal_id: number,
  params: Record<string, unknown>,
  netuid: number | "GLOBAL",
): ProposalCardFields {
  const title =
    `Parameters proposal #${proposal_id} for ` +
    (netuid == "GLOBAL" ? "global network" : `subnet ${netuid}`);
  return {
    title,
    body: params_to_markdown(params),
    netuid,
  };
}

export const handle_proposal = (proposal: ProposalState): ProposalCardFields =>
  match(proposal.data)({
    globalCustom: function (/*raw_data*/): ProposalCardFields {
      return handle_custom_proposal_data(
        proposal.id,
        proposal.custom_data ?? null,
        "GLOBAL",
      );
    },
    subnetCustom: function ({ subnetId /*raw_data*/ }): ProposalCardFields {
      return handle_custom_proposal_data(
        proposal.id,
        proposal.custom_data ?? null,
        subnetId,
      );
    },
    globalParams: function (params): ProposalCardFields {
      return handle_proposal_params(proposal.id, params, "GLOBAL");
    },
    subnetParams: function ({ subnetId, params }): ProposalCardFields {
      return handle_proposal_params(proposal.id, params, subnetId);
    },
    transferDaoTreasury: function (): ProposalCardFields {
      return {
        title: `Transfer proposal #${proposal.id}`,
        body: `Transfer proposal #${proposal.id} to treasury`,
        netuid: "GLOBAL",
        invalid: true,
      };
    },
  });

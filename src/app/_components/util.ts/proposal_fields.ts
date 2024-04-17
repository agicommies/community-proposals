import { match } from "rustie";
import {
  param_name_to_display_name,
  type CustomProposalDataState,
  type ProposalState,
} from "~/hooks/polkadot/functions/types";

export type ProposalCardFields = {
  title: string | null;
  body: string | null;
  netuid: number | "GLOBAL";
  invalid?: boolean;
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
    custom: function (/*raw_data*/): ProposalCardFields {
      return handle_custom_proposal_data(
        proposal.id,
        proposal.custom_data ?? null,
        "GLOBAL",
      );
    },
    subnetCustom: function ({ netuid /*raw_data*/ }): ProposalCardFields {
      return handle_custom_proposal_data(
        proposal.id,
        proposal.custom_data ?? null,
        netuid,
      );
    },
    globalParams: function (params): ProposalCardFields {
      return handle_proposal_params(proposal.id, params, "GLOBAL");
    },
    subnetParams: function ({ netuid, params }): ProposalCardFields {
      return handle_proposal_params(proposal.id, params, netuid);
    },
    expired: function (): ProposalCardFields {
      return {
        title: `Proposal #${proposal.id} has expired`,
        body: "This proposal has expired.",
        netuid: "GLOBAL",
        invalid: true,
      };
    }
  });

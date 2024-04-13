"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
// import { intlFormatDistance } from "date-fns";
import Image from "next/image";
import { match } from "rustie";
import { assert } from "tsafe";

import { type ProposalStakeInfo } from "~/hooks/polkadot/functions/proposals";
import {
  param_name_to_display_name,
  type ProposalState,
} from "~/hooks/polkadot/functions/types";
import { getStoredTheme } from "~/styles/theming";
import { bigint_division, format_token, small_address } from "~/utils";

import { Card } from "./card";
import { Label } from "./label";
import ProposalExpandedCard from "./proposal-expanded-card";
import { Skeleton } from "./skeleton";
import { StatusLabel, type TProposalStatus } from "./status-label";
import { VoteLabel, type TVote } from "./vote-label";

export type ProposalCardProps = {
  proposal: ProposalState;
  stake_info: ProposalStakeInfo | null;
  voted: TVote;
};

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal, stake_info, voted } = props;
  const proposalId = proposal.id;
  const theme = getStoredTheme();

  type ProposalCardFields = {
    title: string | null;
    body: string | null;
    netuid: number | "GLOBAL";
  };

  const params_to_markdown = (params: Record<string, unknown>): string => {
    const items = [];
    for (const [key, value] of Object.entries(params)) {
      const label = `**${param_name_to_display_name(key).toUpperCase()}**`;
      const formattedValue =
        typeof value === "string" || typeof value === "number"
          ? `\`${value}\``
          : "`???`";

      items.push(`${label}: ${formattedValue}`);
    }
    return items.join(" | ") + "\n";
  };

  const proposal_info = match(proposal.data)({
    custom: function (/*v: string*/): ProposalCardFields {
      return {
        title: proposal?.custom_data?.title ?? null,
        body: proposal?.custom_data?.title ?? null,
        netuid: "GLOBAL",
      };
    },
    subnetCustom: function ({ netuid /*data*/ }): ProposalCardFields {
      return {
        title: proposal?.custom_data?.title ?? null,
        body: proposal?.custom_data?.title ?? null,
        netuid: netuid,
      };
    },
    globalParams: function (params): ProposalCardFields {
      return {
        title: `Parameters proposal #${proposalId} for global network`,
        body: params_to_markdown(params),
        netuid: "GLOBAL",
      };
    },
    subnetParams: function ({ netuid, params }): ProposalCardFields {
      return {
        title: `Parameters proposal #${proposalId} for subnet ${netuid}`,
        body: params_to_markdown(params),
        netuid: netuid,
      };
    },
  });

  function handle_favorable_percent(favorable_percent: number) {
    const against_percent = 100 - favorable_percent;
    const isFavorableBigger = favorable_percent >= 50;
    if (Number.isNaN(favorable_percent)) {
      return (
        <Label className="w-full bg-gray-100 py-1.5 text-center text-yellow-500 md:w-auto lg:text-left dark:bg-light-dark">
          – %
        </Label>
      );
    }
    return (
      // TODO: render red-ish label if losing and green-ish label if winning
      <Label className={`flex w-full items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center md:w-auto lg:text-left dark:bg-light-dark ${isFavorableBigger ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
        <span className="text-green-500">{favorable_percent?.toFixed(0)}%</span>
        <Image
          src={"/favorable-up.svg"}
          height={14}
          width={10}
          alt="favorable arrow up icon"
        />
        {" / "}
        <span className="text-red-500"> {against_percent?.toFixed(0)}% </span>
        <Image
          src={"/against-down.svg"}
          height={14}
          width={10}
          alt="against arrow down icon"
        />
      </Label>
    );
  }

  function render_favorable_percent(stake_info: ProposalStakeInfo) {
    const { stake_for, stake_against, stake_voted } = stake_info;
    assert(
      stake_for + stake_against == stake_voted,
      "stake_for + stake_against != stake_voted",
    );
    const favorable_percent = bigint_division(stake_for, stake_voted) * 100;
    return handle_favorable_percent(favorable_percent);
  }

  function render_quorum_percent(stake_info: ProposalStakeInfo) {
    const { stake_voted, stake_total } = stake_info;
    const quorum_percent = bigint_division(stake_voted, stake_total) * 100;
    return (
      <span className="text-yellow-600">
        {" ("}
        {quorum_percent.toFixed(2)} %{")"}
      </span>
    );
  }

  return (
    <Card.Root key={proposal.id}>
      <Card.Header className="flex-col-reverse z-10">
        {proposal_info.title && (
          <h3 className="text-base font-semibold">{proposal_info.title}</h3>
        )}
        {!proposal_info.title && <Skeleton className="w-8/12 py-3" />}

        <div className="mb-2 flex w-full flex-row-reverse justify-center gap-2 md:mb-0 md:ml-auto md:w-auto md:flex-row md:justify-end md:pl-4">
          <VoteLabel vote={voted} />
          <Label>
            {(proposal_info.netuid !== "GLOBAL" && (
              <span> Subnet {proposal_info.netuid} </span>
            )) || <span> Global </span>}
          </Label>
          <StatusLabel result={proposal.status as TProposalStatus} />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="pb-2 md:pb-6">
          <div
            className="rounded-xl p-3 dark:bg-black/20"
            data-color-mode={theme === "dark" ? "dark" : "light"}
          >
            {proposal_info.body && (
              <MarkdownPreview source={proposal_info.body} />
            )}
            {/* TODO: skeleton */}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
          <div className="w-[240px] space-x-2 pb-4 text-gray-500 md:pb-0">
            <span className="line-clamp-1 block w-full truncate">
              posted by {small_address(proposal.proposer)}
            </span>
          </div>

          <div className="center mx-auto ml-auto mt-4 flex w-full flex-col-reverse gap-2 md:mt-0 md:flex-row md:justify-end">
            {!stake_info && (
              <div className="flex w-full items-center space-x-2 md:justify-end">
                <span className="flex w-full animate-pulse rounded-3xl bg-gray-700 py-3.5 md:w-2/5 lg:w-3/12" />
              </div>
            )}
            {stake_info && (
              <div className="flex w-full md:w-auto">
                {render_favorable_percent(stake_info)}
              </div>
            )}

            {!stake_info && (
              <div className="w-full text-center md:w-4/5">
                <span className="flex w-full animate-pulse rounded-3xl bg-gray-700 py-3.5" />
              </div>
            )}

            {stake_info && (
              <Label className="w-full rounded-3xl bg-gray-100 py-1.5 text-center font-medium md:w-auto dark:bg-light-dark">
                Total staked:
                <span className="font-bold text-blue-500">
                  {" "}
                  {format_token(stake_info.stake_voted)}
                </span>
                <span className="text-xs font-extralight text-blue-500">
                  {" "}
                  COMAI
                </span>
                {render_quorum_percent(stake_info)}
              </Label>
            )}
          </div>
        </div>
        <div className="flex justify-center pt-4 md:justify-start">
          <ProposalExpandedCard {...props} />
        </div>
      </Card.Body>
    </Card.Root>
  );
};

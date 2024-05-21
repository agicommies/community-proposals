"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
// import { intlFormatDistance } from "date-fns";
import Image from "next/image";
import { assert } from "tsafe";

import { type ProposalStakeInfo } from "~/hooks/polkadot/functions/proposals";
import { type ProposalState } from "~/hooks/polkadot/functions/types";
import { bigint_division, format_token, small_address } from "~/utils";

import { Card } from "./card";
import { Label } from "./label";
import ProposalExpandedCard from "./proposal-expanded-card";
import { Skeleton } from "./skeleton";
import { StatusLabel, type TProposalStatus } from "./status-label";
import { handle_proposal } from "./util.ts/proposal_fields";
import { VoteLabel, type TVote } from "./vote-label";
import { cairo } from "~/styles/fonts";

export type ProposalCardProps = {
  proposal: ProposalState;
  stake_info: ProposalStakeInfo | null;
  voted: TVote;
};

function handle_favorable_percent(favorable_percent: number) {
  const against_percent = 100 - favorable_percent;
  // const winning = favorable_percent >= 50; // Are you winning son?
  if (Number.isNaN(favorable_percent)) {
    return (
      <Label className="w-full py-1.5 text-center text-yellow-500 border border-gray-500 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
    // TODO: render red-ish label if losing and green-ish label if winning
    <Label className="flex w-full items-center justify-center gap-1.5 border-gray-500 border py-2.5 text-center lg:w-auto">
      <span className="text-green-500">{favorable_percent?.toFixed(0)}%</span>
      <Image
        src={"/favorable-up.svg"}
        height={14}
        width={10}
        alt="favorable arrow up icon"
      />
      <span className="text-gray-500">
        {" / "}
      </span>
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

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal, stake_info, voted } = props;

  const { title, body, netuid, invalid } = handle_proposal(proposal);

  return (
    <Card.Root
      key={proposal.id}
      className={`${invalid ? "opacity-50" : ""} ${invalid ? "hidden" : ""}`}
    >
      <Card.Header className="z-10 flex-col">
        {title && <h2 className="pb-4 text-base font-semibold text-white">{title}</h2>}
        {!title && <Skeleton className="w-8/12 py-3 pb-4" />}

        <div className="flex flex-row justify-center w-full gap-2 mb-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
          {/* <VoteLabel vote={voted} /> */}
          <VoteLabel vote={'AGAINST'} />
          <div className="flex items-center">
            <span className="border text-white border-white px-4 py-1.5 text-center text-sm font-medium">
              {netuid !== "GLOBAL" ? `Subnet ${netuid}` : "Global"}
            </span>
          </div>

          <StatusLabel result={proposal.status as TProposalStatus} />
        </div>
      </Card.Header>
      <Card.Body className="px-0 py-0">
        <div className="p-4 py-10">
          {body && <MarkdownPreview source={body} style={{ backgroundColor: 'transparent', color: 'white' }} className={`line-clamp-4 ${cairo.className}`} />}
          {/* TODO: skeleton for markdown body */}
        </div>

        <div className="flex flex-col items-start justify-between p-2 border-t border-gray-500 lg:p-4 lg:flex-row lg:items-center">
          <div className="flex flex-col-reverse w-full lg:items-center lg:flex-row">
            <div className="w-full py-2 mr-3 lg:py-0 lg:w-auto lg:min-w-fit">
              <ProposalExpandedCard {...props} />
            </div>
            <span className="block w-full text-base text-green-500 truncate line-clamp-1">
              Posted by <span className="text-white">{small_address(proposal.proposer)}</span>
            </span>
          </div>

          <div className="flex flex-col-reverse items-center w-full gap-2 mx-auto lg:flex-row lg:justify-end">
            {!stake_info && (
              <div className="flex items-center w-full space-x-2 lg:justify-end">
                <span className="flex w-full animate-pulse bg-gray-700 py-3.5 lg:w-3/12" />
              </div>
            )}
            {stake_info && (
              <div className="flex w-full lg:w-auto">
                {render_favorable_percent(stake_info)}
              </div>
            )}

            {!stake_info && (
              <div className="w-full text-center lg:w-4/5">
                <span className="flex w-full animate-pulse bg-gray-700 py-3.5" />
              </div>
            )}

            {stake_info && (
              <Label className="w-full px-2 lg:px-4 border-gray-500 border text-gray-300 py-2.5 text-center flex justify-center font-medium lg:w-auto">
                Total staked:
                <span className="font-bold text-green-500">
                  {format_token(stake_info.stake_voted)}
                </span>
                <span className="text-xs text-gray-300 font-extralight">
                  COMAI
                </span>
                {render_quorum_percent(stake_info)}
              </Label>
            )}
          </div>
        </div>

      </Card.Body>
    </Card.Root>
  );
};

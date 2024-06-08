"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import Image from "next/image";
import { assert } from "tsafe";

import {
  handle_proposal_status_data,
  type ProposalStakeInfo,
} from "~/hooks/polkadot/functions/proposals";
import {
  ProposalStatus,
  ProposalStatusDataProps,
  type ProposalState,
} from "~/subspace/types";
import { format_token, small_address } from "~/utils";

import { Card } from "./card";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { StatusLabel } from "./status-label";
import { handle_proposal } from "./util.ts/proposal_fields";
import { VoteLabel, type TVote } from "./vote-label";
import { cairo } from "~/styles/fonts";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export type ProposalCardProps = {
  proposal: ProposalState;
  voted: TVote;
};

function handle_favorable_percent(favorable_percent: number) {
  const against_percent = 100 - favorable_percent;
  // const winning = favorable_percent >= 50; // Are you winning son?
  if (Number.isNaN(favorable_percent)) {
    return (
      <Label className="w-full border border-gray-500 py-1.5 text-center text-yellow-500 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
    // TODO: render red-ish label if losing and green-ish label if winning
    <Label className="flex w-full items-center justify-center gap-1.5 border border-gray-500 py-2.5 text-center lg:w-auto">
      <span className="text-green-500">{favorable_percent?.toFixed(0)}%</span>
      <Image
        src={"/favorable-up.svg"}
        height={14}
        width={10}
        alt="favorable arrow up icon"
      />
      <span className="text-gray-500">{" / "}</span>
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
  const favorable_percent = 1;
  return handle_favorable_percent(favorable_percent);
}

function render_quorum_percent(ProposalStatusData: ProposalStatusDataProps) {
  if (ProposalStatusData.status === "expired") return null;
  if (!ProposalStatusData.stakeFor || !ProposalStatusData.stakeAgainst)
    return null;
  const quorum_percent =
    (100 * ProposalStatusData.stakeFor) / ProposalStatusData.stakeAgainst +
    ProposalStatusData.stakeFor;

  return (
    <span className="text-yellow-600">
      {" ("}
      {quorum_percent.toFixed(2)} %{")"}
    </span>
  );
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal, voted } = props;

  const { title, body, netuid, invalid } = handle_proposal(proposal);

  const ProposalStatusData = handle_proposal_status_data(proposal.status);

  return (
    <Card.Root
      key={proposal.id}
      className={`${invalid ? "opacity-50" : ""} ${invalid ? "hidden" : ""}`}
    >
      <Card.Header className="z-10 flex-col">
        {title && (
          <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
            {title}
          </h2>
        )}
        {!title && <Skeleton className="mb-3 w-8/12 py-3 pb-4 lg:mb-0" />}

        <div className="mb-2 flex w-full flex-row justify-center gap-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
          <VoteLabel vote={voted} />
          <div className="flex items-center">
            <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
              {netuid !== "GLOBAL" ? `Subnet ${netuid}` : "Global"}
            </span>
          </div>
          <StatusLabel result={proposal.status} />
        </div>
      </Card.Header>

      <Card.Body className="px-0 py-0">
        <div className="p-4 py-10">
          {body && (
            <MarkdownPreview
              source={body}
              style={{ backgroundColor: "transparent", color: "white" }}
              className={`line-clamp-4 ${cairo.className}`}
            />
          )}
          {/* TODO: skeleton for markdown body */}
        </div>

        <div className="flex flex-col items-start justify-between border-t border-gray-500 p-2 lg:flex-row lg:items-center lg:p-4">
          <div className="flex w-full flex-col-reverse lg:flex-row lg:items-center">
            <div className="mr-3 w-full py-2 lg:w-auto lg:min-w-fit lg:py-0">
              <Link
                href={`proposal/${proposal.id}`}
                className="min-w-auto flex w-full items-center border border-green-500 px-2 py-2 text-sm text-green-500 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 lg:w-auto lg:px-4"
              >
                View full proposal
                <ArrowRightIcon className="ml-auto w-5 lg:ml-2" />
              </Link>
            </div>
            <span className="line-clamp-1 block w-full truncate text-base text-green-500">
              Posted by{" "}
              <span className="text-white">
                {small_address(proposal.proposer)}
              </span>
            </span>
          </div>

          <div className="mx-auto flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-end">
            {/* {!stake_info && (
              <div className="flex w-full items-center space-x-2 lg:justify-end">
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
            )} */}

            {ProposalStatusData && (
              <Label className="flex w-full justify-center border border-gray-500 px-2 py-2.5 text-center font-medium text-gray-300 lg:w-auto lg:px-4">
                Total staked:
                <span className="font-bold text-green-500">
                  {format_token(
                    Number(
                      ProposalStatusData.stakeFor as ProposalStatusDataProps,
                    ),
                  )}
                </span>
                <span className="text-xs font-extralight text-gray-300">
                  COMAI
                </span>
                {render_quorum_percent(
                  ProposalStatusData as ProposalStatusDataProps,
                )}
              </Label>
            )}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};

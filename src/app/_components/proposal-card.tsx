"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import Image from "next/image";

import {
  calc_proposal_favorable_percent,
  handle_proposal_quorum_percent,
  handle_proposal_stake_voted,
} from "~/hooks/polkadot/functions/proposals";
import { type ProposalState } from "~/subspace/types";
import { small_address } from "~/utils";

import { Card } from "./card";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { StatusLabel } from "./status-label";
import { handle_proposal } from "./util.ts/proposal_fields";
import { VoteLabel, type TVote } from "./vote-label";
import { cairo } from "~/styles/fonts";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { usePolkadot } from "~/hooks/polkadot";

export type ProposalCardProps = {
  proposal_state: ProposalState;
  voted: TVote;
};

function handle_percentages(favorable_percent: number | null) {
  if (favorable_percent === null) return null;

  const against_percent = 100 - favorable_percent;
  if (Number.isNaN(favorable_percent)) {
    return (
      <Label className="w-full border border-gray-500 py-1.5 text-center text-yellow-500 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
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

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal_state, voted } = props;
  const { stake_data } = usePolkadot();
  const { title, body, netuid, invalid } = handle_proposal(proposal_state);

  return (
    <Card.Root
      key={proposal_state.id}
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
          <StatusLabel result={proposal_state.status} />
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
        </div>

        <div className="flex flex-col items-start justify-between border-t border-gray-500 p-2 lg:flex-row lg:items-center lg:p-4">
          <div className="flex w-full flex-col-reverse lg:flex-row lg:items-center">
            <div className="mr-3 w-full py-2 lg:w-auto lg:min-w-fit lg:py-0">
              <Link
                href={`/item/proposal/${proposal_state.id}`}
                className="min-w-auto flex w-full items-center border border-green-500 px-2 py-2 text-sm text-green-500 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 lg:w-auto lg:px-4"
              >
                View full proposal
                <ArrowRightIcon className="ml-auto w-5 lg:ml-2" />
              </Link>
            </div>
            <span className="line-clamp-1 block w-full truncate text-base text-green-500">
              Posted by{" "}
              <span className="text-white">
                {small_address(proposal_state.proposer)}
              </span>
            </span>
          </div>

          <div className="mx-auto flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-end">
            {!proposal_state.status && (
              <div className="flex w-full items-center space-x-2 lg:justify-end">
                <span className="flex w-full animate-pulse bg-gray-700 py-3.5 lg:w-3/12" />
              </div>
            )}
            {proposal_state.status && (
              <div className="flex w-full lg:w-auto">
                {handle_percentages(
                  calc_proposal_favorable_percent(proposal_state.status),
                )}
              </div>
            )}

            {stake_data?.stake_out.total && proposal_state.status ? (
              <Label className="flex w-full justify-center border border-gray-500 px-2 py-2.5 text-center font-medium text-gray-300 lg:w-auto lg:px-4">
                Stake Voted:
                <span className="font-bold text-green-500">
                  {handle_proposal_stake_voted(proposal_state.status)}
                </span>
                {handle_proposal_quorum_percent(
                  proposal_state.status,
                  stake_data?.stake_out.total,
                )}
              </Label>
            ) : (
              <div className="h-fit w-full text-center lg:w-4/5">
                <span className="flex h-fit w-full animate-pulse bg-gray-700 py-3.5" />
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};

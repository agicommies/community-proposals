"use client";
import { Label } from "./label";
import { intlFormatDistance } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { type TVote, VoteLabel } from "./vote-label";
import { StatusLabel, type TProposalStatus } from "./status-label";
import { Card } from "./card";
import { Skeleton } from "./skeleton";
import { match } from "rustie";
import { type ProposalState } from "~/types";
import { type ProposalStakeInfo } from "~/proposals";
import { assert } from "tsafe";

function from_nano(nano: number): number {
  return nano / 1_000_000_000;
}

function format_token(nano: number): string {
  const amount = from_nano(nano);
  return amount.toFixed(2);
}

type ProposalCardProps = {
  proposal: ProposalState;
  stake_info: ProposalStakeInfo | null;
};

const handle_relative_time = (
  startDate: Date | string,
  endDate: Date | string | null,
) => {
  if (endDate) {
    return <span>Ended {intlFormatDistance(endDate, new Date())}</span>;
  }
  return <span>Started {intlFormatDistance(startDate, new Date())}</span>;
};

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal, stake_info } = props;
  const proposalId = proposal.id;

  const is_stake_loading = stake_info == null;
  // const is_custom_proposal = is_proposal_custom(proposal);

  type ProposalCardFields = {
    title: string | null;
    body: string | null;
    netuid: number | "GLOBAL";
  };

  // TODO: use these variables to render the proposal card
  const { title, body, netuid } = match(proposal.data)({
    custom: function (/*v: string*/): ProposalCardFields {
      return {
        title: proposal?.custom_data?.title ?? null,
        body: proposal?.custom_data?.title ?? null,
        netuid: "GLOBAL",
      };
    },
    subnetCustom: function ({ netuid /*data*/ }): ProposalCardFields {
      return {
        title: `Custom proposal #${proposalId} for subnet ${netuid}`,
        body: `To be implemented :)`,
        netuid: netuid,
      };
    },
    globalParams: function (/*v: unknown*/): ProposalCardFields {
      return {
        title: `Parameters proposal #${proposalId} for global network`,
        body: `To be implemented :)`,
        netuid: "GLOBAL",
      };
    },
    subnetParams: function ({ netuid /*params*/ }): ProposalCardFields {
      return {
        title: `Parameters proposal #${proposalId} for subnet ${netuid}`,
        body: `To be implemented :)`,
        netuid: netuid,
      };
    },
  });

  function handle_favorable_percent(favorable_percent: number) {
    const againstPercentage = 100 - favorable_percent;
    // const winning = favorable_percent >= 50;
    if (Number.isNaN(favorable_percent)) {
      return (
        <Label className="w-1/2 bg-gray-100 py-1.5 text-center text-yellow-500 md:w-auto lg:text-left dark:bg-light-dark">
          – %
        </Label>
      );
    }
    return (
      // TODO: render red-ish label if losing and green-ish label if winning
      <Label className="flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center md:w-auto lg:text-left dark:bg-light-dark">
        <span className="text-green-500">{favorable_percent?.toFixed(0)}%</span>
        <Image
          src={"/favorable-up.svg"}
          height={14}
          width={10}
          alt="favorable arrow up icon"
        />
        {" / "}
        <span className="text-red-500"> {againstPercentage?.toFixed(0)}% </span>
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
    console.log(stake_info);
    const { stake_for, stake_against, stake_voted } = stake_info;
    assert(
      Math.abs(stake_for + stake_against - stake_voted) <= 1.0,
      "stake_for + stake_against != stake_voted",
    );
    const favorable_percent = (100 * stake_for) / stake_voted;
    return handle_favorable_percent(favorable_percent);
  }

  function render_quorum_percent(stake_info: ProposalStakeInfo) {
    const { stake_voted, stake_total } = stake_info;
    const quorum_percent = (100 * stake_voted) / stake_total;
    return (
      <span className="text-yellow-600">
        {" ("}
        {quorum_percent.toFixed(2)} %{")"}
      </span>
    );
  }

  const isProposalLoading = false;
  const voted = "FAVORABLE";

  return (
    <Card.Root key={proposal.id}>
      <Card.Header className="flex-col-reverse">
        {proposal.custom_data && (
          <h3 className="text-base font-semibold">
            {proposal.custom_data.title}
          </h3>
        )}
        {isProposalLoading && <Skeleton className="w-9/12 py-3 " />}
        {!isProposalLoading && (
          <div className="mb-2 flex min-w-fit flex-row-reverse gap-2 md:mb-0 md:ml-auto md:flex-row">
            {!is_stake_loading && <VoteLabel vote={voted as TVote} />}
            {is_stake_loading && (
              <span className="flex w-[7rem] animate-pulse rounded-3xl bg-gray-700 py-3.5" />
            )}
            <StatusLabel result={proposal.status as TProposalStatus} />
          </div>
        )}
        {isProposalLoading && (
          <div className="mb-2 flex w-2/5 flex-row-reverse justify-center gap-2 md:mb-0 md:ml-auto md:flex-row lg:w-3/12 lg:justify-end">
            <Skeleton className="w-2/5 rounded-3xl py-3.5" />
            <Skeleton className="w-2/5 rounded-3xl py-3.5" />
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {!isProposalLoading && (
          <div className="pb-2 md:pb-6">
            <p className="line-clamp-7 md:line-clamp-5">
              {proposal?.custom_data?.body}
            </p>
          </div>
        )}

        {isProposalLoading && (
          <div className="space-y-1 pb-2 md:pb-6">
            <Skeleton className="w-full rounded-md py-2.5" />
            <Skeleton className="w-full rounded-md py-2.5" />
            <Skeleton className="w-full rounded-md py-2.5" />
            <Skeleton className="w-2/4 rounded-md py-2.5" />
          </div>
        )}

        <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
          {isProposalLoading && (
            <div className="flex w-full space-x-2">
              {/* <Skeleton className="py-2.5 w-full lg:w-4/12 rounded-3xl" /> */}
              <Skeleton className="w-full rounded-3xl py-2.5 lg:w-5/12" />
            </div>
          )}
          {!isProposalLoading && (
            <div className="w-[200px] space-x-2 pb-4 text-gray-500 md:pb-0">
              {/* <span className="">By {proposal.expirationBlock}</span> */}
              <span className="line-clamp-1 block w-full truncate">
                By {proposal.proposer}
              </span>
            </div>
          )}

          <div className="center mx-auto ml-auto mt-4 flex w-full flex-col-reverse gap-2 md:mt-0 md:flex-row md:justify-end">
            {!stake_info && (
              <div className="flex w-full items-center space-x-2 md:justify-end">
                <span className="flex w-full animate-pulse rounded-3xl bg-gray-700 py-3.5 md:w-2/5 lg:w-3/12" />
              </div>
            )}
            {stake_info && (
              <div className="flex w-full items-center space-x-2 md:w-auto">
                {/* <ResultLabel
                        result={proposal?.proposalResult as TProposalResult}
                      /> */}
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
        <div className="flex justify-center pt-4 md:justify-start md:pt-2">
          {isProposalLoading && (
            <span className="flex w-4/12 animate-pulse rounded-lg bg-gray-700 py-2.5" />
          )}
          {!isProposalLoading && (
            <Link
              href={`/proposal/${proposal.id}`}
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Click to access proposal {"->"}
            </Link>
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
};

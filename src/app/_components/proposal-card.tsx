import { type ProposalList } from "~/utils/proposalMockList";
import { Label } from "./label";
import { intlFormatDistance } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { type TVote, VoteLabel } from "./vote-label";
import { StatusLabel } from "./status-label";
import { ResultLabel, type TProposalResult } from "./result-label";
import { Card } from "./card";

type ProposalCardProps = {
  proposal: ProposalList;
};

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;

  const handlePercentage = (favorablePercentage: number) => {
    const againstPercentage = 100 - favorablePercentage;

    if (againstPercentage > favorablePercentage) {
      return (
        <Label className="flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center text-red-500 md:w-auto lg:text-left dark:bg-light-dark">
          {againstPercentage.toFixed(0)}%
          <Image
            src={"/against-down.svg"}
            height={14}
            width={10}
            alt="against arrow down icon"
          />
        </Label>
      );
    }

    if (againstPercentage < favorablePercentage) {
      return (
        <Label className=" flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center text-green-500 md:w-auto lg:text-left dark:bg-light-dark">
          {favorablePercentage.toFixed(0)}%
          <Image
            src={"/favorable-up.svg"}
            height={14}
            width={10}
            alt="favorable arrow up icon"
          />
        </Label>
      );
    }

    return (
      <Label className="w-1/2 bg-gray-100 py-1.5 text-center text-yellow-500 md:w-auto lg:text-left dark:bg-light-dark">
        {favorablePercentage.toFixed(0)}% -
      </Label>
    );
  };

  const handleRelativeTime = (
    startDate: Date | string,
    endDate: Date | string | null,
  ) => {
    if (endDate)
      return <span>Ended {intlFormatDistance(endDate, new Date())}</span>;
    return <span>Started {intlFormatDistance(startDate, new Date())}</span>;
  };

  return (
    <Card.Root>
      <Card.Header className="flex-col-reverse">
        <h3 className="text-base font-semibold">{proposal.title}</h3>
        <div className="mb-2 flex min-w-fit flex-row-reverse gap-2 md:mb-0 md:ml-auto md:flex-row">
          <VoteLabel vote={proposal.voted as TVote} />
          <StatusLabel isActive={proposal.active} />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="pb-2 md:pb-6">
          <p>{proposal.description}</p>
        </div>

        <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
          <div className="min-w-fit space-x-2 divide-x pb-4 text-gray-500 md:pb-0">
            {handleRelativeTime(proposal.startDate, proposal.endDate)}
            <span className="pl-2">By {proposal.by}</span>
          </div>

          <div className="mx-auto mt-4 flex w-full flex-col-reverse justify-center gap-2 md:mt-0 md:flex-row md:justify-end">
            <div className="flex w-full items-center space-x-2 md:w-auto">
              <ResultLabel
                result={proposal.proposalResult as TProposalResult}
              />
              {handlePercentage(proposal.favorablePercentage)}
            </div>

            <Label className="w-full rounded-3xl bg-gray-100 py-1.5 text-center font-medium md:w-auto dark:bg-light-dark">
              Total staked:
              <span className="font-bold text-blue-500">
                {" "}
                {proposal.totalStake}
              </span>
              <span className="text-xs font-extralight text-blue-500">
                COMAI
              </span>
            </Label>
          </div>
        </div>
        <div className="flex justify-center pt-4 md:justify-start md:pt-2">
          <Link
            href={`/proposal/${proposal.id}`}
            className="text-blue-500 hover:text-blue-400 hover:underline"
          >
            Click to access proposal {"->"}
          </Link>
        </div>
      </Card.Body>
    </Card.Root>
  );
};

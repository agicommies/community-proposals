import { type ProposalList } from "~/utils/proposalMockList"
import { Label } from "./label";
import { intlFormatDistance } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { type TVote, VoteLabel } from "./vote-label";
import { StatusLabel } from "./status-label";
import { ResultLabel, type TProposalResult } from "./result-label";
import { Card } from "./card";

type ProposalCardProps = {
  proposal: ProposalList
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;

  const handlePercentage = (favorablePercentage: number) => {
    const againstPercentage = 100 - favorablePercentage

    if (againstPercentage > favorablePercentage) {
      return <Label className="text-red-500 flex gap-1.5 items-center justify-center bg-gray-100 dark:bg-light-dark text-center py-1.5 lg:text-left w-1/2 md:w-auto">{againstPercentage.toFixed(0)}%
        <Image src={'/against-down.svg'} height={14} width={10} alt="against arrow down icon" />
      </Label>
    }

    if (againstPercentage < favorablePercentage) {
      return <Label className=" flex gap-1.5 items-center justify-center text-green-500 bg-gray-100 dark:bg-light-dark text-center lg:text-left py-1.5 w-1/2 md:w-auto">{favorablePercentage.toFixed(0)}%
        <Image src={'/favorable-up.svg'} height={14} width={10} alt="favorable arrow up icon" />
      </Label>
    }

    return <Label className="text-yellow-500 bg-gray-100 dark:bg-light-dark text-center lg:text-left py-1.5 w-1/2 md:w-auto">{favorablePercentage.toFixed(0)}% -</Label>
  }

  const handleRelativeTime = (startDate: Date | string, endDate: Date | string | null) => {
    if (endDate) return <span>Ended {intlFormatDistance(endDate, new Date())}</span>
    return <span>Started {intlFormatDistance(startDate, new Date())}</span>
  }

  return (
    <Card.Root>
      <Card.Header className="flex-col-reverse">
        <h3 className="text-base font-semibold">{proposal.title}</h3>
        <div className="flex flex-row-reverse gap-2 mb-2 md:mb-0 md:ml-auto md:flex-row min-w-fit">
          <VoteLabel vote={proposal.voted as TVote} />
          <StatusLabel isActive={proposal.active} />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="pb-2 md:pb-6">
          <p>{proposal.description}</p>
        </div>

        <div className="flex flex-col items-start justify-between md:items-center md:flex-row">
          <div className="pb-4 space-x-2 text-gray-500 divide-x md:pb-0 min-w-fit">
            {handleRelativeTime(proposal.startDate, proposal.endDate)}
            <span className="pl-2">
              By {" "} {proposal.by}
            </span>
          </div>

          <div className="flex flex-col-reverse justify-center w-full gap-2 mx-auto mt-4 md:justify-end md:mt-0 md:flex-row">
            <div className="flex items-center w-full space-x-2 md:w-auto">
              <ResultLabel result={proposal.proposalResult as TProposalResult} />
              {handlePercentage(proposal.favorablePercentage)}
            </div>

            <Label className="rounded-3xl bg-gray-100 dark:bg-light-dark py-1.5 font-medium w-full md:w-auto text-center">
              Total staked: {" "}
              <span className="font-bold text-blue-500">
                {proposal.totalStake}
              </span>
              <span className="text-xs text-blue-500 font-extralight">
                COMAI
              </span>
            </Label>
          </div>
        </div>
        <div className="flex justify-center pt-4 md:justify-start md:pt-2">
          <Link href={`/proposal/${proposal.id}`} className="text-blue-500 hover:text-blue-400 hover:underline">Click to access proposal {"->"}</Link>
        </div>
      </Card.Body>

    </Card.Root>
  )
}
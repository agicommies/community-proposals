import { type ProposalList } from "~/utils/proposalMockList"
import { Label } from "./label";
import { intlFormatDistance } from "date-fns";
import Link from "next/link";
import Image from "next/image";

type ProposalCardProps = {
  proposal: ProposalList
}

type TVote = "FAVOR" | "AGAINST" | "UNVOTED"
type TProposalResult = "PENDING" | "ACCEPTED" | "REFUSED"


export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;

  const handleProposalVoting = (vote: TVote) => {
    const votingStatus = {
      "UNVOTED": <Label className="text-white border border-white">You didn&apos;t vote for this</Label>,
      "FAVOR": <Label className="text-green-500 border border-green-500">You have voted in favor</Label>,
      "AGAINST": <Label className="text-red-500 border border-red-500">You have voted against</Label>
    }
    return votingStatus[vote || "UNVOTED"]
  }

  const handleProposalStatus = (isActive: boolean) => {
    if (isActive) {
      return <Label className="flex items-center text-black bg-green-400 ">Active</Label>
    }
    return <Label className="flex items-center bg-red-400">Closed</Label>
  }

  const handleProposalResult = (result: TProposalResult) => {
    const votingStatus = {
      "PENDING": <Label className="text-black dark:text-white dark:bg-light-dark text-center lg:text-left bg-gray-100 py-1.5 w-1/2 md:w-auto">Pending</Label>,
      "ACCEPTED": <Label className="text-green-500 dark:bg-light-dark bg-gray-100 text-center lg:text-left py-1.5 w-1/2 md:w-auto">Accepted</Label>,
      "REFUSED": <Label className="text-red-500 dark:bg-light-dark bg-gray-100 text-center lg:text-left py-1.5 w-1/2 md:w-auto">Refused</Label>
    }
    return votingStatus[result || "PENDING"]
  }

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
    <div className="border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom">
      <div className="relative flex flex-col-reverse items-center w-full px-6 py-3 space-y-2 border-b border-black md:space-y-0 md:justify-between md:flex-row dark:border-white rounded-t-xl">
        <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl"></div>
        <h3 className="text-base font-semibold">{proposal.title}</h3>
        <div className="flex flex-row-reverse gap-3 md:flex-row min-w-fit">
          {handleProposalVoting(proposal.voted as TVote)}
          {handleProposalStatus(proposal.active)}
        </div>
      </div>

      <div className="p-6 pb-2 md:pb-6">
        <p>{proposal.description}</p>
      </div>

      <div className="flex flex-col items-start justify-between px-6 md:items-center md:flex-row">
        <div className="pb-4 space-x-2 text-gray-500 divide-x md:pb-0 min-w-fit">
          {handleRelativeTime(proposal.startDate, proposal.endDate)}
          <span className="pl-2">
            By {" "} {proposal.by}
          </span>
        </div>

        <div className="flex flex-col-reverse justify-center w-full gap-2 mx-auto mt-4 md:justify-end md:mt-0 md:flex-row">
          <div className="flex items-center w-full space-x-2 md:w-auto">
            {handleProposalResult(proposal.proposalResult as TProposalResult)}
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
      <div className="flex justify-center p-6 pt-4 md:justify-start md:pt-2">
        <Link href={`/proposal/${proposal.id}`} className="text-blue-500 hover:text-blue-400 hover:underline">Click to access proposal {"->"}</Link>
      </div>
    </div>
  )
}
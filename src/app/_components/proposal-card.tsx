"use client"
import { Label } from "./label"
import { intlFormatDistance } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { type TVote, VoteLabel } from "./vote-label"
import { StatusLabel, type TProposalStatus } from "./status-label"
import { Card } from "./card"
import { Skeleton } from "./skeleton"

// type TProposalResponse = Array<Proposal> & Array<{
//   data: { custom: string },
//   expirationBlock: number //TODO: suposed to be converted in date someway (represents when is expected to be ended)
//   finalizationBlock: number | null //TODO: suposed to be converted in date someway (represents when it have been finilized)
//   id: number,
//   proposalCost: number
//   proposer: string, // author
//   status: "Pending" //unknowed types of status
//   votesAgainst: Array<string> //The strings inside the array represents the "wallet id" from everyone that have voted against this proposal
//   votesFor: Array<string> //The strings inside the array represents the "wallet id" from everyone that have voted for this proposal
// }>

type ProposalCardProps = {
  isProposalBodyLoading?: boolean
  isProposalLoading?: boolean
  proposalsList: Array<unknown>
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposalsList, isProposalLoading } = props

  const isStakeLoading = true

  const handlePercentage = (favorablePercentage: number) => {
    const againstPercentage = 100 - favorablePercentage

    if (againstPercentage > favorablePercentage) {
      return (
        <Label className="flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center text-red-500 md:w-auto lg:text-left dark:bg-light-dark">
          {againstPercentage?.toFixed(0)}%
          <Image
            src={"/against-down.svg"}
            height={14}
            width={10}
            alt="against arrow down icon"
          />
        </Label>
      )
    }

    if (againstPercentage < favorablePercentage) {
      return (
        <Label className=" flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center text-green-500 md:w-auto lg:text-left dark:bg-light-dark">
          {favorablePercentage?.toFixed(0)}%
          <Image
            src={"/favorable-up.svg"}
            height={14}
            width={10}
            alt="favorable arrow up icon"
          />
        </Label>
      )
    }

    return (
      <Label className="w-1/2 bg-gray-100 py-1.5 text-center text-yellow-500 md:w-auto lg:text-left dark:bg-light-dark">
        {favorablePercentage?.toFixed(0)}% -
      </Label>
    )
  }

  const handleRelativeTime = (
    startDate: Date | string,
    endDate: Date | string | null,
  ) => {
    if (endDate)
      return <span>Ended {intlFormatDistance(endDate, new Date())}</span>
    return <span>Started {intlFormatDistance(startDate, new Date())}</span>
  }

  return (
    <>
      {proposalsList?.map((proposal) => {
        return (
          <Card.Root key={proposal.id}>
            <Card.Header className="flex-col-reverse">
              {!isProposalLoading &&
                <h3 className="text-base font-semibold">{proposal.content.Custom.metadata.title}</h3>
              }
              {isProposalLoading &&
                <Skeleton className="w-9/12 py-3 " />
              }
              {!isProposalLoading &&
                <div className="flex flex-row-reverse gap-2 mb-2 min-w-fit md:mb-0 md:ml-auto md:flex-row">
                  {!isStakeLoading &&
                    <VoteLabel vote={proposal.voted as TVote} />
                  }
                  {isStakeLoading &&
                    <span className="flex py-3.5 bg-gray-700 w-[7rem] animate-pulse rounded-3xl" />
                  }
                  <StatusLabel result={proposal.status as TProposalStatus} />
                </div>
              }
              {isProposalLoading &&
                <div className="flex flex-row-reverse justify-center w-2/5 gap-2 mb-2 lg:w-3/12 lg:justify-end md:mb-0 md:ml-auto md:flex-row">
                  <Skeleton className="py-3.5 w-2/5 rounded-3xl" />
                  <Skeleton className="py-3.5 w-2/5 rounded-3xl" />
                </div>
              }
            </Card.Header>
            <Card.Body>
              {!isProposalLoading && <div className="pb-2 md:pb-6">
                <p className="line-clamp-7 md:line-clamp-5">{proposal?.content.Custom.metadata?.body}</p>
              </div>
              }

              {isProposalLoading &&
                <div className="pb-2 space-y-1 md:pb-6">
                  <Skeleton className="py-2.5 w-full rounded-md" />
                  <Skeleton className="py-2.5 w-full rounded-md" />
                  <Skeleton className="py-2.5 w-full rounded-md" />
                  <Skeleton className="py-2.5 w-2/4 rounded-md" />
                </div>
              }

              <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
                {isProposalLoading &&
                  <div className="flex w-full space-x-2">
                    {/* <Skeleton className="py-2.5 w-full lg:w-4/12 rounded-3xl" /> */}
                    <Skeleton className="py-2.5 w-full lg:w-5/12 rounded-3xl" />
                  </div>
                }
                {!isProposalLoading &&
                  <div className="w-[200px] pb-4 space-x-2 text-gray-500 md:pb-0">
                    {/* <span className="">By {proposal.expirationBlock}</span> */}
                    <span className="block w-full truncate line-clamp-1">By {proposal.proposer}</span>
                  </div>
                }

                <div className="flex flex-col-reverse w-full gap-2 mx-auto mt-4 ml-auto center md:mt-0 md:flex-row md:justify-end">
                  {isStakeLoading &&
                    <div className="flex items-center w-full space-x-2 md:justify-end">
                      <span className="flex py-3.5 bg-gray-700 animate-pulse w-full md:w-2/5 lg:w-3/12 rounded-3xl" />
                    </div>
                  }
                  {!isStakeLoading &&
                    <div className="flex items-center w-full space-x-2 md:w-auto">
                      {/* <ResultLabel
                        result={proposal?.proposalResult as TProposalResult}
                      /> */}
                      {handlePercentage(proposal.favorablePercentage)}
                    </div>
                  }

                  {isStakeLoading &&
                    <div className="w-full text-center md:w-4/5">
                      <span className="flex py-3.5 bg-gray-700 w-full animate-pulse rounded-3xl" />
                    </div>
                  }

                  {!isStakeLoading &&
                    <Label className="w-full rounded-3xl bg-gray-100 py-1.5 text-center font-medium md:w-auto dark:bg-light-dark">
                      Total staked:
                      <span className="font-bold text-blue-500">
                        {" "}
                        {proposal.totalStake}
                      </span>
                      <span className="text-xs text-blue-500 font-extralight">
                        COMAI
                      </span>
                    </Label>
                  }

                </div>
              </div>
              <div className="flex justify-center pt-4 md:justify-start md:pt-2">
                {isProposalLoading &&
                  <span className="flex py-2.5 bg-gray-700 animate-pulse w-4/12 rounded-lg" />
                }
                {!isProposalLoading &&
                  <Link
                    href={`/proposal/${proposal.id}`}
                    className="text-blue-500 hover:text-blue-400 hover:underline"
                  >
                    Click to access proposal {"->"}
                  </Link>
                }
              </div>
            </Card.Body>
          </Card.Root>
        )
      })}
    </>
  )
}
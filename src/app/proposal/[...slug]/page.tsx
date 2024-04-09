import { proposalMockList } from "~/utils/proposalMockList";
import { Container } from "../../_components/container";
import { Label } from "~/app/_components/label";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";

type TProposalDetails = {
  params: { slug: string },
}


type TVote = "FAVOR" | "AGAINST" | "UNVOTED"
type TProposalResult = "PENDING" | "ACCEPTED" | "REFUSED"

export default function ProposalDetails(props: TProposalDetails) {
  const { params } = props;

  const proposal = proposalMockList.find((e) => e.id === String(params.slug))
  if (!proposal) return null

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

  return (
    <main className="flex flex-col items-center justify-center dark:bg-light-dark">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>

          <div className="flex gap-3">
            {handleProposalStatus(proposal.active)}
            {handleProposalVoting(proposal.voted as TVote)}
          </div>

          <div className="flex py-2">
            <span className="text-white">Proposals</span>
            <ChevronRightIcon width={20} className="text-white" />
            <span className="text-white">{proposal.title}</span>
          </div>

          <div className="flex gap-4">
            <div className="w-8/12 border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom">
              <div className="relative flex flex-col-reverse items-center w-full px-6 py-3 space-y-2 border-b border-black md:space-y-0 md:justify-between md:flex-row dark:border-white rounded-t-xl">
                <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl"></div>
                <h3 className="text-base font-semibold">{proposal.title}</h3>
              </div>
              <div className="p-6 pb-2 md:pb-6">
                <p>{proposal.description}</p>
              </div>
            </div>

            <div className="w-4/12 space-y-4">
              <div className="border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom">
                <div className="relative flex flex-col-reverse items-center w-full px-6 py-3 space-y-2 border-b border-black md:space-y-0 md:justify-between md:flex-row dark:border-white rounded-t-xl">
                  <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl"></div>
                  <h3 className="text-base font-semibold">Information</h3>
                </div>

                <div className="p-6 pb-2 md:pb-6">
                  <div className="flex flex-col">
                    <span>
                      {proposal.by}
                      <span className="ml-1 text-gray-600">
                        | Post Author
                      </span>
                    </span>

                    <span>
                      {format(new Date(), 'MMM dd, yyyy, hh:mma')}
                      <span className="ml-1 text-gray-600">
                        | End Date
                      </span>
                    </span>

                    <span>
                      Share this post
                      <span className="ml-1 text-gray-600">
                        | URL
                      </span>
                    </span>

                    <span>
                      {proposal.id}
                      <span className="ml-1 text-gray-600">
                        | Post ID
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom">
                <div className="relative flex flex-col-reverse items-center w-full px-6 py-3 space-y-2 border-b border-black md:space-y-0 md:justify-between md:flex-row dark:border-white rounded-t-xl">
                  <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl"></div>
                  <h3 className="text-base font-semibold">Cast your vote</h3>
                </div>
                <div className="flex flex-col items-center w-full p-6 pb-2 space-y-3 md:pb-6">
                  <div className="flex w-full gap-2">
                    <button className="w-full py-1 border-2 border-green-500 rounded-3xl">In favor</button>
                    <button className="w-full py-1 border-2 border-red-500 rounded-3xl">Against</button>
                  </div>
                  <button className="w-full py-1 border-2 border-white rounded-3xl">Vote</button>
                </div>
              </div>

              <div className="border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom">
                <div className="relative flex flex-col-reverse items-center w-full px-6 py-3 space-y-2 border-b border-black md:space-y-0 md:justify-between md:flex-row dark:border-white rounded-t-xl">
                  <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl"></div>
                  <h3 className="text-base font-semibold">Current results</h3>
                </div>

                <div className="p-6 pb-2 md:pb-6">
                  <div>
                    <span>In favor</span>
                  </div>
                  <div>
                    <span>Against</span>
                  </div>
                </div>
              </div>

            </div>
          </div>


        </Container>
      </div>
    </main>
  );
}

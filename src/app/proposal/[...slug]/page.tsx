import { proposalMockList } from "~/utils/proposalMockList";
import { Container } from "../../_components/container";
import { format } from "date-fns";
import { type TVote, VoteLabel } from "~/app/_components/vote-label";
import { StatusLabel } from "~/app/_components/status-label";
import { Card } from "~/app/_components/card";
import Image from "next/image";
import { CopyToClipboard } from "~/app/_components/copy-to-clipboard";
import { headers } from "next/headers";
import { VoteCard } from "~/app/_components/vote-card";

type TProposalDetails = {
  params: { slug: string },
}

export default function ProposalDetails(props: TProposalDetails) {
  const { params } = props;

  const proposal = proposalMockList.find((e) => e.id === String(params.slug))
  if (!proposal) return null

  const headersList = headers();
  const sharePathname = headersList.get('referer') ?? "";

  const votesFavorable = 3
  const votesAgainst = 2

  const favorablePercentage = (votesFavorable * 100 / (votesAgainst + votesFavorable))
  const againstPercentage = 100 - favorablePercentage

  return (
    <main className="flex flex-col items-center justify-center dark:bg-light-dark">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>
          <div className="flex gap-3">
            <StatusLabel isActive={proposal.active} />
            <VoteLabel vote={proposal.voted as TVote} />
          </div>

          <div className="flex flex-col gap-4 mt-6 lg:flex-row">
            <Card.Root className="w-full lg:w-8/12">
              <Card.Header>
                <h3 className="text-base font-semibold">{proposal.title}</h3>
              </Card.Header>
              <Card.Body>
                <p>{proposal.description}</p>
              </Card.Body>
            </Card.Root>

            <div className="w-full space-y-6 lg:w-4/12">
              <Card.Root>
                <Card.Header>
                  <h3 className="text-base font-semibold">Information</h3>
                </Card.Header>
                <Card.Body className="flex flex-col space-y-4">
                  <span className="flex items-center text-sm">
                    <Image src="/id-icon.svg" height={18} width={18} alt="author icon" className="mr-2" />
                    {proposal.by}
                    <span className="ml-1 text-xs text-gray-600">
                      | Post Author
                    </span>
                  </span>

                  <span className="flex items-center text-sm">
                    <Image src="/calendar-icon.svg" height={20} width={20} alt="author icon" className="mr-2" />
                    {format(new Date(), 'MMM dd, yyyy, hh:mma')}
                    <span className="ml-1 text-xs text-gray-600">
                      | End Date
                    </span>
                  </span>

                  <span className="flex items-center text-sm">
                    <Image src="/chain-icon.svg" height={20} width={20} alt="author icon" className="mr-2" />
                    <CopyToClipboard content={sharePathname}>
                      <span className="underline hover:text-blue-500">
                        Share this post
                      </span>
                    </CopyToClipboard>
                    <span className="ml-1 text-xs text-gray-600">
                      | URL
                    </span>
                  </span>

                  <span className="flex items-center text-sm">
                    <Image src="/dev-icon.svg" height={21} width={21} alt="author icon" className="mr-2" />
                    {proposal.id}
                    <span className="ml-1 text-xs text-gray-600">
                      | Post ID
                    </span>
                  </span>
                </Card.Body>
              </Card.Root>

              <VoteCard />

              <Card.Root>
                <Card.Header>
                  <h3 className="text-base font-semibold">Current results</h3>
                </Card.Header>
                <Card.Body>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Favorable</span>
                    <div className="flex items-center gap-2 divide-x">
                      <span className="text-xs">
                        {votesFavorable}
                        {' '} COMAI
                      </span>
                      <span className="pl-2 text-sm font-semibold text-green-500">
                        {favorablePercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#212D43] w-full rounded-3xl my-2">
                    <div className={`bg-green-400 py-2 rounded-3xl`} style={{ width: `${favorablePercentage.toFixed(0)}%` }} />
                  </div>
                  <div className="flex justify-between mt-8">
                    <span className="font-semibold">Against</span>
                    <div className="flex items-center gap-2 divide-x">
                      <span className="text-xs">
                        {votesAgainst}
                        {' '} COMAI
                      </span>
                      <span className="pl-2 text-sm font-semibold text-red-500">
                        {againstPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#212D43] w-full rounded-3xl my-2">
                    <div className={`bg-red-400 py-2 rounded-3xl`} style={{ width: `${againstPercentage.toFixed(0)}%` }} />
                  </div>
                </Card.Body>
              </Card.Root>
            </div>
          </div>
        </Container >
      </div >
    </main >
  );
}

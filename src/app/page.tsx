"use client"
import { Container } from "./_components/container";
import { ProposalListHeader } from "./_components/proposal-list-header";
import { ProposalCard } from "./_components/proposal-card";
import { Card } from "./_components/card";
import { usePolkadot } from "~/polkadot";

export default function HomePage() {
  const stakedVotes = undefined;

  const { proposal, isProposalLoading } = usePolkadot()

  return (
    <main className="flex flex-col items-center justify-center dark:bg-light-dark">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>

          <ProposalListHeader stakedVotes={stakedVotes} />
          <div className="py-8 space-y-8">

            {!isProposalLoading &&
              <ProposalCard proposalsList={proposal} isProposalLoading={isProposalLoading} />
            }

            {isProposalLoading &&
              <Card.Root>
                <Card.Header className="flex-col-reverse">
                  <span className="w-9/12 py-3 bg-gray-700 rounded-lg animate-pulse" />
                  <div className="flex flex-row-reverse justify-center w-2/5 gap-2 mb-2 lg:w-3/12 lg:justify-end md:mb-0 md:ml-auto md:flex-row">
                    <span className="py-3.5 bg-gray-700 animate-pulse w-2/5 rounded-3xl" />
                    <span className="py-3.5 bg-gray-700 animate-pulse w-2/5 rounded-3xl" />
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="pb-2 space-y-1 md:pb-6">
                    <span className="flex py-2.5 bg-gray-700 animate-pulse w-full rounded-md" />
                    <span className="flex py-2.5 bg-gray-700 animate-pulse w-full rounded-md" />
                    <span className="flex py-2.5 bg-gray-700 animate-pulse w-full rounded-md" />
                    <span className="flex py-2.5 bg-gray-700 animate-pulse w-2/4 rounded-md" />
                  </div>

                  <div className="flex flex-col items-start justify-between w-full md:flex-row md:items-center">
                    <div className="flex w-full pb-4 mt-2 space-x-2 text-gray-500 md:pb-0">
                      {/* <span className="flex py-2.5 bg-gray-700 animate-pulse w-4/12 rounded-lg" /> */}
                      <span className="flex py-2.5 bg-gray-700 animate-pulse w-5/12 rounded-lg" />
                    </div>

                    <div className="flex flex-col-reverse justify-center w-full gap-2 mt-4 md:mt-0 md:flex-row md:justify-end">
                      <div className="flex items-center w-full space-x-2 md:w-full md:justify-end">
                        {/* <span className="flex py-3.5 bg-gray-700 animate-pulse  w-full lg:w-4/12 rounded-3xl" /> */}
                        <span className="flex py-3.5 bg-gray-700 animate-pulse w-full lg:w-3/12 rounded-3xl" />
                      </div>

                      <div className="w-full font-medium text-center">
                        <span className="flex py-3.5 bg-gray-700 lg:w-full animate-pulse rounded-3xl" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-4 md:justify-start md:pt-2">
                    <span className="flex py-2.5 bg-gray-700 animate-pulse w-4/12 rounded-lg" />

                  </div>
                </Card.Body>
              </Card.Root>
            }
          </div>
        </Container>
      </div>
    </main>
  );
}

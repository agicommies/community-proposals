"use client";
import { Container } from "./_components/container";
import { ProposalListHeader } from "./_components/proposal-list-header";
import { ProposalCard } from "./_components/proposal-card";
import { Card } from "./_components/card";
import { usePolkadot } from "~/hooks/polkadot";
import {
  compute_votes,
  get_proposal_netuid,
} from "~/hooks/polkadot/functions/proposals";
import type { SS58Address } from "~/hooks/polkadot/functions/types";

export default function HomePage() {
  const { proposals, stake_data, selectedAccount } = usePolkadot();

  let user_stake_weight = null;
  if (stake_data != null && selectedAccount != null) {
    const user_stake_entry = stake_data.stake_out.per_addr.get(
      selectedAccount.address,
    );
    if (user_stake_entry != null) {
      user_stake_weight = user_stake_entry;
    }
    user_stake_weight = 11 * 10 ** 9;
  }

  const isProposalsLoading = proposals == null;

  return (
    <main className="flex flex-col items-center justify-center dark:bg-light-dark">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>
          <ProposalListHeader user_stake_weight={user_stake_weight} />
          <div className="space-y-8 py-8">
            {!isProposalsLoading &&
              proposals?.map((proposal) => {
                const voted =
                  selectedAccount != null
                    ? proposal.votesFor.includes(
                        selectedAccount.address as SS58Address,
                      )
                      ? "FAVORABLE"
                      : proposal.votesAgainst.includes(
                            selectedAccount.address as SS58Address,
                          )
                        ? "AGAINST"
                        : "UNVOTED"
                    : "UNVOTED";

                const netuid = get_proposal_netuid(proposal);
                let proposal_stake_info = null;
                if (stake_data != null) {
                  const stake_map =
                    netuid != null
                      ? stake_data.stake_out.per_addr_per_net.get(netuid) ??
                        new Map<string, bigint>()
                      : stake_data.stake_out.per_addr;
                  proposal_stake_info = compute_votes(
                    stake_map,
                    proposal.votesFor,
                    proposal.votesAgainst,
                  );
                }
                return (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    stake_info={proposal_stake_info}
                    voted={voted}
                  />
                );
              })}

            {isProposalsLoading && (
              <Card.Root>
                <Card.Header className="flex-col-reverse">
                  <span className="w-9/12 animate-pulse rounded-lg bg-gray-700 py-3" />
                  <div className="mb-2 flex w-2/5 flex-row-reverse justify-center gap-2 md:mb-0 md:ml-auto md:flex-row lg:w-3/12 lg:justify-end">
                    <span className="w-2/5 animate-pulse rounded-3xl bg-gray-700 py-3.5" />
                    <span className="w-2/5 animate-pulse rounded-3xl bg-gray-700 py-3.5" />
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-1 pb-2 md:pb-6">
                    <span className="flex w-full animate-pulse rounded-md bg-gray-700 py-2.5" />
                    <span className="flex w-full animate-pulse rounded-md bg-gray-700 py-2.5" />
                    <span className="flex w-full animate-pulse rounded-md bg-gray-700 py-2.5" />
                    <span className="flex w-2/4 animate-pulse rounded-md bg-gray-700 py-2.5" />
                  </div>

                  <div className="flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                    <div className="mt-2 flex w-full space-x-2 pb-4 text-gray-500 md:pb-0">
                      {/* <span className="flex py-2.5 bg-gray-700 animate-pulse w-4/12 rounded-lg" /> */}
                      <span className="flex w-5/12 animate-pulse rounded-lg bg-gray-700 py-2.5" />
                    </div>

                    <div className="mt-4 flex w-full flex-col-reverse justify-center gap-2 md:mt-0 md:flex-row md:justify-end">
                      <div className="flex w-full items-center space-x-2 md:w-full md:justify-end">
                        {/* <span className="flex py-3.5 bg-gray-700 animate-pulse  w-full lg:w-4/12 rounded-3xl" /> */}
                        <span className="flex w-full animate-pulse rounded-3xl bg-gray-700 py-3.5 lg:w-3/12" />
                      </div>

                      <div className="w-full text-center font-medium">
                        <span className="flex animate-pulse rounded-3xl bg-gray-700 py-3.5 lg:w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-4 md:justify-start md:pt-2">
                    <span className="flex w-4/12 animate-pulse rounded-lg bg-gray-700 py-2.5" />
                  </div>
                </Card.Body>
              </Card.Root>
            )}
          </div>
        </Container>
      </div>
    </main>
  );
}

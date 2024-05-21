"use client";
import { Container } from "./_components/container";
import { ProposalListHeader } from "./_components/proposal-list-header";
import { ProposalCard } from "./_components/proposal-card";
import { usePolkadot } from "~/hooks/polkadot";
import {
  compute_votes,
  get_proposal_netuid,
} from "~/hooks/polkadot/functions/proposals";
import type { SS58Address } from "~/hooks/polkadot/functions/types";
import { type TVote } from "./_components/vote-label";
import { BalanceSection } from "./_components/balance-section";
import { CardSkeleton } from "./_components/skeletons/card-skeleton";

export default function HomePage() {
  const { proposals, stake_data, selectedAccount, handleConnect, isInitialized } =
    usePolkadot();

  let user_stake_weight: bigint | null = null;
  if (stake_data != null && selectedAccount != null) {
    const user_stake_entry = stake_data.stake_out.per_addr.get(
      selectedAccount.address,
    );
    user_stake_weight = user_stake_entry ?? 0n;
  }

  const isProposalsLoading = proposals == null;

  const handleUserVotes = ({
    votesAgainst,
    votesFor,
    selectedAccountAddress,
  }: {
    votesAgainst: Array<string>;
    votesFor: Array<string>;
    selectedAccountAddress: SS58Address;
  }): TVote => {
    if (votesAgainst.includes(selectedAccountAddress)) return "AGAINST";
    if (votesFor.includes(selectedAccountAddress)) return "FAVORABLE";
    return "UNVOTED";
  };

  return (
    <main className="flex flex-col items-center justify-center w-full">
      <div className="w-full h-full bg-repeat">
        <Container>
          <BalanceSection
            user_stake_weight={user_stake_weight}
            accountUnselected={!selectedAccount}
            handleConnect={handleConnect}
            isInitialized={isInitialized}
          />

          <ProposalListHeader />

          <div className="max-w-6xl px-4 py-8 mx-auto space-y-10">
            {!isProposalsLoading &&
              proposals?.map((proposal) => {
                const voted = handleUserVotes({
                  votesAgainst: proposal.votesAgainst,
                  votesFor: proposal.votesFor,
                  selectedAccountAddress:
                    selectedAccount?.address as SS58Address,
                });

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
              <CardSkeleton />
            )}
          </div>
        </Container>
      </div>
    </main>
  );
}

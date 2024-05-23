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
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { DaoCard } from "./_components/dao-card";
import { BalanceSection } from "./_components/balance-section";
import { CardSkeleton } from "./_components/skeletons/card-skeleton";

export default function HomePage() {
  const { proposals, daos, stake_data, selectedAccount } = usePolkadot();

  const [viewMode, setViewMode] = useState<'proposals' | 'daos'>("proposals");
  const [content, setContent] = useState<Array<ReactElement> | null>(null);


  const isLoading = proposals == null;

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

  const renderProposals = useCallback(() => {
    const proposalsContent = proposals?.map((proposal) => {
      const voted = handleUserVotes({
        votesAgainst: proposal.votesAgainst,
        votesFor: proposal.votesFor,
        selectedAccountAddress: selectedAccount?.address as SS58Address,
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
        <div key={proposal.id} className="animate-fade-in-down">
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            stake_info={proposal_stake_info}
            voted={voted}
          />
        </div>
      );
    })

    if (!proposalsContent) return null
    return proposalsContent
  }, [proposals, selectedAccount?.address, stake_data])

  const renderDaos = useCallback(() => {
    const daosContent = daos?.map((dao) => {
      return (
        <div key={dao.id}>
          <DaoCard key={dao.id} dao={dao} />
        </div>
      );
    })

    if (!daosContent) return null
    return daosContent
  }, [daos])

  // viewMode === 'proposals' ? renderProposals() : renderDaos()

  useEffect(() => {
    if (!isLoading) {
      setContent(viewMode === 'proposals' ? renderProposals() : renderDaos())
    }
  }, [viewMode, isLoading, renderProposals, renderDaos])

  return (
    <main className="flex flex-col items-center justify-center w-full">
      <div className="w-full h-full bg-repeat">
        <Container>
          <BalanceSection className="hidden lg:flex" />

          <ProposalListHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          <div className="max-w-6xl px-4 py-8 mx-auto space-y-10">
            {!isLoading && content}
            {isLoading && (
              <CardSkeleton />
            )}
          </div>
        </Container>
      </div>
    </main>
  );
}

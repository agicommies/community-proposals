"use client";
import { useState } from "react";

import { Container } from "./_components/container";
import { ProposalListHeader } from "./_components/proposal-list-header";
import { usePolkadot } from "~/hooks/polkadot";
import { DaoCard } from "./_components/dao-card";
import { BalanceSection } from "./_components/balance-section";
import { CardSkeleton } from "./_components/skeletons/card-skeleton";
import { useSubspaceQueries } from "~/subspace/queries";
import { type ProposalStatus, type SS58Address } from "~/subspace/types";
import { type TVote } from "./_components/vote-label";
import { ProposalCard } from "./_components/proposal-card";

export default function HomePage() {
  const { api, selectedAccount } = usePolkadot();
  const { proposals_with_meta, is_proposals_loading, daos, is_dao_loading } =
    useSubspaceQueries(api);

  const [viewMode, setViewMode] = useState<"proposals" | "daos">("proposals");

  const handleIsLoading = (kind: "proposals" | "daos") => {
    switch (kind) {
      case "daos":
        return is_dao_loading;
      case "proposals":
        return is_proposals_loading;
      default:
        console.error(`Invalid kind`);
        return false;
    }
  };

  const isLoading = handleIsLoading(viewMode);

  const handleUserVotes = ({
    proposalStatus,
    selectedAccountAddress,
  }: {
    proposalStatus: ProposalStatus;
    selectedAccountAddress: SS58Address;
  }): TVote => {
    if (!proposalStatus.hasOwnProperty("open")) return "UNVOTED";

    if (
      "open" in proposalStatus &&
      proposalStatus.open.votesFor.includes(selectedAccountAddress)
    ) {
      return "FAVORABLE";
    }
    if (
      "open" in proposalStatus &&
      proposalStatus.open.votesAgainst.includes(selectedAccountAddress)
    ) {
      return "AGAINST";
    }

    return "UNVOTED";
  };

  const renderProposals = () => {
    const proposalsContent = proposals_with_meta?.map((proposal) => {
      const voted = handleUserVotes({
        proposalStatus: proposal.status,
        selectedAccountAddress: selectedAccount?.address as SS58Address,
      });

      return (
        <div key={proposal.id} className="animate-fade-in-down">
          <ProposalCard key={proposal.id} proposal={proposal} voted={voted} />
        </div>
      );
    });
    return proposalsContent;
  };

  const renderDaos = () => {
    const daosContent = daos?.map((dao) => {
      return (
        <div key={dao.id}>
          <DaoCard key={dao.id} dao={dao} />
        </div>
      );
    });

    return daosContent;
  };

  const content = viewMode === "proposals" ? renderProposals() : renderDaos();

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <div className="h-full w-full bg-repeat">
        <Container>
          <BalanceSection className="hidden lg:flex" />

          <ProposalListHeader viewMode={viewMode} setViewMode={setViewMode} />

          <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
            {!isLoading && content}
            {isLoading && <CardSkeleton />}
          </div>
        </Container>
      </div>
    </main>
  );
}

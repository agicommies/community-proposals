import { proposalMockList } from "~/utils/proposalMockList";
import { Container } from "./_components/container";
import { ProposalListHeader } from "./_components/proposal-list-header";
import { ProposalCard } from "./_components/proposal-card";

export default function HomePage() {
  const stakedVotes = 5107.45;

  return (
    <main className="flex flex-col items-center justify-center dark:bg-light-dark">
      <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
        <Container>
          <ProposalListHeader stakedVotes={stakedVotes} />
          <div className="space-y-8 py-8">
            {proposalMockList.map((proposal) => {
              return <ProposalCard proposal={proposal} key={proposal.id} />;
            })}
          </div>
        </Container>
      </div>
    </main>
  );
}

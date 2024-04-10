import Link from "next/link";
import { CreateProposal } from "./create-proposal";

type ProposalListHeaderProps = {
  stakedVotes: string | number;
};

export const ProposalListHeader = (props: ProposalListHeaderProps) => {
  const { stakedVotes } = props;
  return (
    <div className="flex w-full flex-col items-center justify-between gap-6 lg:flex-row">
      <h2 className="text-4xl font-semibold dark:text-white">Proposals</h2>
      <div className="flex w-full flex-col items-center space-y-4 lg:flex-row lg:space-x-3 lg:space-y-0 lg:divide-x">
        <div className="flex w-full justify-center lg:flex-col lg:items-end">
          <span className="text-base font-medium text-black dark:text-white">
            Your total staked votes:
          </span>
          <span className="ml-1 text-base font-semibold text-blue-500">
            {stakedVotes}
            <span className="text-xs font-light">COMAI</span>
          </span>
        </div>

        <div className="flex w-full flex-row-reverse justify-center gap-4 lg:w-auto lg:flex-row lg:gap-0 lg:pl-3">
          <input
            className="w-8/12 rounded-xl border-2 border-black bg-white px-4 py-2 shadow-custom placeholder:text-black lg:mr-3 lg:w-auto dark:border-white dark:bg-light-dark dark:text-white dark:shadow-custom-dark dark:placeholder:text-white"
            placeholder="Search"
          ></input>
          <button className="w-4/12 rounded-xl border-2 border-black px-4 shadow-custom lg:w-auto dark:border-white dark:bg-light-dark dark:text-white dark:shadow-custom-dark">
            Filter
          </button>
        </div>

        <div className="flex w-full min-w-max lg:w-auto lg:pl-3">
          <CreateProposal />
        </div>
      </div>
    </div>
  );
};

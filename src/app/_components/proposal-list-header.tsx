import { Skeleton } from "./skeleton";

import { CreateProposal } from "./create-proposal";
import { format_token } from "~/utils";

type ProposalListHeaderProps = {
  user_stake_weight: number | null;
  accountUnselected: boolean
  handleConnect: () => void
};

export const ProposalListHeader = (props: ProposalListHeaderProps) => {
  const { user_stake_weight, accountUnselected, handleConnect } = props;

  return (
    <div className="flex w-full flex-col items-center justify-between gap-6 lg:flex-row">
      <h2 className="text-4xl font-semibold dark:text-white">Proposals</h2>
      <div className="flex w-full flex-col items-center space-y-4 lg:flex-row lg:space-x-3 lg:space-y-0 lg:divide-x">
        <div className="flex w-full justify-center lg:flex-col lg:items-end">
          <span className="text-base font-medium text-black dark:text-white">
            Your total staked balance:
          </span>

          {!user_stake_weight && !accountUnselected && (
            <Skeleton className="ml-2 w-1/5 py-2 md:mt-1 lg:w-2/5" />
          )}

          {!user_stake_weight && accountUnselected && (
            <button
              className="text-blue-500"
              onClick={() => handleConnect()}
            >
              Connect your wallet
            </button>
          )}

          {user_stake_weight && (
            <span className="ml-1 text-base font-semibold text-blue-500">
              {format_token(user_stake_weight)}
              <span className="text-xs font-light"> COMAI</span>
            </span>
          )}
        </div>

        {/* <div className="flex w-full flex-row-reverse justify-center gap-4 lg:w-auto lg:flex-row lg:gap-0 lg:pl-3">
          <input
            className="w-8/12 rounded-xl border-2 border-black bg-white px-4 py-2 shadow-custom placeholder:text-black lg:mr-3 lg:w-auto dark:border-white dark:bg-light-dark dark:text-white dark:shadow-custom-dark dark:placeholder:text-white"
            placeholder="Search"
          ></input>
          <button className="w-4/12 rounded-xl border-2 border-black px-4 shadow-custom lg:w-auto dark:border-white dark:bg-light-dark dark:text-white dark:shadow-custom-dark">
            Filter
          </button>
        </div> */}

        <div className="flex w-full min-w-max lg:w-auto lg:pl-3">
          <CreateProposal />
        </div>
      </div>
    </div>
  );
};

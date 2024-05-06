"use client";

import { Skeleton } from "./skeleton";
import { format_token } from "~/utils";
import { usePolkadot } from "~/hooks/polkadot";
import { CreateProposal } from "./create-proposal";
import { CreateDao } from "./create-dao";

type ProposalListHeaderProps = {
  user_stake_weight: bigint | null;
  accountUnselected: boolean;
  handleConnect: () => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
};

export const ProposalListHeader = (props: ProposalListHeaderProps) => {
  const { isBalanceLoading, balance } = usePolkadot();
  const { user_stake_weight, accountUnselected, handleConnect } = props;

  return (
    <div className="flex w-full flex-col items-center justify-between gap-6 lg:flex-row">
      <div className="flex gap-1 text-2xl font-medium dark:text-white">
        <button
          className={`toggle-btn rounded-xl border-2 px-5 py-2 shadow-custom dark:shadow-custom-dark ${props.viewMode === "proposals" ? "active bg-blue-200 dark:bg-blue-950" : ""}`}
          onClick={() => props.setViewMode("proposals")}
        >
          Proposals
        </button>
        <button
          className={`toggle-btn ml-2 rounded-xl border-2 px-5 py-2 shadow-custom dark:shadow-custom-dark ${props.viewMode === "daos" ? "active bg-blue-200 dark:bg-blue-950" : ""}`}
          onClick={() => props.setViewMode("daos")}
        >
          S0 DAO Applications
        </button>
      </div>
      <div className="flex w-full flex-col items-center space-y-4 lg:flex-row lg:space-x-3 lg:space-y-0 lg:divide-x">
        <div className="flex w-full flex-col justify-end lg:items-end">
          <div>
            {user_stake_weight == null ? (
              !accountUnselected ? (
                <Skeleton className="ml-2 w-1/5 py-2 md:mt-1 lg:w-2/5" />
              ) : (
                <button
                  className="pl-2 text-blue-500"
                  onClick={() => handleConnect()}
                >
                  Connect your wallet
                </button>
              )
            ) : (
              <div>
                <span className="text-base font-medium text-black dark:text-white">
                  Total balance:
                </span>
                <span className="ml-1 text-base font-semibold text-green-500">
                  {isBalanceLoading ? (
                    <Skeleton className="w-1/5 py-2 md:mt-1 lg:w-2/5" />
                  ) : (
                    balance
                  )}
                  <span className="text-xs font-light"> COMAI</span>
                </span>
                <div>
                  <span className="text-base font-medium text-black dark:text-white">
                    Total staked balance:
                  </span>
                  <span className="ml-1 text-base font-semibold text-blue-500">
                    {format_token(user_stake_weight)}
                    <span className="text-xs font-light"> COMAI</span>
                  </span>
                </div>
              </div>
            )}
          </div>
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

        <div className="flex w-full min-w-max gap-3 lg:w-auto lg:pl-3">
          <CreateProposal />
          <CreateDao />
        </div>
      </div>
    </div>
  );
};

"use client";

import {
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { usePolkadot } from "~/hooks/polkadot";
import { useSubspaceQueries } from "~/subspace/queries";
import { type CallbackStatus } from "~/subspace/types";

export function VotingPowerButton() {
  const { api, selectedAccount, updateDelegatingVotingPower } = usePolkadot();
  const { not_delegating_voting_set } = useSubspaceQueries(api);

  const [votingStatus, setVotingStatus] = useState<CallbackStatus>({
    status: null,
    finalized: false,
    message: null,
  });

  const [isPowerUser, setIsPowerUser] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const notDelegatingList = not_delegating_voting_set?.toHuman() as string[];

  useEffect(() => {
    if (selectedAccount?.address && notDelegatingList) {
      const isUserPower = notDelegatingList.includes(selectedAccount.address);
      setIsPowerUser(isUserPower);
    }
  }, [selectedAccount, not_delegating_voting_set, notDelegatingList]);

  const handleCallback = (callbackReturn: CallbackStatus) => {
    setVotingStatus(callbackReturn);
  };

  if (!selectedAccount) {
    return null; // No button is displayed if there is no selected account
  }

  const handleVote = () => {
    updateDelegatingVotingPower(
      {
        boolean: isPowerUser,
      },
      handleCallback,
    );
  };

  const tooltipText =
    "By default, your voting power is delegated to a validator. If you're not a validator and prefer to manage your own votes, click here!";

  return (
    <div className="p-6">
      <div className="flex w-full flex-row items-center justify-center gap-3">
        <button
          type="submit"
          onClick={() => handleVote()}
          className={`w-11/12 border border-gray-500 py-1 font-semibold text-green-500 transition duration-200 hover:border-green-600 hover:bg-green-500/10`}
        >
          {isPowerUser ? "Enable vote power delegation" : "Become a Power User"}
        </button>
        <div className="relative w-1/12">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <InformationCircleIcon className="h-7 w-7 pt-1.5 text-green-500" />
          </button>
          {showTooltip && (
            <div className="absolute bottom-10 right-0 w-64 border border-gray-500 bg-green-950/50 p-2 text-sm text-white shadow-lg backdrop-blur-md">
              {tooltipText}
            </div>
          )}
        </div>
      </div>
      {votingStatus.status && (
        <p
          className={`${votingStatus.status === "PENDING" && "text-yellow-300"} ${votingStatus.status === "ERROR" && "text-red-300"} ${votingStatus.status === "SUCCESS" && "text-green-300"} flex text-left text-base`}
        >
          {votingStatus.message}
          {votingStatus.status === "PENDING" && (
            <ArrowPathIcon width={16} className="ml-2 animate-spin" />
          )}
        </p>
      )}
    </div>
  );
}

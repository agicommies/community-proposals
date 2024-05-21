"use client";

import { useState } from "react";
import { Card } from "./card";
import { type TVote } from "./vote-label";
import { usePolkadot, type VoteStatus } from "~/hooks/polkadot";
import Image from "next/image";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

export const VoteCard = (props: { proposalId: number, voted: TVote }) => {
  const { proposalId, voted = 'UNVOTED' } = props;
  const { isConnected, send_vote, handleConnect } = usePolkadot();

  const [vote, setVote] = useState("UNVOTED");
  const [votingStatus, setVotingStatus] = useState<VoteStatus>({
    status: null,
    finalized: false,
    message: null
  });

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleCallback = (callbackReturn: VoteStatus) => {
    setVotingStatus(callbackReturn)
  }

  const handleVote = () => {
    send_vote({
      proposal_id: proposalId,
      vote: vote === "FAVORABLE" ? true : false,
    }, handleCallback);
  };

  // const handleRemoveVote = () => {
  //   removeStake({
  //     validator: "5CXiWwsS76H2vwroWu4SvdAS3kxprb7aFtqWLxxZC5FNhYri",
  //     amount: String(1),
  //   });
  // };

  if (voted !== "UNVOTED") {
    return (
      <Card.Root>
        <Card.Header>
          <h3 className="text-base font-semibold">Cast your vote</h3>
        </Card.Header>
        <Card.Body className="flex w-full flex-col space-y-4 p-6">
          <span>You already voted!</span>
        </Card.Body>
      </Card.Root>
    )
  }


  return (
    <Card.Root>
      <Card.Header>
        <h3 className="text-base font-semibold">Cast your vote</h3>
      </Card.Header>
      <Card.Body className="flex w-full flex-col space-y-4 p-6">
        {isConnected &&
          <div className="flex w-full gap-4">
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full rounded-2xl border-2 border-green-500 py-1 ${vote === "FAVORABLE" ? "bg-green-500 text-black" : "text-green-800"} ${votingStatus.status === "PENDING" && 'cursor-not-allowed'}`}
              onClick={() => handleVotePreference("FAVORABLE")}
            >
              Favorable
            </button>
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full rounded-2xl border-2 border-red-500 py-1 ${vote === "AGAINST" ? "bg-red-500 text-black" : "text-red-500 "} ${votingStatus.status === "PENDING" && 'cursor-not-allowed'}`}
              onClick={() => handleVotePreference("AGAINST")}
            >
              Against
            </button>
          </div>
        }


        {!isConnected &&
          <button
            onClick={handleConnect}
            className=" w-full rounded-2xl flex items-center border-2 p-1.5 text-black justify-center gap-3 border-orange-500 bg-white px-4 py-2 shadow-custom-orange active:top-1 active:shadow-custom-orange-clicked"

          >
            <span className="flex gap-3 font-medium text-orange-500">
              <Image
                src="/polkadot-logo.svg"
                alt="Polkadot"
                width={24}
                height={24}
              />
              <p>Connect Wallet to vote</p>
            </span>
          </button>
        }

        {isConnected &&
          <button
            onClick={handleVote}
            disabled={vote === "UNVOTED" || votingStatus.status === "PENDING"}
            className={`w-full rounded-2xl border-2 p-1.5 ${vote === "UNVOTED" || votingStatus.status === "PENDING" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400 text-black"} `}
          >
            {vote === "UNVOTED" && "Chose Before Voting"}
            {vote !== "UNVOTED" && "Vote"}
          </button>
        }

        {votingStatus.status &&
          <p className={`${votingStatus.status === "PENDING" && 'text-yellow-300'} ${votingStatus.status === "ERROR" && 'text-red-300'} ${votingStatus.status === "SUCCESS" && 'text-green-300'} flex text-base text-left`}>
            {votingStatus.message}
            {votingStatus.status === "PENDING" &&
              <ArrowPathIcon width={16} className="animate-spin ml-2" />
            }
          </p>
        }

      </Card.Body>
    </Card.Root>
  );
};

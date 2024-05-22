"use client";

import { useState } from "react";
import { Card } from "./card";
import { type TVote } from "./vote-label";
import { usePolkadot } from "~/hooks/polkadot";
import Image from "next/image";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { type CallbackStatus } from "~/hooks/polkadot/functions/types";

export const VoteCard = (props: { proposalId: number; voted: TVote }) => {
  const { proposalId, voted = "UNVOTED" } = props;
  const { isConnected, send_vote, handleConnect } = usePolkadot();

  const [vote, setVote] = useState("UNVOTED");
  const [votingStatus, setVotingStatus] = useState<CallbackStatus>({
    status: null,
    finalized: false,
    message: null,
  });

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleCallback = (callbackReturn: CallbackStatus) => {
    setVotingStatus(callbackReturn);
  };

  const handleVote = () => {
    send_vote(
      {
        proposal_id: proposalId,
        vote: vote === "FAVORABLE" ? true : false,
      },
      handleCallback,
    );
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
        <Card.Body className="flex flex-col w-full p-6 space-y-4">
          <span>You already voted!</span>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root className="bg-transparent border-none">
      <Card.Header>
        <h3 className="text-base font-semibold">Cast your vote</h3>
      </Card.Header>
      <Card.Body className="flex flex-col w-full p-6 space-y-4 border-b border-gray-500">
        {isConnected && (
          <div className="flex w-full gap-4">
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full border border-green-600 py-1 ${vote === "FAVORABLE" ? "bg-green-500/20 border-green-500 text-green-500" : "text-green-600"} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
              onClick={() => handleVotePreference("FAVORABLE")}
            >
              Favorable
            </button>
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full border border-red-600 py-1 ${vote === "AGAINST" ? "bg-red-500/20 text-red-500 border-red-500" : "text-red-500 "} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
              onClick={() => handleVotePreference("AGAINST")}
            >
              Against
            </button>
          </div>
        )}

        {!isConnected && (
          <button
            onClick={handleConnect}
            className=" w-full flex items-center border p-1.5 text-black justify-center gap-3 border-orange-500 bg-white px-4 py-2 shadow-custom-orange active:top-1 active:shadow-custom-orange-clicked"
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
        )}

        {isConnected && (
          <button
            onClick={handleVote}
            disabled={vote === "UNVOTED" || votingStatus.status === "PENDING"}
            className={`w-full border p-1.5 ${vote === "UNVOTED" || votingStatus.status === "PENDING" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400/20 text-blue-400"} `}
          >
            {vote === "UNVOTED" && "Chose Before Voting"}
            {vote !== "UNVOTED" && "Vote"}
          </button>
        )}

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
      </Card.Body>
    </Card.Root>
  );
};

"use client";
import { useState } from "react";
import { Card } from "./card";
import { type TVote } from "./vote-label";
import { usePolkadot } from "~/polkadot";

export const VoteCard = () => {
  const { isConnected, addStake } = usePolkadot();

  const [vote, setVote] = useState("UNVOTED");

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleVote = () => {
    addStake({
      validator: "5CXiWwsS76H2vwroWu4SvdAS3kxprb7aFtqWLxxZC5FNhYri",
      amount: String(1), // make this dynamic
    });
  };

  // const handleRemoveVote = () => {
  //   removeStake({
  //     validator: "5CXiWwsS76H2vwroWu4SvdAS3kxprb7aFtqWLxxZC5FNhYri",
  //     amount: String(1),
  //   });
  // };

  return (
    <Card.Root>
      <Card.Header>
        <h3 className="text-base font-semibold">Cast your vote</h3>
      </Card.Header>
      <Card.Body className="flex w-full flex-col items-center space-y-4 p-6">
        <div className="flex w-full gap-4">
          <button
            className={`w-full rounded-3xl border-2 border-green-500 py-1 ${vote === "FAVORABLE" ? "bg-green-500 text-black" : "text-green-800"}`}
            onClick={() => handleVotePreference("FAVORABLE")}
          >
            Favorable
          </button>
          <button
            className={`w-full rounded-3xl border-2 border-red-500 py-1 ${vote === "AGAINST" ? "bg-red-500 text-black" : "text-red-500 "}`}
            onClick={() => handleVotePreference("AGAINST")}
          >
            Against
          </button>
        </div>
        <button
          onClick={handleVote}
          disabled={!isConnected || vote === "UNVOTED"}
          className={`w-full rounded-3xl border-2 p-1.5 ${!isConnected || vote === "UNVOTED" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400 text-black"} `}
        >
          {vote === "UNVOTED"
            ? "Chose Before Voting"
            : !isConnected
              ? "Connect Wallet to Vote"
              : "Vote"}
        </button>
      </Card.Body>
    </Card.Root>
  );
};

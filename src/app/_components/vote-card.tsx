"use client";
import { useState } from "react";
import { Card } from "./card";
import { type TVote } from "./vote-label";
import { usePolkadot } from "~/polkadot";

export const VoteCard = () => {
  const { isConnected, addStake } = usePolkadot();
  const [selectedAmount, setSelectedAmount] = useState("1");

  const handleAmountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAmount(event.target.value);
  };

  const [vote, setVote] = useState("UNVOTED");

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleVote = () => {
    addStake({
      validator: "5CXiWwsS76H2vwroWu4SvdAS3kxprb7aFtqWLxxZC5FNhYri",
      amount: String(selectedAmount),
    });
  };

  // const handleRemoveVote = () => {
  //   removeStake({
  //     validator: "5CXiWwsS76H2vwroWu4SvdAS3kxprb7aFtqWLxxZC5FNhYri",
  //     amount: String(selectedAmount),
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
            className={`w-full rounded-3xl border-2 border-green-500 py-1 ${vote === "FAVORABLE" && "bg-green-500 text-black"}`}
            onClick={() => handleVotePreference("FAVORABLE")}
          >
            Favorable
          </button>
          <button
            className={`w-full rounded-3xl border-2 border-red-500 py-1 ${vote === "AGAINST" && "bg-red-500 text-black"}`}
            onClick={() => handleVotePreference("AGAINST")}
          >
            Against
          </button>
        </div>
        <select
          value={selectedAmount}
          disabled={!isConnected}
          onChange={handleAmountChange}
          className="darkborder-dark w-full rounded-3xl border-2 bg-white p-2 dark:bg-light-dark"
        >
          <option value="1">1 COMAI</option>
          <option value="10">10 COMAI</option>
          <option value="100">100 COMAI</option>
          <option value="1000">1,000 COMAI</option>
          <option value="10000">10,000 COMAI</option>
          <option value="100000">100,000 COMAI</option>
          <option value="1000000">1,000,000 COMAI</option>
        </select>
        <button
          onClick={handleVote}
          disabled={!isConnected || vote === "UNVOTED"}
          className={`w-full rounded-3xl border-2 p-1.5 ${!isConnected || vote === "UNVOTED" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400 text-black"} `}
        >
          {vote === "UNVOTED" || !isConnected ? "Connect to vote" : "Vote"}
        </button>
      </Card.Body>
    </Card.Root>
  );
};

"use client";

import { useState } from "react";
import { Card } from "./card";
import { type TVote } from "./vote-label";
import { usePolkadot } from "~/hooks/polkadot";
import Image from "next/image";

export const VoteCard = (props: { proposalId: number }) => {
  const { proposalId } = props;
  const { isConnected, send_vote, handleConnect } = usePolkadot();

  const [vote, setVote] = useState("UNVOTED");

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleVote = () => {
    send_vote({
      proposal_id: proposalId,
      vote: vote === "FAVORABLE" ? true : false,
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
        {isConnected &&
          <div className="flex w-full gap-4">
            <button
              disabled={!isConnected}
              className={`w-full rounded-2xl border-2 border-green-500 py-1 ${vote === "FAVORABLE" ? "bg-green-500 text-black" : "text-green-800"}`}
              onClick={() => handleVotePreference("FAVORABLE")}
            >
              Favorable
            </button>
            <button
              disabled={!isConnected}
              className={`w-full rounded-2xl border-2 border-red-500 py-1 ${vote === "AGAINST" ? "bg-red-500 text-black" : "text-red-500 "}`}
              onClick={() => handleVotePreference("AGAINST")}
            >
              Against
            </button>
          </div>
        }


        {!isConnected &&
          <button
            onClick={handleConnect}
            className=" w-full rounded-2xl flex items-center border-2 p-1.5 text-black justify-center gap-3 border-orange-500 bg-white px-4 py-2 shadow-custom-orange active:top-1 active:shadow-custom-orange-clicked dark:bg-light-dark"

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
            disabled={!isConnected || vote === "UNVOTED"}
            className={`w-full rounded-2xl border-2 p-1.5 ${!isConnected || vote === "UNVOTED" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400 text-black"} `}
          >
            {vote === "UNVOTED"
              ? "Chose Before Voting"
              : "Vote"}
          </button>
        }
      </Card.Body>
    </Card.Root>
  );
};

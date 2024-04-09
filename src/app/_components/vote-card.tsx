"use client"
import { useState } from "react"
import { Card } from "./card"
import { type TVote } from "./vote-label"

export const VoteCard = () => {
  const [vote, setVote] = useState("UNVOTED")

  const handleVotePreference = (value: TVote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value)
    if (vote === value) return setVote("UNVOTED")
  }

  return (
    <Card.Root>
      <Card.Header>
        <h3 className="text-base font-semibold">Cast your vote</h3>
      </Card.Header>
      <Card.Body className="flex flex-col items-center w-full p-6 space-y-4">
        <div className="flex w-full gap-4">
          <button className={`w-full py-1 border-2 border-green-500 rounded-3xl ${vote === "FAVORABLE" && 'bg-green-500 text-black'}`} onClick={() => handleVotePreference('FAVORABLE')}>Favorable</button>
          <button className={`w-full py-1 border-2 border-red-500 rounded-3xl ${vote === "AGAINST" && 'bg-red-500 text-black'}`} onClick={() => handleVotePreference('AGAINST')}>Against</button>
        </div>
        <button className={`w-full py-1 border-2 rounded-3xl ${vote === "UNVOTED" ? "cursor-not-allowed border-gray-400 text-gray-400" : 'bg-blue-400 border-blue-400 text-black'} `}>Vote</button>
      </Card.Body>
    </Card.Root>
  )
}
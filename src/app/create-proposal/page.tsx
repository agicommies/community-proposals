"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePolkadot } from "~/polkadot";

import { api } from "~/trpc/react";

export default function CreateProposalPage() {
  const router = useRouter();
  const { selectedAccount } = usePolkadot();

  const [data, setData] = useState("");

  const createProposal = api.proposal.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setData("");
    },
  });

  return (
    <main className=" dark:bg-light-dark">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProposal.mutate({ proposer: String(selectedAccount), data });
        }}
        className="flex flex-col gap-2 px-24 pt-12 "
      >
        <input
          type="text"
          placeholder="Your proposal here..."
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-full bg-gray-100 px-4 py-2 dark:bg-dark dark:text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-blue-500 px-10 py-3 font-semibold text-white transition hover:bg-blue-600 dark:bg-light-dark dark:text-white"
          disabled={createProposal.isPending}
        >
          {createProposal.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
}

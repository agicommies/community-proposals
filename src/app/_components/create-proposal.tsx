"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePolkadot } from "~/polkadot";

import { api } from "~/trpc/react";

export function CreateProposal() {
  const router = useRouter();
  const { selectedAccount, isConnected } = usePolkadot();

  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);

  const [data, setData] = useState("");

  const createProposal = api.proposal.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setData("");
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={toggleModalMenu}
        className="min-w-auto w-full rounded-xl border-2 border-blue-500 px-4 py-2 text-blue-500 shadow-custom-blue lg:w-auto dark:bg-light-dark"
      >
        New Proposal
      </button>
      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-dark bg-opacity-60 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-[100%] max-w-5xl transform overflow-hidden rounded-3xl border-2 border-zinc-800 bg-white text-left shadow-custom dark:border-white dark:bg-light-dark dark:shadow-custom-dark">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b-2 border-zinc-800 bg-[url(/grids.svg)] bg-cover bg-center bg-no-repeat p-6 md:flex-row dark:border-white">
                <div className="flex flex-col items-center md:flex-row">
                  <h3
                    className="pl-2 text-xl font-bold leading-6 dark:text-white"
                    id="modal-title"
                  >
                    Create Proposal
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={toggleModalMenu}
                  className="rounded-2xl border-2 border-black p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
                >
                  <XMarkIcon className="h-6 w-6 dark:fill-white" />
                </button>
              </div>
              {/* Modal Body */}
              <main className=" dark:bg-light-dark">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createProposal.mutate({
                      proposer: String(selectedAccount),
                      data,
                    });
                  }}
                  className="flex flex-col gap-2 p-6"
                >
                  <textarea
                    placeholder="Your proposal here..."
                    value={data}
                    rows={5}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full rounded-xl bg-gray-100 px-4 py-2 dark:bg-dark dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gray-100 p-3 font-semibold text-black transition hover:bg-gray-200 dark:bg-dark dark:text-white dark:hover:bg-blue-950"
                    disabled={createProposal.isPending || !isConnected}
                  >
                    {createProposal.isPending
                      ? "Submitting..."
                      : isConnected
                        ? "Submit"
                        : "Connect Wallet to Submit"}
                  </button>
                </form>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

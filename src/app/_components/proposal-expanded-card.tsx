"use client";

export const runtime = "edge";

import { format } from "date-fns";
import { type TVote, VoteLabel } from "~/app/_components/vote-label";
import { StatusLabel } from "~/app/_components/status-label";
import { Card } from "~/app/_components/card";
import Image from "next/image";
import { CopyToClipboard } from "~/app/_components/copy-to-clipboard";

import { VoteCard } from "~/app/_components/vote-card";
import { Container } from "./container";
import { type ProposalCardProps } from "./proposal-card";
import { useState } from "react";

export default function ProposalExpandedCard(props: ProposalCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);
  return (
    <>
      <button
        type="button"
        onClick={toggleModalMenu}
        className="min-w-auto w-full rounded-xl border-2 border-blue-500 px-4 py-2 text-blue-500 shadow-custom-blue lg:w-auto dark:bg-light-dark"
      >
        Click to view proposal {"->"}
      </button>
      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-dark bg-opacity-60 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto">
          <main className="flex flex-col items-center justify-center dark:bg-light-dark">
            <div className="my-12 h-full w-full bg-[url(/dots-bg.svg)] bg-repeat py-12 dark:bg-[url(/dots-bg-dark.svg)]">
              <Container>
                <div className="flex gap-3">
                  <StatusLabel result="Pending" /> {/* TODO: add result */}
                  <VoteLabel vote={proposal.voted as TVote} />
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                  <Card.Root className="w-full lg:w-8/12">
                    <Card.Header>
                      <h3 className="text-base font-semibold">
                        {proposal.title}
                      </h3>
                    </Card.Header>
                    <Card.Body>
                      <p>{proposal.description}</p>
                    </Card.Body>
                  </Card.Root>

                  <div className="w-full space-y-6 lg:w-4/12">
                    <Card.Root>
                      <Card.Header>
                        <h3 className="text-base font-semibold">Information</h3>
                      </Card.Header>
                      <Card.Body className="flex flex-col space-y-4">
                        <span className="flex items-center text-sm">
                          <Image
                            src="/id-icon.svg"
                            height={18}
                            width={18}
                            alt="author icon"
                            className="mr-2"
                          />
                          {proposal.by}
                          <span className="ml-1 text-xs text-gray-600">
                            | Post Author
                          </span>
                        </span>

                        <span className="flex items-center text-sm">
                          <Image
                            src="/calendar-icon.svg"
                            height={20}
                            width={20}
                            alt="author icon"
                            className="mr-2"
                          />
                          {format(new Date(), "MMM dd, yyyy, hh:mma")}
                          <span className="ml-1 text-xs text-gray-600">
                            | End Date
                          </span>
                        </span>

                        <span className="flex items-center text-sm">
                          <Image
                            src="/chain-icon.svg"
                            height={20}
                            width={20}
                            alt="author icon"
                            className="mr-2"
                          />
                          <CopyToClipboard content={sharePathname}>
                            <span className="underline hover:text-blue-500">
                              Share this post
                            </span>
                          </CopyToClipboard>
                          <span className="ml-1 text-xs text-gray-600">
                            | URL
                          </span>
                        </span>

                        <span className="flex items-center text-sm">
                          <Image
                            src="/dev-icon.svg"
                            height={21}
                            width={21}
                            alt="author icon"
                            className="mr-2"
                          />
                          {proposal.id}
                          <span className="ml-1 text-xs text-gray-600">
                            | Post ID
                          </span>
                        </span>
                      </Card.Body>
                    </Card.Root>

                    <VoteCard />

                    <Card.Root>
                      <Card.Header>
                        <h3 className="text-base font-semibold">
                          Current results
                        </h3>
                      </Card.Header>
                      <Card.Body>
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold">
                            Favorable
                          </span>
                          <div className="flex items-center gap-2 divide-x">
                            <span className="text-xs">
                              {votesFavorable} COMAI
                            </span>
                            <span className="pl-2 text-sm font-semibold text-green-500">
                              {favorablePercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="my-2 w-full rounded-3xl bg-[#212D43]">
                          <div
                            className={`rounded-3xl bg-green-400 py-2`}
                            style={{
                              width: `${favorablePercentage.toFixed(0)}%`,
                            }}
                          />
                        </div>
                        <div className="mt-8 flex justify-between">
                          <span className="font-semibold">Against</span>
                          <div className="flex items-center gap-2 divide-x">
                            <span className="text-xs">
                              {votesAgainst} COMAI
                            </span>
                            <span className="pl-2 text-sm font-semibold text-red-500">
                              {againstPercentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="my-2 w-full rounded-3xl bg-[#212D43]">
                          <div
                            className={`rounded-3xl bg-red-400 py-2`}
                            style={{
                              width: `${againstPercentage.toFixed(0)}%`,
                            }}
                          />
                        </div>
                      </Card.Body>
                    </Card.Root>
                  </div>
                </div>
              </Container>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

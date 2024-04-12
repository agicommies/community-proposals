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
import { Label } from "./label";
import { type ProposalStakeInfo } from "~/proposals";
import { bigint_division, format_token } from "~/utils";
import { assert } from "tsafe";
import { XMarkIcon } from "@heroicons/react/20/solid";

function handle_favorable_percent(favorable_percent: number) {
  const againstPercentage = 100 - favorable_percent;
  // const winning = favorable_percent >= 50;
  if (Number.isNaN(favorable_percent)) {
    return (
      <Label className="w-1/2 bg-gray-100 py-1.5 text-center text-yellow-500 md:w-auto lg:text-left dark:bg-light-dark">
        – %
      </Label>
    );
  }
  return (
    // TODO: render red-ish label if losing and green-ish label if winning
    <Label className="flex w-1/2 items-center justify-center gap-1.5 bg-gray-100 py-1.5 text-center md:w-auto lg:text-left dark:bg-light-dark">
      <span className="text-green-500">{favorable_percent?.toFixed(0)}%</span>
      <Image
        src={"/favorable-up.svg"}
        height={14}
        width={10}
        alt="favorable arrow up icon"
      />
      {" / "}
      <span className="text-red-500"> {againstPercentage?.toFixed(0)}% </span>
      <Image
        src={"/against-down.svg"}
        height={14}
        width={10}
        alt="against arrow down icon"
      />
    </Label>
  );
}

function render_favorable_percent(stake_info: ProposalStakeInfo) {
  const { stake_for, stake_against, stake_voted } = stake_info;
  assert(
    stake_for + stake_against == stake_voted,
    "stake_for + stake_against != stake_voted",
  );
  const favorable_percent = bigint_division(stake_for, stake_voted) * 100;
  return handle_favorable_percent(favorable_percent);
}

function render_quorum_percent(stake_info: ProposalStakeInfo) {
  const { stake_voted, stake_total } = stake_info;
  const quorum_percent = bigint_division(stake_voted, stake_total) * 100;
  return (
    <span className="text-yellow-600">
      {" ("}
      {quorum_percent.toFixed(2)} %{")"}
    </span>
  );
}

function render_vote_data(stake_info: ProposalStakeInfo) {
  const { stake_for, stake_against, stake_voted, stake_total } = stake_info;

  const favorable_percent = bigint_division(stake_for, stake_voted) * 100;

  return (
    <>
      <div className="flex justify-between">
        <span className="text-sm font-semibold">Favorable</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{format_token(stake_for)} COMAI</span>
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
          <span className="text-xs">{votesAgainst} COMAI</span>
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
    </>
  );
}

export default function ProposalExpandedCard(props: ProposalCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);

  const { proposal, stake_info } = props;

  const voted: TVote = "UNVOTED";
  const title = proposal.custom_data?.title;
  const body = proposal.custom_data?.body;
  const share_pathname = `/proposal/${proposal.id}`;

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
          <main className="flex flex-col items-center justify-center">
            <div className="my-12 h-full w-full bg-repeat py-12 ">
              <Container>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <StatusLabel result="Pending" /> {/* TODO: add result */}
                    <VoteLabel vote={voted} />
                  </div>
                  <button
                    type="button"
                    onClick={toggleModalMenu}
                    className="rounded-2xl border-2 border-black p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
                  >
                    <XMarkIcon className="h-6 w-6 dark:fill-white" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                  <Card.Root className="w-full lg:w-8/12">
                    {proposal.custom_data && (
                      <>
                        <Card.Header>
                          <h3 className="text-base font-semibold">
                            {proposal.custom_data.title}
                          </h3>
                        </Card.Header>
                        <Card.Body>
                          <p>{proposal.custom_data.body}</p>
                        </Card.Body>
                      </>
                    )}
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
                          {proposal.proposer.slice(0, 26)}...
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
                          <CopyToClipboard content={share_pathname}>
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
                      <Card.Body></Card.Body>
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

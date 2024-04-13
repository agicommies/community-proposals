"use client";

export const runtime = "edge";

import Image from "next/image";
import { useState } from "react";

import { XMarkIcon } from "@heroicons/react/20/solid";
import MarkdownPreview from "@uiw/react-markdown-preview";

import { Card } from "~/app/_components/card";
// import { CopyToClipboard } from "~/app/_components/copy-to-clipboard";
import { StatusLabel } from "~/app/_components/status-label";
import { VoteCard } from "~/app/_components/vote-card";
import { VoteLabel } from "~/app/_components/vote-label";
import { type ProposalStakeInfo } from "~/hooks/polkadot/functions/proposals";
import { bigint_division, format_token, small_address } from "~/utils";

import { getCurrentTheme } from "~/styles/theming";
import { Container } from "./container";
import { Label } from "./label";
import { type ProposalCardProps } from "./proposal-card";
import { Skeleton } from "./skeleton";
import { handle_proposal } from "./util.ts/proposal_fields";

function render_vote_data(stake_info: ProposalStakeInfo) {
  const { stake_for, stake_against, stake_voted } = stake_info;

  const favorable_percent = bigint_division(stake_for, stake_voted) * 100;
  const against_percent = bigint_division(stake_against, stake_voted) * 100;

  return (
    <>
      <div className="flex justify-between">
        <span className="text-sm font-semibold">Favorable</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{format_token(stake_for)} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-green-500">
            {favorable_percent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="my-2 w-full rounded-3xl bg-[#212D43]">
        <div
          className={`rounded-3xl bg-green-400 py-2`}
          style={{
            width: `${favorable_percent.toFixed(0)}%`,
          }}
        />
      </div>
      <div className="mt-8 flex justify-between">
        <span className="font-semibold">Against</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{format_token(stake_against)} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-red-500">
            {against_percent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="my-2 w-full rounded-3xl bg-[#212D43]">
        <div
          className={`rounded-3xl bg-red-400 py-2`}
          style={{
            width: `${against_percent.toFixed(0)}%`,
          }}
        />
      </div>
    </>
  );
}

export default function ProposalExpandedCard(props: ProposalCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);
  const theme = getCurrentTheme();

  const { proposal, stake_info, voted } = props;
  const { title, body, netuid, invalid } = handle_proposal(proposal);

  // const share_pathname = `/proposal/${proposal.id}`; // TODO

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
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm transition-opacity" />
        {/* Modal */}
        className={``}
        {/* Red corner if invalid */}
        <div
          className={`fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto ${invalid ? "corner-red" : ""}`}
        >
          <main className="flex flex-col items-center justify-center">
            <div className="my-12 h-full w-full bg-repeat py-12 ">
              <Container>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <VoteLabel vote={voted} />
                    <Label>
                      {(netuid !== "GLOBAL" && (
                        <span> Subnet {netuid} </span>
                      )) || <span> Global </span>}
                    </Label>
                    <StatusLabel result={proposal.status} />{" "}
                  </div>
                  <button
                    type="button"
                    onClick={toggleModalMenu}
                    className="rounded-2xl border-2 border-black bg-white p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
                  >
                    <XMarkIcon className="h-6 w-6 dark:fill-white" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                  <Card.Root className="w-full lg:w-8/12">
                    <>
                      <Card.Header>
                        {title && (
                          <h3 className="text-base font-semibold">{title}</h3>
                        )}
                        {!title && <Skeleton className="w-8/12 py-3" />}
                      </Card.Header>
                      <Card.Body>
                        {body != null && (
                          <div
                            className="rounded-xl p-3 dark:bg-black/20"
                            data-color-mode={
                              theme === "dark" ? "dark" : "light"
                            }
                          >
                            <MarkdownPreview source={body} />
                          </div>
                        )}
                        {body == null && (
                          <Skeleton className="w-full rounded-xl py-3" />
                        )}
                      </Card.Body>
                    </>
                  </Card.Root>

                  <div className="w-full space-y-6 lg:w-4/12">
                    <Card.Root>
                      <Card.Header>
                        <h3 className="text-base font-semibold">Info</h3>
                      </Card.Header>
                      <Card.Body className="flex flex-col space-y-4">
                        {/* Proposal ID */}
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
                            | Proposal ID
                          </span>
                        </span>

                        <span className="flex items-center text-sm">
                          <Image
                            src="/id-icon.svg"
                            height={18}
                            width={18}
                            alt="author icon"
                            className="mr-2"
                          />
                          {small_address(proposal.proposer)}
                          <span className="ml-1 text-xs text-gray-600">
                            | Proposal Author
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
                          {proposal.expirationBlock}
                          <span className="ml-1 text-xs text-gray-600">
                            | Expiration block
                          </span>
                        </span>

                        {/* TODO */}
                        {/* <span className="flex items-center text-sm">
                          <Image
                            src="/chain-icon.svg"
                            height={20}
                            width={20}
                            alt="author icon"
                            className="mr-2"
                          />
                          <CopyToClipboard content={share_pathname}>
                            <span className="underline hover:text-blue-500">
                              Share this proposal
                            </span>
                          </CopyToClipboard>
                          <span className="ml-1 text-xs text-gray-600">
                            | URL
                          </span>
                        </span> */}
                      </Card.Body>
                    </Card.Root>

                    <VoteCard proposalId={proposal.id} voted={voted} />

                    <Card.Root>
                      <Card.Header>
                        <h3 className="text-base font-semibold">
                          Current results
                        </h3>
                      </Card.Header>
                      <Card.Body>
                        {stake_info && render_vote_data(stake_info)}
                        {!stake_info && (
                          <Skeleton className="w-full rounded-3xl py-2.5" />
                        )}
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

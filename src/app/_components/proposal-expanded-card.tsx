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

import { Container } from "./container";
import { Label } from "./label";
import { type ProposalCardProps } from "./proposal-card";
import { Skeleton } from "./skeleton";
import { handle_proposal } from "./util.ts/proposal_fields";
import { cairo } from "~/styles/fonts";
import { ArrowRight } from 'lucide-react'


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
      <div className="flex justify-between mt-8">
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

  const { proposal, stake_info, voted } = props;
  const { title, body, netuid, invalid } = handle_proposal(proposal);

  // const share_pathname = `/proposal/${proposal.id}`; // TODO

  return (
    <>
      <button
        type="button"
        onClick={toggleModalMenu}
        className="flex items-center w-full px-2 py-2 text-sm text-green-500 border border-green-500 lg:px-4 min-w-auto lg:w-auto"
      >
        View full proposal
        <ArrowRight className="w-5 ml-auto lg:ml-2 stroke-green-500" />
      </button>

      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-dark/95 backdrop-blur-sm" />
        {/* Modal */}
        className={``}
        {/* Red corner if invalid */}
        <div
          className={`fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto ${invalid ? "corner-red" : ""}`}
        >
          <main className="flex flex-col items-center justify-center">
            <div className="w-full h-full p-6 py-12 my-12 bg-repeat">
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
                    className="p-2 transition duration-200 bg-white border-2 border-black"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mt-6 lg:flex-row">
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
                            className="p-3 rounded-xl"
                          >
                            <MarkdownPreview source={body} style={{ backgroundColor: 'transparent', color: 'white' }} className={`${cairo.className}`} />
                          </div>
                        )}
                        {body == null && (
                          <Skeleton className="w-full py-3 rounded-xl" />
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

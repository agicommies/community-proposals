"use client";

import { notFound } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { usePolkadot } from "~/hooks/polkadot";

import type { DaoStatus, ProposalStatus, SS58Address } from "~/subspace/types";
import { calc_proposal_favorable_percent } from "~/hooks/polkadot/functions/proposals";
import { format_token, small_address } from "~/utils";
import { VoteLabel, type TVote } from "~/app/_components/vote-label";
import { StatusLabel } from "~/app/_components/status-label";
import { VoteCard } from "~/app/_components/vote-card";
import { DaoStatusLabel } from "~/app/_components/dao-status-label";
import { useSubspaceQueries } from "~/subspace/queries";
import {
  handle_custom_dao,
  handle_proposal,
} from "~/app/_components/util.ts/proposal_fields";

import { MarkdownView } from "~/app/_components/markdown-view";
import { VotingPowerButton } from "~/app/_components/voting-power-button";

type ProposalContent = {
  paramId: number;
  contentType: string;
};

function render_vote_data(favorable_percent: number | null) {
  if (favorable_percent === null) return null;

  const against_percent = 100 - favorable_percent;
  return (
    <>
      <div className="flex justify-between">
        <span className="text-sm font-semibold">Favorable</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{favorable_percent} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-green-500">
            {favorable_percent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="my-2 w-full bg-dark">
        <div
          className={`bg-green-400 py-2`}
          style={{
            width: `${favorable_percent.toFixed(0)}%`,
          }}
        />
      </div>
      <div className="mt-8 flex justify-between">
        <span className="font-semibold">Against</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{format_token(against_percent)} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-red-500">
            {against_percent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="my-2 w-full bg-dark">
        <div
          className={`bg-red-400 py-2`}
          style={{
            width: `${against_percent.toFixed(0)}%`,
          }}
        />
      </div>
    </>
  );
}

const handleUserVotes = ({
  proposalStatus,
  selectedAccountAddress,
}: {
  proposalStatus: ProposalStatus;
  selectedAccountAddress: SS58Address;
}): TVote => {
  if (!proposalStatus.hasOwnProperty("open")) return "UNVOTED";

  if (
    "open" in proposalStatus &&
    proposalStatus.open.votesFor.includes(selectedAccountAddress)
  ) {
    return "FAVORABLE";
  }
  if (
    "open" in proposalStatus &&
    proposalStatus.open.votesAgainst.includes(selectedAccountAddress)
  ) {
    return "AGAINST";
  }

  return "UNVOTED";
};

export const ExpandedView = (props: ProposalContent) => {
  const { paramId, contentType } = props;

  const { api, selectedAccount } = usePolkadot();
  const {
    daos_with_meta,
    proposals_with_meta,
    is_dao_loading,
    is_proposals_loading,
  } = useSubspaceQueries(api);

  const handleProposalsContent = () => {
    const proposal = proposals_with_meta?.find(
      (proposal) => proposal.id === paramId,
    );
    if (!proposal) return null;

    const { body, netuid, title, invalid } = handle_proposal(proposal);

    const voted = handleUserVotes({
      proposalStatus: proposal.status,
      selectedAccountAddress: selectedAccount?.address as SS58Address,
    });

    const proposalContent = {
      body,
      title,
      netuid,
      invalid,
      id: proposal.id,
      status: proposal.status,
      author: proposal.proposer,
      expirationBlock: proposal.expirationBlock,
      voted: voted,
    };
    return proposalContent;
  };

  const handleDaosContent = () => {
    const dao = daos_with_meta?.find((dao) => dao.id === paramId);
    if (!dao) return null;

    dao.custom_data;
    const { body, title } = handle_custom_dao(dao.id, dao.custom_data ?? null);

    const daoContent = {
      body,
      title,
      status: dao?.status,
      author: dao?.userId,
      id: dao?.id,
      expirationBlock: null,
      invalid: null,
      netuid: null,
      voted: null,
      stakeInfo: null,
    };
    return daoContent;
  };

  const handleContent = () => {
    if (contentType === "dao") {
      return handleDaosContent();
    }
    if (contentType === "proposal") {
      return handleProposalsContent();
    }
    return null;
  };

  const handleIsLoading = (type: string | undefined) => {
    switch (type) {
      case "dao":
        return is_dao_loading;

      case "proposal":
        return is_proposals_loading;

      default:
        return false;
    }
  };

  const isLoading = handleIsLoading(contentType);

  const content = handleContent();

  if (isLoading || !content)
    return (
      <div className="flex w-full items-center justify-center lg:h-[calc(100svh-203px)]">
        <h1 className="text-2xl text-white">Loading...</h1>
        <ArrowPathIcon width={20} color="#FFF" className="ml-2 animate-spin" />
      </div>
    );

  if (!content) {
    return notFound();
  }

  return (
    <>
      <div className="flex flex-col lg:h-[calc(100svh-203px)] lg:w-2/3 lg:overflow-auto">
        <div className="border-b border-gray-500 p-6">
          <h2 className="text-base font-semibold">{content?.title}</h2>
        </div>
        <div className="h-full p-6 lg:overflow-auto">
          <MarkdownView source={content.body ?? ""} />
        </div>
      </div>

      <div className="flex flex-col lg:w-1/3">
        <div className="border-b border-t border-gray-500 p-6 pr-20 lg:border-t-0">
          <div className="flex flex-col gap-3 ">
            <div>
              <span className="text-gray-500">ID</span>
              <span className="flex items-center">{content?.id}</span>
            </div>

            {content?.author && (
              <div>
                <span className="text-gray-500">Author</span>
                <span className="flex items-center">
                  {small_address(content.author)}
                </span>
              </div>
            )}

            {content?.expirationBlock && (
              <div>
                <span className="text-gray-500">Expiration block</span>
                <span className="flex items-center">
                  {content.expirationBlock}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-500 p-6">
          <div className="flex items-center gap-3">
            <VoteLabel vote={content.voted!} />
            {contentType === "proposal" && (
              <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
                {(content?.netuid !== "GLOBAL" && (
                  <span> Subnet {content?.netuid} </span>
                )) || <span> Global </span>}
              </span>
            )}
            {contentType === "dao" ? (
              <DaoStatusLabel result={content?.status as DaoStatus} />
            ) : (
              <StatusLabel result={content?.status as ProposalStatus} />
            )}
          </div>
        </div>

        {contentType == "proposal" && (
          <>
            <VoteCard proposalId={content.id} voted="UNVOTED" />
            <div className="w-full border-gray-500 p-6 lg:border-b ">
              {!content.status && (
                <span className="flex text-gray-400">
                  Loading results...
                  <ArrowPathIcon width={16} className="ml-2 animate-spin" />
                </span>
              )}
              {content.status &&
                render_vote_data(
                  calc_proposal_favorable_percent(
                    content.status as ProposalStatus,
                  ),
                )}
            </div>
            <VotingPowerButton />
          </>
        )}
      </div>
    </>
  );
};

"use client"

import { usePolkadot } from "~/hooks/polkadot";
import { MarkdownView } from "../../_components/markdown-view";
import { handle_proposal } from "../../_components/util.ts/proposal_fields";
import { notFound } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { type SS58Address } from "~/hooks/polkadot/functions/types";
import { compute_votes, type ProposalStakeInfo } from "~/hooks/polkadot/functions/proposals";
import { bigint_division, format_token, small_address } from "~/utils";
import { VoteLabel, type TVote } from "~/app/_components/vote-label";
import { StatusLabel } from "~/app/_components/status-label";
import { VoteCard } from "~/app/_components/vote-card";

type ProposalContent = {
  paramId: number,
  contentType: string
}

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
      <div className="w-full my-2 bg-dark">
        <div
          className={`bg-green-400 py-2`}
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
      <div className="w-full my-2 bg-dark">
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
  votesAgainst,
  votesFor,
  selectedAccountAddress,
}: {
  votesAgainst: Array<string>;
  votesFor: Array<string>;
  selectedAccountAddress: SS58Address;
}): TVote => {
  if (votesAgainst.includes(selectedAccountAddress)) return "AGAINST";
  if (votesFor.includes(selectedAccountAddress)) return "FAVORABLE";
  return "UNVOTED";
};

export const ExpandedView = (props: ProposalContent) => {
  const { paramId, contentType } = props;

  const { proposals, daos, selectedAccount, stake_data } = usePolkadot();


  const handleProposalsContent = () => {
    const proposal = proposals?.find(
      (proposal) => proposal.id === paramId,
    );
    if (!proposal) return null;

    const { body, netuid, title, invalid } = handle_proposal(proposal);


    const voted = handleUserVotes({
      votesAgainst: proposal.votesAgainst,
      votesFor: proposal.votesFor,
      selectedAccountAddress: selectedAccount?.address as SS58Address,
    });

    let proposal_stake_info = null;
    if (stake_data != null) {
      const parsedNetuid = netuid === "GLOBAL" ? null : netuid;
      const stake_map =
        parsedNetuid != null
          ? stake_data.stake_out.per_addr_per_net.get(parsedNetuid) ??
          new Map<string, bigint>()
          : stake_data.stake_out.per_addr;
      proposal_stake_info = compute_votes(
        stake_map,
        proposal.votesFor,
        proposal.votesAgainst,
      );
    }

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
      stakeInfo: proposal_stake_info,
    };
    return proposalContent;
  };

  const handleDaosContent = () => {
    const dao = daos?.find((dao) => dao.id === paramId);
    if (!dao) return null;

    const daoContent = {
      body: dao?.body?.body,
      title: dao?.body?.title,
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
        return daos == null;

      case "proposal":
        return proposals == null;

      default:
        return false;
    }
  };

  const isLoading = handleIsLoading(contentType);

  const content = handleContent();

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full lg:h-[calc(100svh-203px)]">
        <h1 className="text-2xl text-white">Loading...</h1>
        <ArrowPathIcon width={20} color="#FFF" className="ml-2 animate-spin" />
      </div>
    );

  if ((!content && !isLoading) || !content) {
    return notFound();
  }


  return (<>
    <div className="flex flex-col lg:h-[calc(100svh-203px)] lg:w-2/3 lg:overflow-auto">
      <div className="p-6 border-b border-gray-500">
        <h2 className="text-base font-semibold">{content?.title}</h2>
      </div>
      <div className="h-full p-6 lg:overflow-auto">
        <MarkdownView source={content.body ?? ''} />
      </div>
    </div>


    <div className="flex flex-col lg:w-1/3">
      <div className="p-6 pr-20 border-t border-b border-gray-500 lg:border-t-0">
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

      <div className="p-6 border-b border-gray-500">
        <div className="flex items-center gap-3">
          <VoteLabel vote={content.voted!} />
          {
            contentType === 'proposal' && (
              <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
                {(content?.netuid !== "GLOBAL" && (
                  <span> Subnet {content?.netuid} </span>
                )) || <span> Global </span>}
              </span>
            )
          }

          <StatusLabel result={content?.status} />{" "}
        </div>
      </div>

      {content && contentType == "proposal" && (
        <>
          <VoteCard proposalId={content.id} voted="UNVOTED" />
          <div className="w-full p-6 border-gray-500 lg:border-b ">
            {!content.stakeInfo && (
              <span className="flex text-gray-400">
                Loading results...
                <ArrowPathIcon width={16} className="ml-2 animate-spin" />
              </span>
            )}
            {content.stakeInfo && render_vote_data(content.stakeInfo)}
          </div>
        </>
      )}
    </div>
  </>
  )
}
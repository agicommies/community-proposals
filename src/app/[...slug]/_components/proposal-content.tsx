"use client"

import { usePolkadot } from "~/hooks/polkadot";
import { MarkdownView } from "../../_components/markdown-view";
import { handle_proposal } from "../../_components/util.ts/proposal_fields";

type ProposalContent = {
  paramId: number,
  contentType: string
}

export const ProposalContent = (props: ProposalContent) => {
  const { paramId, contentType } = props;

  const { proposals, daos } = usePolkadot();


  const handleProposalsContent = () => {

    const proposal = proposals?.find(
      (proposal) => proposal.id === paramId,
    );
    if (!proposal) return null;

    const { body, title } = handle_proposal(proposal);

    const proposalContent = {
      body,
      title,
    };
    return proposalContent;
  };

  const handleDaosContent = () => {
    const dao = daos?.find((dao) => dao.id === paramId);
    if (!dao) return null;

    const daoContent = {
      body: dao?.body?.body,
      title: dao?.body?.title,
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

  const content = handleContent();
  if (!content) return null

  return (
    <div className="flex flex-col lg:h-[calc(100svh-203px)] lg:w-2/3 lg:overflow-auto">
      <div className="p-6 border-b border-gray-500">
        <h2 className="text-base font-semibold">{content?.title}</h2>
      </div>
      <div className="h-full p-6 lg:overflow-auto">
        <MarkdownView source={content.body ?? ''} />
      </div>
    </div>
  )
}
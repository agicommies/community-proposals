import { CreateProposal } from "./create-proposal";

export const ProposalListHeader = () => {

  return (
    <div className="flex-col items-center justify-between hidden w-full gap-6 py-6 border-b border-gray-500 lg:flex lg:flex-row ">
      <div className="w-full max-w-6xl mx-auto lg:px-4">
        <div className="flex justify-end w-full">
          <CreateProposal />
        </div>
      </div>
    </div>
  );
};

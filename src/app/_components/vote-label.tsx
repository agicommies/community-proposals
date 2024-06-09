import { Label } from "./label";

export type TVote = "FAVORABLE" | "AGAINST" | "UNVOTED" | "FINISHED";
type TVoteLabelProps = { vote: TVote };

export const VoteLabel = (props: TVoteLabelProps) => {
  const { vote } = props;

  const votingStatus = {
    UNVOTED: <></>,
    FAVORABLE: (
      <Label className="border border-green-500 text-green-500">
        Favorable
      </Label>
    ),
    AGAINST: (
      <Label className="border border-red-500 text-red-500">Against</Label>
    ),
    FINISHED: (
      <Label className="border border-gray-500 text-gray-500">Finished</Label>
    ),
  };
  return votingStatus[vote || "UNVOTED"];
};

import { Label } from "./label";

export type TVote = "FAVORABLE" | "AGAINST" | "UNVOTED";
type TVoteLabelProps = { vote: TVote };

export const VoteLabel = (props: TVoteLabelProps) => {
  const { vote } = props;

  const votingStatus = {
    // UNVOTED: <Label className="border border-white text-white">Unvoted</Label>,
    UNVOTED: <></>,
    FAVORABLE: (
      <Label className="border border-green-500 text-green-500">
        Favorable
      </Label>
    ),
    AGAINST: (
      <Label className="border border-red-500 text-red-500">Against</Label>
    ),
  };
  return votingStatus[vote || "UNVOTED"];
};

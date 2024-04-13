import { Label } from "./label";

export type TProposalStatus = "Pending" | "Accepted" | "Rejected"
type TStatusLabelProps = {
  result: TProposalStatus
  className?: string
}

export const StatusLabel = (props: TStatusLabelProps) => {
  const { result, className = '' } = props;
  const votingStatus = {
    "Pending": <Label className={` dark:text-black dark:bg-white text-center lg:text-left bg-light-dark text-white py-1.5 w-auto ${className}`}>Active</Label>,
    "Accepted": <Label className={` bg-green-400 text-center lg:text-left py-1.5 w-auto ${className}`}>Accepted</Label>,
    "Rejected": <Label className={` bg-red-400 text-center lg:text-left py-1.5 w-auto  ${className}`}>Rejected</Label>
  }
  return votingStatus[result || "Pending"]
};

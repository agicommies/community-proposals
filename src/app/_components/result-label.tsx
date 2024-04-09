import { Label } from "./label"

export type TProposalResult = "ONGOING" | "ACCEPTED" | "REFUSED"
type TLabelResultProps = {
  result: TProposalResult
  className?: string
}

export const ResultLabel = (props: TLabelResultProps) => {
  const { result, className } = props;
  const votingStatus = {
    "ONGOING": <Label className={`text-black dark:text-white dark:bg-light-dark text-center lg:text-left bg-gray-100 py-1.5 w-1/2 md:w-auto ${className}`}>Ongoing</Label>,
    "ACCEPTED": <Label className={`text-green-500 dark:bg-light-dark bg-gray-100 text-center lg:text-left py-1.5 w-1/2 md:w-auto ${className}`}>Accepted</Label>,
    "REFUSED": <Label className={`text-red-500 dark:bg-light-dark bg-gray-100 text-center lg:text-left py-1.5 w-1/2 md:w-auto ${className}`}>Refused</Label>
  }
  return votingStatus[result || "ONGOING"]
}
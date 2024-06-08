import { Label } from "./label";

export type DaoStatus = "Pending" | "Accepted" | "Refused";

type TStatusLabelProps = {
  result: DaoStatus;
  className?: string;
};

export const DaoStatusLabel = (props: TStatusLabelProps) => {
  const { result, className = "" } = props;
  const votingStatus = {
    Pending: (
      <Label
        className={`w-auto border py-1.5 text-center text-white lg:text-left ${className}`}
      >
        Active
      </Label>
    ),
    Accepted: (
      <Label
        className={`w-auto border border-green-500 py-1.5 text-center text-green-500 lg:text-left ${className}`}
      >
        Accepted
      </Label>
    ),
    Refused: (
      <Label
        className={`w-auto border border-red-500 py-1.5 text-center text-red-500 lg:text-left ${className}`}
      >
        Refused
      </Label>
    ),
  };
  return votingStatus[result ?? "Pending"];
};

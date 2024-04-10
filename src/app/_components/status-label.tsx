import { Label } from "./label";

type TStatusLabelProps = {
  isActive: boolean;
};

export const StatusLabel = (props: TStatusLabelProps) => {
  const { isActive } = props;
  if (isActive) {
    return (
      <Label className="flex items-center bg-green-400 text-black ">
        Active
      </Label>
    );
  }
  return <Label className="flex items-center bg-red-600/90">Closed</Label>;
};

import { Label } from "./label"

type TStatusLabelProps = {
  isActive: boolean
}

export const StatusLabel = (props: TStatusLabelProps) => {
  const { isActive } = props;
  if (isActive) {
    return <Label className="flex items-center text-black bg-green-400 ">Active</Label>
  }
  return <Label className="flex items-center bg-red-400">Closed</Label>
}
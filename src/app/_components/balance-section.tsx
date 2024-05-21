import { Globe, Landmark, WalletMinimalIcon } from "lucide-react"
import { format_token } from "~/utils";
import { Skeleton } from "./skeleton";

type BalanceSectionProps = {
  user_stake_weight: bigint | null;
  accountUnselected: boolean;
  isInitialized: boolean;
  handleConnect: () => void;
};

export const BalanceSection = (props: BalanceSectionProps) => {
  const { user_stake_weight, accountUnselected, handleConnect, isInitialized } = props;

  const handleShowStakeWeight = () => {
    if (user_stake_weight != null) {
      return (
        <p>{format_token(user_stake_weight)}<span className="text-lg text-white"> COMAI</span></p>
      )
    }

    if (isInitialized && accountUnselected) {
      return (
        <div>
          <button onClick={() => handleConnect()}>
            Connect your wallet
          </button>
        </div>
      )
    }
    return <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
  }

  return (
    <div className="justify-between hidden w-full text-2xl text-green-500 border-b border-gray-500 lg:flex ">
      <div className="flex w-full px-6 mx-auto divide-x divide-gray-500 lg:max-w-6xl">
        <div className="flex flex-row items-center justify-between w-1/3 pr-6 lg:pr-10">
          <div>
            <p>164,342 <span className="text-lg text-white">COMAI</span></p>
            <span className="text-base font-thin text-gray-400">DAO treasury funds</span>
          </div>
          <Landmark size={40} />
        </div>

        <div className="flex flex-row items-center justify-between w-1/3 p-6 lg:p-10">
          <div>
            <p>727,727<span className="text-lg text-white"> COMAI</span></p>
            <span className="text-base font-thin text-gray-400">Your on balance</span>
          </div>
          <WalletMinimalIcon size={40} />
        </div>

        <div className="flex flex-row items-center justify-between w-1/3 pl-6 lg:pl-10">
          <div>
            {handleShowStakeWeight()}
            <span className="text-base font-thin text-gray-400">Your total staked balance</span>
          </div>
          <Globe size={40} />

        </div>
      </div>

    </div>
  )
}
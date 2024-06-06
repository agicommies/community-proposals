"use client";
import { format_token } from "~/utils";
import { Skeleton } from "./skeleton";
import { usePolkadot } from "~/hooks/polkadot";
import Image from "next/image";

export const BalanceSection = ({ className }: { className?: string }) => {
  const {
    isInitialized,
    daosTreasuries,
    balance,
    selectedAccount,
    stake_data,
  } = usePolkadot();

  let user_stake_weight: bigint | null = null;
  if (stake_data != null && selectedAccount != null) {
    const user_stake_entry = stake_data.stake_out.per_addr.get(
      selectedAccount.address,
    );
    user_stake_weight = user_stake_entry ?? 0n;
  }

  return (
    <div
      className={`w-full justify-between border-b border-gray-500 text-2xl text-green-500 ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full flex-col divide-gray-500 lg:max-w-6xl lg:flex-row lg:divide-x lg:px-6">
        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div>
            {!daosTreasuries && !isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {daosTreasuries}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-thin text-gray-400">
              DAO treasury funds
            </span>
          </div>
          <Image src={"/dao-icon.svg"} width={40} height={40} alt="Dao Icon" />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div>
            {!balance && !isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {balance}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-thin text-gray-400">
              Your on balance
            </span>
          </div>
          <Image
            src={"/wallet-icon.svg"}
            width={40}
            height={40}
            alt="Wallet Icon"
          />
        </div>

        <div className="flex flex-row items-center justify-between p-6 pr-6 lg:w-1/3 lg:pr-10">
          <div>
            {user_stake_weight == null ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {format_token(user_stake_weight)}{" "}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-thin text-gray-400">
              Your total staked balance
            </span>
          </div>
          <Image
            src={"/globe-icon.svg"}
            width={40}
            height={40}
            alt="Globe Icon"
          />
        </div>
      </div>
    </div>
  );
};

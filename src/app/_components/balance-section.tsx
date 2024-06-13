"use client";
import { format_token, get_balance, small_address } from "~/utils";
import { Skeleton } from "./skeleton";
import { usePolkadot } from "~/hooks/polkadot";
import Image from "next/image";
import { useSubspaceQueries } from "~/subspace/queries";
import { useEffect, useState } from "react";
import { LinkIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";

export const BalanceSection = ({ className }: { className?: string }) => {
  const {
    api,
    isInitialized,
    balance,
    selectedAccount,
    stake_data,
    handleConnect,
  } = usePolkadot();

  const { dao_treasury } = useSubspaceQueries(api);

  const [daosTreasuries, setDaosTreasuries] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && api && dao_treasury) {
      void get_balance({ api, address: dao_treasury.toHuman() as string }).then(
        (balance) => {
          setDaosTreasuries(balance);
        },
      );
    }
  }, [isInitialized, api, dao_treasury]);

  let user_stake_weight: bigint | null = null;
  if (stake_data != null && selectedAccount != null) {
    const user_stake_entry = stake_data.stake_out.per_addr.get(
      selectedAccount.address,
    );
    user_stake_weight = user_stake_entry ?? 0n;
  }

  const handleCopyClick = () => {
    const treasuryData = dao_treasury?.toHuman() as string;

    navigator.clipboard
      .writeText(treasuryData)
      .then(() => {
        toast.success("Treasury address copied to clipboard");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to copy treasury address");
      });
  };

  return (
    <div
      className={`w-full justify-between border-b border-gray-500 text-2xl text-green-500 ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full flex-col divide-gray-500 lg:max-w-6xl lg:flex-row lg:divide-x lg:px-6">
        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col gap-1">
            {!daosTreasuries && !isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {daosTreasuries}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-light text-gray-200">
              DAO treasury funds
            </span>
            <button
              onClick={handleCopyClick}
              className="flex flex-row items-center gap-1 text-center text-base font-light text-gray-400 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />{" "}
              {dao_treasury && small_address(dao_treasury.toHuman() as string)}
            </button>
          </div>
          <Image src={"/dao-icon.svg"} width={40} height={40} alt="Dao Icon" />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col items-start gap-2">
            {!isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : !balance || !selectedAccount?.meta.name ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={!isInitialized}
                className={`inline-flex items-center justify-center text-gray-300 hover:text-green-600`}
              >
                Connect wallet
              </button>
            ) : (
              <>
                <p>
                  {balance}
                  <span className="text-lg text-white"> COMAI</span>
                </p>
              </>
            )}
            <span className="text-base font-light text-gray-200">
              Your total free balance
            </span>
          </div>
          <Image
            src={"/wallet-icon.svg"}
            width={40}
            height={40}
            alt="Wallet Icon"
          />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col items-start gap-2">
            {!isInitialized ||
            (selectedAccount?.meta.name && user_stake_weight == null) ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : !selectedAccount?.meta.name || user_stake_weight == null ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={!isInitialized}
                className={`inline-flex items-center justify-center text-gray-300 hover:text-green-600`}
              >
                Connect wallet
              </button>
            ) : (
              <>
                <p>
                  {format_token(user_stake_weight)}{" "}
                  <span className="text-lg text-white"> COMAI</span>
                </p>
              </>
            )}
            <span className="text-base font-light text-gray-200">
              Your total Staked balance
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

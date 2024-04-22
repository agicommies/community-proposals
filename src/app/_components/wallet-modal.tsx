"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { type InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { toast } from "react-toastify";
import { getCurrentTheme } from "~/styles/theming";
import { usePolkadot } from "~/hooks/polkadot";

export function WalletModal({
  open,
  wallets,
  setOpen,
  handleWalletSelections,
}: {
  open: boolean;
  setOpen: (args: boolean) => void;
  wallets: InjectedAccountWithMeta[];
  handleWalletSelections: (arg: InjectedAccountWithMeta) => void;
}) {
  const theme = getCurrentTheme();
  const { selectedAccount } = usePolkadot()
  const [selectedWallet, setSelectedWallet] = useState<InjectedAccountWithMeta | null>(null);

  const handleSelectAccount = (item: InjectedAccountWithMeta) => {
    if (item.address == selectedWallet?.address) return setSelectedWallet(null)
    return setSelectedWallet(item)
  }

  useEffect(() => { setSelectedWallet(selectedAccount) }, [selectedAccount])

  return (
    <div
      role="dialog"
      className={`fixed inset-0 z-[100] ${open ? "block" : "hidden"} animate-fade-in-down`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark opacity-80" />

      {/* Modal */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative w-[100%] max-w-3xl transform overflow-hidden rounded-3xl border-2 border-zinc-800 bg-white text-left shadow-custom dark:border-white dark:bg-light-dark dark:shadow-custom-dark">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b-2 border-zinc-800 bg-[url(/grids.svg)] bg-cover bg-center bg-no-repeat p-4 flex-row dark:border-white">
              <div className="flex items-center flex-row">
                <Image
                  src="/polkadot-logo.svg"
                  alt="Module Logo"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:h-8 md:w-8"
                />

                <h3
                  className="pl-2 text-transparent md:text-lg font-bold leading-6 dark:text-white"
                  id="modal-title"
                >
                  Select Wallet
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl md:rounded-2xl border-2 border-black p-1.5 md:p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
              >
                <XMarkIcon className="h-4 w-4 md:h-6 md:w-6 dark:fill-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-y-4 overflow-y-auto p-4 md:p-4">
              {wallets.map((item) => (
                <button
                  key={item.address}
                  onClick={() => handleSelectAccount(item)}
                  className={`text-md flex cursor-pointer items-center gap-x-2.5 overflow-auto rounded-xl border-2 p-2.5 shadow-white dark:text-white ${selectedWallet?.address === item.address ? "border-green-500 dark:border-green-300" : "border-black dark:border-white "} hover:border-green-500 hover:dark:border-green-300`}
                >
                  <CheckCircleIcon
                    className={`min-h-6 min-w-6 max-w-6 max-h-6 ${selectedWallet?.address === item.address
                      ? "fill-green-500 dark:fill-green-300"
                      : "fill-black dark:fill-white"
                      }`}
                  />

                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold">{item.meta.name}</span>
                    <span>{item.address}</span>
                  </div>
                </button>
              ))}

              {!wallets.length && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-gray-500">
                  <div>No wallet found.</div>
                  <div>
                    Please install Polkadot extension or check permission
                    settings.
                  </div>
                  <a
                    href="https://polkadot.js.org/extension/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    Install Extension
                  </a>
                </div>
              )}

              <button
                disabled={selectedWallet == null}
                className={`w-full rounded-xl border-2 ${selectedWallet ? 'border-orange-400 text-orange-400 hover:border-orange-500 hover:text-orange-500' : 'border-gray-400 text-gray-400 cursor-not-allowed'} p-2 text-base md:text-lg font-semibold`}
                onClick={() => {
                  if (!selectedWallet) {
                    toast.error("No account selected", {
                      theme: theme === "dark" ? "dark" : "light",
                    });
                    return;
                  }
                  handleWalletSelections(selectedWallet);
                }}
              >
                Connect Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

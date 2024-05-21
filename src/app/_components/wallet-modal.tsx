"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { type InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { toast } from "react-toastify";
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
      className={`fixed inset-0 z-[100] ${open ? "block" : "hidden"} `}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center">
          <div className="relative w-[100%] max-w-3xl transform overflow-hidden border border-gray-500 bg-[url('/bg-pattern.svg')] bg-cover text-left shadow-custom">
            {/* Modal Header */}
            <div className="flex flex-row items-center justify-between gap-3 p-4 bg-center bg-no-repeat bg-cover border-b border-gray-500">
              <div className="flex flex-row items-center">
                <Image
                  src="/polkadot-logo.svg"
                  alt="Module Logo"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:h-8 md:w-8"
                />

                <h3
                  className="pl-2 font-bold leading-6 text-transparent md:text-lg"
                  id="modal-title"
                >
                  Select Wallet
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-gray-500 p-1.5 md:p-2 transition duration-200"
              >
                <XMarkIcon className="w-4 h-4 text-white md:h-6 md:w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col p-4 overflow-y-auto gap-y-4 md:p-4">
              {wallets.map((item) => (
                <button
                  key={item.address}
                  onClick={() => handleSelectAccount(item)}
                  className={`text-md flex cursor-pointer items-center gap-x-2.5 overflow-auto border p-2.5 ${selectedWallet?.address === item.address ? "border-green-500" : "border-gray-500"} hover:border-green-500`}
                >
                  <CheckCircleIcon
                    className={`min-h-6 min-w-6 max-w-6 max-h-6 ${selectedWallet?.address === item.address
                      ? "fill-green-500"
                      : "fill-white"
                      }`}
                  />

                  <div className="flex flex-col items-start gap-0.5 text-white">
                    <span className="font-semibold">{item.meta.name}</span>
                    <span>{item.address}</span>
                  </div>
                </button>
              ))}

              {!wallets.length && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-sm text-center text-gray-500">
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
                className={`w-full border ${selectedWallet ? 'border-orange-400 text-orange-400 hover:border-orange-500 hover:text-orange-500' : 'border-gray-500 text-gray-400 cursor-not-allowed'} p-2 text-base md:text-lg font-semibold`}
                onClick={() => {
                  if (!selectedWallet) {
                    toast.error("No account selected");
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

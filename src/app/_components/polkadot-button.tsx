// import Image from "next/image";
import { usePolkadot } from "~/hooks/polkadot";
import { Squares2X2Icon } from "@heroicons/react/20/solid";
import { WalletMinimal } from "lucide-react";

export function PolkadotButton() {
  const { handleConnect, isInitialized, selectedAccount } = usePolkadot();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center">
        <Squares2X2Icon className="w-6 h-6 animate-spin fill-orange-500" />
      </div>
    );
  }

  const formatString = (text: string) => {
    if (text.length > 10) return `${text.slice(0, 10)}...`
    return text
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={!isInitialized}
      className="relative inline-flex items-center justify-center gap-3 px-4 py-2 text-gray-300 border border-gray-500 active:top-1 hover:border-green-500 hover:text-green-400"
    >
      {selectedAccount ? (
        <span className="flex items-center gap-2 font-medium">
          {/* <Image src={"wallet-icon.svg"} width={24} height={24} alt={"wallet icon"} className="w-6 h-6" /> */}
          <WalletMinimal className="stroke-green-500" />
          <div className="flex flex-col items-start">
            <p className="text-lg font-light">{formatString(selectedAccount.meta.name!)}</p>
            {/* <p className="text-xs font-extralight">{selectedAccount.address.slice(0, 8)}...</p> */}
          </div>
        </span>
      ) : (
        <span className="flex items-center gap-3 font-medium">
          {/* <Image
            src="/polkadot-logo.svg"
            alt="Polkadot"
            width={24}
            height={24}
            className="w-6 h-6"
          /> */}
          <WalletMinimal className="stroke-green-500" />
          <p className="text-lg">Connect Wallet</p>
        </span>
      )}
    </button>
  );
}

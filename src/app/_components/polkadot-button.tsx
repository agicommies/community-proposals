import Image from "next/image";
import { usePolkadot } from "~/hooks/polkadot";
import { Squares2X2Icon } from "@heroicons/react/20/solid";

export function PolkadotButton() {
  const { handleConnect, isInitialized, selectedAccount } = usePolkadot();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center">
        <Squares2X2Icon className="h-6 w-6 animate-spin fill-orange-500" />
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
      className="relative inline-flex items-center justify-center gap-3 rounded-xl border-2 border-orange-500 bg-white px-3 py-2 shadow-custom-orange active:top-1 hover:border-orange-400 hover:shadow-custom-orange-hover active:shadow-custom-orange-clicked dark:bg-light-dark text-orange-500 hover:text-orange-400 active:border-orange-500 active:text-orange-500"
    >
      {selectedAccount ? (
        <span className="flex gap-3 font-medium items-center">
          <Image src={"wallet-icon.svg"} width={24} height={24} alt={"wallet icon"} className="h-6 w-6" />
          <div className="flex flex-col items-start">
            <p className="text-sm dark:text-orange-400 text-orange-700 font-semibold">{formatString(selectedAccount.meta.name!)}</p>
            {/* <p className="text-xs dark:text-orange-500 font-extralight">{selectedAccount.address.slice(0, 8)}...</p> */}
          </div>
        </span>
      ) : (
        <span className="flex items-center gap-3 font-medium">
          <Image
            src="/polkadot-logo.svg"
            alt="Polkadot"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <p>Connect Wallet</p>
        </span>
      )}
    </button>
  );
}

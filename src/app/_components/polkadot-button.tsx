import Image from "next/image";

export function PolkadotButton() {
  return (
    <button
      type="button"
      className="active:shadow-custom-orange-clicked shadow-custom-orange dark:bg-light-dark relative inline-flex items-center justify-center rounded-2xl border-2 border-orange-500 bg-white p-2 active:top-1"
    >
      <span>
        <Image src="/polkadot-logo.svg" alt="Polkadot" width={24} height={24} />
      </span>
    </button>
  );
}

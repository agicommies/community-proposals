import "~/styles/globals.css";

import { env } from "~/env";

import { cairo } from "~/styles/fonts";
import { Header } from "./_components/header";
import { PolkadotProvider } from "~/hooks/polkadot";
import { TRPCReactProvider } from "~/hooks/trpc/react";
import ToastProvider from "~/hooks/toast";

export const metadata = {
  title: "Community Proposal",
  // description: "comrads.ai community validator",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cairo.className}`}>
      <body className="w-full animate-fade-in-up bg-black bg-[url('/bg-pattern.svg')]  px-0 bg-cover">
        <TRPCReactProvider>
          <PolkadotProvider wsEndpoint={env.NEXT_PUBLIC_WS_PROVIDER_URL}>
            <ToastProvider>
              <Header />
              {children}
            </ToastProvider>
          </PolkadotProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

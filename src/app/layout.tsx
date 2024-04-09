import "~/styles/globals.css";

import { env } from "~/env";

import { inter } from "~/styles/fonts";
import { Header } from "./_components/header";
import { PolkadotProvider } from "~/polkadot";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Community Proposal",
  description: "Vote on community proposals",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <body className={`dark:bg-light-dark`}>
        <TRPCReactProvider>
          <PolkadotProvider wsEndpoint={env.NEXT_PUBLIC_WS_PROVIDER_URL}>
            <Header />
            {children}
          </PolkadotProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

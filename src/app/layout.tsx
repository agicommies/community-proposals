import "~/styles/globals.css";

import { inter } from "~/styles/fonts";
import { Header } from "./_components/header";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Community Validator",
  description: "comrads.ai community validator",
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
          <Header />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}

/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";

import { WalletModal } from "~/app/_components/wallet-modal";
import { build_ipfs_gateway_url, parse_ipfs_uri } from "~/utils/ipfs";

interface AddVoting {
  vote: boolean;
  proposalId: number;
  callback?: () => void;
}

interface PolkadotApiState {
  web3Accounts: (() => Promise<InjectedAccountWithMeta[]>) | null;
  web3Enable: ((appName: string) => Promise<InjectedExtension[]>) | null;
  web3FromAddress: ((address: string) => Promise<InjectedExtension>) | null;
}

interface PolkadotContextType {
  api: ApiPromise | null;
  isConnected: boolean;
  isInitialized: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | undefined;

  blockNumber: number;
  proposals: unknown;
  proposalBody: unknown;

  isProposalLoading: boolean;
  isProposalBodyLoading: boolean;

  handleConnect: () => void;
  addVoting: (args: AddVoting) => void;
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(
  undefined,
);

interface PolkadotProviderProps {
  children: React.ReactNode;
  wsEndpoint: string;
}

export const PolkadotProvider: React.FC<PolkadotProviderProps> = ({
  children,
  wsEndpoint,
}) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [polkadotApi, setPolkadotApi] = useState<PolkadotApiState>({
    web3Accounts: null,
    web3Enable: null,
    web3FromAddress: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);

  const [blockNumber, setBlockNumber] = useState(0);
  const [proposals, setProposals] = useState<unknown>([]);
  const [proposalBody, setProposalBody] = useState<unknown>([]);

  const [isProposalLoading, setIsProposalLoading] = useState(true);
  const [isProposalBodyLoading, setIsProposalBodyLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  async function loadPolkadotApi() {
    const { web3Accounts, web3Enable, web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );

    setPolkadotApi({
      web3Accounts,
      web3Enable,
      web3FromAddress,
    });

    const provider = new WsProvider(wsEndpoint);
    const newApi = await ApiPromise.create({ provider });

    setApi(newApi);
    setIsInitialized(true);
  }

  useEffect(() => {
    void loadPolkadotApi();
    return () => {
      void api?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEndpoint]);

  useEffect(() => {
    if (api) {
      void api.rpc.chain.subscribeNewHeads((header) => {
        setBlockNumber(header.number.toNumber());
      });

      void api.query.subspaceModule?.proposals?.entries().then((result) => {
        return setProposals(result);
      });

      setIsProposalLoading(false);
    }
  }, [api]);

  async function ProposalData() {
    const cid = parse_ipfs_uri(
      "ipfs://bafkreideif2rljo42bmvuzqurbozhj55pvfkbwak42oadssk2w46y3a4pe", // this should be replaced by kelvin function
    );
    const url = build_ipfs_gateway_url(cid);

    await fetch(url)
      .then((res) => res.json())
      .then((data) => setProposalBody(data))
      .then(() => setIsProposalBodyLoading(false));
  }

  useEffect(() => {
    void ProposalData();
  }, []);

  async function handleConnect() {
    if (!polkadotApi.web3Enable || !polkadotApi.web3Accounts) return;
    const extensions = await polkadotApi.web3Enable("Community Validator");
    if (!extensions) {
      throw Error("NO_EXTENSION_FOUND");
    }
    const allAccounts = await polkadotApi.web3Accounts();
    setAccounts(allAccounts);
    setOpenModal(true);
  }

  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  async function handleWalletSelections(wallet: InjectedAccountWithMeta) {
    setSelectedAccount(wallet);
    setIsConnected(true);
    setOpenModal(false);
  }

  async function addVoting({ vote, proposalId, callback }: AddVoting) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.voteProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);

    api.tx.subspaceModule
      .voteProposal(proposalId, vote) // what is sopposed to be here?
      .signAndSend(selectedAccount.address, { signer: injector.signer })
      .then((response) => {
        console.log("Vote Submitted");
        console.log(response);
        callback?.();
      })
      .catch((err) => {
        // TODO toast error
        console.log(err);
      });
  }

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isConnected,
        isInitialized,

        accounts,
        selectedAccount,

        blockNumber,
        proposals,
        proposalBody,

        isProposalLoading,
        isProposalBodyLoading,

        addVoting,
        handleConnect,
      }}
    >
      <WalletModal
        open={openModal}
        setOpen={setOpenModal}
        wallets={accounts}
        handleWalletSelections={handleWalletSelections}
      />
      {children}
    </PolkadotContext.Provider>
  );
};

export const usePolkadot = (): PolkadotContextType => {
  const context = useContext(PolkadotContext);
  if (context === undefined) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }
  return context;
};

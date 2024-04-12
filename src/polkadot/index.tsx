/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { ApiPromise, WsProvider } from "@polkadot/api";

import { match } from "rustie";

import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";

import { handle_proposals } from "~/proposals";
import { get_proposals } from "~/chain_queries";
import { WalletModal } from "~/app/_components/wallet-modal";
import type { ProposalState } from "~/types";

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

  blockNumber: number;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | undefined;

  proposals: ProposalState[] | null;

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
    web3Enable: null,
    web3Accounts: null,
    web3FromAddress: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [blockNumber, setBlockNumber] = useState(0);

  const [proposals, setProposals] = useState<ProposalState[] | null>(null);

  const isProposalLoading = () => proposals == null;

  // const [isProposalLoading, setIsProposalLoading] = useState(true);

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
    console.log(wsEndpoint, 'useEffect do wsEndpoint')
  }, [wsEndpoint])

  useEffect(() => {
    console.log(api, 'useEffect da api')
    if (api) {
      void api.rpc.chain.subscribeNewHeads((header) => {
        setBlockNumber(header.number.toNumber());
      });

      get_proposals(api)
        .then((proposals) => {
          console.log(proposals)
          setProposals(proposals)

          handle_proposals(proposals, (id, new_proposal) => {
            const new_proposal_list = [...proposals]
            new_proposal_list[id] = new_proposal
            setProposals(new_proposal_list)
          }).catch((e) => {
            console.error("Error fetching proposals:", e);
          });
        })
        .catch((e) => {
          console.error("Error fetching proposals:", e);
        });
    }
  }, [api]);

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
      .voteProposal(proposalId, vote)
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
        blockNumber,
        selectedAccount,

        proposals,

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

/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";

import { WalletModal } from "~/app/_components/wallet-modal";
import { get_all_stake_out, get_proposals } from "~/chain_queries";
import { handle_proposals } from "~/proposals";
import type { Proposal, ProposalBody } from "~/types";

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
  proposals: Proposal[];
  proposalBody: ProposalBody[];

  isProposalLoading: boolean;

  handleConnect: () => void;
  addVoting: (args: AddVoting) => void;
  createNewProposal: (args: string) => void;
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

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isProposalLoading, setIsProposalLoading] = useState(true);
  const [proposalBody, setProposalBody] = useState<ProposalBody[]>([]);

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
    }
  }, [api]);

  useEffect(() => {
    if (api) {
      console.log("Fetching proposals");

      get_all_stake_out(api)
        .then(({ stake_map_total, stake_map_per_net }) => {
          console.log(stake_map_total);
          //handle_stake_maps(stake_map_total, stake_map_per_net);
          // TODO: Store stake data and re-render proposals
        })
        .catch((e) => {
          console.error("Error fetching stake maps:", e);
        });

      get_proposals(api)
        .then((proposals) => {
          console.log("Proposals:", proposals);
          setProposals(proposals);
          setIsProposalLoading(false);
          const bodies = proposals.map((proposal) => ({ Loading: proposal }));
          setProposalBody(bodies);
          handle_proposals(proposals, (id, body) => {
            setProposalBody((prev) => {
              const new_arr = [...prev];
              new_arr[id] = body;
              console.log("New proposal body array:", new_arr);
              return new_arr;
            });
          }).catch((e) => {
            console.error("Error fetching proposals:", e);
            setIsProposalLoading(false);
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

  async function createNewProposal(data: string) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.addCustomProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    api.tx.subspaceModule
      .addCustomProposal(data)
      .signAndSend(selectedAccount.address, { signer: injector.signer })
      .then(() => {
        window.location.reload();
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
        isProposalLoading,
        proposalBody,

        addVoting,
        handleConnect,
        createNewProposal,
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

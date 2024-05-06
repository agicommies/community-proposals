/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { ApiPromise, WsProvider, type SubmittableResult } from "@polkadot/api";
import { type DispatchError } from "@polkadot/types/interfaces";

import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";

import { WalletModal } from "~/app/_components/wallet-modal";
import {
  get_all_stake_out,
  get_daos,
  get_proposals,
  type StakeData,
} from "~/hooks/polkadot/functions/chain_queries";
import {
  handle_custom_daos,
  handle_custom_proposals,
} from "~/hooks/polkadot/functions/proposals";
import type {
  CallbackStatus,
  DaoState,
  ProposalState,
  SendDaoData,
  SendProposalData,
} from "~/hooks/polkadot/functions/types";
import { get_balance, is_not_null } from "~/utils";
import { toast } from "react-toastify";
import { getCurrentTheme } from "~/styles/theming";

interface Vote {
  proposal_id: number;
  vote: boolean;
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

  balance: number;
  isBalanceLoading: boolean;

  blockNumber: number;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | undefined;

  daos: DaoState[] | null;
  proposals: ProposalState[] | null;
  stake_data: StakeData | null;

  handleConnect: () => void;
  send_vote: (args: Vote, callback?: (arg: CallbackStatus) => void) => void;

  createNewDao: (args: SendDaoData) => void;
  createNewProposal: (args: SendProposalData) => void;
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
  const theme = getCurrentTheme();

  const [polkadotApi, setPolkadotApi] = useState<PolkadotApiState>({
    web3Enable: null,
    web3Accounts: null,
    web3FromAddress: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [blockNumber, setBlockNumber] = useState(0);

  const [balance, setBalance] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const [daos, setDaos] = useState<DaoState[] | null>(null);
  const [proposals, setProposals] = useState<ProposalState[] | null>(null);
  const [stakeData, setStakeData] = useState<StakeData | null>(null);

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
    const favoriteWalletAddress = localStorage.getItem("favoriteWalletAddress");
    if (favoriteWalletAddress) {
      const fetchWallets = async () => {
        const walletList = await getWallets();
        const accountExist = walletList?.find(
          (wallet) => wallet.address === favoriteWalletAddress,
        );
        if (accountExist) {
          setSelectedAccount(accountExist);
          setIsConnected(true);
        }
      };
      fetchWallets().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const handleGetProposals = (api: ApiPromise) => {
    get_proposals(api)
      .then((proposals_result) => {
        setProposals(proposals_result);

        handle_custom_proposals(proposals_result)
          .then((results) => {
            // Handle data from custom proposals
            const new_proposal_list: ProposalState[] = [...proposals_result];
            // For each custom data result, find the proposal with the same id
            // and update its `custom_data` field
            results.filter(is_not_null).forEach((result) => {
              const { id, custom_data } = result;
              const proposal = new_proposal_list.find((p) => p.id === id);
              if (proposal == null) {
                console.error(`Proposal ${id} not found`);
                return;
              }
              proposal.custom_data = custom_data;
            });
            // Update the state with the new proposal list
            setProposals(new_proposal_list);
          })
          .catch((e) => {
            console.error("Error fetching custom proposals data:", e);
          });
      })
      .catch((e) => {
        console.error("Error fetching proposals:", e);
      });
  };

  const handleGetDaos = (api: ApiPromise) => {
    get_daos(api)
      .then((daos_result) => {
        setDaos(daos_result);

        handle_custom_daos(daos_result)
          .then((results) => {
            const new_dao_list: DaoState[] = [...daos_result];

            results.filter(is_not_null).forEach((result) => {
              const { id, custom_data } = result;
              const proposal = new_dao_list.find((p) => p.id === id);
              if (proposal == null) {
                console.error(`Proposal ${id} not found`);
                return;
              }
              proposal.custom_data = custom_data;
            });

            setDaos(new_dao_list);
          })
          .catch((e) => {
            console.error("Error fetching custom DAOs data:", e);
          });
      })
      .catch((e) => {
        console.error("Error fetching DAOs:", e);
      });
  };

  useEffect(() => {
    // console.log("useEffect for api", api); // DEBUG
    if (api) {
      void api.rpc.chain.subscribeNewHeads((header) => {
        setBlockNumber(header.number.toNumber());
      });

      get_all_stake_out(api)
        .then((stake_data_result) => {
          setStakeData(stake_data_result);
        })
        .catch((e) => {
          toast.success(`Error fetching stake out map", ${e}`, {
            theme: theme === "dark" ? "dark" : "light",
          });
        });

      handleGetProposals(api);
      handleGetDaos(api);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  async function getWallets() {
    if (!polkadotApi.web3Enable || !polkadotApi.web3Accounts) return;
    const extensions = await polkadotApi.web3Enable("Community Validator");
    if (!extensions) {
      toast.error("No account selected", {
        theme: theme === "dark" ? "dark" : "light",
      });
      throw Error("NO_EXTENSION_FOUND");
    }
    try {
      const response = await polkadotApi.web3Accounts();
      return response;
    } catch (error) {
      console.warn(error);
    }
  }

  async function handleConnect() {
    try {
      const allAccounts = await getWallets();
      if (allAccounts) {
        setAccounts(allAccounts);
        setOpenModal(true);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  async function handleWalletSelections(wallet: InjectedAccountWithMeta) {
    localStorage.setItem("favoriteWalletAddress", wallet.address);
    setSelectedAccount(wallet);
    setIsConnected(true);
    setOpenModal(false);
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!api || !selectedAccount?.address) {
        console.error("API or user address is not defined");
        setIsBalanceLoading(false);
        return;
      }

      const fetchedBalance = await get_balance({
        api,
        address: selectedAccount.address,
      });
      setBalance(fetchedBalance);
      setIsBalanceLoading(false);
    };

    void fetchBalance();
  }, [api, selectedAccount?.address]);

  async function send_vote(
    { vote, proposal_id: proposalId }: Vote,
    callback?: (vote_status: CallbackStatus) => void,
  ) {
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
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          // toast.success(`Transaction hash: ${result.txHash.toHex()}`, {
          //   theme: theme === "dark" ? "dark" : "light",
          // });

          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: "Casting your vote...",
            });
          }

          if (result.status.isFinalized) {
            result.events.forEach(({ event }) => {
              if (api.events.system?.ExtrinsicSuccess?.is(event)) {
                toast.success("Voting successful", {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "Vote sucessful",
                });
                handleGetProposals(api);
              } else if (api.events.system?.ExtrinsicFailed?.is(event)) {
                const [dispatchError] = event.data as unknown as [
                  DispatchError,
                ];

                let msg;
                if (dispatchError.isModule) {
                  const mod = dispatchError.asModule;
                  const error = api.registry.findMetaError(mod);

                  if (error.section && error.name && error.docs) {
                    const errorMessage = `${error.name}`;
                    msg = `Voting failed: ${errorMessage}`;
                  } else {
                    msg = `Voting failed: Unknown error`;
                  }
                } else {
                  msg = `Voting failed: ${dispatchError.type}`;
                }
                toast(msg, {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "ERROR",
                  message: msg,
                });
              }
            });
          }
        },
      )
      .catch((err) => {
        toast.error(`${err}`, {
          theme: theme === "dark" ? "dark" : "light",
        });
        console.error(err);
      });
  }

  async function createNewProposal({ IpfsHash, callback }: SendProposalData) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.addCustomProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    void api.tx.subspaceModule
      .addCustomProposal(IpfsHash)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: "Creating proposal...",
            });
          }

          if (result.status.isFinalized) {
            result.events.forEach(({ event }) => {
              if (api.events.system?.ExtrinsicSuccess?.is(event)) {
                toast.success("Proposal created", {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "Proposal created",
                });
                handleGetProposals(api);
              } else if (api.events.system?.ExtrinsicFailed?.is(event)) {
                const [dispatchError] = event.data as unknown as [
                  DispatchError,
                ];

                let msg;
                if (dispatchError.isModule) {
                  const mod = dispatchError.asModule;
                  const error = api.registry.findMetaError(mod);

                  if (error.section && error.name && error.docs) {
                    const errorMessage = `${error.name}`;
                    msg = `Proposal creation failed: ${errorMessage}`;
                  } else {
                    msg = `Proposal creation failed: Unknown error`;
                  }
                } else {
                  msg = `Proposal creation failed: ${dispatchError.type}`;
                }
                toast(msg, {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "ERROR",
                  message: msg,
                });
              }
            });
          }
        },
      );
  }

  async function createNewDao({
    IpfsHash,
    applicationKey,
    callback,
  }: SendDaoData) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.addDaoApplication
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    void api.tx.subspaceModule
      .addDaoApplication(applicationKey, IpfsHash)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: "Creating DAO...",
            });
          }

          if (result.status.isFinalized) {
            result.events.forEach(({ event }) => {
              if (api.events.system?.ExtrinsicSuccess?.is(event)) {
                toast.success("DAO created", {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "DAO created",
                });
                handleGetProposals(api);
              } else if (api.events.system?.ExtrinsicFailed?.is(event)) {
                const [dispatchError] = event.data as unknown as [
                  DispatchError,
                ];

                let msg;
                if (dispatchError.isModule) {
                  const mod = dispatchError.asModule;
                  const error = api.registry.findMetaError(mod);

                  if (error.section && error.name && error.docs) {
                    const errorMessage = `${error.name}`;
                    msg = `DAO creation failed: ${errorMessage}`;
                  } else {
                    msg = `DAO creation failed: Unknown error`;
                  }
                } else {
                  msg = `DAO creation failed: ${dispatchError.type}`;
                }
                toast(msg, {
                  theme: theme === "dark" ? "dark" : "light",
                });
                callback?.({
                  finalized: true,
                  status: "ERROR",
                  message: msg,
                });
              }
            });
          }
        },
      );
  }

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isConnected,
        isInitialized,

        balance,
        isBalanceLoading,

        accounts,
        blockNumber,
        selectedAccount,

        daos,
        proposals,
        stake_data: stakeData,

        send_vote,
        handleConnect,

        createNewDao,
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

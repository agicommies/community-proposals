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
  type StakeData,
  get_all_stake_out,
  get_delegating_voting_power,
} from "~/hooks/polkadot/functions/chain_queries";

import { get_balance } from "~/utils";
import { toast } from "react-toastify";
import type {
  SendProposalData,
  CallbackStatus,
  SS58Address,
  SendDaoData,
} from "~/subspace/types";

interface Vote {
  proposal_id: number;
  vote: boolean;
}

interface updateDelegating {
  boolean: boolean;
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

  balance: string | null;

  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;

  votingPower: Set<SS58Address>;

  stake_data: StakeData | null;

  handleConnect: () => void;
  send_vote: (args: Vote, callback?: (arg: CallbackStatus) => void) => void;

  createNewDao: (args: SendDaoData) => void;
  createNewProposal: (args: SendProposalData) => void;
  updateDelegatingVotingPower: (
    args: updateDelegating,
    callback?: (arg: CallbackStatus) => void,
  ) => void;
}

const PolkadotContext = createContext<PolkadotContextType | null>(null);

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

  const [balance, setBalance] = useState<null | string>(null);

  const [votingPower, setVotingPower] = useState<Set<SS58Address>>(new Set());

  const [stakeData, setStakeData] = useState<StakeData | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta | null>(null);

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

  useEffect(() => {
    if (api) {
      get_all_stake_out(api)
        .then((stake_data_result) => {
          setStakeData(stake_data_result);
        })
        .catch((e) => {
          toast.success(`Error fetching stake out map", ${e}`);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    if (api) {
      const fetchBalance = async () => {
        if (!selectedAccount?.address) {
          console.error("No account selected");
          return;
        }

        const fetchedBalance = await get_balance({
          api,
          address: selectedAccount.address,
        });
        setBalance(fetchedBalance);
      };

      void fetchBalance();
    }
  }, [api, selectedAccount?.address]);

  async function getWallets() {
    if (!polkadotApi.web3Enable || !polkadotApi.web3Accounts) return;
    const extensions = await polkadotApi.web3Enable("Community Validator");
    if (!extensions) {
      toast.error("No account selected");
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
        return;
      }

      const fetchedBalance = await get_balance({
        api,
        address: selectedAccount.address,
      });
      setBalance(fetchedBalance);
    };

    void fetchBalance();
  }, [api, selectedAccount?.address]);

  useEffect(() => {
    if (api) {
      void get_delegating_voting_power(api)
        .then((votingPower) => {
          setVotingPower(new Set(votingPower));
        })
        .catch((e) => {
          console.error(`Error fetching voting power: ${e}`);
        });
    }
  }, [api]);

  async function send_vote(
    { vote, proposal_id: proposalId }: Vote,
    callback?: (vote_status: CallbackStatus) => void,
  ) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.governanceModule?.voteProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);

    api.tx.governanceModule
      .voteProposal(proposalId, vote)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
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
                toast.success("Voting successful");
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "Vote sucessful",
                });
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
                toast(msg);
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
        toast.error(`${err}`);
        console.error(err);
      });
  }

  // fn update_delegating_voting_power(delegator: &AccountId, delegating: bool) -> DispatchResult

  async function updateDelegatingVotingPower(
    { boolean }: updateDelegating,
    callback?: (vote_status: CallbackStatus) => void,
  ) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.governanceModule?.enableVotePowerDelegation ||
      !api.tx.governanceModule?.disableVotePowerDelegation
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);

    const txMethod = boolean
      ? api.tx.governanceModule.enableVotePowerDelegation()
      : api.tx.governanceModule.disableVotePowerDelegation();

    api.tx.governanceModule;
    txMethod
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: "Updating your delegating voting power...",
            });
          }
          if (result.status.isFinalized) {
            result.events.forEach(({ event }) => {
              if (api.events.system?.ExtrinsicSuccess?.is(event)) {
                toast.success("Voting power updated");
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "Updated delegating voting power",
                });
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
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
                    msg = `Updating voting power failed: ${errorMessage}`;
                  } else {
                    msg = `Updating voting power failed: Unknown error`;
                  }
                } else {
                  msg = `Updating voting power failed: ${dispatchError.type}`;
                }
                toast(msg);
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
        toast.error(`${err}`);
        console.error(err);
      });
  }

  async function createNewProposal({ IpfsHash, callback }: SendProposalData) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.governanceModule?.addGlobalCustomProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    void api.tx.governanceModule
      .addGlobalCustomProposal(IpfsHash)
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
                toast.success("Proposal created");
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "Proposal created",
                });

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
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
                toast(msg);
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
      !api.tx.governanceModule?.addDaoApplication
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    void api.tx.governanceModule
      .addDaoApplication(applicationKey, IpfsHash)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: "Creating S0 Applicaiton...",
            });
          }

          if (result.status.isFinalized) {
            result.events.forEach(({ event }) => {
              if (api.events.system?.ExtrinsicSuccess?.is(event)) {
                toast.success("DAO created");
                callback?.({
                  finalized: true,
                  status: "SUCCESS",
                  message: "S0 Applicaiton created",
                });

                setTimeout(() => {
                  window.location.reload();
                }, 2000);
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
                    msg = `S0 Applicaiton creation failed: ${errorMessage}`;
                  } else {
                    msg = `S0 Applicaiton creation failed: Unknown error`;
                  }
                } else {
                  msg = `S0 Applicaiton creation failed: ${dispatchError.type}`;
                }
                toast(msg);
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

        accounts,
        selectedAccount,

        votingPower,

        stake_data: stakeData,

        send_vote,
        handleConnect,

        createNewDao,
        createNewProposal,
        updateDelegatingVotingPower,
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
  if (context === null) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }
  return context;
};

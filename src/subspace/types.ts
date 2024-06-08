import { type ApiPromise } from "@polkadot/api";
import type { Codec } from "@polkadot/types/types";
import type { Enum, Tagged } from "rustie";
import { assert, type Extends } from "tsafe";
import { z } from "zod";
import type { Result } from "~/utils";

import { decodeAddress } from "@polkadot/util-crypto";

export type Entry<T> = [unknown, T];

// -> Adresses

export type SS58Address = Tagged<string, "SS58Address">;

function is_ss58_address(value: string): value is SS58Address {
  // const test_addr = "5DSFNnK94z8VLVhmvrtunHHrAkcgtCPAx6LLEgVNSXQbEvB7";
  const test_addr = "5Dw5xxnpgVAbBgXtxT1DEWKv3YJJxHGELZKHNCEWzRNKbXdL";
  try {
    // eslint-disable-next-line no-var
    var decoded = decodeAddress(test_addr || value);
  } catch (e) {
    console.error(e);
    return false;
  }
  return decoded != null;
}

export const ADDRESS_SCHEMA = z
  .string()
  .refine(is_ss58_address, "Invalid SS58 address");

// -> Proposal  & Dao State

/**
 * What we get from metadata IPFS files
 */
export interface CustomMetadata {
  title?: string;
  body?: string;
}

/** Just and error while fetching metadata */
export type CustomDataError = { message: string };

/**
 * The state of the metadata for a proposal or dao.
 */
export type CustomMetadataState = Result<CustomMetadata, CustomDataError>;

export type WithMetadataState<T> = T & { custom_data?: CustomMetadataState };

export type ProposalState = WithMetadataState<Proposal>;

export type DaoState = WithMetadataState<Dao>;

// -> idk

export type CallbackStatus = {
  finalized: boolean;
  message: string | null;
  status: "SUCCESS" | "ERROR" | "PENDING" | "STARTING" | null;
};

export interface SendProposalData {
  IpfsHash: string;
  callback?: (status: CallbackStatus) => void;
}

export type CustomProposalDataState = Result<CustomMetadata, CustomDataError>;

export interface SendDaoData {
  applicationKey: string;
  IpfsHash: string;
  callback?: (status: CallbackStatus) => void;
}

export const CUSTOM_PROPOSAL_METADATA_SCHEMA = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export const CUSTOM_DAO_METADATA_SCHEMA = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

assert<
  Extends<z.infer<typeof CUSTOM_PROPOSAL_METADATA_SCHEMA>, CustomMetadata>
>();

assert<Extends<z.infer<typeof CUSTOM_DAO_METADATA_SCHEMA>, CustomMetadata>>();

// == Proposal ==

export interface ProposalStatusDataProps {
  status: "open" | "accepted" | "refused" | "expired";
  votesFor?: SS58Address[];
  votesAgainst?: SS58Address[];
  stakeFor?: bigint;
  stakeAgainst?: bigint;
  block?: number;
}

export type ProposalStatus = Enum<{
  open: {
    votesFor: SS58Address[];
    votesAgainst: SS58Address[];
    stakeFor: bigint;
    stakeAgainst: bigint;
  };
  accepted: { block: number; stakeFor: bigint; stakeAgainst: bigint };
  refused: { block: number; stakeFor: bigint; stakeAgainst: bigint };
  expired: null;
}>;

export type DaoStatus = "Pending" | "Accepted" | "Refused";

export type ProposalData = Enum<{
  globalCustom: null;
  globalParams: Record<string, unknown>;
  subnetCustom: { subnetId: number };
  subnetParams: { subnetId: number; params: Record<string, unknown> };
  transferDaoTreasury: { account: SS58Address; amount: bigint };
}>;

export interface Proposal {
  id: number;
  proposer: SS58Address;
  expirationBlock: number;
  data: ProposalData;
  status: ProposalStatus;
  metadata: string;
  proposalCost: bigint;
  creationBlock: number;
}

export interface Dao {
  id: number;
  userId: SS58Address;
  payingFor: SS58Address;
  data: string;
  body?: CustomMetadata;
  status: DaoStatus;
  applicationCost: bigint;
}

export interface GetBalance {
  api: ApiPromise | null;
  address: string;
}

// TODO: put each Zod schema togheter with interface type
// TODO: helper function to define zod Rust-like enum

export const TOKEN_AMOUNT_SCHEMA = z
  .string()
  .or(z.number())
  .transform((value) => BigInt(value));

export const PROPOSAL_DATA_SCHEMA = z.union([
  z.object({ globalCustom: z.null() }),
  z.object({ globalParams: z.record(z.unknown()) }),
  z.object({ subnetCustom: z.object({ subnetId: z.number() }) }),
  z.object({
    subnetParams: z.object({
      subnetId: z.number(),
      params: z.record(z.unknown()),
    }),
  }),
  z.object({
    transferDaoTreasury: z.object({
      account: ADDRESS_SCHEMA,
      amount: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
]);

const PROPOSAL_STATUS_SCHEMA = z.union([
  z.object({
    open: z.object({
      votesFor: z.array(ADDRESS_SCHEMA),
      votesAgainst: z.array(ADDRESS_SCHEMA),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    accepted: z.object({
      block: z.number(),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    refused: z.object({
      block: z.number(),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    expired: z.null(),
  }),
]);

export const PROPOSAL_SCHEMA = z.object({
  id: z.number(),
  proposer: ADDRESS_SCHEMA,
  expirationBlock: z.number(),
  data: PROPOSAL_DATA_SCHEMA,
  status: PROPOSAL_STATUS_SCHEMA,
  metadata: z.string(),
  proposalCost: TOKEN_AMOUNT_SCHEMA,
  creationBlock: z.number(),
});

export function parse_proposal(value_raw: Codec): Proposal | null {
  const value = value_raw.toPrimitive();
  const validated = PROPOSAL_SCHEMA.safeParse(value);
  if (!validated.success) {
    console.warn("Invalid proposal:", validated.error.issues);
    return null;
  }
  return validated.data;
}

export const DAO_SHEMA = z.object({
  id: z.number(),
  userId: ADDRESS_SCHEMA, // TODO: validate SS58 address
  payingFor: ADDRESS_SCHEMA, // TODO: validate SS58 address
  data: z.string(),
  status: z
    .string()
    .refine(
      (value) => ["Pending", "Accepted", "Refused"].includes(value),
      "Invalid proposal status",
    )
    .transform((value) => value as DaoStatus),
  applicationCost: TOKEN_AMOUNT_SCHEMA,
});

export function parse_daos(value_raw: Codec): Dao | null {
  const value = value_raw.toPrimitive();
  const validated = DAO_SHEMA.safeParse(value);
  if (!validated.success) {
    console.warn("Invalid DAO:", validated.error.issues);
    return null;
  } else {
    return validated.data;
  }
}

assert<Extends<z.infer<typeof PROPOSAL_DATA_SCHEMA>, ProposalData>>();
assert<Extends<z.infer<typeof PROPOSAL_SCHEMA>, Proposal>>();
assert<Extends<z.infer<typeof DAO_SHEMA>, Dao>>();

// TODO: move to display.ts
const PARAM_FIELD_DISPLAY_NAMES: Record<string, string> = {
  // # Global
  maxNameLength: "Max Name Length",
  maxAllowedSubnets: "Max Allowed Subnets",
  maxAllowedModules: "Max Allowed Modules",
  unitEmission: "Unit Emission",
  floorDelegationFee: "Floor Delegation Fee",
  maxRegistrationsPerBlock: "Max Registrations Per Block",
  targetRegistrationsPerInterval: "Target Registrations Per Interval",
  targetRegistrationsInterval: "Target Registrations Interval",
  burnRate: "Burn Rate",
  minBurn: "Min Burn",
  maxBurn: "Max Burn",
  adjustmentAlpha: "Adjustment Alpha",
  minStake: "Min Stake",
  maxAllowedWeights: "Max Allowed Weights",
  minWeightStake: "Min Weight Stake",
  proposalCost: "Proposal Cost",
  proposalExpiration: "Proposal Expiration",
  proposalParticipationThreshold: "Proposal Participation Threshold",
  // # Subnet
  founder: "Founder",
  founderShare: "Founder Share",
  immunityPeriod: "Immunity Period",
  incentiveRatio: "Incentive Ratio",
  maxAllowedUids: "Max Allowed UIDs",
  // maxAllowedWeights: "Max Allowed Weights",
  maxStake: "Max Stake",
  maxWeightAge: "Max Weight Age",
  minAllowedWeights: "Min Allowed Weights",
  // minStake: "Min Stake",
  name: "Name",
  tempo: "Tempo",
  trustRatio: "Trust Ratio",
  voteMode: "Vote Mode",
};

export const param_name_to_display_name = (param_name: string): string => {
  return PARAM_FIELD_DISPLAY_NAMES[param_name] ?? param_name;
};

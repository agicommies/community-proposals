import { type ApiPromise } from "@polkadot/api";
import type { Codec } from "@polkadot/types/types";
import type { Enum, Tagged } from "rustie";
import { assert, type Extends } from "tsafe";
import { z } from "zod";
import type { Result } from "~/utils";

export type SS58Address = Tagged<string, "SS58Address">;

// == Proposal State on Interface ==

export interface ProposalState extends Proposal {
  custom_data?: CustomProposalDataState;
}

export type CustomProposalDataState = Result<
  CustomProposalData,
  CustomDataError
>;
export type CustomDataError = { message: string };

// == Custom Proposal Extra Data ==

export interface CustomProposalData {
  title?: string;
  body?: string; // Markdown description
}

export interface CustomDaoData {
  discord_id?: string;
  title?: string;
  body?: string;
}

export type CallbackStatus = {
  finalized: boolean;
  message: string | null;
  status: "SUCCESS" | "ERROR" | "PENDING" | "STARTING" | null;
};

export interface SendProposalData {
  IpfsHash: string;
  callback?: (status: CallbackStatus) => void;
}

export interface SendDaoData {
  IpfsHash: string;
  applicationKey: string;
  callback?: (status: CallbackStatus) => void;
}

export const CUSTOM_PROPOSAL_METADATA_SCHEMA = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export const CUSTOM_DAO_METADATA_SCHEMA = z.object({
  discord_id: z.string(),
  title: z.string().optional(),
  body: z.string().optional(),
});

assert<
  Extends<z.infer<typeof CUSTOM_PROPOSAL_METADATA_SCHEMA>, CustomProposalData>
>();

assert<Extends<z.infer<typeof CUSTOM_DAO_METADATA_SCHEMA>, CustomDaoData>>();

// == Proposal ==

export type ProposalStatus = "Pending" | "Accepted" | "Refused" | "Expired";
export type DaoStatus = "Pending" | "Accepted" | "Refused";

/*
pub enum ProposalData<T: Config> {
    Custom(Vec<u8>),
    GlobalParams(GlobalParams),
    SubnetParams {
        netuid: u16,
        params: SubnetParams<T>,
    },
    SubnetCustom {
        netuid: u16,
        data: Vec<u8>,
    },
}
*/
export type ProposalData = Enum<{
  custom: string;
  globalParams: Record<string, unknown>;
  subnetParams: { netuid: number; params: Record<string, unknown> };
  subnetCustom: { netuid: number; data: string };
  expired: null;
}>;

export interface Proposal {
  id: number;
  proposer: SS58Address; // TODO: SS58 address validation
  status: ProposalStatus;
  expirationBlock: number;
  votesFor: SS58Address[];
  votesAgainst: SS58Address[];
  finalizationBlock: number | null;
  data: ProposalData;
}
export interface Dao {
  id: number;
  userId: SS58Address;
  payingFor: SS58Address;
  data: string;
  body?: string;
  status: DaoStatus;
  applicationCost: number;
}

export interface GetBalance {
  api: ApiPromise | null;
  address: string;
}

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
  // return paramName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()); // Do not try to do AI with regex
};

export const ADDRESS_SCHEMA = z
  .string()
  .transform((value) => value as SS58Address); // TODO: validate SS58 address

export const PROPOSAL_DATA_SCHEMA = z.union([
  z.object({
    custom: z.string(),
  }),
  z.object({
    globalParams: z
      .object({})
      .passthrough()
      .transform((value) => value as Record<string, unknown>), // TODO: globalParams validation
  }),
  z.object({
    subnetParams: z.object({
      netuid: z.number(),
      params: z
        .object({})
        .passthrough()
        .transform((value) => value as Record<string, unknown>), // TODO: subnetParams validation
    }),
  }),
  z.object({
    subnetCustom: z.object({
      netuid: z.number(),
      data: z.string(),
    }),
  }),
  z.object({ expired: z.null() }),
]);

assert<Extends<z.infer<typeof PROPOSAL_DATA_SCHEMA>, ProposalData>>();

export const PROPOSAL_SHEMA = z
  .object({
    id: z.number(),
    proposer: ADDRESS_SCHEMA, // TODO: validate SS58 address
    expirationBlock: z.number(),
    data: PROPOSAL_DATA_SCHEMA,
    status: z
      .string()
      .refine(
        (value) =>
          ["Pending", "Accepted", "Refused", "Expired"].includes(value),
        "Invalid proposal status",
      )
      .transform((value) => value as ProposalStatus),
    votesFor: z.array(ADDRESS_SCHEMA),
    votesAgainst: z.array(ADDRESS_SCHEMA),
    proposalCost: z.number(),
    finalizationBlock: z.number().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "Accepted" && value.finalizationBlock == null) {
      ctx.addIssue({
        code: "custom",
        message:
          "Proposal status is 'Accepted', but no finalization block was found",
      });
    }
  });

export function parse_proposal(value_raw: Codec): Proposal | null {
  const value = value_raw.toPrimitive();
  const validated = PROPOSAL_SHEMA.safeParse(value);
  if (!validated.success) {
    console.warn("Invalid proposal:", validated.error.issues);
    return null;
  } else {
    return validated.data;
  }
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
  applicationCost: z.number(),
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
assert<Extends<z.infer<typeof PROPOSAL_SHEMA>, Proposal>>();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
assert<Extends<z.infer<typeof DAO_SHEMA>, Dao>>();

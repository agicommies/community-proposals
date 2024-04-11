import type { Codec } from "@polkadot/types/types";
import type { Enum, Tagged } from "rustie";
import { z } from "zod";
export type SS58Address = Tagged<string, "SS58Address">;

// == Proposal ==

export type ProposalStatus = "Pending" | "Accepted" | "Refused" | "Expired";

export interface ProposalMetadata {
  title: string;
  body: string; // Markdown description
}

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
  Custom: string;
  GlobalParams: null;
  SubnetParams: { netuid: number; params: null };
  SubnetCustom: { netuid: number; data: string };
}>;

export interface Proposal {
  id: number;
  proposer: SS58Address; // TODO: SS58 address validation
  proposalStatus: ProposalStatus;
  expirationBlock: number;
  votesFor: SS58Address[];
  votesAgainst: SS58Address[];
  finalizationBlock: number | null;
  data: {
    custom: string;
  };
}

export const ADDRESS_SCHEMA = z
  .string()
  .transform((value) => value as SS58Address); // TODO: validate SS58 address

export const PROPOSAL_SHEMA = z
  .object({
    id: z.number(),
    proposer: ADDRESS_SCHEMA,
    expirationBlock: z.number(),
    data: z.object({
      custom: z.string(),
    }),
    // TODO: cast to SS58 address
    proposalStatus: z
      .string()
      .refine(
        (value) => ["Pending", "Accepted", "Refused"].includes(value),
        "Invalid proposal status",
      )
      .transform((value) => value as ProposalStatus),
    votesFor: z.array(ADDRESS_SCHEMA),
    votesAgainst: z.array(ADDRESS_SCHEMA),
    proposalCost: z.number(),
    finalizationBlock: z.number().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.proposalStatus === "Accepted") {
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
    console.error(validated.error.issues);
    return null;
  } else {
    return validated.data;
  }
}

import { assert, type Extends } from "tsafe";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
assert<Extends<z.infer<typeof PROPOSAL_SHEMA>, Proposal>>();

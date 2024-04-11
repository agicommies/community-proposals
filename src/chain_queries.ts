import { ApiPromise, WsProvider } from "@polkadot/api";
import type { Codec } from "@polkadot/types/types";
import repl from "repl";
import { z } from "zod";

import type { Proposal, ProposalStatus, SS58Address } from "./types";

export type DoubleMap<K1, K2, V> = Map<K1, Map<K2, V>>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function do_repl(context: any) {
  const my_repl = repl.start("> ");
  for (const key in context) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    my_repl.context[key] = context[key];
  }
  const prom = new Promise<null>((resolve, reject) => {
    my_repl.on("exit", () => {
      resolve(null);
    });
    my_repl.on("error", (err) => {
      reject(err);
    });
  });
  return prom;
}

export async function get_all_stake(
  api: ApiPromise,
): Promise<Map<string, bigint>> {
  const stake_items = await api.query.subspaceModule?.stake?.entries();
  if (stake_items == null) throw new Error("Query to `stake` returned nullish");

  const stake_map = new Map<string, bigint>();

  let max_stake = 0n;
  let max_addr;

  for (const stake_item of stake_items) {
    if (!Array.isArray(stake_item) || stake_item.length != 2)
      throw new Error(`Invalid stake item '${stake_item.toString()}'`);
    const [key_raw, value_raw] = stake_item;
    const stake = BigInt(value_raw.toPrimitive() as string);

    const [n_raw, address_raw] = key_raw.args;
    if (n_raw == null || address_raw == null)
      throw new Error("stake storage key is nullish");

    const n = n_raw.toPrimitive(); // TODO: I don't even know what `n` is. netuid?
    const address = address_raw.toHuman();

    if (typeof n !== "number") throw new Error("Invalid stake storage key (n)");
    if (typeof address !== "string")
      throw new Error("Invalid stake storage key (address)");

    if (stake > max_stake) {
      max_stake = stake;
      max_addr = address;
    }

    if (stake_map.get(address) == null) {
      stake_map.set(address, stake);
    } else {
      const old_stake = stake_map.get(address) ?? 0n;
      stake_map.set(address, old_stake + stake);
    }
  }
  console.log("Max stake key:", max_addr, max_stake);
  return stake_map;
}

export async function get_all_stake_out(api: ApiPromise): Promise<{
  stake_map_total: Map<string, number>;
  stake_map_per_net: DoubleMap<number, string, number>;
}> {
  const stake_to_items = await api.query.subspaceModule?.stakeTo?.entries();
  if (stake_to_items == null)
    throw new Error("Query to stakeTo returned nullish");

  const stake_map_per_net = new Map<number, Map<string, number>>();
  const stake_map_total = new Map<string, number>();

  for (const stake_to_item of stake_to_items) {
    if (!Array.isArray(stake_to_item) || stake_to_item.length != 2)
      throw new Error(`Invalid stakeTo item '${stake_to_item.toString()}'`);
    const [key_raw, value_raw] = stake_to_item;

    const [netuid_raw, from_addr_raw] = key_raw.args;
    if (netuid_raw == null || from_addr_raw == null)
      throw new Error("stakeTo storage key is nullish");

    const netuid = netuid_raw.toPrimitive(); // TODO: I don't even know what `n` is. netuid?
    const from_addr = from_addr_raw.toHuman();
    const stake_to_map_for_key = value_raw.toPrimitive();

    if (typeof netuid !== "number")
      throw new Error("Invalid stakeTo storage key (netuid)");
    if (typeof from_addr !== "string")
      throw new Error("Invalid stakeTo storage key (from_addr)");
    if (typeof stake_to_map_for_key !== "object")
      throw new Error("Invalid stakeTo storage value");
    if (Array.isArray(stake_to_map_for_key))
      throw new Error("Invalid stakeTo storage value, it's an array");

    for (const module_key in stake_to_map_for_key) {
      const staked = stake_to_map_for_key[module_key];

      // TODO: It's possible that this ill turn into a string if the number is too big and we need to convert to a bigint
      if (typeof staked !== "number")
        throw new Error(
          "Invalid stakeTo storage value item, it's not a number",
        );

      const old_total = stake_map_total.get(from_addr) ?? 0;
      stake_map_total.set(from_addr, old_total + staked);

      const stake_map_for_net =
        stake_map_per_net.get(netuid) ?? new Map<string, number>();
      const old_total_for_net = stake_map_for_net.get(from_addr) ?? 0;
      stake_map_for_net.set(from_addr, old_total_for_net + staked);
    }

    // await do_repl({ api, netuid, from_addr, value_raw }); break
  }

  return { stake_map_total, stake_map_per_net };
}

export async function get_proposals(api: ApiPromise): Promise<Proposal[]> {
  const proposals_raw = await api.query.subspaceModule?.proposals?.entries();
  if (!proposals_raw) throw new Error("No proposals found");

  const proposals = [];
  for (const proposal_item of proposals_raw) {
    if (!Array.isArray(proposal_item) || proposal_item.length != 2) {
      console.error("Invalid proposal item:", proposal_item);
      continue;
    }
    const [, value_raw] = proposal_item;
    const proposal = parse_proposal(value_raw);
    if (proposal == null) throw new Error("Invalid proposal");
    proposals.push(proposal);
  }
  return proposals;
}

export function handle_votes(
  stake_map: Map<string, number>,
  votes_for: string[],
  votes_against: string[],
): { stake_for: number; stake_against: number; stake_total: number } {
  let stake_for = 0;
  let stake_against = 0;
  let stake_total = 0;

  for (const vote_addr of votes_for) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_for += stake;
    stake_total += stake;
  }

  for (const vote_addr of votes_against) {
    const stake = stake_map.get(vote_addr);
    if (stake == null) {
      console.error(`Key ${vote_addr} not found in stake map`);
      continue;
    }
    stake_against += stake;
    stake_total += stake;
  }

  return { stake_for, stake_against, stake_total };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _test() {
  const ws_endpoint = "wss://testnet-commune-api-node-0.communeai.net";

  const provider = new WsProvider(ws_endpoint);
  const api = await ApiPromise.create({ provider });

  const proposals = await get_proposals(api);
  console.log(proposals);

  const { stake_map_total } = await get_all_stake_out(api);

  for (const proposal of proposals) {
    // if (proposal.netuid != null) {
    //     continue
    // }
    console.log(`Proposal #${proposal.id}`, `proposer: ${proposal.proposer}`);

    const { stake_for, stake_against, stake_total } = handle_votes(
      stake_map_total,
      proposal.votesFor,
      proposal.votesAgainst,
    );

    console.log(stake_for, stake_against, stake_total);
  }

  process.exit();
}

// await _test();

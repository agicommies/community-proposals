import { ApiPromise, WsProvider } from "@polkadot/api";
import type { Codec } from "@polkadot/types/types"
import { z } from "zod"

import type { Proposal, ProposalStatus, SS58Address } from "./types"

const ADDRESS_SCHEMA = z.string().transform((value) => value as SS58Address) // TODO: validate SS58 address

const PROPOSAL_SHEMA = z.object({
    id: z.number(),
    proposer: ADDRESS_SCHEMA,
    expirationBlock: z.number(),
    data: z.object({
        custom: z.string().trim().url(),
    }),
    // TODO: cast to SS58 address
    proposalStatus: z.string()
        .refine((value) => ["Pending", "Accepted", "Refused"].includes(value), "Invalid proposal status")
        .transform((value) => value as ProposalStatus),
    votesFor: z.array(ADDRESS_SCHEMA),
    votesAgainst: z.array(ADDRESS_SCHEMA),
    proposalCost: z.number(),
    finalizationBlock: z.number().nullable(),
}).superRefine((value, ctx) => {
    if (value.proposalStatus === "Accepted") {
        ctx.addIssue({
            code: "custom",
            message: "Proposal status is 'Accepted', but no finalization block was found",
        })
    }
})

function parse_proposal(value_raw: Codec): Proposal | null {
    const value = value_raw.toPrimitive()
    const validated = PROPOSAL_SHEMA.safeParse(value)
    if (!validated.success) {
        console.error(validated.error.issues)
        return null
    } else {
        return validated.data
    }
}

import repl from "repl"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function do_repl(context: any) {
    const my_repl = repl.start("> ")
    for (const key in context) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        my_repl.context[key] = context[key]
    }
    const prom = new Promise<null>((resolve, reject) => {
        my_repl.on("exit", () => {
            resolve(null)
        })
        my_repl.on("error", (err) => {
            reject(err)
        })
    })
    return prom
}

export async function get_all_stake(api: ApiPromise): Promise<Map<string, bigint>> {
    const stake_items = await api.query.subspaceModule?.stake?.entries()
    if (stake_items == null) throw new Error("Query to `stake` returned nullish")

    const stake_map = new Map<string, bigint>()

    let max_stake = 0n
    let max_addr

    for (const stake_item of stake_items) {
        if (!Array.isArray(stake_item) || stake_item.length != 2)
            throw new Error(`Invalid stake item '${stake_item.toString()}'`)
        const [key_raw, value_raw] = stake_item
        const stake = BigInt(value_raw.toPrimitive() as string)

        const [n_raw, address_raw] = key_raw.args
        if (n_raw == null || address_raw == null) throw new Error("stake storage key is nullish")

        const n = n_raw.toPrimitive()  // TODO: I don't even know what `n` is. netuid?
        const address = address_raw.toHuman()

        if (typeof n !== "number") throw new Error("Invalid stake storage key (n)")
        if (typeof address !== "string") throw new Error("Invalid stake storage key (address)")

        if (stake > max_stake) {
            max_stake = stake
            max_addr = address
        }

        if (stake_map.get(address) == null) {
            stake_map.set(address, stake)
        } else {
            const old_stake = stake_map.get(address) ?? 0n
            stake_map.set(address, old_stake + stake)
        }
    }
    console.log("Max stake key:", max_addr, max_stake)
    return stake_map
}

async function get_all_stake_out(api: ApiPromise): Promise<Map<string, bigint>> {
    const stake_to_items = await api.query.subspaceModule?.stakeTo?.entries()
    if (stake_to_items == null) throw new Error("Query to stakeTo returned nullish")

    const stake_map = new Map<number, Map<string, bigint>>()
    const stake_map_total = new Map<string, bigint>()

    for (const stake_to_item of stake_to_items) {
        if (!Array.isArray(stake_to_item) || stake_to_item.length != 2)
            throw new Error(`Invalid stakeTo item '${stake_to_item.toString()}'`)
        const [key_raw, value_raw] = stake_to_item

        const [netuid_raw, from_addr_raw] = key_raw.args
        if (netuid_raw == null || from_addr_raw == null) throw new Error("stakeTo storage key is nullish")

        const netuid = netuid_raw.toPrimitive()  // TODO: I don't even know what `n` is. netuid?
        const from_addr = from_addr_raw.toHuman()

        if (typeof netuid !== "number") throw new Error("Invalid stakeTo storage key (netuid)")
        if (typeof from_addr !== "string") throw new Error("Invalid stakeTo storage key (from_addr)")

        await do_repl({ api, key: key_raw, key_raw, value_raw })
        break
    }

    return stake_map
}

async function get_proposals(api: ApiPromise): Promise<Proposal[]> {
    const proposals_raw = await api.query.subspaceModule?.proposals?.entries()
    if (!proposals_raw) throw new Error("No proposals found")

    const proposals = []
    for (const proposal_item of proposals_raw) {
        if (!Array.isArray(proposal_item) || proposal_item.length != 2) {
            console.error("Invalid proposal item:", proposal_item)
            continue
        }
        const [_key_raw, value_raw] = proposal_item
        const proposal = parse_proposal(value_raw)
        if (proposal == null) throw new Error("Invalid proposal")
        proposals.push(proposal)
    }
    return proposals
}

async function _test() {
    const ws_endpoint = "wss://testnet-commune-api-node-0.communeai.net"

    const provider = new WsProvider(ws_endpoint);
    const api = await ApiPromise.create({ provider });

    const proposals = await get_proposals(api)
    console.log(proposals)

    const stake_map = await get_all_stake_out(api)
    // console.log(stake_map)

    // for (const proposal of proposals) {
    //     const votes = proposal.votesFor
    //     for (const vote_addr of votes) {
    //         const stake = stake_map.get(vote_addr)
    //         if (stake == null) throw new Error("Key not found")
    //         console.log(vote_addr, stake)
    //     }
    // }

    process.exit()
}

await _test()

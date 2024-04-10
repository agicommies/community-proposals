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
    my_repl.on("exit", () => {
        process.exit()
    })
    return my_repl
}

async function _test() {
    const ws_endpoint = "wss://testnet-commune-api-node-0.communeai.net"

    const provider = new WsProvider(ws_endpoint);
    const api = await ApiPromise.create({ provider });

    const proposals = await api.query.subspaceModule?.proposals?.entries()
    if (!proposals) throw new Error("No proposals found")

    for (const proposal_item of proposals) {
        if (!Array.isArray(proposal_item) || proposal_item.length != 2) {
            console.error("Invalid proposal item:", proposal_item)
            continue
        }
        const [_key_raw, value_raw] = proposal_item
        const proposal = parse_proposal(value_raw)
        console.log(proposal)
    }

    const stake_items = await api.query.subspaceModule?.stake?.entries()
    if (!stake_items) throw new Error("No stakes found")

    const stake_map = new Map<string, bigint>()

    let max_stake = 0n
    let max_addr

    for (const stake_item of stake_items) {
        if (!Array.isArray(stake_item) || stake_item.length != 2) {
            console.error("Invalid stake item:", stake_item)
            continue
        }
        const [key_raw, value_raw] = stake_item
        const stake = BigInt(value_raw.toPrimitive() as string)

        const [n_raw, address_raw] = key_raw.args
        if (n_raw == null || address_raw == null) throw new Error("Invalid stake storage key")

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
        // do_repl({ api, key, key_raw, address }); break
    }

    console.log(stake_map)
    console.log(max_addr, max_stake)

    const votes = ["5FpoUNprfkaR7FY9mGUrNK88YNim1fpQ118VkeAieE8GBFjr"]
    for (const vote_addr of votes) {
        const stake = stake_map.get(vote_addr)
        if (stake == null) throw new Error("Key not found")
        console.log(vote_addr, stake)
    }
}

await _test()

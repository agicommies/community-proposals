

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
}

await _test()

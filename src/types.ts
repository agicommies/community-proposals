import type { Tagged } from "rustie"

export type SS58Address = Tagged<string, "SS58Address">

export type ProposalStatus = "Pending" | "Accepted" | "Refused"

export interface Proposal {
    id: number,
    proposer: SS58Address, // TODO: SS58 address validation
    proposalStatus: ProposalStatus,
    expirationBlock: number,
    votesFor: SS58Address[],
    votesAgainst: SS58Address[],
    finalizationBlock: number | null,
    data: {
        custom: string,
    },
}

export interface ProposalMetadata {
    title: string,
    body: string, // Markdown description
}

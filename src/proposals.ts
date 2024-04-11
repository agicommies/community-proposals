import { match } from "rustie";
import {
  type Proposal,
  type CustomProposalMetadata,
  CUSTOM_PROPOSAL_METADATA_SCHEMA,
  type ProposalBody,
} from "./types";
import { parse_ipfs_uri, build_ipfs_gateway_url } from "./utils/ipfs";

export async function handle_custom_proposal_data(
  proposal: Proposal,
  data: string,
): Promise<CustomProposalMetadata | null> {
  const cid = parse_ipfs_uri(data);
  if (cid == null) {
    console.error(`Invalid IPFS URI ${data} for proposal ${proposal.id}`);
    return null;
  }
  const url = build_ipfs_gateway_url(cid);

  const response = await fetch(url);
  const validated = CUSTOM_PROPOSAL_METADATA_SCHEMA.safeParse(
    await response.json(),
  );
  if (!validated.success) {
    console.error(
      `Invalid proposal data for proposal ${proposal.id} at ${url}`,
      validated.error.issues,
    );
    console.error();
    return null;
  }
  const metadata = validated.data;
  return metadata;
}

export async function handle_proposals(
  proposals: Proposal[],
  handler: (id: number, proposal_body: ProposalBody) => void,
) {
  for (const proposal of proposals) {
    // const variant = flatten_enum(proposal.data);
    void match(proposal.data)({
      custom: async function (data: string) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return;
        }
        handler(proposal.id, { Custom: { metadata, netuid: null } });
      },
      subnetCustom: async function ({
        netuid,
        data,
      }: {
        netuid: number;
        data: string;
      }) {
        const metadata = await handle_custom_proposal_data(proposal, data);
        if (metadata == null) {
          console.warn(
            `Invalid custom proposal data for proposal ${proposal.id}: ${data}`,
          );
          return;
        }
        handler(proposal.id, {
          Custom: {
            metadata: metadata,
            netuid: netuid,
          },
        });
      },
      globalParams: async function (/*v: unknown*/) {
        // ignore
      },
      subnetParams:
        async function (/*v: { netuid: number; params: unknown }*/) {
          // ignore
        },
    });
  }
}

import { CID } from "multiformats/cid";
import { z } from "zod";

const URL_SCHEMA = z.string().trim().url();

export function parse_ipfs_uri(uri: string): CID | null {
  const validated = URL_SCHEMA.safeParse(uri);
  if (!validated.success) {
    console.warn(`Invalid IPFS URI ${uri}`, validated.error.issues);
    return null;
  }
  const ipfs_prefix = "ipfs://";
  const rest = uri.startsWith(ipfs_prefix)
    ? uri.slice(ipfs_prefix.length)
    : uri;
  try {
    const cid = CID.parse(rest);
    return cid;
  } catch (e) {
    console.warn(`Invalid IPFS CID ${rest}`, e);
    return null;
  }
}

export function build_ipfs_gateway_url(cid: CID): string {
  const cid_str = cid.toString();
  return `https://ipfs.io/ipfs/${cid_str}`;
}

import { CID } from "multiformats/cid";
import { z } from "zod";

const URL_SCHEMA = z.string().trim().url();

export function parse_ipfs_uri(uri: string): CID {
  URL_SCHEMA.parse(uri);
  const ipfs_prefix = "ipfs://";
  const rest = uri.startsWith(ipfs_prefix)
    ? uri.slice(ipfs_prefix.length)
    : uri;
  const cid = CID.parse(rest);
  return cid;
}

export function build_ipfs_gateway_url(cid: CID): string {
  const cid_str = cid.toString();
  return `https://ipfs.io/ipfs/${cid_str}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _test() {
  const cid = parse_ipfs_uri(
    "ipfs://bafkreideif2rljo42bmvuzqurbozhj55pvfkbwak42oadssk2w46y3a4pe",
  );
  const url = build_ipfs_gateway_url(cid);
  console.log(`Let's fetch: ${url}`);
  await fetch(url)
    .then((res) => res.json())
    .then((data) => console.log(data));
}

// await _test();

import { CID } from 'multiformats/cid'
import { z } from "zod"

const URL_SCHEMA = z.string().trim().url()

function parse_ipfs_uri(uri: string): CID | null {
    const result = URL_SCHEMA.safeParse(uri)
    if (!result.success) return null
    const ipfs_prefix = "ipfs://"
    const rest = uri.startsWith(ipfs_prefix) ? uri.slice(ipfs_prefix.length) : uri
    const cid = CID.parse(rest)
    return cid
}

export function build_ipfs_gateway_url(cid: CID): string {
    const cid_str = cid.toString()
    return `https://ipfs.io/ipfs/${cid_str}`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _test() {
    const cid = parse_ipfs_uri("ipfs://QmWzkJ3Akebc8pCU7KxyBUqCGCg1Xfj7C6yxSQX5ZK9r7T")
    if (cid == null) throw new Error("Invalid CID")
    const url = build_ipfs_gateway_url(cid)
    console.log(`Let's fetch: ${url}`)
    await fetch(url)
        .then(res => res.json())
        .then(data => console.log(data))
}

await _test()

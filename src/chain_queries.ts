import { ApiPromise, WsProvider } from "@polkadot/api";

const ws_endpoint = "wss://commune.api.onfinality.io/public-ws"

const provider = new WsProvider(ws_endpoint);
const api = await ApiPromise.create({ provider });

console.log(api);

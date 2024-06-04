import "@polkadot/api-augment";

import { type Dao, parse_proposal, type Proposal, parse_daos } from "./types";
import { from_nano } from "~/utils";
import { type ApiPromise } from "@polkadot/api";

export type DoubleMap<K1, K2, V> = Map<K1, Map<K2, V>>;

export interface StakeData {
  block_number: number;
  block_hash_hex: string;
  stake_out: {
    total: bigint;
    per_addr: Map<string, bigint>;
    per_net: Map<number, bigint>;
    per_addr_per_net: Map<number, Map<string, bigint>>;
  };
}

export async function use_last_block(api: ApiPromise) {
  const block_header = await api.rpc.chain.getHeader();
  const block_number = block_header.number.toNumber();
  const block_hash = block_header.hash;
  const block_hash_hex = block_hash.toHex();
  const api_at_block = await api.at(block_header.hash);
  return {
    block_header,
    block_number,
    block_hash,
    block_hash_hex,
    api_at_block,
  };
}

export async function __get_all_stake(
  api: ApiPromise,
): Promise<Map<string, bigint>> {
  const stake_items = await api.query.subspaceModule?.stake?.entries();
  if (stake_items == null) throw new Error("Query to `stake` returned nullish");

  const stake_map = new Map<string, bigint>();

  let max_stake = 0n;

  for (const stake_item of stake_items) {
    if (!Array.isArray(stake_item) || stake_item.length != 2)
      throw new Error(`Invalid stake item '${stake_item.toString()}'`);
    const [key_raw, value_raw] = stake_item;
    const stake = BigInt(value_raw.toPrimitive() as string);

    const [n_raw, address_raw] = key_raw.args;
    if (n_raw == null || address_raw == null)
      throw new Error("stake storage key is nullish");

    const netuid = n_raw.toPrimitive();
    const address = address_raw.toHuman();

    if (typeof netuid !== "number")
      throw new Error("Invalid stake storage key (n)");
    if (typeof address !== "string")
      throw new Error("Invalid stake storage key (address)");

    if (stake > max_stake) {
      max_stake = stake;
      // max_addr = address;
    }

    if (stake_map.get(address) == null) {
      stake_map.set(address, stake);
    } else {
      const old_stake = stake_map.get(address) ?? 0n;
      stake_map.set(address, old_stake + stake);
    }
  }

  return stake_map;
}

export async function get_user_total_stake(
  api: ApiPromise,
  address: string,
): Promise<{ address: string; stake: string; netuid: number }[]> {
  const { api_at_block } = await use_last_block(api);
  const N_query = await api_at_block.query.subspaceModule?.n?.entries();

  if (!N_query) throw new Error("Query to n returned nullish");

  const stakePromises = N_query.map(async ([netuid_raw, _]) => {
    const netuid = parseInt(netuid_raw.toHuman() as string, 10);

    if (!api_at_block.query.subspaceModule?.stakeTo) return null;

    const stake = await api_at_block.query.subspaceModule.stakeTo(
      netuid,
      address,
    );

    const stakeHuman = stake.toHuman();

    if (!stakeHuman) return null;

    return {
      address,
      stake: stakeHuman,
      netuid,
    };
  });

  const stakes = await Promise.all(stakePromises);

  // Filter out any null results
  return stakes.filter((stake) => stake !== null) as {
    address: string;
    stake: string;
    netuid: number;
  }[];
}

// export async function get_all_stake_out_v2(api: ApiPromise) {
//   const { api_at_block, block_number, block_hash_hex } =
//     await use_last_block(api);
//   console.debug(`Querying StakeTo at block ${block_number}`);

//   const stake_to_query =
//     await api_at_block.query.subspaceModule?.stakeTo?.entries();

//   if (stake_to_query == null)
//     throw new Error("Query to stakeTo returned nullish");

//   // Total stake per netuid
//   const per_net = new Map<number, bigint>();
//   // Total stake per address per netuid
//   const per_addr_per_net = new Map<number, Map<string, bigint>>();

//   for (const stake_to_item of stake_to_query) {
//     if (!Array.isArray(stake_to_item) || stake_to_item.length != 2)
//       throw new Error(`Invalid stakeTo item '${stake_to_item.toString()}'`);
//     const [key_raw, value_raw] = stake_to_item;

//     const [netuid_raw, from_addr_raw] = key_raw.args;
//     if (netuid_raw == null || from_addr_raw == null)
//       throw new Error("stakeTo storage key is nullish");

//     const netuid = netuid_raw.toPrimitive();
//     const from_addr = from_addr_raw.toHuman();
//     const stake_to_map_for_key = value_raw.toPrimitive();

//     if (typeof netuid !== "number")
//       throw new Error("Invalid stakeTo storage key (netuid)");
//     if (typeof from_addr !== "string")
//       throw new Error("Invalid stakeTo storage key (from_addr)");
//     if (typeof stake_to_map_for_key !== "object")
//       throw new Error("Invalid stakeTo storage value");
//     if (Array.isArray(stake_to_map_for_key))
//       throw new Error("Invalid stakeTo storage value, it's an array");

//     let total_stake_for_addr = 0n;
//     for (const module_key in stake_to_map_for_key) {
//       const staked_ = stake_to_map_for_key[module_key];

//       if (typeof staked_ !== "number" && typeof staked_ !== "string")
//         throw new Error(
//           "Invalid stakeTo storage value item, it's not a number or string",
//         );
//       const staked = BigInt(staked_);

//       // Add stake to total for the address
//       total_stake_for_addr += staked;
//     }

//     // Add stake to (netuid => stake) map
//     const old_total_for_net = per_net.get(netuid) ?? 0n;
//     per_net.set(netuid, old_total_for_net + total_stake_for_addr);

//     // Add stake to (netuid => addr => stake) map
//     const map_net = per_addr_per_net.get(netuid) ?? new Map<string, bigint>();
//     map_net.set(from_addr, total_stake_for_addr);
//   }

//   if (!api_at_block.query.governanceModule?.delegatingVotingPower) {
//     throw new Error("API does not support query for delegatingVotingPower");
//   }

//   const delegatingVotingPower =
//     await api_at_block.query.governanceModule.delegatingVotingPower();

//   // list of delegating voting power addresses ['5C4i5Xi8gWVrJjp5sUAKZtNZHwBMU4dWxb9DfJ9GptXUgDNw', '5C4j8cMyyNKGruuqhaks6wH19kaqEJ3vdhpKGxi3KehhBvAm', '5C4jQvqzmuXzexk8hmXvY5bVe3dTD8DWLMSoDgt8q6u1vQr7', '5C4kWDoaGcJ74q1yFstzDiCVwY1cGNsxTKFHe5wnZkqT35EV', '5C4mBkeaeTB3n5kDcCW5NJQBxNBmcB...
//   const delegatingVotingPowerMap = delegatingVotingPower.toHuman();

//   console.log(delegatingVotingPowerMap);
// }

async function calc_stake(
  api_at_block: ApiPromise,
  delegating: Set<string>,
  voter: string,
  subnet_id: number | null,
): Promise<bigint> {
  if (!api_at_block.query.palletSubspace?.getAccountStake) {
    throw new Error("API does not support query for getAccountStake");
  }

  const own_stake = delegating.has(voter)
    ? 0n
    : await api_at_block.query.palletSubspace.getAccountStake(
        api_at_block,
        voter,
        subnet_id,
      );

  const calculate_delegated = async (subnet_id: number) => {
    if (!api_at_block.query.palletSubspace?.getStakeFromVector) {
      throw new Error("API does not support query for getStakeFromVector");
    }
    const stake_from_vector =
      await api_at_block.query.palletSubspace.getStakeFromVector(
        api_at_block,
        subnet_id,
        voter,
      );

    const human_stake_from_vector = stake_from_vector.toHuman() as [
      string,
      string,
    ][];

    return human_stake_from_vector
      .filter(([staker, _]) => delegating.has(staker))
      .reduce((sum, [_, stake]) => sum + BigInt(stake), 0n);
  };

  const delegated_stake =
    subnet_id == null ? 0n : await calculate_delegated(subnet_id);

  return own_stake + delegated_stake;
}

export async function get_all_stake_out_v2(api: ApiPromise) {
  const { api_at_block, block_number, block_hash_hex } =
    await use_last_block(api);
  console.debug(`Querying StakeTo at block ${block_number}`);

  const stake_to_query =
    await api_at_block.query.subspaceModule?.stakeTo?.entries();

  if (stake_to_query == null)
    throw new Error("Query to stakeTo returned nullish");

  // Total stake per netuid
  const per_net = new Map<number, bigint>();
  // Total stake per address per netuid
  const per_addr_per_net = new Map<number, Map<string, bigint>>();

  for (const stake_to_item of stake_to_query) {
    if (!Array.isArray(stake_to_item) || stake_to_item.length != 2)
      throw new Error(`Invalid stakeTo item '${stake_to_item.toString()}'`);
    const [key_raw, value_raw] = stake_to_item;

    const [netuid_raw, from_addr_raw] = key_raw.args;
    if (netuid_raw == null || from_addr_raw == null)
      throw new Error("stakeTo storage key is nullish");

    const netuid = netuid_raw.toPrimitive();
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

    let total_stake_for_addr = 0n;
    for (const module_key in stake_to_map_for_key) {
      const staked_ = stake_to_map_for_key[module_key];

      if (typeof staked_ !== "number" && typeof staked_ !== "string")
        throw new Error(
          "Invalid stakeTo storage value item, it's not a number or string",
        );
      const staked = BigInt(staked_);

      // Add stake to total for the address
      total_stake_for_addr += staked;
    }

    // Add stake to (netuid => stake) map
    const old_total_for_net = per_net.get(netuid) ?? 0n;
    per_net.set(netuid, old_total_for_net + total_stake_for_addr);

    // Add stake to (netuid => addr => stake) map
    const map_net = per_addr_per_net.get(netuid) ?? new Map<string, bigint>();
    map_net.set(from_addr, total_stake_for_addr);
  }

  if (!api_at_block.query.governanceModule?.delegatingVotingPower) {
    throw new Error("API does not support query for delegatingVotingPower");
  }

  const delegatingVotingPower =
    await api_at_block.query.governanceModule.delegatingVotingPower();

  const delegatingVotingPowerMap: string[] =
    delegatingVotingPower.toHuman() as string[];
  const delegating = new Set(delegatingVotingPowerMap);

  if (!api_at_block.query.palletSubspace?.getSubnetId) {
    throw new Error("API does not support query for getSubnetId");
  }

  const subnet_id = await api_at_block.query.palletSubspace.getSubnetId();

  const stakePromises = Array.from(per_addr_per_net.entries()).map(
    async ([netuid, addr_map]) => {
      const stakePromises = Array.from(addr_map.entries()).map(
        async ([voter, _]) => {
          const stake = await calc_stake(
            api_at_block,
            delegating,
            voter,
            netuid,
          );
          return { voter, stake, netuid };
        },
      );
      return Promise.all(stakePromises);
    },
  );

  const stakes = await Promise.all(stakePromises);

  // Filter out any null results
  return stakes.filter((stake) => stake !== null) as {
    voter: string;
    stake: bigint;
    netuid: number;
  }[];
}

// old for reference
export async function get_all_stake_out(api: ApiPromise) {
  const { api_at_block, block_number, block_hash_hex } =
    await use_last_block(api);
  console.debug(`Querying StakeTo at block ${block_number}`);
  // TODO: cache query for specific block
  console.debug(api.runtimeChain);
  const stake_to_query =
    await api_at_block.query.subspaceModule?.stakeTo?.entries();

  if (stake_to_query == null)
    throw new Error("Query to stakeTo returned nullish");

  // Total stake
  let total = 0n;
  // Total stake per address
  const per_addr = new Map<string, bigint>();
  // Total stake per netuid
  const per_net = new Map<number, bigint>();
  // Total stake per address per netuid
  const per_addr_per_net = new Map<number, Map<string, bigint>>();

  for (const stake_to_item of stake_to_query) {
    if (!Array.isArray(stake_to_item) || stake_to_item.length != 2)
      throw new Error(`Invalid stakeTo item '${stake_to_item.toString()}'`);
    const [key_raw, value_raw] = stake_to_item;

    const [netuid_raw, from_addr_raw] = key_raw.args;
    if (netuid_raw == null || from_addr_raw == null)
      throw new Error("stakeTo storage key is nullish");

    const netuid = netuid_raw.toPrimitive();
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
      const staked_ = stake_to_map_for_key[module_key];

      if (typeof staked_ !== "number" && typeof staked_ !== "string")
        throw new Error(
          "Invalid stakeTo storage value item, it's not a number or string",
        );
      const staked = BigInt(staked_);

      // Add stake to total
      total += staked;

      // Add stake to (addr => stake) map
      const old_total = per_addr.get(from_addr) ?? 0n;
      per_addr.set(from_addr, old_total + staked);

      // Add stake to (netuid => stake) map
      const old_total_for_net = per_net.get(netuid) ?? 0n;
      per_net.set(netuid, old_total_for_net + staked);

      // Add stake to (netuid => addr => stake) map
      const map_net = per_addr_per_net.get(netuid) ?? new Map<string, bigint>();
      const old_total_addr_net = map_net.get(from_addr) ?? 0n;
      map_net.set(from_addr, old_total_addr_net + staked);
    }
  }

  return {
    block_number,
    block_hash_hex,
    stake_out: { total, per_addr, per_net, per_addr_per_net },
  };
}

export async function get_proposals(api: ApiPromise): Promise<Proposal[]> {
  const proposals_raw = await api.query.governanceMoudule?.proposals?.entries();
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

  proposals.reverse();
  return proposals;
}

export async function get_daos(api: ApiPromise): Promise<Dao[]> {
  const daos_raw =
    await api.query.subspaceModule?.curatorApplications?.entries();

  if (!daos_raw) throw new Error("No DAOs found");

  const daos = [];
  for (const dao_item of daos_raw) {
    if (!Array.isArray(dao_item) || dao_item.length != 2) {
      console.error("Invalid DAO item:", dao_item);
      continue;
    }
    const [, value_raw] = dao_item;
    const dao = parse_daos(value_raw);
    if (dao == null) throw new Error("Invalid DAO");
    daos.push(dao);
  }

  daos.reverse();
  return daos;
}

export async function get_dao_treasury(api: ApiPromise) {
  if (!api.query?.subspaceModule?.globalDaoTreasury) {
    throw new Error("API does not support query for globalDaoTreasury");
  }
  const result = await api.query.subspaceModule.globalDaoTreasury();
  const parsed_result = JSON.stringify(result);
  return Math.round(from_nano(BigInt(parsed_result)));
}

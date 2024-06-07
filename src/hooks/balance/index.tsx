import { type ApiPromise } from "@polkadot/api";
import { useQuery } from "@tanstack/react-query";
import { format_token } from "~/utils";

const fetchBalance = async ({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}) => {
  const {
    data: { free },
  } = await api.query.system.account(address);

  return format_token(Number(free));
};

const useBalance = (
  api: ApiPromise | undefined,
  address: string | undefined,
) => {
  const { data, ...result } = useQuery(
    ["balance", address],
    () => fetchBalance({ api: api!, address: address! }),
    {
      enabled: !!api && !!address,
      cacheTime: Infinity,
    },
  );

  return { balance: data, ...result };
};

export default useBalance;

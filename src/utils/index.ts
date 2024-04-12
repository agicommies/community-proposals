export const is_not_null = <T>(item: T | null): item is T => item !== null;

export function from_nano(nano: number | bigint): number {
  if (typeof nano === "bigint") return Number(nano / 1_000_000_000n);
  else return nano / 1_000_000_000;
}

export function format_token(nano: number | bigint): string {
  const amount = from_nano(nano);
  return amount.toFixed(2);
}

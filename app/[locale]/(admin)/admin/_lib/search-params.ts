export type SearchParams = Record<string, string | string[] | undefined>;

/** A query value is a string, or an array when the key is repeated: take the first. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : undefined;
}

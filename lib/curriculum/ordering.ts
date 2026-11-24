/**
 * Ordering rules for modules, lessons, quiz questions, supports and resources.
 *
 * The tables carry unique(parent, order) constraints, so two rows can never hold the same position,
 * not even for an instant inside one statement. Moving rows is therefore done in two phases:
 * first the rows that change are parked far above any real position, then they get their final one.
 */

/** Positions at or above this are scratch space used while rows swap. */
export const TEMP_ORDER_BASE = 1_000_000;

/** Next free position after the highest one (so deleting a row never makes the next insert collide). */
export function nextOrder(orders: readonly number[]): number {
  return orders.reduce((max, o) => (o > max ? o : max), 0) + 1;
}

export function sameIdSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const left = new Set(a);
  const right = new Set(b);
  return left.size === a.length && right.size === b.length && b.every((id) => left.has(id));
}

/** Moves `id` to `index` (clamped) in a list of ids. Returns a new array. */
export function moveId(ids: readonly string[], id: string, index: number): string[] {
  const without = ids.filter((x) => x !== id);
  const target = Math.max(0, Math.min(index, without.length));
  without.splice(target, 0, id);
  return without;
}

/**
 * Gives `desiredIds` the positions 1..n. `current` are the rows as they are now. Only rows whose
 * position changes are written, each twice (park, then final), so unique(order) is never violated.
 */
export async function applyOrder(
  current: readonly { id: string; order: number }[],
  desiredIds: readonly string[],
  setOrder: (id: string, order: number) => Promise<unknown>,
): Promise<void> {
  const currentOrder = new Map(current.map((r) => [r.id, r.order]));
  const changed = desiredIds
    .map((id, index) => ({ id, order: index + 1 }))
    .filter((r) => currentOrder.get(r.id) !== r.order);

  for (let i = 0; i < changed.length; i++) await setOrder(changed[i].id, TEMP_ORDER_BASE + i);
  for (const row of changed) await setOrder(row.id, row.order);
}

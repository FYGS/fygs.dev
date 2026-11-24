/**
 * Tas binaire min générique (file de priorité).
 * push / pop en O(log n), peek en O(1).
 * Les égalités sont départagées par ordre d'insertion (stable en pratique),
 * ce qui rend les parcours déterministes.
 */
export class MinHeap<T> {
  private items: { value: T; seq: number }[] = [];
  private counter = 0;

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  push(value: T): void {
    this.items.push({ value, seq: this.counter++ });
    this.siftUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return top.value;
  }

  private less(i: number, j: number): boolean {
    const c = this.compare(this.items[i].value, this.items[j].value);
    return c < 0 || (c === 0 && this.items[i].seq < this.items[j].seq);
  }

  private swap(i: number, j: number): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }

  private siftUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(index: number): void {
    let i = index;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      if (left < this.items.length && this.less(left, smallest)) smallest = left;
      if (right < this.items.length && this.less(right, smallest))
        smallest = right;
      if (smallest === i) return;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}

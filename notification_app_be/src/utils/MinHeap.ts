export class MinHeap<T> {
  private data: T[] = [];

  constructor(private comparator: (a: T, b: T) => number) {}

  public size(): number {
    return this.data.length;
  }

  public peek(): T | undefined {
    return this.data[0];
  }

  public push(item: T): void {
    this.data.push(item);
    this.bubbleUp();
  }

  public pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  private bubbleUp(): void {
    let index = this.data.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const child = this.data[index];
      const parent = this.data[parentIndex];
      if (!child || !parent || this.comparator(child, parent) >= 0) break;
      [this.data[parentIndex], this.data[index]] = [child, parent];
      index = parentIndex;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.data.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;
      
      const currentVal = this.data[index];
      if (!currentVal) break;

      if (left < length) {
        const leftVal = this.data[left];
        if (leftVal && this.comparator(leftVal, this.data[smallest]!) < 0) {
          smallest = left;
        }
      }
      if (right < length) {
        const rightVal = this.data[right];
        if (rightVal && this.comparator(rightVal, this.data[smallest]!) < 0) {
          smallest = right;
        }
      }
      if (smallest === index) break;
      [this.data[index], this.data[smallest]] = [this.data[smallest]!, this.data[index]!];
      index = smallest;
    }
  }
}
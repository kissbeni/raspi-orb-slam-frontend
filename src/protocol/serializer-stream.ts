export class SerializerStream {
  private buffer: Buffer | number[];
  private position: number;

  constructor(fieldCount: number, buff: Buffer | undefined) {
    this.position = 0;
    if (!buff) {
      this.buffer = new Array(64).map(() => 0);
      return;
    }
    this.buffer = buff;
  }

  putBoolean(val: boolean): void {
    this.putByte(+val);
  }

  putByte(val: number): void {
    this.buffer[this.position++] = val;
  }

  putInt8(val: number): void {
    this.buffer[this.position++] = val & 0xff;
  }
}

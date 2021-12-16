import { Point3D } from '../common/common-types';

const convertExponent = (n: number) => (n & 0x10 ? -(~n + 33) : n);

export class DeserializerStream {
  private buffer: Buffer;
  private position: number;

  constructor(buff: Buffer) {
    this.position = 0;
    this.buffer = buff;
  }

  getBoolean(): boolean {
    return this.getByte() !== 0;
  }

  getByte(): number {
    return this.buffer.readUInt8(this.position++);
  }

  getInt8(): number {
    return this.buffer.readInt8(this.position++);
  }

  getUint(): number {
    let num = 0;
    let shift = 0;
    let b;
    do {
      if (shift >= 1 << 8) throw new Error('varint too long');

      b = this.buffer.readUInt8(this.position++);
      num |= (b & 0x7f) << shift;
      shift += 7;
    } while ((b & 0x80) !== 0);

    return num;
  }

  getString(): string {
    const len = this.getUint();
    const res = this.buffer.toString('UTF-8', this.position, this.position + len);
    this.position += len;
    return res;
  }

  getFloat(): number {
    const res = this.buffer.readFloatLE(this.position);
    this.position += 4;
    return res;
  }

  getVec3(): Point3D {
    const lo = this.buffer.readUInt32LE(this.position);
    this.position += 4;
    const hi = this.buffer.readUInt32LE(this.position);
    this.position += 4;
    const roundingBit = lo & 1 ? 3.039836883544922e-5 : 0;

    let x = hi & 0x80000000 ? -1 : 1; // sign of X
    x *= Math.pow(2, convertExponent((hi >> 26) & 0x1f)); // exponent of X
    x *= (32768 + ((hi >> 11) & 0x7fff)) / 32768; // mantissa of X
    x += roundingBit;

    let y = hi & 0x400 ? -1 : 1; // sign of Y
    y *= Math.pow(2, convertExponent((hi >> 5) & 0x1f)); // exponent of Y
    y *= (32768 + (((hi & 0x1f) << 10) | ((lo >> 22) & 0x3ff))) / 32768; // mantissa of Y
    y += roundingBit;

    let z = lo & 0x200000 ? -1 : 1; // sign of Z
    z *= Math.pow(2, convertExponent((lo >> 16) & 0x1f)); // exponent of Z
    z *= (32768 + ((lo >> 1) & 0x7fff)) / 32768; // mantissa of Z
    z += roundingBit;

    return { x, y, z };
  }
}

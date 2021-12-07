import { Point3D } from '../common/common-types';

const from32to64 = (n: number) => [0, n | 0];
const from64to32 = (n: number[]) => n[1];
const get64 = (hi: number, lo: number) => [hi | 0, lo | 0];
const and64 = (a: number[], b: number[]) => [a[0] & b[0], a[1] & b[1]];
const and6432 = (a: number[], b: number) => [0, a[1] & b];
const shl64 = (a: number[], s: number) => {
  if (s === 0) {
    return [a[0], a[1]];
  }

  if (s < 32) {
    return [(a[1] >>> (32 - s)) | (a[0] << s), (a[1] << s) | 0];
  }

  if (s < 64) {
    return [(a[1] << (s - 32)) | 0, 0];
  }

  return [a[0], a[1]];
};
const shr64 = (a: number[], s: number) => {
  if (s === 0) {
    return [a[0], a[1]];
  }

  if (s < 32) {
    return [(a[0] >>> s) | 0, (a[0] << (32 - s)) | (a[1] >>> s)];
  }

  if (s < 64) {
    return [0, (a[0] >>> (s - 32)) | 0];
  }

  return [a[0], a[1]];
};
const shl3264 = (a: number, s: number) => shl64([0, a], s);
const shr3264 = (a: number, s: number) => shr64([0, a], s);
const add64 = (a: number[], b: number[]) => {
  const [a0, a1] = a;
  const [b0, b1] = b;

  const u = (a1 + b1) | 0;
  // Either two highest bits are on
  // or one highest bit is on and the
  // other number is >= in absolute value
  const c = Number((a1 < 0 && (b1 < 0 || b1 > ~a1)) || (b1 < 0 && b1 > ~a1));

  return [(a0 + b0 + c) | 0, u];
};
const mul3264 = (a: number, b: number) => {
  const a0 = (a >>> 16) & 0xff_ff;
  const a1 = a & 0xff_ff;
  const b0 = (b >>> 16) & 0xff_ff;
  const b1 = b & 0xff_ff;

  const x = [Math.imul(a0, b0), Math.imul(a1, b1)];
  const t = Math.imul(a0, b1);
  const u = Math.imul(a1, b0);
  const y = [(t >>> 16) | 0, (t << 16) | 0];
  const z = [(u >>> 16) | 0, (u << 16) | 0];
  return add64(x, add64(y, z));
};
const mul64 = (a: number[], b: number[]) => {
  const [a0, a1] = a;
  const [b0, b1] = b;

  const x = [(Math.imul(a1, b0) + Math.imul(a0, b1)) | 0, 0];
  const y = mul3264(a1, b1);
  return add64(x, y);
};
const or64 = (a: number[], b: number[]) => [a[0] | b[0], a[1] | b[1]];

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
    const hi = this.buffer.readUInt32LE(this.position);
    this.position += 4;
    const lo = this.buffer.readUInt32LE(this.position);
    this.position += 4;
    const res = get64(hi, lo);

    const roundingBit = from64to32(and6432(res, 1)) ? 1 : 0;

    let x = and64(res, shl3264(1, 63)) ? -1 : 1; // sign of X
    x *= Math.pow(
      2,
      from64to32(
        or64(
          mul64(shl3264(0xe0, 5), and64(res, shl3264(1, 62))),
          and64(shr64(res, 58), from32to64(0x1f))
        )
      )
    ); // exponent of X
    x *= from64to32(
      or64(from32to64(0xff * roundingBit), shl64(and6432(shr64(res, 43), 0x7fff), 8))
    ); // mantissa of X

    let y = and64(res, shl3264(1, 42)) ? -1 : 1; // sign of Y
    y *= Math.pow(
      2,
      from64to32(
        or64(
          mul64(shl3264(0xe0, 5), and64(res, shl3264(1, 41))),
          and64(shr64(res, 37), from32to64(0x1f))
        )
      )
    ); // exponent of Y
    y *= from64to32(
      or64(from32to64(0xff * roundingBit), shl64(and6432(shr64(res, 22), 0x7fff), 8))
    ); // mantissa of Y

    let z = and64(res, shl3264(1, 21)) ? -1 : 1; // sign of Z
    z *= Math.pow(
      2,
      from64to32(
        or64(
          mul64(shl3264(0xe0, 5), and64(res, shl3264(1, 20))),
          and64(shr64(res, 16), from32to64(0x1f))
        )
      )
    ); // exponent of Z
    z *= from64to32(or64(from32to64(0xff * roundingBit), shl64(and6432(shr64(res, 1), 0x7fff), 8))); // mantissa of Z

    return { x, y, z };
  }
}

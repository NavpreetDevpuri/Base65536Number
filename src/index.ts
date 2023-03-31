class Base2N {
  private readonly n: number;
  private readonly base: number;
  private readonly length: number;
  private readonly digits: Uint16Array;
  static charset: string[];

  constructor(digits: string | Uint16Array = "\0", n = 16) {
    if (n === 0) {
      throw new Error(`n can't be zero.`);
    }

    if (n > 16) {
      throw new Error(
        `n can't be more than 16 because 2^16 = 65536. That's the limit of possible characters we can have in UNICODE to represent digits.`
      );
    }

    this.n = n;
    this.base = 2 ** n;

    const noOf1sInBaseBinary = this.base.toString(2).split('1').length - 1;
    if (noOf1sInBaseBinary > 1) {
      throw new Error(
        `base should be some power of 2, For example 2^2=4, 2^3=8, 16, 32, 64, 128, ... 65536`
      );
    }

    this.length = digits.length;
    this.digits =
      digits instanceof Uint16Array
        ? digits
        : new Uint16Array(this.length);

    if (typeof digits === 'string') {
      for (let i = digits.length, j = this.length; i > -1; i -= 1, j -= 1) {
        this.digits[j] = digits.charCodeAt(i);
        if (this.digits[j] >= this.base) {
          throw new Error(
            `Any digit's ASCII code in given digits can't be more than or equal to given base: ${this.base}. ASCII code ${this.digits[j]} > base ${this.base}`
          );
        }
      }
    }
  }

  public toString(): string {
    let result = '';
    for (let i = 0; i < this.length; i += 1) {
      result += Base2N.charset[this.digits[i]];
    }
    return result;
  }

  public subtract(other: Base2N): Base2N {
    if (this.n !== other.n) {
      throw new Error('Can\' subtract two number with different number system');
    }
    if (this.toString() < other.toString()) {
      throw new Error('Subtraction result is negative');
    }
    const { a, b } = Base2N._getMakeLength(this, other);
    const result = new Uint16Array(a.length);
    let carry = 0;
    for (let i = a.length - 1; i > -1; i -= 1) {
      if (a.digits[i] < b.digits[i]) {
        result[i] = a.digits[i] - carry + a.base - b.digits[i];
        carry = 1;
      } else {
        result[i] = a.digits[i] - carry - b.digits[i];
        carry = 0;
      }
    }
    return new Base2N(result, a.n);
  }

  add(other: Base2N): Base2N {
    if (this.n !== other.n) {
      throw new Error('Can\' add two number with different number system');
    }
    const { a, b } = Base2N._getMakeLength(this, other);
    const result = new Uint16Array(a.length);
    let carry = 0;
    for (let i = a.length - 1; i > -1; i -= 1) {
      const curr = a.digits[i] + b.digits[i] + carry;
      if (curr >= a.base) {
        result[i] = curr - a.base;
        carry = 1;
      } else {
        result[i] = curr;
        carry = 0;
      }
    }
    return new Base2N(result, a.n);
  }

  half(): Base2N {
    const result = new Uint16Array(this.length);
    let carry = 0;
    for (let i = 0; i < this.length; i += 1) {
      const curr = (this.digits[i] >> 1) | (carry << (this.n - 1));
      carry = this.digits[i] & 1;
      result[i] = curr;
    }
    return new Base2N(result, this.n);
  }

  average(other: Base2N): Base2N {
    if (this.length !== other.length) {
      throw new Error('Operands are not of the same length');
    }
    let bothOddFlag = '\u0000';
    if (
      this.digits[this.digits.length - 1] % 2 === 1 &&
      other.digits[other.digits.length - 1] % 2 === 1
    ) {
      bothOddFlag = '\u0001';
    }
    const thisHalf = this.half();
    const bHalf = other.half();
    const result = thisHalf
      .add(bHalf)
      .add(new Base2N(bothOddFlag, this.n));
    return result;
  }

  static _getMakeLength(a: Base2N, b: Base2N): { a: Base2N, b: Base2N }  {
    if (a.length > b.length) {
      b = new Base2N(b.toString().padStart(a.length, '\0'), a.n);
      return { a, b };
    } else if (b.length > a.length) {
      a = new Base2N(a.toString().padStart(b.length, '\0'), b.n);
      return { a, b };
    }
    return { a, b };
  }
}

Base2N.charset = [];
for (let i = 0; i < 2 ** 16; i += 1) {
  Base2N.charset[i] = String.fromCharCode(i);
}

export default Base2N;
export { Base2N };

class Base2N {
  private readonly n: number;
  private readonly base: number;
  private readonly maxNoOfDigits: number;
  private readonly digits: Uint16Array;
  private readonly charset: string[];

  constructor(digits: string | Uint16Array, n = 16, maxNoOfDigits = 50) {
    if (digits.length > maxNoOfDigits) {
      throw new Error(
        `Digits length can't be longer than maxNoOfDigits: ${maxNoOfDigits}`
      );
    }

    if (n === 0) {
      throw new Error(`n can't be zero.`);
    }

    if (maxNoOfDigits === 0) {
      throw new Error(`maxNoOfDigits can't be zero.`);
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

    this.charset = [];
    for (let i = 0; i < this.base; i += 1) {
      this.charset[i] = String.fromCharCode(i);
    }
    this.maxNoOfDigits = maxNoOfDigits;
    this.digits =
      digits instanceof Uint16Array
        ? digits
        : new Uint16Array(this.maxNoOfDigits);

    if (typeof digits === 'string') {
      for (let i = digits.length, j = maxNoOfDigits; i > -1; i -= 1, j -= 1) {
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
    for (let i = 0; i < this.maxNoOfDigits; i += 1) {
      result += this.charset[this.digits[i]];
    }
    return result;
  }

  public subtract(other: Base2N): Base2N {
    if (this.toString() < other.toString()) {
      throw new Error('Subtraction result is negative');
    }
    const result = new Uint16Array(this.maxNoOfDigits);
    let carry = 0;
    for (let i = this.maxNoOfDigits - 1; i > -1; i -= 1) {
      if (this.digits[i] < other.digits[i]) {
        result[i] = this.digits[i] - carry + this.base - other.digits[i];
        carry = 1;
      } else {
        result[i] = this.digits[i] - carry - other.digits[i];
        carry = 0;
      }
    }
    return new Base2N(result, this.n, this.maxNoOfDigits);
  }

  add(other: Base2N): Base2N {
    const result = new Uint16Array(this.maxNoOfDigits);
    let carry = 0;
    for (let i = this.maxNoOfDigits - 1; i > -1; i -= 1) {
      const curr = this.digits[i] + other.digits[i] + carry;
      if (curr >= this.base) {
        result[i] = curr - this.base;
        carry = 1;
      } else {
        result[i] = curr;
        carry = 0;
      }
    }
    return new Base2N(result, this.n, this.maxNoOfDigits);
  }

  half(): Base2N {
    const result = new Uint16Array(this.maxNoOfDigits);
    let carry = 0;
    for (let i = 0; i < this.maxNoOfDigits; i += 1) {
      const curr = (this.digits[i] >> 1) | (carry << (this.n - 1));
      carry = this.digits[i] & 1;
      result[i] = curr;
    }
    return new Base2N(result, this.n, this.maxNoOfDigits);
  }

  average(other: Base2N): Base2N {
    if (this.maxNoOfDigits !== other.maxNoOfDigits) {
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
      .add(new Base2N(bothOddFlag, this.n, this.maxNoOfDigits));
    return result;
  }
}

export default Base2N;
export { Base2N };

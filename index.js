export default class Base65536Number {
  constructor(digits, length = 50) {
    if (digits.length > length) {
      throw new Error('Digits length is too long');
    }
    const base = 65536;
    this.charset = [];
    for (let i = 0; i < base; i++) {
      this.charset[i] = String.fromCharCode(i);
    }
    this.length = length;
    this.digits = digits;
    if (typeof digits == 'string') {
      this.digits = new Uint16Array(this.length);
      for (let i = digits.length, j = length; i > -1; i--, j--) {
        this.digits[j] = digits.charCodeAt(i);
      }
    }
  }

  toString() {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      result += this.charset[this.digits[i]];
    }
    return result;
  }

  subtract(other) {
    if (this.toString() < other.toString()) {
      throw new Error('Subtraction result is negative');
    }
    const result = new Uint16Array(this.length);
    let carry = 0;
    for (let i = this.length - 1; i > -1; i--) {
      if (this.digits[i] < other.digits[i]) {
        result[i] = this.digits[i] - carry + 65536 - other.digits[i];
        carry = 1;
        continue;
      }
      result[i] = this.digits[i] - carry - other.digits[i];
      carry = 0;
    }
    return new Base65536Number(result, this.length);
  }

  add(other) {
    const result = new Uint16Array(this.length);
    let carry = 0;
    for (let i = this.length - 1; i > -1; i--) {
      const curr = this.digits[i] + other.digits[i] + carry;
      carry = curr > 65535 ? 1 : 0;
      result[i] = curr;
    }
    return new Base65536Number(result, this.length);
  }

  half() {
    const result = new Uint16Array(this.length);
    let carry = 0;
    for (let i = 0; i < this.length; i++) {
      const curr = (this.digits[i] >> 1) | (carry << 15);
      carry = curr & 1 ? 1 : 0;
      result[i] = curr;
    }
    return new Base65536Number(result, this.length);
  }

  average(other) {
    if (this.length != other.length) {
      throw new Error('Operands are not of the same length');
    }
    let bothOddFlag = 0;
    if (
      this.digits[this.digits.length - 1] % 2 == 1 &&
      other.digits[b.digits.length - 1] % 2 == 1
    ) {
      bothOddFlag = 1;
    }
    const thisHalf = this.half();
    const bHalf = other.half();
    const result = thisHalf
      .add(bHalf)
      .add(new Base65536Number(bothOddFlag.toString(), this.length));
    return result;
  }
}

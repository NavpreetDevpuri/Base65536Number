export default class Base65536Number {
  constructor(digits, maxLength = 50) {
    if (digits.length > maxLength) {
      throw new Error('Digits length is too long');
    }
    const base = 65536;
    this.charset = [];
    for (let i = 0; i < base; i++) {
      this.charset[i] = String.fromCharCode(i);
    }
    this.maxLength = maxLength;
    this.digits = digits;
    if (typeof digits == 'string') {
      this.digits = new Uint16Array(this.maxLength);
      for (let i = digits.length, j = maxLength; i > -1; i--, j--) {
        this.digits[j] = digits.charCodeAt(i);
      }
    }
  }

  toString() {
    let result = '';
    for (let i = 0; i < this.maxLength; i++) {
      result += this.charset[this.digits[i]];
    }
    return result;
  }

  subtract(other) {
    if (this.toString() < other.toString()) {
      throw new Error('Subtraction result is negative');
    }
    const result = new Uint16Array(this.maxLength);
    let carry = 0;
    for (let i = this.maxLength - 1; i > -1; i--) {
      if (this.digits[i] < other.digits[i]) {
        result[i] = this.digits[i] - carry + 65536 - other.digits[i];
        carry = 1;
        continue;
      }
      result[i] = this.digits[i] - carry - other.digits[i];
      carry = 0;
    }
    return new Base65536Number(result, this.maxLength);
  }

  add(other) {
    const result = new Uint16Array(this.maxLength);
    let carry = 0;
    for (let i = this.maxLength - 1; i > -1; i--) {
      const curr = this.digits[i] + other.digits[i] + carry;
      carry = curr > 65535 ? 1 : 0;
      result[i] = curr;
    }
    return new Base65536Number(result, this.maxLength);
  }

  half() {
    const result = new Uint16Array(this.maxLength);
    let carry = 0;
    for (let i = 0; i < this.maxLength; i++) {
      const curr = (this.digits[i] >> 1) | (carry << 15);
      carry = curr & 1 ? 1 : 0;
      result[i] = curr;
    }
    return new Base65536Number(result, this.maxLength);
  }

  average(other) {
    if (this.maxLength != other.length) {
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
      .add(new Base65536Number(bothOddFlag.toString(), this.maxLength));
    return result;
  }
}

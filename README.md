# base-65536-number

To work with base 2^n numbers.

## Usage

```js
const a = new Base2N('0', 2); // base 2
const b = new Base2N('3', 2);
let c = a.add(b);
console.log(a.toString());
console.log(b.toString());
console.log(c.toString()); 
c = c.subtract(b);
console.log(c.toString() == a.toString()); // true
```

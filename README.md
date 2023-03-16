# base-65536-number

To work with base 65536 numbers

## Usage

```js
const a = new Base65536Number('0');
const b = new Base65536Number('3');
let c = a.add(b);
console.log(a.toString()); // 0
console.log(b.toString()); // 3
console.log(c.toString()); // c
c = c.subtract(b);
console.log(c.toString() == a.toString()); // true
```

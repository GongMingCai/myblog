## 柯里化（Currying）
> currying is the technique of converting a function that takes multiple arguments into a sequence of functions that each takes a single argument.

柯里化是一种函数高阶技术，它将接收多个参数的函数转换成一系列接收单个参数的函数。  

读起来有点绕口，我们看个例子。  
```js
function sum(a, b) {
  return a + b;
}
```
对于这个求和函数，我们希望通过柯里化 - `curry` 将 `sum(a, b)` 调用转换成形如 `curriedSum(a)(b)` 的调用。  
```js
const curriedSum = curry(sum);
```
那么，我们该如何实现 `curry` 呢？  

可以明确的是， `curry` 是一个接收原始函数作为唯一参数的函数，并且其返回值也是函数（它接收第一个参数 `a`），而该函数的返回值依旧是函数（它接收第二个参数 `b`）。  

有了上述的分析，具体的代码实现就很容易了。  
```js
function curry(fn) {
  return function(a) {
    return function(b) {
      return fn(a, b);
    }
  }
}
```

这里的实现是为了解决一开始的求和函数柯里化问题，它只对固定的两个参数进行了处理。那么对于更一般的多参数函数柯里化我们又该如何实现呢？  

通过求和函数的柯里化实现，我们不难发现其中的规律：柯里化嵌套的返回一个函数，这些函数依次接收原始函数（被柯里化的函数）的一个参数，直到接收到的参数个数等于原始函数参数的总数，最后调用原始函数并返回。  

对于这种情况，显然需要通过递归来处理。  
```js
function curry(fn) {
  // curried 是一个辅助函数，用于保存已经接收的参数
  return function curried(...args) {
    if (args.length === fn.length) {
      // 递归结束
      return fn.apply(this, args);
    } else {
      // 嵌套的返回一个函数
      return function (arg) {
        return curried.apply(this, args.concat(arg));
      };
    }
  };
}
```

好了，我们来验证下。  
```js
function sum(a, b, c) {
  return a + b + c;
}
const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3));   // 6
```

这里的柯里化函数每次只能处理一个参数，然而在 [lodash](https://lodash.com/docs/4.17.15#curry) 这样的库中关于柯里化有更高级的实现 - 可以处理多个参数。  

```js
const curriedSum = _.curry(sum);
// 单个参数
curriedSum(1)(2)(3);   // 6
// 多个参数
curriedSum(1, 2)(3);   // 6
curriedSum(1, 2,3);    // 6
```

对于多参数的处理，我们稍作处理即可。  
```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      // args2 接收多个参数
      return function (...arg2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
```








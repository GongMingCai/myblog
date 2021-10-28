# 柯里化（Currying）
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

# call
`call` 为我们所熟知在于它可以改变函数执行时的上下文（context），也就是 `this` 的值。  

`call` 方法定义在 `Function.prototype` 上。语法上，`call()` 方法使用一个指定的 `this` 值和单独给出的一个或多个参数来调用一个函数。  
```js
Function.prototype.call(thisArg, ...args)
```
这里的 `thisArg` 和 `args` 都是可选参数。  

我们先看个例子。  
```js
function showProfileMessage(message) {
  console.log(message, this.name);
}
const obj = {
  name: "Mingcai Gong",
};
showProfileMessage.call(obj, "welcome"); // welcome Mingcai Gong
```

通过分析上面的示例，我们不难发现下面的事实。  
1.  调用 `call` 方法会执行 `showProfileMessage`
2.  调用 `call` 方法改变了 `this` 的指向，变为 `obj`  
3.  传递给 `showProfileMessage.call` 的任意数量参数（当然不包含 `obj`）都会被 `showProfileMessage` 以 `arg1, arg2, ...` 的形式接收
4.  调用 `call` 方法不会对原有的 `obj` 对象 和 `showProfileMessage` 函数产生任何副作用  

接下来，让我们开始实现吧。  

类似于 `call` 方法，我们将自己的 `myCall` 方法添加到 `Funciton` 对象的原型上。  
```js
Function.prototype.myCall = function() {}
```
对于事实1， 因为 `myCall` 是原型上的方法，它的 `this` 指向的就是 `showProfileMessage`。  
对于事实2， 我们可以将 `showProfileMessage` 作为 `obj` 对象的一个属性值（`obj.fn = showProfileMessage`）来调用 `obj.fn()`。  

基于此，我们可以初步实现 `myCall`。
```js
Function.prototype.myCall = function (context) {
  // context 就是 thisArg
  context.fn = this;
  context.fn();
};
```

接下来，让我们来处理事实3 -  `myCall` 任意数量参数的问题。  
首先想到的就是 ES6 的剩余参数。  
```js
Function.prototype.myCall = function (context, ...args) {
  // context 就是 thisArg
  context.fn = this;
  context.fn(...args);
};
```
这里的 `context` 就是 `thisArg`，是不是很简单。但考虑到浏览器兼容性的问题，我们需要其它的解决方案。  

我们先了解下 JavaScript 中的 `eval` 和 `arguments`。  
1.  `eval()` 函数会将传入的字符串当做代码进行执行。  
2.  函数内部存在一个 `arguments` 对象，它是一个对应于传递给函数的参数的类数组对象。  

有了 `eval` 和 `arguments` 就可以处理任意数量参数。  

```js
Function.prototype.myCall = function (context) {
  context.fn = this;
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push("arguments[" + i + "]");
  }
  eval("context.fn(" + args + ")");
};
```
这里的 `args` 将参数保存为字符串数组，`eval` 中的 `args` 会自动调用 `Array.toString()` 方法转换成 `arg1, arg2, ...` 的形式。  

我们注意到，`obj` 对象新增了一个 `fn` 属性，并且我们无法确定 `obj` 对象上本身是否已经存在 `fn` 属性。这些都违背了事实4。  

利用 ES6 的 `Symbol` 可以解决属性冲突的问题，同样考虑到浏览器兼容性，我们需要更一般的方法。对于新增的属性，在函数调用后 `delete` 即可。 

另外，`call` 方法是有返回值的。并且 `call` 方法可以不接收参数，此时的 `this` 指向的是全局对象，如果 `call` 方法接收的第一个参数为 `undefined` 或 `null`，`this` 也指向全局对象，不过有个前提 - 非严格模式，因此我们这里不予考虑，知道即可。  

看下修复之后的版本。  
```js
Function.prototype.myCall = function (context) {
  var uniqueID = "00" + Math.random();
  while (context.hasOwnProperty(uniqueID)) {
    uniqueID = "00" + Math.random();
  }
  context[uniqueID] = this;
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push("arguments[" + i + "]");
  }
  var result = eval("context[uniqueID](" + args + ")");
  delete context[uniqueID];
  return result;
};
```
最后让我们来验证下 `myCall` 方法。  
```js
function showProfileMessage(message) {
  console.log(message, this.name);
}
const obj = {
  name: "Mingcai Gong",
};
showProfileMessage.myCall(obj, "Bye Bye"); // Bye Bye Mingcai Gong
```
符合预期结果，ES6 版本的代码实现[在这里](./code/myCall.es6.js)。  


# apply
`apply()` 方法的作用和 `call()` 方法类似，区别就是 `call()` 方法接受的是参数列表，而 `apply()` 方法接受的是一个参数数组。  

`apply` 的实现与 `call` 类似。区别在于我们不再需要借助 `arguments` 来处理参数。  
```js
Function.prototype.myApply = function(context, argArr) {
  var uniqueID = "00" + Math.random();
  while (context.hasOwnProperty(uniqueID)) {
    uniqueID = "00" + Math.random();
  }
  context[uniqueID] = this;
  var args = [];
  for (var i = 0; i < argArr.length; i++) {
    args.push("argArr[" + i + "]");
  }
  var result = eval("context[uniqueID](" + args + ")");
  delete context[uniqueID];
  return result;
}
```
让我们来验证下吧。  
```js
function showProfileMessage(firstMsg, secMsg) {
  console.log(firstMsg, secMsg, this.name);
}
const obj = {
  name: "Mingcai Gong",
};
showProfileMessage.myApply(obj, ["Bye", "Bye"]); // Bye Bye Mingcai Gong
```
符合预期结果，ES6 版本的代码实现[在这里](./code/myApply.es6.js)。  

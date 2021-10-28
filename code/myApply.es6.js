Function.prototype.myApply = function (context, args) {
  const symbolKey = Symbol();
  context[symbolKey] = this;
  const result = context[symbolKey](...args);
  delete context[symbolKey];
  return result;
};
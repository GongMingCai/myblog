Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  return function (...args2) {
    fn.apply(context, args.concat(args2));
  };
};
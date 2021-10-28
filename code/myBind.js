Function.prototype.myBind = function (context) {
  const fn = this;
  const args = Array.prototype.slice.call(arguments, 1);
  return function () {
    const args2 = Array.prototype.slice.call(arguments);
    fn.apply(context, args.concat(args2));
  };
};
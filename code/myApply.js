Function.prototype.myApply = function (context, argArr) {
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
};
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
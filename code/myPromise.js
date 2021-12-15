function MyPromise(callbackFn) {
  this.value = undefined;
  this.state = "pending";
  this.queue = [];
  this.handlers = {
    fulfill: null,
    reject: null,
  };
  if (fn) {
    fn(
      function (value) {
        that.fulfill(value);
      },
      function (reason) {
        that.reject(reason);
      }
    );
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var queuedPromise = new MyPromise();
  if (onFulfilled && typeof onFulfilled === "function") {
    queuedPromise.handlers.fulfill = onFulfilled;
  }
  if (onRejected && typeof onRejected === "function") {
    queuedPromise.handlers.reject = onRejected;
  }
  this.queue.push(queuedPromise);

  return queuedPromise;
};

MyPromise.prototype.fulfill = function (value) {};

MyPromise.prototype.reject = function (reason) {};

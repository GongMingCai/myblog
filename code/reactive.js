let effectStack = []; //副作用栈

function effect(fn) {
  const _effect = () => {
    activeEffect = _effect;
    effectStack.push(effect);
    fn();
    effectStack.pop(effect);
  };

  _effect(); // 立即自动执行副作用

  return _effect;
}

// reactive 实现
const proxyMap = new WeakMap();
const targetMap = new WeakMap();

export function reactive(target) {
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    // 如果目标对象已经被代理直接返回
    return existingProxy
  }
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      track(target, key);
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (value !== oldValue) {
        trigger(target, key);
      }
      return res;
    },
  });
  proxyMap.set(target, proxy);
  return proxy;
}

// 追踪依赖
function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
}

// 通知更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }
  for (const effect of deps) {
    effect();
  }
}

// 验证reactive
let data = reactive({
  val1: 1,
  val2: 2,
});
let sum;
const sumUpdateEffect = effect(() => {
  sum = data.val1 + data.val2;
});
console.log(sum);

data.val1 = 3;
console.log(sum);
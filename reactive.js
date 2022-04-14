/***
 * WeakMap key: target, value: Map  键: 被代理的对象, 值: Map 对象
 * Map     key: key, value: Set     键: 被代理的对象的 key, 值: 副作用函数集合
 */

let activeEffect;
// 注册副作用函数并执行
function effect(fn) {
  activeEffect = fn;
  fn();
}

const buket = new WeakMap();

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key);
  },
});

function track(target, key) {
  if (activeEffect) {
    return;
  }
  let depsMap = buket.get(target);
  if (!depsMap) {
    buket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps.set(key, new Set());
  }
  deps.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = buket.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }
  deps.forEach((fn) => {
    fn();
  });
}

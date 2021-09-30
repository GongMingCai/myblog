let activeEffect; // 当前的副作用

class RefImpl {
  _value;
  dep;

  constructor(value) {
    this._value = value;
  }

  get value() {
    track(this);
    return this._value;
  }

  set value(newVal) {
    if (newVal !== this._value) {
      // 属性值发生变化时通知更新
      this._value = newVal;
      trigger(this);
    }
  }
}

function ref(value) {
  return new RefImpl(value);
}

// 追踪依赖
function track(ref) {
  if (!ref.dep) {
    ref.dep = new Set();
  }
  ref.dep.add(activeEffect);
}

// 通知更新
function trigger(ref) {
  if (ref.dep) {
    for (const effect of ref.dep) {
      effect();
    }
  }
}

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

// 验证响应性
let val1 = ref(1);
let val2 = ref(2);
let sum;

const sumUpdateEffect = effect(() => {
  sum = val1.value + val2.value;
});
console.log(sum); // 3

val1.value = 3;
console.log(sum); // 5
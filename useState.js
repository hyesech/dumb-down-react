/* Closure
 *  Closure is when a function is able to remember and access its lexical scope
 *  even when that function is executing outside its lexical scope.
 * */

function useState(initialValue) {
  let _val = initialValue;

  function setState(newValue) {
    _val = newValue;
  }
  return [_val, setState];
}

const [foo, setFoo] = useState(0);
console.log(foo);
setFoo(1);
console.log(foo);

const React = (function () {
  let _val, _deps;
  return {
    render(Component) {
      const Comp = Component();
      Comp.render();
      return Comp;
    },
    useEffect(cb, deps) {
      const hasNoDeps = !deps;
      const hasChangedDeps = _deps
        ? !deps.every((el, idx) => el === _deps[idx])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        cb();
        _deps = deps;
      }
    },
    useState(initialValue) {
      _val = _val || initialValue;
      function setState(newValue) {
        _val = newValue;
      }
      return [_val, setState];
    },
  };
})();

function Counter() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    console.log("useEffect", count);
  }, [count]);
  return {
    click: () => setCount(count + 1),
    noDiff: () => setCount(count),
    render: () => console.log("render", { count }),
  };
}

let App;
App = React.render(Counter);
App.click();
App = React.render(Counter);
App.noDiff();
App = React.render(Counter);
App.click();
App = React.render(Counter);

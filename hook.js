const React = (function () {
  let hooks = [],
    currentHook = 0;
  return {
    render(Component) {
      const Comp = Component();
      Comp.render();
      currentHook = 0;
      return Comp;
    },
    useEffect(cb, deps) {
      const hasNoDeps = !deps;
      const currentDeps = hooks[currentHook];
      const hasChangedDeps = currentDeps
        ? !deps.every((el, idx) => el === currentDeps[idx])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        cb();
        hooks[currentDeps] = deps;
      }
      currentHook++;
    },
    useState(initialValue) {
      hooks[currentHook] = hooks[currentHook] || initialValue;
      const setStateHookIdx = currentHook;
      const setState = (newState) => (hooks[setStateHookIdx] = newState);

      return [hooks[currentHook++], setState];
    },
  };
})();

function Counter() {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState("foo");
  React.useEffect(() => {
    console.log("useEffect", count, text);
  }, [count, text]);
  return {
    click: () => setCount(count + 1),
    type: (text) => setText(text),
    noDiff: () => setCount(count),
    render: () => console.log("render", { count, text }),
  };
}

let App;
App = React.render(Counter);
App.click();
App = React.render(Counter);
App.type("hell");
App = React.render(Counter);
App.noDiff();
App = React.render(Counter);
App.click();
App = React.render(Counter);

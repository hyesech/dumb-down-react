/*    e.g) Element
 *
 *    <div id="container">
 *      <input type="text" value="name" />
 *      <a href="/index">link to index</a>
 *      <span class="description">write your name in here.</span>
 *    </div>
 *
 * */

/* Create DOM  */
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // Set EventListener
  const isEvent = (key) => key.startsWith("on");
  Object.keys(fiber.props)
    .filter(isEvent)
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, fiber.props[key]);
    });

  // Set Attributes
  const isAttribute = (key) => key !== "children" && !isEvent(key);
  Object.keys(fiber.props)
    .filter(isAttribute)
    .forEach((key) => {
      dom[key] = fiber.props[key];
    });

  return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isOld = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // remove old, changed event
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(keu in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    });

  // remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isOld(prevProps, nextProps))
    .forEach((key) => (dom[key] = ""));

  // set new, changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = nextProps[key];
    });

  // add new event
  Object.keys(nextProps)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[key]);
    });
}

/* Commit nodes to DOM */
function commitFiber() {
  console.log("commitFiber");
  console.log("nextWork, progressRoot", nextWork, progressWork);

  deletions.forEach(commitWork);
  commitWork(progressWork.child);
  currentWork = progressWork;
  progressWork = null;
}
function commitWork(fiber) {
  console.log("commitWork", fiber);
  if (!fiber) return;
  const parentNode = fiber.parent.dom;
  if (fiber.tag === "PLACEMENT" && fiber.dom !== null) {
    parentNode.appendChild(fiber.dom);
  } else if (fiber.tag === "DELETION") {
    parentNode.removeChild(fiber.dom);
  } else if (fiber.tag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/* Generate Single Fiber */
function render(element, container) {
  console.log(element, currentWork);
  console.log("render");
  progressWork = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentWork,
  };
  deletions = [];
  nextWork = progressWork;
}

let nextWork = null;
let progressWork = null;
let currentWork = null;
let deletions = null;

/* Loop */
function workLoop(deadline) {
  console.log("workLoop");
  let shouldYield = false;
  while (nextWork && !shouldYield) {
    nextWork = doNextWork(nextWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  console.log("nextWork, progressRoot", nextWork, progressWork);
  if (!nextWork && progressWork) commitFiber();
  requestIdleCallback(workLoop);
}

/* Set Unit of Fiber, Perform Task */
function doNextWork(fiber) {
  console.log("doNextWork");
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

/* Reconcile */
function reconcileChildren(progressWork, elements) {
  let idx = 0;
  let oldFiber = progressWork.alternate && progressWork.alternate.child;

  while (idx < elements.length || oldFiber !== null) {
    const element = elements[idx];
    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: progressWork,
        alternate: oldFiber,
        tag: "UPDATE",
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: progressWork,
        alternate: null,
        tag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.tag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (idx === 0) {
      progressWork.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    idx++;
  }
}

/* Create Elements */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextElement(child) : child;
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/* Schedule */
requestIdleCallback(workLoop);

/* Generate Element Tree */
const element = createElement(
  "div",
  { id: "container" },
  createElement("input", { value: "name", type: "text" }),
  createElement("a", { href: "/index" }, "link to index"),
  createElement(
    "span",
    { className: "description", onClick: () => alert("YOU CLICK THIS") },
    "write your name in here."
  )
);

/* Append node to parentNode */
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.querySelector("#root");
  render(element, rootElement);
});

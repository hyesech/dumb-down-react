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

/* Generate Single Fiber */
function render(element, container) {
  // set next work: 다음 work를 fiber 트리의 root로 설정
  nextWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

let nextWork = null;

/* Loop */
function workLoop(deadline) {
  let shouldYield = false;
  while (nextWork && !shouldYield) {
    nextWork = doNextWork(nextWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

/* Set Unit of Fiber, Perform Task */
function doNextWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  const elements = fiber.props.children;
  let idx = 0;
  let prevSibling = null;

  while (idx < elements.length) {
    const element = elements[idx];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (idx === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    idx++;
  }

  // 다음 작업 단위를 찾는다.
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

/* Create Elements */
function createElement(type, props, ...children) {
  console.log("children", children);
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

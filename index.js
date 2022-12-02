/*    e.g) Element
 *
 *    <div id="container">
 *      <input type="text" value="name" />
 *      <a href="/index">link to index</a>
 *      <span class="description">write your name in here.</span>
 *    </div>
 *
 * */

/* render function */
function render(elem, parentNode) {
    const { type, props } = elem;
    const node =
        type === 'TEXT_NODE'
            ? document.createTextNode('')
            : document.createElement(type);

    // Set EventListener
    const isEvent = (key) => key.startsWith('on');
    Object.keys(props)
        .filter(isEvent)
        .forEach((key) => {
            const eventType = key.toLowerCase().substring(2);
            node.addEventListener(eventType, props[key]);
        });

    // Set Attributes
    const isAttribute = (key) => key !== 'children' && !isEvent(key);
    Object.keys(props)
        .filter(isAttribute)
        .forEach((key) => {
            node[key] = props[key];
        });

    // Render childrens
    props.children.forEach((child) => render(child, node));
    parentNode.appendChild(node);
}

function createElement(type, props, ...children) {
    console.log('childere', children);
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                return typeof child === 'string'
                    ? createTextElement(child)
                    : child;
            }),
        },
    };
}

function createTextElement(text) {
    return {
        type: 'TEXT_NODE',
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

const element = createElement(
    'div',
    { id: 'container' },
    createElement('input', { value: 'name', type: 'text' }),
    createElement('a', { href: '/index' }, 'link to index'),
    createElement(
        'span',
        { className: 'description', onClick: () => console.log('click') },
        'write your name in here.',
    ),
);

/* Append node to parentNode */
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.querySelector('#root');
    render(element, rootElement);
});

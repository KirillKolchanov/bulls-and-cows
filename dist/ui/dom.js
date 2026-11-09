const isRenderable = (child) => child !== null && child !== undefined && child !== false;
const setAttribute = (element, name, value) => {
    if (value === null || value === undefined || value === false) {
        return;
    }
    element.setAttribute(name, value === true ? '' : String(value));
};
export const el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);
    if (options.className !== undefined) {
        element.className = options.className;
    }
    if (options.text !== undefined) {
        element.textContent = options.text;
    }
    Object.entries(options.attrs ?? {}).forEach(([name, value]) => {
        setAttribute(element, name, value);
    });
    element.append(...children.filter(isRenderable));
    return element;
};
//# sourceMappingURL=dom.js.map
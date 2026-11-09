export type Child = Node | string | null | undefined | false;

type AttributeValue = string | number | boolean | null | undefined;

export interface ElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attrs?: Readonly<Record<string, AttributeValue>>;
}

const isRenderable = (child: Child): child is Node | string =>
  child !== null && child !== undefined && child !== false;

const setAttribute = (element: Element, name: string, value: AttributeValue): void => {
  if (value === null || value === undefined || value === false) {
    return;
  }
  element.setAttribute(name, value === true ? '' : String(value));
};

export const el = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options: ElementOptions = {},
  children: readonly Child[] = [],
): HTMLElementTagNameMap[Tag] => {
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

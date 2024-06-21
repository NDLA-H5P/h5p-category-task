import { escape, decode } from 'he';

/**
 * @param {{
 *   id?: number | null;
 *   added?: boolean;
 *   argumentText?: string | null;
 *   editMode?: boolean;
 *   prefix?: string
 * }} initValues
 * @returns {ArgumentDataObject}
 */
export function ArgumentDataObject({
  id,
  added,
  argumentText,
  editMode,
  prefix,
}) {
  this.id = id ?? null;
  this.added = added ?? false;
  this.argumentText = argumentText ?? null;
  this.editMode = editMode ?? false;
  this.prefix = prefix ?? 'argument';

  return this;
}

/**
 * @param {{
 *   id: number;
 *   title?: string | null;
 *   connectedArguments?: Array<number>;
 *   isArgumentDefaultList?: boolean;
 *   theme?: string;
 *   useNoArgumentsPlaceholder?: boolean;
 *   prefix?: string;
 *   actionTargetContainer?: boolean
 * }} initValues
 *
 * @returns {CategoryDataObject}
 */
export function CategoryDataObject({
  id,
  title,
  connectedArguments,
  isArgumentDefaultList,
  theme,
  useNoArgumentsPlaceholder,
  prefix,
  actionTargetContainer,
}) {
  this.id = id ?? null;
  this.title = title ?? null;
  this.connectedArguments = connectedArguments ?? [];
  this.isArgumentDefaultList = isArgumentDefaultList ?? false;
  this.theme = theme ?? 'h5p-category-task-category-default';
  this.useNoArgumentsPlaceholder = useNoArgumentsPlaceholder ?? false;
  this.prefix = prefix ?? 'category';
  this.actionTargetContainer = actionTargetContainer ?? false;

  return this;
}

/**
 *
 * @param {{
 *   id?: number;
 *   title?: string | null;
 *   activeCategory?: boolean;
 *   onSelect?: () => void;
 *   type?: string;
 *   label?: string}} initValues
 * @returns
 */
export function ActionMenuDataObject({
  id,
  title,
  activeCategory,
  onSelect,
  type,
  label,
}) {
  this.id = id ?? null;
  this.title = title ?? null;
  this.activeCategory = activeCategory ?? null;
  this.onSelect = onSelect ?? null;
  this.type = type ?? null;
  this.label = label ?? null;

  return this;
}

/**
 * @param {CategoryDataObject | ArgumentDataObject} element
 * @returns {string}
 */
export function getDnDId(element) {
  return [element.prefix, element.id].join('-');
}

/**
 * @param {() => void} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {() => void}
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * @param {string} html
 * @returns {string}
 */
export function decodeHTML(html) {
  return html ? decode(html) : html;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function escapeHTML(html) {
  return html ? escape(html) : html;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function stripHTML(html) {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText;
}

export function sanitizeParams(params) {
  const filterResourceList = (element) =>
    Object.keys(element).length !== 0 && element.constructor === Object;
  const handleObject = (sourceObject) => {
    if (sourceObject == null || !filterResourceList(sourceObject)) {
      return sourceObject;
    }

    return Object.keys(sourceObject).reduce((aggregated, current) => {
      aggregated[current] = decodeHTML(sourceObject[current]);
      return aggregated;
    }, {});
  };

  let {
    header,
    description,
    argumentsList,
    summary,
    summaryHeader,
    summaryInstruction,
    l10n,
    resourceReport,
    resources,
  } = params;

  if (Array.isArray(argumentsList)) {
    argumentsList = argumentsList.map((argument) => decodeHTML(argument));
  }

  if (resources?.params.resourceList?.filter(filterResourceList).length > 0) {
    resources.params = {
      ...resources.params,
      l10n: handleObject(resources.params.l10n),
      resourceList: resources.params.resourceList
        .filter(filterResourceList)
        .map((resource) => {
          const { title, introduction } = resource;
          return {
            ...resource,
            title: decodeHTML(title),
            introduction: decodeHTML(introduction),
          };
        }),
    };
  }

  return {
    ...params,
    argumentsList,
    resources,
    header: decodeHTML(header),
    description: decodeHTML(description),
    summary: decodeHTML(summary),
    summaryHeader: decodeHTML(summaryHeader),
    summaryInstruction: decodeHTML(summaryInstruction),
    l10n: handleObject(l10n),
    resourceReport: handleObject(resourceReport),
  };
}

/**
 * CSS classnames and breakpoints for the content type
 */
const CategoryTaskClassnames = {
  mediumTablet: 'h5p-medium-tablet-size',
  largeTablet: 'h5p-large-tablet-size',
  large: 'h5p-large-size',
};

/**
 * Get list of classname and conditions for when to add the classname to the content type
 *
 * @return {[
 *   {className: string, shouldAdd: ((ratio: number) => boolean)},
 *   {className: string, shouldAdd: ((ratio: number) => boolean)},
 *   {className: string, shouldAdd: ((ratio: number) => boolean)}
 * ]}
 */
export const breakpoints = () => {
  return [
    {
      className: CategoryTaskClassnames.mediumTablet,
      shouldAdd: (ratio) => ratio >= 22 && ratio < 40,
    },
    {
      className: CategoryTaskClassnames.largeTablet,
      shouldAdd: (ratio) => ratio >= 40 && ratio < 60,
    },
    {
      className: CategoryTaskClassnames.large,
      shouldAdd: (ratio) => ratio >= 60,
    },
  ];
};

/**
 * Get the ratio of the container
 *
 * @param {HTMLElement} container
 *
 * @return {number | undefined}
 */
export function getRatio(container) {
  if (!container) {
    return;
  }
  const computedStyles = window.getComputedStyle(container);
  return (
    container.offsetWidth /
    parseFloat(computedStyles.getPropertyValue('font-size'))
  );
}

/**
 * @template T
 * @param {T} object
 * @returns {T}
 */
export function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Check if a number is even
 * 
 * @param {number} number
 * @returns {boolean}
 */
export function isEven(number) {
  return number % 2 === 0;
}

import React from 'react';
import classnames from 'classnames';
import { CSS } from '@dnd-kit/utilities';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';

/**
 * @param {{
 *   draggableId: string;
 *   ariaLabel: string;
 *   renderChildren: (
 *     isDragging: boolean,
 *   ) => JSX.Element | Array<JSX.Element | null> | null
 * }} props
 * @returns
 */
function Element({ draggableId, ariaLabel, renderChildren }) {
  /** @type {import('@dnd-kit/sortable').AnimateLayoutChanges} */
  const animateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true });

  const { setNodeRef, transform, transition, attributes, listeners, isDragging } =
    useSortable({
      id: draggableId,
      data: { draggableId },
      animateLayoutChanges,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    cursor: 'grab'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classnames('h5p-dnd-draggable', {
        'h5p-dnd-draggable--dragging': isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      <div
        className={'h5p-category-task-draggable-container'}
        aria-label={ariaLabel}
      >
        <ElementLayout 
          ariaLabel={ariaLabel} 
          isDragging={isDragging}
        >
          {renderChildren(isDragging)}
        </ElementLayout>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   children: JSX.Element | Array<JSX.Element | null> | null;
 *   isDragging: boolean;
 *   ariaLabel: string;
 * }} props
 *
 * @returns {JSX.Element}
 */
function ElementLayout({ children, isDragging, ariaLabel }) {
  return (
    <div
      className={classnames('h5p-category-task-draggable-element', {
        'h5p-category-task-active-draggable': isDragging,
        'h5p-category-task-draggable-element--dragging': isDragging,
      })}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export { Element as default, ElementLayout };

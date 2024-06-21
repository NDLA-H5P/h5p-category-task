import classnames from 'classnames';
import { useDroppable } from '@dnd-kit/core';
import React from 'react';

/**
 * @typedef {{
 *   id: string;
 *   children: React.ReactElement
 *   isDropDisabled: boolean;
 * }} Props
 */

/**
 * @param {Props} props
 *
 * @return {React.ReactElement}
 */
export default function Droppable({ id, children, isDropDisabled }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { droppableId: id },
    disabled: isDropDisabled,
  });

  return (
    <div
      className={classnames('h5p-category-task-droppable', {
        'h5p-category-task-droppable--active': isOver,
      })}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

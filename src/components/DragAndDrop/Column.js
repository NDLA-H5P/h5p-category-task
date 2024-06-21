import { SortableContext } from '@dnd-kit/sortable';
import React from 'react';
import Droppable from './Droppable';

/**
 *
 * @param {{
 *   droppableId: string;
 *   disableDrop: boolean;
 *   connectedArguments: Array<number>
 *   children: JSX.Element | Array<JSX.Element | null> | null;
 *   additionalClassName?: string;
 * }} props
 * @returns
 */
function Column({
  droppableId,
  children,
  additionalClassName,
  disableDrop,
  connectedArguments,
}) {
  return (
    <div className={additionalClassName}>
      <SortableContext
        items={connectedArguments.map((argumentId) => `argument-${argumentId}`)}
      >
        <Droppable isDropDisabled={disableDrop} id={droppableId}>
          <div className={'h5p-category-task-column'}>{children}</div>
        </Droppable>
      </SortableContext>
    </div>
  );
}

export default Column;

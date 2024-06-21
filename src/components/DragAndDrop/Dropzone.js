import React from 'react';
import Droppable from './Droppable';

/**
 *
 * @param {{
 *   droppablePrefix: 'droppable';
 *   label: string;
 *   disableDrop: boolean;
 * }} props
 * @returns
 */
function Dropzone({ droppablePrefix, label, disableDrop }) {
  return (
    <Droppable id={`${droppablePrefix}-dzone`} isDropDisabled={disableDrop}>
      <div className={'h5p-category-task-dropzone'}>
        <div>{label}</div>
      </div>
    </Droppable>
  );
}

export default Dropzone;

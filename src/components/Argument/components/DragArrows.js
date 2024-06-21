import React from 'react';
import { useCategoryTask } from '../../../context/CategoryTaskContext';

function DragArrows() {

  const context = useCategoryTask();

  return (
    <div
      className={'h5p-category-task-drag-element'}
    >
      <span className="h5p-ri hri-move" aria-hidden={'true'} />
      <span className={'visible-hidden'}>{context.translations.drag}</span>
    </div>
  );
}

export default DragArrows;

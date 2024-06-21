import React from 'react';
import PropTypes from 'prop-types';
import {useCategoryTask} from 'context/CategoryTaskContext';

/**
 * @return {null}
 */
function DeleteStatement(props) {

  const context = useCategoryTask();

  const {
    behaviour: {
      allowAddingOfStatements = true,
    },
    translate
  } = context;

  const {
    onClick
  } = props;

  if ( allowAddingOfStatements !== true) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      type={'button'}
      onKeyUp={(event) => {
        if (event.keyCode && event.keyCode === 8) {
          onClick();
        }
      }}
      className={'h5p-category-task-delete-button'}
    >
      <span
        className={'h5p-ri hri-times'}
      />
      <span className="visible-hidden">{translate('close')}</span>
    </button>
  );
}

DeleteStatement.propTypes = {
  onClick: PropTypes.func,
};

export default DeleteStatement;

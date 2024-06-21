import React from 'react';
import PropTypes from 'prop-types';
import {useCategoryTask} from 'context/CategoryTaskContext';

function AddArgument(props) {

  const context = useCategoryTask();
  const {
    onClick,
  } = props;

  return (
    <button
      aria-label={context.translate('addArgument')}
      className={'h5p-category-task-add-button'}
      onClick={onClick}
      type={'button'}
    >
      <div className={'h5p-category-task-add-button-content'}>
        <span className={'h5p-category-task-add-button-icon fa fa-plus'} aria-hidden={true} />
        <span className={'h5p-category-task-add-button-text'}>{context.translate('addArgument')}</span>
      </div>
    </button>
  );
}

AddArgument.propTypes = {
  displayFull: PropTypes.bool,
  onClick: PropTypes.func,
};

export default AddArgument;

import React from 'react';
import PropTypes from 'prop-types';

function UnEditableArgument({argument}) {
  return (
    <p className={'h5p-category-task-element'}>
      {argument}
    </p>
  );
}

UnEditableArgument.propTypes = {
  argument: PropTypes.string,
};

export default UnEditableArgument;
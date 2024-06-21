import React from 'react';
import PropTypes from 'prop-types';
import AddArgument from './components/AddArgument';

function Category(props) {
  const {
    additionalClassName,
    categoryId,
    addArgument,
    title,
    includeHeader,
    onAddArgument,
    children,
  } = props;

  additionalClassName.unshift('h5p-category-task-category');

  return (
    <div className={additionalClassName.join(' ')}>
      {includeHeader && (
        <div className={'h5p-category-task-category-header'}>
          {title}
        </div>
      )}
      <div className={'h5p-category-task-category-content'} id={categoryId}>
        {children}
        {addArgument && <AddArgument onClick={onAddArgument} />}
      </div>
    </div>
  );
}

Category.propTypes = {
  additionalClassName: PropTypes.array,
  categoryId: PropTypes.string.isRequired,
  title: PropTypes.string,
  addArgument: PropTypes.bool,
  includeHeader: PropTypes.bool,
  onAddArgument: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
};

Category.defaultProps = {
  columnClassName: [],
  additionalClassName: [],
  title: '',
  addArgument: true,
  includeHeader: true,
};

export default Category;

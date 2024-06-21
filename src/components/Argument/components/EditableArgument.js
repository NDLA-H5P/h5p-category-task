import React, {useState, useRef, useEffect} from 'react';
import PropsTypes from 'prop-types';
import classnames from 'classnames';
import {debounce} from '../../utils';
import { useCategoryTask } from '../../../context/CategoryTaskContext';

function EditableArgument({
  argument,
  inEditMode,
  onChange,
  startEditing,
  stopEditing,
  idBase,
}) {
  const { translate } = useCategoryTask();

  const [buttonFocus, setButtonFocus] = useState(false);

  const inputRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    if (inEditMode === true) {
      inputRef.current.value = argument;
      inputRef.current.focus();
    }
    else {
      if (buttonFocus) {
        buttonRef.current.focus();
        setButtonFocus(false);
      }
    }
  }, [inEditMode]);

  /**
   * Handle keydown events.
   * KeyDown is used instead of KeyUp to prevent focused input to be blurred
   * when arguments are added with the enter key.
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (inEditMode) {
        stopEditing();
        setButtonFocus(true);
        event.preventDefault();
      }
    }
  };

  const id = 'es_' + idBase;
  const inputId = 'input_' + id;

  /*
   * TODO: Clean this up. This feels like a very weird construct. Why can't
   *       the `input` element be used on its own? Why the textbox wrapper that
   *       adds an extra level while there already is an input field? Also, why
   *       is ARIA labelling handled that way?
   */
  return (
    <div className={'h5p-category-task-editable-container'}>
      <button
        ref={buttonRef}
        className={classnames('h5p-category-task-editable-button', {
          'hidden': inEditMode === true,
        })}
        onClick={startEditing}
      >
        <span className={'visible-hidden'}>{`${translate('editArgument')} ${argument}`}</span>
      </button>
      <label
        title={argument}
        htmlFor={inputId}
        className={classnames('h5p-category-task-editable', {
          'hidden': inEditMode === false,
        })}
      >
        <span className={'visible-hidden'}>{translate('argument')}</span>
        <input
          className={'h5p-category-task-editable'}
          ref={inputRef}
          onBlur={stopEditing}
          onChange={debounce(() => onChange(inputRef.current.value), 200)}
          onKeyDown={handleKeyDown}
          id={inputId}
        />
      </label>
      <p
        className={classnames('h5p-category-task-noneditable', {
          'hidden': inEditMode === true,
        })}
      >
        {argument}
      </p>
    </div>
  );
}

EditableArgument.propTypes = {
  argument: PropsTypes.string,
  inEditMode: PropsTypes.bool,
  onChange: PropsTypes.func,
  startEditing: PropsTypes.func,
  stopEditing: PropsTypes.func,
  idBase: PropsTypes.oneOfType([
    PropsTypes.string,
    PropsTypes.number,
  ]),
};

EditableArgument.defaultProps = {
  inEditMode: false,
};

export default EditableArgument;

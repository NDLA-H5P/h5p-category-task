import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import EditableArgument from './components/EditableArgument';
import UnEditableArgument from './components/UnEditableArgument';
import ActionMenu from './components/ActionMenu';
import classnames from 'classnames';
import DragArrows from './components/DragArrows';
import { getDnDId } from '../utils';

function Argument({
  argument,
  onArgumentChange,
  startEditing,
  stopEditing,
  enableEditing = false,
  isDragging = false,
  isDragEnabled = true,
  actions,
}) {
  const innerRef = useRef(null);
  const [refReady, setRef] = useState(false);

  const [showPopover, togglePopover] = useState(false);

  const actionMenuId = `action-menu-${argument.id}_${H5P.createUUID()}`;

  function toggle() {
    togglePopover((prevState) => !prevState);
  }

  function closePopover() {
    togglePopover(false);
  }

  useEffect(() => {
    setRef(true);
  }, [innerRef]);

  let displayStatement;
  if (enableEditing && !isDragging) {
    displayStatement = (
      <EditableArgument
        argument={argument.argumentText}
        inEditMode={argument.editMode}
        onChange={onArgumentChange}
        startEditing={startEditing}
        stopEditing={stopEditing}
        idBase={argument.id}
      />
    );
  }
  else {
    displayStatement = <UnEditableArgument argument={argument.argumentText} />;
  }

  let argumentLayout = (
    <ArgumentLayout
      activeDraggable={isDragEnabled && isDragging}
      isDragEnabled={isDragEnabled}
      statementDisplay={displayStatement}
      showPopover={showPopover}
      menuId={actionMenuId}
      toggle={toggle}
    />
  );

  if (Array.isArray(actions) && actions.length > 0 && refReady) {
    argumentLayout = (
      <ActionMenu
        menuId={actionMenuId}
        actions={actions}
        show={showPopover}
        handleClose={closePopover}
        parentElement={innerRef.current}
      >
        {argumentLayout}
      </ActionMenu>
    );
  }

  return (
    <div id={getDnDId(argument)} ref={innerRef}>
      {argumentLayout}
    </div>
  );
}

Argument.propTypes = {
  argument: PropTypes.object,
  onArgumentChange: PropTypes.func,
  startEditing: PropTypes.func,
  stopEditing: PropTypes.func,
  enableEditing: PropTypes.bool,
  onArgumentDelete: PropTypes.func,
  isDragging: PropTypes.bool.isRequired,
  isDragEnabled: PropTypes.bool,
  actions: PropTypes.array,
};

function ArgumentLayout({
  activeDraggable,
  isDragEnabled,
  statementDisplay,
  showPopover,
  menuId,
  toggle,
}) {
  return (
    <div className={'h5p-category-task-argument-container'}>
      <div
        className={classnames('h5p-category-task-argument', {
          'h5p-category-task-active-draggable': activeDraggable,
        })}
      >
        <div className={'h5p-category-task-argument-provided'}>
          {isDragEnabled && (
            <DragArrows/>
          )}
          {statementDisplay}
          <button
            className={'h5p-category-task-argument-actions'}
            aria-label={'See available actions'}
            aria-expanded={showPopover}
            aria-controls={showPopover ? menuId : undefined}
            onClick={toggle}
            type={'button'}
          >
            <span className={'fa fa-caret-down'} />
          </button>
        </div>
      </div>
    </div>
  );
}

ArgumentLayout.propTypes = {
  activeDraggable: PropTypes.bool,
  isDragEnabled: PropTypes.bool,
  statementDisplay: PropTypes.object,
  toggle: PropTypes.func,
  closePopover: PropTypes.func,
};

ArgumentLayout.defaultProps = {
  toggle: () => {},
  isDragEnabled: true,
  activeDraggable: false,
};

export { Argument as default, ArgumentLayout };

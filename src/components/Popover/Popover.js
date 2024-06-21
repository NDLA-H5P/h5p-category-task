import React from 'react';
import { ArrowContainer, Popover as TinyPopover } from 'react-tiny-popover';
import PropTypes from 'prop-types';

const Popover = ({
  handleClose,
  show,
  children,
  popoverContent,
  classnames = [],
  header,
  close,
  align = 'end',
  openerRect,
}) => {
  classnames.push('h5p-category-task-popover');

  return (
    <TinyPopover
      containerClassName={classnames.join(' ')}
      isOpen={show}
      positions={['top', 'bottom']}
      padding={10}
      containerStyle={{
        overflow: 'unset',
      }}
      align={align}
      onClickOutside={handleClose}
      content={({ position, popoverRect }) => (
        <ArrowContainer
          position={position}
          popoverRect={popoverRect}
          arrowColor={'white'}
          arrowSize={10}
          childRect={openerRect}
        >
          <div
            className={'h5p-category-task-popover-container'}
          >
            <div className={'h5p-category-task-popover-header'}>
              <div>
                {header}
              </div>
              <button
                onClick={handleClose}
                aria-label={close}
                type={'button'}
                className={'close-button'}
              >
                <span
                  className={'h5p-ri hri-close'}
                />
              </button>
            </div>
            <div
              className={'h5p-category-task-popover-content'}
            >
              {popoverContent}
            </div>
          </div>
        </ArrowContainer>
      )}
    >
      {children}
    </TinyPopover>
  );
};

Popover.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  popoverContent: PropTypes.object,
  classnames: PropTypes.array,
  header: PropTypes.string,
  close: PropTypes.string,
  openerRect: PropTypes.object,
};

export default Popover;

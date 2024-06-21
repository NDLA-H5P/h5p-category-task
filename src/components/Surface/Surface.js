import {
  DndContext,
  DragOverlay,
  useSensor,
  PointerSensor,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useCategoryTask } from '../../context/CategoryTaskContext';
import Argument from '../Argument/Argument';
import Category from '../Categories/Category';
import Column from '../DragAndDrop/Column';
import Element from '../DragAndDrop/Element';
import Summary from '../Summary/Summary';
import Dropzone from '../DragAndDrop/Dropzone';
import classnames from 'classnames';
import {
  ActionMenuDataObject,
  ArgumentDataObject,
  CategoryDataObject,
  clone,
  getDnDId,
  isEven,
} from '../utils';

/**
 * @typedef {{
 *   argumentsList: Array<ArgumentDataObject>;
 *   categories: Array<CategoryDataObject>;
 *   hasRemainingUnprocessedArguments: boolean;
 *   actionDropActive: boolean;
 *   idCounter: number;
 * }} State
 */

/**
 * @typedef {{
 *     type: 'move';
 *     payload: { argumentId: number; from: CategoryDataObject; to: CategoryDataObject; }
 *   }
 *   | {
 *     type: 'editArgument';
 *     payload: { id: number; argumentText: string; }
 *   }
 *   | {
 *     type: 'deleteArgument';
 *     payload: { id: number; }
 *   }
 *   | {
 *     type: 'addArgument';
 *     payload: { id: number; }
 *   }
 *   | {
 *     type: 'swap';
 *     payload: { categoryId: number; argument1Id: number; argument2Id: number; }
 *   }
 *   | {
 *     type: 'reset';
 *   }
 *   | {
 *     type: 'setTargetContainer';
 *     payload: { container: string; }
 *   }} Action
 */

function Surface() {
  const context = useCategoryTask();
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 125,
    },
  });

  /**
   * @returns {State}
   */
  function init() {
    /**
     * @type {{
     *   params: {
     *     argumentsList: Array<string>;
     *     categoriesList: Array<string>;
     *   };
     *   behaviour: {
     *     randomizeArguments: boolean;
     *   };
     * }}
     */
    const {
      params: { argumentsList: argumentDataList = [], categoriesList = [] },
      behaviour: { randomizeArguments = true },
    } = context;

    if (randomizeArguments === true) {
      argumentDataList.sort(() => 0.5 - Math.random());
    }

    const argumentsList = argumentDataList.map(
      (argument, index) =>
        new ArgumentDataObject({
          id: index,
          argumentText: argument,
        }),
    );

    /** @type {Array<CategoryDataObject>} */
    const categories = [];
    if (argumentsList.length > 0) {
      categories.push(
        new CategoryDataObject({
          id: 100000_1,
          isArgumentDefaultList: true,
          connectedArguments: argumentsList
            .filter((argument) => (argument.id ?? 0) % 2 === 0)
            .map((argument) => argument.id ?? -1),
        }),
      );
      categories.push(
        new CategoryDataObject({
          id: 100000_2,
          isArgumentDefaultList: true,
          connectedArguments: argumentsList
            .filter((argument) => (argument.id ?? 0) % 2 === 1)
            .map((argument) => argument.id ?? -1),
        }),
      );
    }
    categoriesList.forEach((category, index) =>
      categories.push(
        new CategoryDataObject({
          id: index,
          theme: 'h5p-category-task-category-container',
          useNoArgumentsPlaceholder: true,
          title: category,
        }),
      ),
    );

    return {
      categories,
      argumentsList,
      idCounter: argumentsList.length - 1,
      hasRemainingUnprocessedArguments: argumentsList.length > 0,
      actionDropActive: false,
    };
  }

  /**
   * @param {State} state
   * @param {Action} action
   *
   * @returns {State}
   */
  function stateHeadQuarter(state, action) {
    switch (action.type) {
      case 'move': {
        const { argumentId, from, to } = action.payload;

        const newCategories = clone(state.categories);
        const categoryIndex = newCategories.findIndex(
          ({ id }) => id === from?.id,
        );

        const category = newCategories[categoryIndex];
        const movedArgument = category.connectedArguments.includes(argumentId);
        category.connectedArguments = category.connectedArguments.filter(
          (id) => id !== argumentId,
        );

        newCategories.map((category) => {
          category.actionTargetContainer = false;

          if (movedArgument && category.id === to.id) {
            const index = category.connectedArguments.indexOf(argumentId);

            category.connectedArguments.splice(index, 0, argumentId);
          }
        });

        return {
          ...state,
          categories: newCategories,
          hasRemainingUnprocessedArguments:
            newCategories.filter(
              (category) =>
                category.isArgumentDefaultList &&
                category.connectedArguments.length > 0,
            ).length > 0,
          actionDropActive: false,
        };
      }
      case 'setEditMode': {
        const {
          id,
          editMode,
        } = action.payload;
        const newArguments = state.argumentsList.map((argument) => {
          if (argument.id === id) {
            return {
              ...argument,
              editMode: editMode,
            };
          }
          return argument;
        });

        return {
          ...state,
          argumentsList: newArguments
        };
      }
      case 'editArgument': {
        const { id, argumentText } = action.payload;

        const newArguments = clone(state.argumentsList);
        const argumentIndex = newArguments.findIndex(
          (argument) => argument.id === id,
        );

        if (argumentIndex !== -1) {
          const argument = newArguments[argumentIndex];
          argument.argumentText = argumentText;
        }

        return {
          ...state,
          argumentsList: newArguments,
        };
      }
      case 'deleteArgument': {
        const { id } = action.payload;

        const categories = clone(state.categories).map((category) => {
          category.connectedArguments = category.connectedArguments.filter(
            (connectedArgument) => connectedArgument !== id,
          );

          return category;
        });

        const argumentsList = state.argumentsList.filter(
          (argument) => argument.id !== id,
        );

        return {
          ...state,
          categories,
          argumentsList,
        };
      }
      case 'addArgument': {
        const { id } = action.payload;

        const argumentsList = Array.from(state.argumentsList);
        const argumentId = state.idCounter + 1;
        argumentsList.push(
          new ArgumentDataObject({
            id: argumentId,
            added: true,
            editMode: true,
          }),
        );

        const categories = clone(state.categories);
        const targetIndex = categories.findIndex(
          (category) => category.id === id,
        );

        if (targetIndex === -1) {
          return {
            ...state,
          };
        }

        categories[targetIndex].connectedArguments.push(argumentId);

        return {
          ...state,
          argumentsList,
          categories,
          idCounter: argumentId,
        };
      }
      case 'reset': {
        return init();
      }
      case 'swap': {
        const { argument1Id, argument2Id, categoryId } = action.payload;

        return {
          ...state,
          categories: state.categories.map((category) => {
            const isUpdatedCategory = category.id === categoryId;
            if (isUpdatedCategory) {
              const index1 = category.connectedArguments.findIndex(
                (argumentId) => argumentId === argument1Id,
              );
              const index2 = category.connectedArguments.findIndex(
                (argumentId) => argumentId === argument2Id,
              );

              const connectedArguments = arrayMove(
                category.connectedArguments,
                index1,
                index2,
              ).filter((id) => id != null);

              return {
                ...category,
                connectedArguments,
              };
            }

            return category;
          }),
        };
      }
      case 'setTargetContainer': {
        const newCategories = clone(state.categories);
        return {
          ...state,
          categories: newCategories.map((category) => {
            category.actionTargetContainer =
              getDnDId(category) === action.payload.container;
            return category;
          }),
          actionDropActive: true,
        };
      }
      default:
        return state;
    }
  }

  const memoizedReducer = useCallback(stateHeadQuarter, []);
  const [state, dispatch] = useReducer(memoizedReducer, init());

  const elements = {};
  const [active, setActive] = useState(null);
  const handleDragStart = ({ active }) => {
    setActive(active);
  };

  useEffect(() => {
    context.trigger('resize');
  }, [state.argumentsList, state.categories]);

  const {
    collectExportValues,
    registerReset,
    translate,
    behaviour: { allowAddingOfArguments = true, provideSummary = true },
  } = context;

  registerReset(() => dispatch({ type: 'reset' }));
  collectExportValues('userInput', () =>
    clone({
      categories: state.categories,
      argumentsList: state.argumentsList,
    }),
  );

  /**
   * @param {import('@dnd-kit/core').DragEndEvent} dragResult
   */
  function handleDragEnd(dragResult) {
    const { active, over } = dragResult;

    const [, activeArgumentIdStr] = active.id.toString().split('-') ?? [];
    const [itemType, collidedItemIdStr] = over?.id.toString().split('-') ?? [];

    if (activeArgumentIdStr == null || collidedItemIdStr == null) {
      return;
    }

    const didSort = itemType === 'argument';
    if (didSort) {
      const argument1Id = parseInt(activeArgumentIdStr, 10);
      const argument2Id = parseInt(collidedItemIdStr, 10);
      const parentCategory1 = state.categories.find((category) =>
        category.connectedArguments.includes(argument1Id),
      );

      const parentCategory2 = state.categories.find((category) =>
        category.connectedArguments.includes(argument2Id),
      );

      if (!parentCategory1) {
        // Could not find argument1's parent category. Something has probably gone horribly wrong.
        return;
      }

      if (parentCategory2 && parentCategory1 !== parentCategory2) {
        // The user tried to swap arguments between two categories. We don't allow that.
        // Instead, we'll act like they wanted to move the argument
        // to the category of the argument the argument they dragged (1) collided with (2).

        dispatch({
          type: 'move',
          payload: {
            argumentId: argument1Id,
            from: parentCategory1,
            to: parentCategory2,
          },
        });

        return;
      }

      if (argument1Id === argument2Id) {
        // The user somehow tried to swap the argument with itself.
        return;
      }

      dispatch({
        type: 'swap',
        payload: {
          categoryId: parentCategory1.id,
          argument1Id,
          argument2Id,
        },
      });
    }
    else {
      const argumentId = parseInt(activeArgumentIdStr, 10);
      const categoryId = collidedItemIdStr && parseInt(collidedItemIdStr, 10);

      const from = state.categories.find(({ connectedArguments }) =>
        connectedArguments.includes(argumentId),
      );

      const to = state.categories.find(
        (category) => category.id === categoryId,
      );

      if (argumentId == null || from == null || to == null) {
        return;
      }

      dispatch({
        type: 'move',
        payload: {
          argumentId,
          from,
          to,
        },
      });
    }
  }

  /**
   * @param {number} argumentId
   * @param {CategoryDataObject} newCategory
   */
  const startMoving = function start(argumentId, newCategory) {
    const previousCategory = state.categories.find((category) =>
      category.connectedArguments.includes(argumentId),
    );

    if (!previousCategory) {
      return;
    }

    dispatch({
      type: 'move',
      payload: {
        argumentId,
        from: previousCategory,
        to: newCategory,
      },
    });
  };

  /**
   * @param {ArgumentDataObject} argument
   * @returns {Array<ActionMenuDataObject>}
   */
  function getDynamicActions(argument) {
    const dynamicActions = state.categories
      .filter((category) => !category.isArgumentDefaultList)
      .map(
        (category) =>
          new ActionMenuDataObject({
            id: category.id,
            title: category.title,
            type: 'category',
            activeCategory:
              category.connectedArguments.findIndex(
                (argumentId) => argumentId === argument.id,
              ) !== -1,
            onSelect: () => startMoving(argument.id ?? -1, category),
          }),
      );

    if (allowAddingOfArguments === true) {
      dynamicActions.push(
        new ActionMenuDataObject({
          type: 'edit',
          title: translate('editArgument'),
          onSelect: () => {
            if (argument.id == null) {
              return;
            }

            return dispatch({
              type: 'setEditMode',
              payload: { id: argument.id, editMode: true },
            });
          },
        }),
      );
      dynamicActions.push(
        new ActionMenuDataObject({
          type: 'delete',
          title: translate('deleteArgument'),
          onSelect: () => {
            if (argument.id == null) {
              return;
            }

            return dispatch({
              type: 'deleteArgument',
              payload: { id: argument.id },
            });
          },
        }),
      );
    }
    return dynamicActions;
  }

  /**
   * @param {ArgumentDataObject} argument 
   * @param {string} id 
   * @returns {JSX.Element}
   */
  function getElementAndArgument(argument, id) {
    if (!argument) {
      return <></>;
    }

    return (
      <Element
        key={id}
        draggableId={id}
        ariaLabel={translate('draggableItem', {
          argument: argument.argumentText,
        })}
        renderChildren={(isDragging) => (
          <Argument
            actions={getDynamicActions(argument)}
            isDragEnabled={!isMobile}
            argument={argument}
            enableEditing={allowAddingOfArguments}
            isDragging={isDragging}
            onArgumentChange={(argumentText) => {
              if (argument.id === null) {
                return;
              }

              return dispatch({
                type: 'editArgument',
                payload: { id: argument.id, argumentText },
              });
            }}
            startEditing={() => {
              if (argument.id === null) {
                return;
              }
              return dispatch({
                type: 'setEditMode',
                payload: { id: argument.id, editMode: true },
              });
            }}
            stopEditing={() => {
              if (argument.id === null) {
                return;
              }
              return dispatch({
                type: 'setEditMode',
                payload: { id: argument.id, editMode: false },
              });
            }}
          />
        )}
      ></Element>
    );
  }

  return (
    <div className="h5p-category-task-surface">
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={[pointerSensor]}
      >
        <Category
          categoryId={'unprocessed'}
          addArgument={false}
          includeHeader={false}
          additionalClassName={[
            'h5p-category-task-unprocessed',
            !state.hasRemainingUnprocessedArguments ? 'hidden' : '',
          ]}
        >
          {state.categories
            .filter((category) => category.isArgumentDefaultList)
            .map((category, index) => (
              <div key={category.id}>
                <Column
                  additionalClassName={classnames(
                    'h5p-category-task-unprocessed-argument-list', {
                    'h5p-category-task-right-aligned': isEven(index + 1),
                  })}
                  droppableId={getDnDId(category)}
                  disableDrop={true}
                  connectedArguments={category.connectedArguments}
                >
                  <>
                    {category.connectedArguments
                      .map(
                        (argument) =>
                          state.argumentsList[
                            state.argumentsList.findIndex(
                              (element) => element.id === argument,
                            )
                          ],
                      )
                      .map((argument) => {
                        const id = getDnDId(argument);
                        const element = getElementAndArgument(argument, id);
                        elements[id] = element;
                        return element;
                      })}
                  </>
                </Column>
              </div>
            ))}
        </Category>
        {state.categories
          .filter((category) => !category.isArgumentDefaultList)
          .map((category, index) => (
            <Category
              key={category.id}
              categoryId={getDnDId(category)}
              includeHeader={category.title !== null}
              title={category.title}
              additionalClassName={[category.theme]}
              addArgument={allowAddingOfArguments}
              onAddArgument={() =>
                dispatch({
                  type: 'addArgument',
                  payload: {
                    id: category.id,
                  },
                })
              }
            >
              <Column
                additionalClassName={classnames('h5p-category-task-argument-list', {
                  'h5p-category-task-right-aligned': isEven(index + 1),
                })}
                droppableId={getDnDId(category)}
                disableDrop={
                  state.actionDropActive && !category.actionTargetContainer
                }
                connectedArguments={category.connectedArguments}
              >
                {category.connectedArguments.length === 0 && (
                  <Dropzone
                    droppablePrefix={getDnDId(category)}
                    label={translate('dropArgumentsHere')}
                    disableDrop={state.actionDropActive || (state.actionDropActive && !category.actionTargetContainer)}
                  />
                )}
                <>
                  {category.connectedArguments
                    .map(
                      (argument) =>
                        state.argumentsList[
                          state.argumentsList.findIndex(
                            (element) => element.id === argument,
                          )
                        ],
                    )
                    .map((argument) => {
                      const id = getDnDId(argument);
                      const element = getElementAndArgument(argument, id);
                      elements[id] = element;
                      return element;
                    })}
                </>
              </Column>
            </Category>
          ))}
        <DragOverlay>
          {active ? (
            <Element
              key={active.id}
              draggableId={active.id}
              renderChildren={() => {
                return elements[active.id];
              }}
              dragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      {provideSummary === true && <Summary />}
    </div>
  );
}

export default Surface;

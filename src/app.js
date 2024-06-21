import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from 'components/Main';
import {CategoryTaskProvider} from 'context/CategoryTaskContext';
import {breakpoints, getRatio, sanitizeParams} from './components/utils';

// Load library
H5P.CategoryTask = (function () {

  function Wrapper(params, contentId, extras = {}) {
    // Initialize event inheritance
    H5P.EventDispatcher.call(this);

    const {
      language = 'en'
    } = extras;

    let container;
    this.params = sanitizeParams(params);
    this.behaviour = this.params.behaviour || {};
    this.resetStack = [];
    this.collectExportValuesStack = [];
    this.wrapper = null;
    this.id = contentId;
    this.language = language;
    this.activityStartTime = new Date();
    this.activeBreakpoints = [];
    this.container = null;

    this.translations = Object.assign({}, {
      summary: 'Summary',
      typeYourReasonsForSuchAnswers: 'Type your reasons for such answers',
      resources: 'Resources',
      save: 'Save',
      restart: 'Restart',
      createDocument: 'Create document',
      labelSummaryComment: 'Summary comment',
      labelComment: 'Comment',
      labelStatement: 'Statement',
      labelNoComment: 'No comment',
      labelResources: 'Resources',
      selectAll: 'Select all',
      export: 'Export',
      addArgument: 'Add argument',
      ifYouContinueAllYourChangesWillBeLost: 'All the changes will be lost. Are you sure you wish to continue?',
      close: 'Close',
      drag: 'Drag',
      feedback: 'Feedback',
      submitText: 'Submit',
      submitConfirmedText: 'Saved!',
      confirm: 'Confirm',
      continue: 'Continue',
      cancel: 'Cancel',
      droparea: 'Droparea :num',
      emptydroparea: 'Empty droparea :index',
      draggableItem: 'Draggable item :statement',
      dropzone: 'Dropzone :index',
      dropzoneWithValue: 'Dropzone :index with value :statement',
      noArguments: 'No arguments',
      moveTo: 'Move to',
      deleteArgument: 'Delete argument',
      editArgument: 'Edit argument',
      argument: 'Argument',
      actionMenuTitle: 'Action menu',
      actionMenuDescription: 'Select the action you want to perform on this argument',
      dropArgumentsHere: 'Drop arguments here',
    }, this.params.l10n, this.params.resourceReport);

    const createElements = () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('h5p-category-task-wrapper');
      this.wrapper = wrapper;

      const root = createRoot(wrapper);
      root.render(
        <CategoryTaskProvider value={this}>
          <Main
            {...this.params}
            id={contentId}
            language={language}
            collectExportValues={this.collectExportValues}
          />
        </CategoryTaskProvider>
      );
    };

    this.collectExportValues = (index, callback) => {
      if (typeof index !== 'undefined') {
        this.collectExportValuesStack.push({key: index, callback: callback});
      }
      else {
        const exportValues = {};
        this.collectExportValuesStack.forEach(({key, callback}) => exportValues[key] = callback());
        return exportValues;
      }
    };

    this.registerReset = (callback) => this.resetStack.push(callback);

    this.attach = ($container) => {
      if (!this.wrapper) {
        createElements();
      }

      // Append elements to DOM
      $container[0].appendChild(this.wrapper);
      $container[0].classList.add('h5p-category-task');
      container = $container[0];
    };

    this.getRect = () => {
      return this.wrapper.getBoundingClientRect();
    };

    this.reset = () => {
      this.resetStack.forEach((callback) => callback());
    };

    /**
     * Set css classes based on ratio available to the container
     *
     * @param wrapper
     * @param ratio
     */
    this.addBreakPoints = (wrapper, ratio = getRatio(container)) => {
      if ( ratio === this.currentRatio) {
        return;
      }
      this.activeBreakpoints = [];
      breakpoints().forEach((item) => {
        if (item.shouldAdd(ratio)) {
          wrapper.classList.add(item.className);
          this.activeBreakpoints.push(item.className);
        }
        else {
          wrapper.classList.remove(item.className);
        }
      });
      this.currentRatio = ratio;
    };

    this.resize = () => {
      if (!this.wrapper) {
        return;
      }
      this.addBreakPoints(this.wrapper);
    };

    /**
         * Help fetch the correct translations.
         *
         * @params key
         * @params vars
         * @return {string}
         */
    this.translate = (key, vars) => {
      let translation = this.translations[key];
      if (vars !== undefined && vars !== null) {
        translation = Object
          .keys(vars)
          .map((key) => translation.replace(key, vars[key]))
          .toString();
      }
      return translation;
    };

    this.getRect = this.getRect.bind(this);
    this.resize = this.resize.bind(this);
    this.on('resize', this.resize);
  }

  // Inherit prototype properties
  Wrapper.prototype = Object.create(H5P.EventDispatcher.prototype);
  Wrapper.prototype.constructor = Wrapper;

  return Wrapper;
})();

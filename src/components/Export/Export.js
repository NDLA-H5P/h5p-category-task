import React, {useRef} from 'react';
import {useCategoryTask} from 'context/CategoryTaskContext';
import {escapeHTML, stripHTML} from '../utils';
import * as focusTrap from 'focus-trap';

function Export() {

  const context = useCategoryTask();
  const {
    translate
  } = context;
  const exportContainer = useRef();
  let exportDocument;
  let exportObject;

  function getExportObject() {
    const {
      params: {
        header,
        description = '',
        summaryHeader,
      },
      behaviour: {
        provideSummary = true,
      },
      translations,
      collectExportValues,
    } = context;

    const {
      resources,
      summary,
      userInput
    } = collectExportValues();

    return Object.assign({}, translations, {
      mainTitle: header,
      description: stripHTML(description),
      summaryHeader,
      hasResources: resources && resources.length > 0,
      useSummary: provideSummary,
      hasSummaryComment: summary && summary.length > 0,
      summaryComment: summary,
      resources: resources,
      unprocessedArguments: userInput.categories
        .filter((category) => category.isArgumentDefaultList)
        .map((category) => category.connectedArguments)
        .reduce((acc, val) => acc.concat(val), []),
      categories: userInput.categories
        .filter((category) => !category.isArgumentDefaultList)
        .map((category) => {
          category.connectedArguments = category.connectedArguments.map((argumentId) => userInput.argumentsList[argumentId]);
          return category;
        })
    });
  }

  function getExportPreview() {
    const documentExportTemplate =
            '<div class="export-preview">' +
            '<div class="page-header" role="heading" tabindex="-1">' +
            ' <div class="page-title h1">{{mainTitle}}</div>' +
            '</div>' +
            '<div class="page-description">{{description}}</div>' +
            '{{#categories}}' +
            '<table class="page-category-arguments">' +
            '<tr><th>{{title}}</th></tr>' +
            '<tr><td><ul>{{#connectedArguments}}<li>{{argumentText}}</li>{{/connectedArguments}}</ul>{{^connectedArguments}}{{noArguments}}{{/connectedArguments}}</td></tr>' +
            '</table>' +
            '{{/categories}}' +
            '{{#useSummary}}' +
            '{{#hasSummaryComment}}' +
            '<div class="h2">{{summaryHeader}}</div>' +
            '<p>{{summaryComment}}</p>' +
            '{{/hasSummaryComment}}' +
            '{{/useSummary}}' +
            '{{#hasResources}}' +
            '<div class="h2">{{resourceHeader}}</div>' +
            '<table class="page-resources">' +
            '<tr><th>{{resourceHeaderTitle}}</th><th>{{resourceHeaderIntro}}</th><th>{{resourceHeaderUrl}}</th></tr>' +
            '{{#resources}}<tr><td>{{title}}</td><td>{{introduction}}</td><td>{{url}}</td></tr>{{/resources}}' +
            '</table>' +
            '{{/hasResources}}' +
            '</div>';

    return Mustache.render(documentExportTemplate, exportObject);
  }

  function handleExport() {
    const {
      translate,
    } = context;

    exportObject = getExportObject();

    context.triggerXAPIScored(0, 0, 'completed');

    exportDocument = new H5P.ExportPage(
      escapeHTML(exportObject.mainTitle),
      getExportPreview(),
      H5PIntegration.reportingIsEnabled || false,
      escapeHTML(translate('submitText')),
      escapeHTML(translate('submitConfirmedText')),
      escapeHTML(translate('selectAll')),
      escapeHTML(translate('export')),
      H5P.instances[0].getLibraryFilePath('exportTemplate.docx'),
      exportObject
    );
    exportDocument.getElement().prependTo(exportContainer.current);

    /*
     * Focus 'Export' button on modal and trap focus.
     * Should be fixed in H5P.ExportPage though.
     */
    const oldFocusElement = document.activeElement;
    const trap = focusTrap.createFocusTrap(
      exportDocument.getElement().get(0),
      {
        initialFocus: exportDocument.getElement().get(0)
          .querySelector('.joubel-exportable-export-button')
      }
    );
    trap.activate();

    // Untrap focus and give focus back to previous focus element
    exportDocument.on('closed', () => {
      trap.deactivate();
      oldFocusElement.focus();
    });

    H5P.$window.on('resize', () => exportDocument.trigger('resize'));
  }

  return (
    <>
      <button
        className={'h5p-category-task-button-export'}
        onClick={handleExport}
        type={'button'}
      >
        <span
          className={'h5p-ri hri-document'}
        />
        {translate('createDocument')}
      </button>
      <div className={'export-container'} ref={exportContainer}/>
    </>
  );
}

export default Export;

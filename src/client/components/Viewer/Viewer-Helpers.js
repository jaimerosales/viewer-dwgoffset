/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Jaime Rosales 2016 - Forge Developer Partner Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

import Client from '../Client';
import ModelTransformerExtension from '../../Viewing.Extension.ModelTransformer'
var viewer;
var viewables;
var indexViewable;
var lmvDoc;
var getToken = { accessToken: Client.getaccesstoken()};
const Autodesk = window.Autodesk;

function launchViewer(documentId) {
 getToken.accessToken.then((token) => { 
    var options = {
            env: 'AutodeskProduction',
            accessToken: token.access_token
        };
        var viewerDiv = document.getElementById('viewerDiv');
        viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);

        Autodesk.Viewing.Initializer(options, function onInitialized(){
            var errorCode = viewer.start();

            // Check for initialization errors.
            if (errorCode) {
                console.error('viewer.start() error - errorCode:' + errorCode);
                return;
            }
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
 })
}

/**
 * Autodesk.Viewing.Document.load() success callback.
 * Proceeds with model initialization.
 */
function onDocumentLoadSuccess(doc) {

    // A document contains references to 3D and 2D viewables.
    viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry'}, true);
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    //load model.
    
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
    viewer.prefs.tag('ignore-producer');
    viewer.loadExtension(ModelTransformerExtension, {
         parentControl: 'modelTools',
         autoLoad: true
    })
    // Choose any of the available viewables.
    indexViewable = 0;
    lmvDoc = doc;

    // Everything is set up, load the model.
    loadModel();
}


        /**
         * Autodesk.Viewing.Document.load() failuire callback.
         */
        function onDocumentLoadFailure(viewerErrorCode) {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        }

        /**
         * viewer.loadModel() success callback.
         * Invoked after the model's SVF has been initially loaded.
         * It may trigger before any geometry has been downloaded and displayed on-screen.
         */
        function onLoadModelSuccess(model) {
            console.log('onLoadModelSuccess()!');
            console.log('Validate model loaded: ' + (viewer.model === model));
            console.log(model);
        }

        /**
         * viewer.loadModel() failure callback.
         * Invoked when there's an error fetching the SVF file.
         */
        function onLoadModelError(viewerErrorCode) {
            console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
        }


//////////////////////////////////////////////////////////////////////////
// Model Geometry loaded callback
//
//////////////////////////////////////////////////////////////////////////
function onGeometryLoaded(event) {
        var viewer = event.target;
        viewer.removeEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                onGeometryLoaded);
        viewer.fitToView();
}

function loadNextModel(documentId) {

    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
}

function loadModel() {
    var initialViewable = viewables[indexViewable];
    var svfUrl = lmvDoc.getViewablePath(initialViewable);
    var modelOptions = {
        sharedPropertyDbPath: lmvDoc.getPropertyDbPath()
    };
    viewer.loadModel(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}




const Helpers = {
  launchViewer,
  loadNextModel
};

export default Helpers;
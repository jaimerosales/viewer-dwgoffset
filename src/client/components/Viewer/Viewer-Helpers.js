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
import ModelTransformerExtension from '../../Viewing.Extension.ModelTransformer';
import EventTool from '../Viewer.EventTool/Viewer.EventTool'

var viewer;
var pointer;
var rotationValue;

var getToken = { accessToken: Client.getaccesstoken()};
var pointData ={};
/// WHY I'M USING GLOBAL VARIABLES, SIMPLE I'M SETTING UP WITH REACT-SCRIPTS FOR EASIER 3RD PARTY DEVELOPER USE OF PROJECT
/// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-global-variables

const Autodesk = window.Autodesk;
const THREE = window.THREE;

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
    var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry'}, true);
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    var eventTool = new EventTool(viewer)
    eventTool.activate()
    eventTool.on('singleclick', (event) => {
        pointer = event
    })

    //load model.
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoadedHandler);
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,onSelection);
    viewer.prefs.tag('ignore-producer');
    viewer.impl.disableRollover(true);
    viewer.loadExtension(ModelTransformerExtension, {
         parentControl: 'modelTools',
         autoLoad: true
    })
    // Choose any of the available viewables.
    var indexViewable = 0;
    var lmvDoc = doc;

    // Everything is set up, load the model.
    loadModel(viewables, lmvDoc, indexViewable);
}

/**
* Autodesk.Viewing.Document.load() failuire callback.
**/
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}


//////////////////////////////////////////////////////////////////////////
// Model Geometry loaded callback
//
//////////////////////////////////////////////////////////////////////////
function onGeometryLoadedHandler(event) {
        event.target.model = event.model
        var viewer = event.target;
        viewer.removeEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                onGeometryLoadedHandler);
        viewer.setQualityLevel(false,false);
        viewer.showAll();
        viewer.setGroundShadow(false);
        viewer.fitToView();   
}

function loadNextModel(documentId , degrees) {

    if (!pointData.point){
        alert('You need to select a point on the house floor to snap your Rack');
    }
    else{
        rotationValue = degrees;
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    }
}

function onSelection (event) {

    if (event.selections && event.selections.length) {
        pointData = viewer.clientToWorld(
        pointer.canvasX,
        pointer.canvasY,
        true)
        console.log('This is the pointData ',pointData)
    }
}

function dwgTransformation(){
    var matrix = new THREE.Matrix4();
    var t = new THREE.Vector3(pointData.point.x , pointData.point.y , 0);
    var euler = new THREE.Euler(0, 0, rotationValue * Math.PI/180,'XYZ');
    
    var q = new THREE.Quaternion();
    q.setFromEuler(euler);
    var s = new THREE.Vector3(0.015, 0.015, 0.015);    
    matrix.compose(t, q, s);
    console.log('my matrix', matrix);
    return matrix
}

function processLayers(model) {
            var layersRoot = model.getLayersRoot();
            console.log('Complete Layer Tree', layersRoot)
            console.log('Model (' + model.id + ') has (' + layersRoot.childCount + ') children.');
            layersRoot.children.forEach(function(child, index){
                if (child.isLayer) {
                    console.log(' Layer: (' + child.name + ') with Id: (' + child.index + ')');
                } else {
                    console.log(' Not a layer, TODO: Check children recursively.'); // TODO
                }
            });
        }

var doToggle = false;
function toggleVisibility() {
    viewer.impl.setLayerVisible([1], doToggle);
    doToggle = !doToggle;
}


function loadModel(viewables, lmvDoc, indexViewable) {
    return new Promise(async(resolve, reject)=> {
        var initialViewable = viewables[indexViewable];
        var svfUrl = lmvDoc.getViewablePath(initialViewable);
        var modelOptions;
        var modelName;

        if (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6amFpbWVkd2dwb2NidWNrZXRscWNnYWhjbXp3ODEwbjdvNmk3NGlhcGt3dTBweGFzNy9TdW5zZXQtQjRTLUZvci1OZXctUHJvZ3JhbS5kd2c"){
             modelOptions = {
                placementTransform: dwgTransformation()
            };

             modelName = "Sunset-B4S-For-New-Program.dwg"
        }
        else {
            modelOptions = {
                sharedPropertyDbPath: lmvDoc.getPropertyDbPath()
            };
            modelName = "Legacy-Farms-Test-for-Lotfit.dwg"
        }

        viewer.loadModel(svfUrl, modelOptions, (model) => {
            model.name = modelName;
            processLayers(model);
            resolve(model)
        })
    })
}


const Helpers = {
  launchViewer,
  loadNextModel,
  toggleVisibility
}

export default Helpers;
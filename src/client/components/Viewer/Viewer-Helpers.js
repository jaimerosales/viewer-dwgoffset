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
        var viewer = event.target;
        viewer.removeEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                onGeometryLoadedHandler);
        viewer.setQualityLevel(false,false);
        // viewer.impl.toggleCelShading(true);
        viewer.setGroundShadow(false);
        viewer.fitToView();   
}

function loadNextModel(documentId) {
    const extInstance = viewer.getExtension(ModelTransformerExtension);
     const pickVar = extInstance.panel;

     pickVar.tooltip.setContent(`
      <div id="pickTooltipId" class="pick-tooltip">
        <b>Pick position ...</b>
      </div>`, '#pickTooltipId')

    if (!pointData.point){
        alert('You need to select a point on the house floor to snap your Rack');
        pickVar.tooltip.activate();
    }
    else{
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        pickVar.tooltip.deactivate();
    }
}

function onSelection (event) {

    if (event.selections && event.selections.length) {
      // const selection = event.selections[0]
      // const dbIds = selection.dbIdArray
      pointData = viewer.clientToWorld(
        pointer.canvasX,
        pointer.canvasY,
        true)

      //console.log('This is the pointData ',pointData)

    }
}

function matrixTransform(){
   
        var matrix = new THREE.Matrix4();
        var t;
        var euler;

        if (pointData.face.normal.x === 0 && pointData.face.normal.y === 0 && Math.round(pointData.face.normal.z) === 1){
            t = new THREE.Vector3(pointData.point.x + 408, pointData.point.y + 104 , pointData.point.z + 401.2 );
            euler = new THREE.Euler(0, 0, 0,'XYZ');
            console.log('Clipped to Floor Z axis');
        }
        else {
            alert('You need to select a point on the Floor');
        }
        matrix.matrixAutoUpdate = false;
        
        var q = new THREE.Quaternion();
        q.setFromEuler(euler);
        var s = new THREE.Vector3(0.0035,0.0035,0.0035);  
        matrix.compose(t, q, s);
        
        return matrix
 
}

function topCameraView(){
    viewer.setViewCube("[top]");

    var mySettings = {
        orbit: false,
        pan: true,
        zoom: true,
        roll: false,
        fov: false,
        gotoview: false,
        walk: false
    }
  
    viewer.navigation.setLockSettings( mySettings );
    viewer.navigation.setIsLocked( true );

}

function loadModel(viewables, lmvDoc, indexViewable) {
    return new Promise(async(resolve, reject)=> {
        var initialViewable = viewables[indexViewable];
        var svfUrl = lmvDoc.getViewablePath(initialViewable);
        var modelOptions; // = TransformSimple(); 
         var modelName;

        if (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L0NhYmluZXQuemlw"){
            modelOptions = {
                placementTransform: matrixTransform()
            };
             modelName = "Cabinet.iam"
        }
        else {
            modelOptions = {
                sharedPropertyDbPath: lmvDoc.getPropertyDbPath()
            };
            //viewer.impl.toggleCelShading(true);
            modelName = "fabric.rvt"
        }
        viewer.loadModel(svfUrl, modelOptions, (model) => {
            model.name = modelName;
            resolve(model)
        })
    })
}


const Helpers = {
  launchViewer,
  loadNextModel,
  topCameraView
};

export default Helpers;
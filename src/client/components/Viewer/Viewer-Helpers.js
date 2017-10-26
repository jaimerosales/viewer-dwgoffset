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

var LotsGeometry = {};
var lineCount = 1;

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
    //viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoadedHandler);
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,onSelection);

   
    viewer.prefs.tag('ignore-producer');
    //viewer.impl.disableRollover(true);
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
// function onGeometryLoadedHandler(event) {
//         event.target.model = event.model
//         var viewer = event.target;
//         viewer.removeEventListener(
//                 Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
//                 onGeometryLoadedHandler);
//         viewer.setQualityLevel(false,false);
//         viewer.showAll();
//         viewer.setGroundShadow(false);
// }

function onSelection (event) {

    if (event.selections.length>0){
        event.selections[0].model = event.target.model;
    }

    if (event.selections && event.selections.length) {
        pointData = viewer.clientToWorld(
        pointer.canvasX,
        pointer.canvasY,
        true)
        console.log('This is the pointData ',pointData)       
        onGeometrySelect(event);
    }

}

function onGeometrySelect(event){
    // Fit Camera to Polyline view
    viewer.fitToView(event.selections[0].dbIdArray ,viewer.model)

    if (event.selections[0].dbIdArray.length>0){
        event.selections[0].fragIdsArray.forEach(function(fragId){
            var m = viewer.impl.getRenderProxy(viewer.model,0);
            var vbr = new Autodesk.Viewing.Private.VertexBufferReader(m.geometry, viewer.impl.use2dInstancing)  
            vbr.enumGeomsForObject(event.selections[0].dbIdArray[0], new GeometryCallback())
        })
    }
    lineCount = 1;
    console.log('my LotsGeometry Object', LotsGeometry)
    LotsGeometry = {};
    
}

function autoGeometryExtractor(dbIdArray){
    if (dbIdArray.dbId != null){
        viewer.model.getData().fragments.dbId2fragId.forEach(function(fragId){
            var m = viewer.impl.getRenderProxy(viewer.model,0);
            var vbr = new Autodesk.Viewing.Private.VertexBufferReader(m.geometry, viewer.impl.use2dInstancing)  
            vbr.enumGeomsForObject(dbIdArray.dbId, new GeometryCallback())
        })
    }
    console.log(dbIdArray.properties[3].displayValue,' Have the following Geometry Points ', LotsGeometry)
    lineCount = 1;
    LotsGeometry = {};
    
}

function myPageToModelConversion( x1, y1, x2, y2, vpId ) {

    var vpXform = viewer.model.getPageToModelTransform(vpId);

    var modelPt1 = new THREE.Vector3().set(x1, y1, 0).applyMatrix4(vpXform);
    var modelPt2 = new THREE.Vector3().set(x2, y2, 0).applyMatrix4(vpXform);

    var pointX1 = modelPt1.x;
    var pointY1 = modelPt1.y;
    var pointX2 = modelPt2.x;
    var pointY2 = modelPt2.y;

    // // Simple Distance Formula 
    // var a = pointX2 - pointX1
    // var b = pointY2 - pointY1
    // var c = Math.sqrt( a*a + b*b );
    
    var cLinePoints = {
        pointX1,
        pointY1,
        pointX2,
        pointY2
    }

    return cLinePoints;
};


function GeometryCallback(viewer, snapper, aDetectRadius) {
        
}

GeometryCallback.prototype.onLineSegment = function(x1, y1, x2, y2, vpId) {
      
    var linePoints = myPageToModelConversion(x1, y1, x2, y2, vpId)

    switch (true) {
        case (lineCount === 1):
            LotsGeometry.line = linePoints;
        break;
        case (lineCount === 2):
            LotsGeometry.line2 = linePoints;
        break;
        case (lineCount === 3):
            LotsGeometry.line3 = linePoints;
        break;
        case (lineCount === 4):
            LotsGeometry.line4 = linePoints;
        break;
        case (lineCount === 5):
            if(!LotsGeometry.line === linePoints)
              LotsGeometry.line5 = linePoints;
        break;
        default:
            //console.log('out of lotsgem case');
        break;
    }

    lineCount++;

};

GeometryCallback.prototype.onCircularArc = function(cx, cy, start, end, radius, vpId) {
    //TODO Calculation for Circular Arcs in model
    //console.log('The value of center x point ', cx ,'And center y point is ', cy, 'with a radious of', radius);
};

GeometryCallback.prototype.onEllipticalArc = function(cx, cy, start, end, major, minor, tilt, vpId) {
  
};

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
    var layersRoot = viewer.model.getLayersRoot();
    layersRoot.children.forEach(function(child, index){
        if(!child.name.includes("Setback")){
            viewer.impl.setLayerVisible([child.index], doToggle);
        }
    })
    doToggle = !doToggle;
    
}

function getAllLeafComponents(model, callback) {
    var components = [];

    function getLeafComponentsRec(tree, parentId) {
      if (tree.getChildCount(parentId) > 0) {
        tree.enumNodeChildren(parentId, function (childId) {
          getLeafComponentsRec(tree, childId);
        });
      }
      else
        components.push(parentId);
      return components;
    }

    var instanceTree = model.getInstanceTree();
    var allLeafComponents = getLeafComponentsRec(instanceTree, instanceTree.nodeAccess.rootId);
    callback(allLeafComponents);
}


function listElements() {
    getAllLeafComponents(viewer.model, function (modelAdbIds) {
        // this count will help wait until getProperties end all callbacks
        var count = modelAdbIds.length;

        var modelAExtIds = {};
        modelAdbIds.forEach(function (modelAdbId) {
          viewer.model.getProperties(modelAdbId, function (modelAProperty) {
            modelAExtIds[modelAProperty.externalId] = {'dbId': modelAdbId, 'properties': modelAProperty.properties};
            //console.log(modelAExtIds[modelAProperty.externalId])
            
            if(modelAExtIds[modelAProperty.externalId].properties[3].displayValue.includes("Setback")&&
               modelAExtIds[modelAProperty.externalId].properties[1].displayValue.includes("Poly") ){
                autoGeometryExtractor(modelAExtIds[modelAProperty.externalId])
                //console.log('all Lot model ids', modelAExtIds[modelAProperty.externalId].properties);
            }

            if(modelAExtIds[modelAProperty.externalId].properties[1].displayValue.includes("Hatch") ){
                autoGeometryExtractor(modelAExtIds[modelAProperty.externalId])
                //console.log('all Lot model ids', modelAExtIds[modelAProperty.externalId].properties);
            }

            count--;
            if (count === 0)  
                return;
          });
        });
      });
  }



function dwgTransformation(){
    var matrix = new THREE.Matrix4();
    var t = new THREE.Vector3(pointData.point.x - 0.05 , pointData.point.y - 0.12 , 0);
    var euler = new THREE.Euler(0, 0, rotationValue * Math.PI/180,'XYZ');
    
    var q = new THREE.Quaternion();
    q.setFromEuler(euler);
    var s = new THREE.Vector3(0.008, 0.008, 0.008);    
    matrix.compose(t, q, s);
    console.log('my matrix', matrix);
    return matrix
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

function loadModel(viewables, lmvDoc, indexViewable) {
    return new Promise(async(resolve, reject)=> {
        var initialViewable = viewables[indexViewable];
        var svfUrl = lmvDoc.getViewablePath(initialViewable);
        var modelOptions;
        var modelName;

        if (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6amFpbWVkd2dwb2NidWNrZXRscWNnYWhjbXp3ODEwbjdvNmk3NGlhcGt3dTBweGFzNy9TdW5zZXQtQjRTLUZvci1OZXctUHJvZ3JhbS5kd2c"){
             modelOptions = {
                sharedPropertyDbPath: lmvDoc.getPropertyDbPath(),
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
            console.log(model.getInstanceTree())
        })
    })
}


const Helpers = {
  launchViewer,
  loadNextModel,
  toggleVisibility,
  listElements
}

export default Helpers;
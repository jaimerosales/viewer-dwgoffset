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
var getToken = { accessToken: Client.getaccesstoken()};
const Autodesk = window.Autodesk;
const THREE = window.THREE;


function launchViewer(div, urn) {
  getToken.accessToken.then((token) => {
    var options = {
      'document': urn,
      'env': 'AutodeskProduction',
      'accessToken': token.access_token
    };

    var viewerElement = document.getElementById(div);
    //viewer = new Autodesk.Viewing.Viewer3D(viewerElement, {});
    viewer= new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
    Autodesk.Viewing.Initializer(
      options,
      function () {
        viewer.initialize();
        viewer.prefs.tag('ignore-producer')
        loadDocument(options.document);
        viewer.loadExtension(ModelTransformerExtension, {
          parentControl: 'modelTools',
          autoLoad: true
        })
      }
    );
  })
}

function loadDocument(documentId){
  Autodesk.Viewing.Document.load(
    documentId,
    function (doc) { // onLoadCallback
      var geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry'}, true);
      if (geometryItems.length > 0) {
        geometryItems.forEach(function (item, index) {
        });
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
        viewer.load(doc.getViewablePath(geometryItems[0])); // show 1st view on this document...
        // viewer.loadModel USE THIS INSTEAD
      }
    },
    function (errorMsg) { // onErrorCallback
      console.log(errorMsg);
    }
  )
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
        // debugger;
        // viewer.setQualityLevel(false,false); // Getting rid of Ambientshadows to false to avoid blackscreen problem in Viewer.
        // if (viewer.impl.modelQueue().getModels()[1]){
        //   applytoModel(viewer.impl.modelQueue().getModels()[1]);
        // }

}

  /////////////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////////////
  // function applyTransform (model) {
  //   debugger;
  //   var euler = new THREE.Euler(
  //     model.transform.rotation.x * Math.PI/180,
  //     model.transform.rotation.y * Math.PI/180,
  //     model.transform.rotation.z * Math.PI/180,
  //     'XYZ')

  //   var quaternion = new THREE.Quaternion()

  //   quaternion.setFromEuler(euler)

  //   function _transformFragProxy (fragId) {

  //     var fragProxy = viewer.impl.getFragmentProxy(
  //       model,
  //       fragId)

  //     fragProxy.getAnimTransform()

  //     fragProxy.position = model.transform.translation

  //     fragProxy.scale = model.transform.scale

  //     //Not a standard three.js quaternion
  //     fragProxy.quaternion._x = quaternion.x
  //     fragProxy.quaternion._y = quaternion.y
  //     fragProxy.quaternion._z = quaternion.z
  //     fragProxy.quaternion._w = quaternion.w

  //     fragProxy.updateAnimTransform()
  //   }

  //   var fragCount = model.getFragmentList().fragments.fragId2dbId.length

  //   //fragIds range from 0 to fragCount-1
  //   for (var fragId = 0; fragId < fragCount; ++fragId) {

  //     _transformFragProxy(fragId)
  //   }
  // }

  function applytoModel() {
    viewer.loadExtension(ModelTransformerExtension, {
          parentControl: 'modelTools',
          autoLoad: true
        })
  }


export function viewerResize() {
  viewer.resize();
}

const Helpers = {
  launchViewer,
  loadDocument,
  applytoModel
};

export default Helpers;
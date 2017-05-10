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

import React, { Component } from 'react';
import Helpers from './Viewer-Helpers';
import './Viewer.css';

class Viewer extends Component {

    componentDidMount() {
        // DWG Map
        var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6amFpbWVkd2dwb2NidWNrZXRscWNnYWhjbXp3ODEwbjdvNmk3NGlhcGt3dTBweGFzNy9MZWdhY3ktRmFybXMtVGVzdC1mb3ItTG90Zml0LmR3Zw';
        Helpers.launchViewer(documentId);        
    }

    loadSecondModel() {
        // DWG House
        var secondModelId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6amFpbWVkd2dwb2NidWNrZXRscWNnYWhjbXp3ODEwbjdvNmk3NGlhcGt3dTBweGFzNy9TdW5zZXQtQjRTLUZvci1OZXctUHJvZ3JhbS5kd2c'
        Helpers.loadNextModel(secondModelId);

    }

    render() {
        return (
          <div>  
            <div id="viewerDiv" />
            <div className="forge-logo">
                <img className="logo-size" src="images/forge-logo.png" alt="Autodesk Forge" />
            </div>
            <button className="model-button" onClick={this.loadSecondModel} >
                <i className="fa fa-plus-square"></i>
            </button>

          </div>
        );
    }
}

export default Viewer;

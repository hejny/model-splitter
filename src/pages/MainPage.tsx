import {
    FreeCamera,
    HemisphericLight,
    MeshBuilder,
    Vector3,
} from '@babylonjs/core';
import React from 'react';
import styled from 'styled-components';
import { SceneComponent } from '../components/SceneComponent';

export function MainPage() {
    return (
        <MainPageDiv>
            <h1>Model splitter</h1>

            <SceneComponent
                onSceneReady={(scene) => {
                    // This creates and positions a free camera (non-mesh)
                    var camera = new FreeCamera(
                        'camera1',
                        new Vector3(0, 5, -10),
                        scene,
                    );

                    // This targets the camera to scene origin
                    camera.setTarget(Vector3.Zero());

                    const canvas = scene.getEngine().getRenderingCanvas();

                    // This attaches the camera to the canvas
                    camera.attachControl(canvas, true);

                    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
                    var light = new HemisphericLight(
                        'light',
                        new Vector3(0, 1, 0),
                        scene,
                    );

                    // Default intensity is 1. Let's dim the light a small amount
                    light.intensity = 0.7;

                    // Our built-in 'box' shape.
                    const box = MeshBuilder.CreateBox(
                        'box',
                        { size: 2 },
                        scene,
                    );

                    // Move the box upward 1/2 its height
                    box.position.y = 1;

                    // Our built-in 'ground' shape.
                    MeshBuilder.CreateGround(
                        'ground',
                        { width: 6, height: 6 },
                        scene,
                    );
                }}
            />
        </MainPageDiv>
    );
}

const MainPageDiv = styled.div`
    canvas {
        z-index: -1;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }
`;

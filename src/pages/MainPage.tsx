import {
    Color3,
    CSG,
    FreeCamera,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    SceneLoader,
    StandardMaterial,
    Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/loaders/OBJ';
import React from 'react';
import styled from 'styled-components';
import { forEver, forTime } from 'waitasecond';
import { SceneComponent } from '../components/SceneComponent';
import { initWebXrPolyfill } from '../utils/initWebXrPolyfill';

export function MainPage() {
    return (
        <MainPageDiv>
            <h1>Model splitter</h1>

            <SceneComponent
                onSceneReady={async (scene) => {
                    // TODO: !!! Breakup into smaller functions

                    await initWebXrPolyfill();

                    // This creates and positions a free camera (non-mesh)
                    const camera = new FreeCamera(
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
                    const light = new HemisphericLight(
                        'light',
                        new Vector3(0, 1, 0),
                        scene,
                    );

                    // Default intensity is 1. Let's dim the light a small amount
                    light.intensity = 0.7;

                    /*/
                    const box = MeshBuilder.CreateBox(
                        'box',
                        { size: 2 },
                        scene,
                    );
                    box.material = materialA;
                    box.position.y = 1;
                    /**/

                    //------
                    // TODO: Marial provider
                    const materialA = new StandardMaterial('material', scene);
                    materialA.diffuseColor = Color3.FromHexString('#0055ff');
                    materialA.alpha = 0.5;

                    const materialB = new StandardMaterial('material', scene);
                    materialB.diffuseColor = Color3.FromHexString('#ff002b');
                    materialB.alpha = 0.5;

                    const materialC = new StandardMaterial('material', scene);
                    materialC.diffuseColor = Color3.FromHexString('#88ff00');
                    materialC.alpha = 0.5;
                    //------

                    // Our built-in 'ground' shape.
                    const ground = MeshBuilder.CreateGround(
                        'ground',
                        {
                            // TODO: How to make ground infinite?
                            width: 1000,
                            height: 1000,
                        },
                        scene,
                    );

                    const xr = await scene.createDefaultXRExperienceAsync({
                        floorMeshes: [ground],
                    });

                    xr.pointerSelection.laserPointerDefaultColor =
                        Color3.FromHexString('#ff0000');

                    const tube1 = MeshBuilder.CreateTube(
                        'tube1',
                        {
                            cap: Mesh.CAP_ALL,
                            radius: 0.6,
                            path: [
                                new Vector3(-1, -1, -1),

                                new Vector3(0, 0, 0),
                                new Vector3(10, 5, 0),
                            ],
                        },
                        scene,
                    );
                    tube1.material = materialB;

                    const tube2 = MeshBuilder.CreateTube(
                        'tube2',
                        {
                            cap: Mesh.CAP_ALL,
                            radius: 0.6,
                            path: [
                                new Vector3(-10, 20, 0),

                                new Vector3(0, 0, 0),
                            ],
                        },
                        scene,
                    );
                    tube2.material = materialB;

                    /*/
                    // TODO: DRY
                    // TODO: Make as promise with loader support
                    SceneLoader.ImportMesh(
                        '',
                        process.env.PUBLIC_URL + 'models/',
                        // TODO: !!! 'Tumor.obj',
                        'Fox.glb',
                        scene,
                        (newMeses) => {
                            //console.log(newMeses);

                            let x = 2;
                            for (const mesh of newMeses) {
                                mesh.scaling.x = 0.02;
                                mesh.scaling.y = 0.02;
                                mesh.scaling.z = 0.02;
                                mesh.position.y = 1;
                                mesh.position.x = x++;
                            }

                            // Finished
                        },
                    );
                    /**/

                    // TODO: DRY
                    // TODO: Make as promise with loader support
                    SceneLoader.ImportMesh(
                        '',
                        process.env.PUBLIC_URL + 'models/',
                        'Tumor.obj',

                        scene,
                        async (newMeses) => {
                            //console.log(newMeses);

                            //let x = 4;
                            for (const mesh of newMeses) {
                                mesh.scaling.x = 0.02;
                                mesh.scaling.y = 0.02;
                                mesh.scaling.z = 0.02;
                                mesh.position.y = 1;
                                //mesh.position.x = x++;
                                //mesh.rotation.y = Math.PI;

                                /**/
                                // TODO: Cuttion manager

                                await forEver();
                                await forTime(1000);
                                const a = CSG.FromMesh(mesh as any);
                                const b = CSG.FromMesh(tube1);
                                const c = CSG.FromMesh(tube2);

                                const cropped = a.subtract(b).subtract(c);

                                cropped.toMesh('cropped', materialC, scene);

                                tube1.dispose();
                                tube2.dispose();
                                mesh.dispose();
                                /**/
                            }

                            // Finished
                        },
                    );
                }}
            />
        </MainPageDiv>
    );
}

const MainPageDiv = styled.div`
    canvas {
        z-index: 1;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }

    /*.controlls{
        z-index: 1;
        position: fixed;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
    }*/
`;

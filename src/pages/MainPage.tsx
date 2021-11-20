import {
    AbstractMesh,
    Color3,
    FreeCamera,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Vector3,
    WebXRAbstractMotionController,
    WebXRInputSource,
} from '@babylonjs/core';
import React from 'react';
import styled from 'styled-components';
import { SceneComponent } from '../components/SceneComponent';
import { Freehand } from '../utils/Freehand';
import { initWebXrPolyfill } from '../utils/initWebXrPolyfill';
import { loadModel } from '../utils/loadModel';
import { Sculpture } from '../utils/Sculpture';

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

                    let sculpture: Sculpture;

                    //------
                    // TODO: Marial provider
                    const materialA = new StandardMaterial('material', scene);
                    materialA.diffuseColor = Color3.FromHexString('#0055ff');
                    materialA.alpha = 1;

                    const materialB = new StandardMaterial('material', scene);
                    materialB.diffuseColor = Color3.FromHexString('#ff002b');
                    materialB.alpha = 1;

                    const materialC = new StandardMaterial('material', scene);
                    materialC.diffuseColor = Color3.FromHexString('#88ff00');
                    materialC.alpha = 1;
                    //------

                    /*/
                    const box = MeshBuilder.CreateBox(
                        'box',
                        { size: 2 },
                        scene,
                    );
                    box.material = materialA;
                    box.position.y = 1;
                    box.position.z = -8.5;

                    sculpture = new Sculpture(box, scene);
                    /**/

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

                    let freehand: Freehand | null = null;

                    xr.input.onControllerAddedObservable.add(
                        async (controller: WebXRInputSource) => {
                            const [rootMesh, motionController] =
                                await Promise.all([
                                    new Promise<AbstractMesh>((resolve) =>
                                        controller.onMeshLoadedObservable.add(
                                            (rootMesh) => resolve(rootMesh),
                                        ),
                                    ),
                                    new Promise<WebXRAbstractMotionController>(
                                        (resolve) =>
                                            controller.onMotionControllerInitObservable.add(
                                                (motionController) =>
                                                    resolve(motionController),
                                            ),
                                    ),
                                ]);

                            console.info(
                                `🕹️ ${
                                    controller.uniqueId
                                } connected (with ${Object.keys(
                                    motionController.components,
                                ).join(', ')})`,
                                motionController,
                            );

                            /*
                                    for (const [
                                        key,
                                        component,
                                    ] of Object.entries(
                                        motionController.components,
                                    )) {
                                        console.log(key, component);

                                        component.onButtonStateChangedObservable.add(
                                            (xxx) => {
                                                console.log(xxx);
                                            },
                                        );
                                    }
                                    */

                            motionController.components[
                                'xr-standard-trigger'
                            ].onButtonStateChangedObservable.add((state) => {
                                // TODO: !!! Use value
                                //console.log(state.value);

                                if (state.value !== 0) {
                                    if (freehand === null) {
                                        freehand = new Freehand(scene);
                                        freehand.mesh.material = materialB;
                                    }

                                    freehand.addPoint(
                                        rootMesh.absolutePosition.clone(),
                                    );
                                } else if (
                                    state.value === 0 &&
                                    freehand !== null
                                ) {
                                    sculpture.subtract(freehand.mesh);

                                    // TODO: Freeze object
                                    freehand = null;
                                }
                            });
                        },
                    );

                    const foxMesh = await loadModel('Fox.glb', scene);
                    foxMesh.material = materialB;
                    sculpture = new Sculpture(foxMesh, scene);

                    //const tumorMesh = await loadModel('Tumor.obj', scene);
                    //tumorMesh.material = materialB;
                    //sculpture = new Sculpture(tumorMesh, scene);
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

import {
    AbstractMesh,
    Color3,
    Color4,
    DirectionalLight,
    FreeCamera,
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
            <h1>✂️ Model splitter</h1>

            <SceneComponent
                onSceneReady={async (scene) => {
                    // TODO: !!! Breakup into smaller functions

                    await initWebXrPolyfill();

                    // Note: Optimization:
                    scene.pointerMovePredicate = () => false;
                    scene.pointerDownPredicate = () => false;
                    scene.pointerUpPredicate = () => false;

                    scene.clearColor = Color4.FromHexString(
                        `#1d1c21` /* Transparent + fallback to body background-color */,
                    );

                    //-----------------------------------------
                    // TODO: Material provider
                    const cuttingMaterial = new StandardMaterial(
                        'material',
                        scene,
                    );
                    cuttingMaterial.specularColor =
                        Color3.FromHexString('#000000');
                    cuttingMaterial.diffuseColor =
                        Color3.FromHexString('#000000');
                    cuttingMaterial.emissiveColor =
                        Color3.FromHexString('#e41e26');
                    cuttingMaterial.alpha = 0.9;

                    const groundMaterial = new StandardMaterial(
                        'material',
                        scene,
                    );
                    groundMaterial.diffuseColor =
                        Color3.FromHexString('#353535');
                    groundMaterial.alpha = 1;
                    //-----------------------------------------

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

                    //-----------------------------------------
                    /*/
                    const light = new HemisphericLight(
                        'light',
                        new Vector3(0, 1, 0),
                        scene,
                    );
                    light.intensity = 0.05;
                    /**/
                    //------
                    // @see https://coolors.co/e28413-f56416-dd4b1a-ef271b-ea1744
                    const lightColors = `4c1e4f-b5a886-fee1c7-fa7e61-f44174`
                        .split('-')
                        .map((c) => `#${c}`);
                    lightColors.forEach((color, i) => {
                        const light = new DirectionalLight(
                            'light1',
                            new Vector3(
                                10 *
                                    Math.cos(
                                        Math.PI * 2 * (i / lightColors.length),
                                    ),
                                -10,
                                10 *
                                    Math.sin(
                                        Math.PI * 2 * (i / lightColors.length),
                                    ),
                            ),
                            scene,
                        );
                        light.intensity = 0.8;
                        light.diffuse = Color3.FromHexString(color);
                        light.specular = Color3.FromHexString(color);
                    });

                    //-----------------------------------------

                    let sculpture: Sculpture;

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
                    ground.material = groundMaterial;

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
                                if (state.value !== 0) {
                                    if (freehand === null) {
                                        freehand = new Freehand(
                                            scene,
                                            cuttingMaterial,
                                        );
                                    }

                                    freehand.addFrame(
                                        rootMesh.absolutePosition.clone(),
                                        state.value,
                                    );
                                } else if (
                                    state.value === 0 &&
                                    freehand !== null
                                ) {
                                    sculpture.subtract(...freehand.meshes);

                                    // TODO: Freeze object
                                    freehand = null;
                                }
                            });
                        },
                    );

                    // TODO: !!! Dropzone

                    sculpture = new Sculpture(
                        await loadModel(
                            'Liver_WithTumor.lowpoly.obj',

                            scene,
                        ),
                        await loadModel('Liver_WithTumor.obj', scene),
                        scene,
                    );
                }}
            />
        </MainPageDiv>
    );
}

const MainPageDiv = styled.div`
    h1 {
        /*font-family: 'Times New Roman', Times, serif;
        text-transform: uppercase;*/

        color: #e41e26;
        background-color: #fdf2f2;
        padding: 1em;
    }

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

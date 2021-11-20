import { Engine, EngineOptions, Scene, SceneOptions } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';

interface ISceneComponentProps
    extends React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement>,
        HTMLCanvasElement
    > {
    antialias?: boolean;
    engineOptions?: EngineOptions;
    adaptToDeviceRatio?: boolean;
    sceneOptions?: SceneOptions;
    onRender?: (scene: Scene) => void;
    onSceneReady?: (scene: Scene) => void;
}

export function SceneComponent(props: ISceneComponentProps) {
    const reactCanvas = useRef(null);
    const {
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        onSceneReady,
        ...rest
    } = props;

    useEffect(() => {
        if (reactCanvas.current) {
            const engine = new Engine(
                reactCanvas.current,
                antialias,
                engineOptions,
                adaptToDeviceRatio,
            );
            const scene = new Scene(engine, sceneOptions);
            if (scene.isReady()) {
                if (onSceneReady) {
                    onSceneReady(scene);
                }
            } else {
                scene.onReadyObservable.addOnce(() => {
                    if (onSceneReady) {
                        onSceneReady(scene);
                    }
                });
            }

            engine.runRenderLoop(() => {
                if (typeof onRender === 'function') {
                    onRender(scene);
                }
                scene.render();
            });

            const resize = () => {
                scene.getEngine().resize();
            };

            if (window) {
                window.addEventListener('resize', resize);
            }

            return () => {
                scene.getEngine().dispose();

                if (window) {
                    window.removeEventListener('resize', resize);
                }
            };
        }
    }, [
        reactCanvas,
        adaptToDeviceRatio,
        antialias,
        engineOptions,
        onRender,
        onSceneReady,
        sceneOptions,
    ]);

    return <canvas ref={reactCanvas} {...rest} />;
}

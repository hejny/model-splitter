import { Mesh, Scene, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/loaders/OBJ';

const IMPORT_MODEL_SCALE = 0.005;

export function loadModel(filename: string, scene: Scene): Promise<Mesh> {
    return new Promise((resolve, reject) => {
        SceneLoader.ImportMesh(
            '',
            process.env.PUBLIC_URL + 'models/',
            filename,

            scene,
            async (meshes) => {
                if (meshes.length === 0) {
                    reject(new Error('No meshes found'));
                } else {
                    if (meshes.length > 1) {
                        console.warn(
                            `Found ${meshes.length} meshes, using the first one`,
                        );
                    }

                    const mesh = meshes[0];

                    mesh.scaling.x = IMPORT_MODEL_SCALE;
                    mesh.scaling.y = IMPORT_MODEL_SCALE;
                    mesh.scaling.z = IMPORT_MODEL_SCALE;
                    mesh.position.y = 1;
                    mesh.position.z = -9.5;

                    resolve(mesh as Mesh);
                }
            },
        );
    });
}

import { Mesh, Scene, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/loaders/OBJ';

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

                    mesh.scaling.x = 0.02;
                    mesh.scaling.y = 0.02;
                    mesh.scaling.z = 0.02;
                    mesh.position.y = 1;
                    mesh.position.z = -8;

                    resolve(mesh as Mesh);
                }
            },
        );
    });
}

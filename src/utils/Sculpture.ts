import {
    Color3,
    CSG,
    Mesh,
    Scene,
    StandardMaterial,
    Vector3,
} from '@babylonjs/core';

export const SCULPTURE_NEGATIVE_DISTANCE = 1.1;

export class Sculpture {
    private originalCsg: CSG;
    private originalPosition: Vector3;

    private currentPositiveMesh: Mesh;
    private currentNegativeMesh: Mesh | null = null;

    private positiveCsg: CSG;
    private negativeCsg: CSG | null = null;

    private materialA: StandardMaterial;
    private wireframeMaterial: StandardMaterial;

    public constructor(
        originalMesh: Mesh,
        originalHighpolyMesh: Mesh,
        private scene: Scene,
    ) {
        //-----------------------------------------
        // TODO: Material provider
        this.materialA = new StandardMaterial('material', scene);
        this.materialA.diffuseColor = Color3.FromHexString('#ffffff');
        //this.materialA.alpha = 1;

        this.wireframeMaterial = new StandardMaterial('material', scene);
        this.wireframeMaterial.diffuseColor = Color3.FromHexString('#000000');
        this.wireframeMaterial.specularColor = Color3.FromHexString('#000000');
        this.wireframeMaterial.alpha = 0.3;
        this.wireframeMaterial.wireframe = true;
        //-----------------------------------------
        // TODO: Optimize and organize

        this.currentPositiveMesh = originalMesh;
        this.originalPosition = originalMesh.position.clone();

        this.currentPositiveMesh.material = this.materialA;

        const positiveLowpolyMesh = originalMesh.clone('instance');
        positiveLowpolyMesh.material = this.wireframeMaterial;

        originalHighpolyMesh.material = this.wireframeMaterial;
        originalHighpolyMesh.isVisible = false;

        const negativeHighpolyMesh =
            originalHighpolyMesh.createInstance('instance');

        originalMesh.material = this.materialA;
        originalMesh.position.x -= SCULPTURE_NEGATIVE_DISTANCE / 2;
        positiveLowpolyMesh.position.x -= SCULPTURE_NEGATIVE_DISTANCE / 2;
        originalHighpolyMesh.position.x -= SCULPTURE_NEGATIVE_DISTANCE / 2;
        negativeHighpolyMesh.position.x += SCULPTURE_NEGATIVE_DISTANCE / 2;

        // TODO: CSG Clonning
        this.originalCsg = CSG.FromMesh(originalMesh);
        this.positiveCsg = CSG.FromMesh(originalMesh);
    }

    public subtract(...substractingMeshes: Mesh[]) {
        try {
            let substractingCsg: CSG | null = null;

            for (const mesh of substractingMeshes) {
                if (substractingCsg === null) {
                    substractingCsg = CSG.FromMesh(mesh);
                } else {
                    substractingCsg.unionInPlace(CSG.FromMesh(mesh));
                }
            }

            if (substractingCsg === null) {
                throw new Error('No meshes to substract');
            }

            this.positiveCsg.subtractInPlace(substractingCsg);

            // TODO: Which is faster?
            /* [A] */
            this.negativeCsg = this.originalCsg.subtract(this.positiveCsg);
            /* [B] */
            /*
            const newPiece = this.originalCsg.intersect(substractingCsg);
            if (this.negativeCsg === null) {
                this.negativeCsg = newPiece;
            } else {
                this.negativeCsg.unionInPlace(newPiece);
            }
            */

            this.currentPositiveMesh.dispose();
            this.currentNegativeMesh?.dispose();

            this.currentPositiveMesh = this.positiveCsg.toMesh(
                'positive',
                this.materialA,
                this.scene,
            );

            this.currentNegativeMesh = this.negativeCsg.toMesh(
                'negative',
                this.materialA,
                this.scene,
            );

            this.currentNegativeMesh.position = this.originalPosition.clone();
            this.currentNegativeMesh.position.x +=
                SCULPTURE_NEGATIVE_DISTANCE / 2;
        } catch (error) {
            console.error(error);
        } finally {
            for (const mesh of substractingMeshes) {
                // TODO: Sometimes tail is not disposed
                // console.log('disposing', mesh);
                mesh.dispose();
            }
        }
    }
}

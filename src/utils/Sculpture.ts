import {
    Color3,
    CSG,
    Mesh,
    Scene,
    StandardMaterial,
    Vector3,
} from '@babylonjs/core';

// !!! TODO: Manage material here
export class Sculpture {
    private originalCsg: CSG;
    private originalPosition: Vector3;

    private currentPositiveMesh: Mesh;
    private currentNegativeMesh: Mesh | null = null;

    private positiveCsg: CSG;
    private negativeCsg: CSG | null = null;

    private materialA: StandardMaterial;

    public constructor(originalMesh: Mesh, private scene: Scene) {
        this.materialA = new StandardMaterial('material', scene);
        this.materialA.diffuseColor = Color3.FromHexString('#ffffff');
        //this.materialA.alpha = 1;

        this.currentPositiveMesh = originalMesh;
        this.originalPosition = originalMesh.position.clone();

        this.currentPositiveMesh.material = this.materialA;

        // TODO: CSG Clonning
        this.originalCsg = CSG.FromMesh(originalMesh);
        this.positiveCsg = CSG.FromMesh(originalMesh);
    }

    public subtract(substractingMesh: Mesh) {
        try {
            this.positiveCsg.subtractInPlace(CSG.FromMesh(substractingMesh));
            this.negativeCsg = this.originalCsg.subtract(this.positiveCsg);

            substractingMesh.dispose();
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
            this.currentNegativeMesh.position.x += 0.8;
        } catch (error) {
            console.error(error);
        }
    }
}

import { CSG, Mesh, Scene } from '@babylonjs/core';

export class Sculpture {
    private renderedMesh: Mesh;
    private renderedMeshCsg: CSG;

    public constructor(private baseMesh: Mesh, private scene: Scene) {
        this.renderedMesh = baseMesh;
        this.renderedMeshCsg = CSG.FromMesh(baseMesh);
    }

    public subtract(substractingMesh: Mesh) {
        this.renderedMeshCsg.subtractInPlace(CSG.FromMesh(substractingMesh));

        const oldMesh = this.renderedMesh;
        this.renderedMesh = this.renderedMeshCsg.toMesh(
            this.renderedMesh.name,
            this.renderedMesh.material,
            this.scene,
        );

        substractingMesh.dispose();
        oldMesh.dispose();
    }
}

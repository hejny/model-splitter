import { Mesh, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';

const FREEHAND_ALLOCATED_SEGMENTS = 100;
let freehandCount = 0;

export class Freehand {
    public mesh: Mesh;

    private tubeDrawOptions: any;
    private tubeDrawCurrentSegment = 0;
    public constructor(scene: Scene) {
        this.tubeDrawOptions = {
            tessellation: 8,
            updatable: true,
            cap: Mesh.CAP_ALL,
            radius: 0.03,
            path: Array(FREEHAND_ALLOCATED_SEGMENTS).fill(
                // TODO: Some point under ground
                new Vector3(0, 0, 0),
            ),
        };
        this.mesh = MeshBuilder.CreateTube(
            `Freehand${freehandCount++}`,
            this.tubeDrawOptions,
            scene,
        );
    }

    public addPoint(point: Vector3) {
        if (this.tubeDrawCurrentSegment >= FREEHAND_ALLOCATED_SEGMENTS) {
            console.warn('Freehand: Path is full, cannot add point');
            return;
        }

        for (
            let i = this.tubeDrawCurrentSegment++;
            i < FREEHAND_ALLOCATED_SEGMENTS;
            i++
        ) {
            this.tubeDrawOptions.path[i] = point;
        }

        this.mesh = MeshBuilder.CreateTube(this.mesh.name, {
            instance: this.mesh,
            ...this.tubeDrawOptions,
        });
    }
}

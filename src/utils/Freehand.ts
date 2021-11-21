import { Material, Mesh, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';

const FREEHAND_ALLOCATED_SEGMENTS = 50;
const RADIUS_SCALE = 0.25;
let freehandCount = 0;

export class Freehand {
    public mesh: Mesh;
    public get meshes(): Mesh[] {
        // TODO: Sometimes tail is not disposed
        const meshes = [this.mesh];
        if (this.nextFreehand) {
            meshes.push(this.nextFreehand.mesh);
        }
        return meshes;
    }

    private nextFreehand: Freehand | null = null;

    private tubeDrawOptions: any;
    private tubeDrawCurrentSegment = 0;
    private tubeRadiuses: number[] = [];

    public constructor(private scene: Scene, private material: Material) {
        //console.log(this);
        this.tubeDrawOptions = {
            tessellation: 9,
            updatable: true,
            cap: Mesh.CAP_ALL,
            path: Array(FREEHAND_ALLOCATED_SEGMENTS).fill(
                // TODO: Some point under ground
                new Vector3(0, 0, 0),
            ),
        };
        this.mesh = MeshBuilder.CreateTube(
            `Freehand${freehandCount++}`,
            { radius: 0, ...this.tubeDrawOptions },
            scene,
        );

        this.mesh.material = material;
    }

    public addFrame(point: Vector3, radius: number) {
        if (this.tubeDrawCurrentSegment >= FREEHAND_ALLOCATED_SEGMENTS - 1) {
            if (!this.nextFreehand) {
                this.nextFreehand = new Freehand(this.scene, this.material);
            }
            this.nextFreehand.addFrame(point, radius);

            if (this.tubeDrawCurrentSegment >= FREEHAND_ALLOCATED_SEGMENTS) {
                return;
            }

            //console.warn('Freehand: Path is full, cannot add point');
            //return;
        }

        this.tubeRadiuses[this.tubeDrawCurrentSegment] = Math.max(
            radius,
            this.tubeRadiuses[this.tubeDrawCurrentSegment] || 0,
        );

        const distance = Vector3.Distance(
            point,
            this.tubeDrawOptions.path[this.tubeDrawCurrentSegment],
        );

        if (distance < 0.01) {
            console.warn(
                'Freehand: Point is too close to previous point, ignoring',
            );
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
            radiusFunction: (i) => (this.tubeRadiuses[i] || 0) * RADIUS_SCALE,
            instance: this.mesh,
            ...this.tubeDrawOptions,
        });
    }
}

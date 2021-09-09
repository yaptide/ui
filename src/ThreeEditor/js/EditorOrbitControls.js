import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class EditorOrbitControls extends OrbitControls {
    box = new THREE.Box3();
    sphere = new THREE.Sphere();
    delta = new THREE.Vector3();

    focus(target) {
        console.warn("focus should be fixed");
        var distance;

        this.box.setFromObject(target);

        if (this.box.isEmpty() === false) {

            this.box.getCenter(this.target);
            distance = this.box.getBoundingSphere(this.sphere).radius;

        } else {

            // Focusing on an Group, AmbientLight, etc

            this.target.setFromMatrixPosition(target.matrixWorld);
            distance = 0.1;

        }

        this.delta.set(0, 0, 1);
        this.delta.applyQuaternion(this.object.quaternion);
        this.delta.multiplyScalar(distance * 4);

        this.object.position.copy(this.target).add(this.delta);


    }

}
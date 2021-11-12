import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class EditorOrbitControls extends OrbitControls {
    // Code copied (and adjusted) from EditorControls.js to get focus function that was missing on OrbitControls.
    // https://github.com/mrdoob/three.js/blob/r132/editor/js/EditorControls.js
    
    box = new THREE.Box3();
    sphere = new THREE.Sphere();
    delta = new THREE.Vector3();

    focus(target) {

        let distance;

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
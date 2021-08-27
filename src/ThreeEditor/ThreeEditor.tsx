import React, { useEffect, useRef, useState } from 'react';
import { initEditor } from './main';
import './css/main.css';
import SampleComponent from './components/SampleComponent';
import { Editor } from './js/Editor';
import  * as THREE from 'three';
import CSG from './js/libs/csg/three-csg';

function ThreeEditor() {
  const containerEl = useRef(null);


  const [editor, setEditor] = useState<Editor>();
  useEffect(() => {
    if (containerEl.current) {
      const { editor, viewport, toolbar, sidebar, menubar, resizer } = initEditor(containerEl.current);
      setEditor(editor);

      // Make 2 box meshes..

      let meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      let meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

      //offset one of the boxes by half its width..

      meshB.position.add(new THREE.Vector3(0.5, 0.5, 0.5));

      //Make sure the .matrix of each mesh is current

      meshA.updateMatrix();
      meshB.updateMatrix();

      //Create a bsp tree from each of the meshes

      let bspA = CSG.fromMesh(meshA);
      let bspB = CSG.fromMesh(meshB);

      // Subtract one bsp from the other via .subtract... other supported modes are .union and .intersect

      let bspResult = bspA.subtract(bspB);

      //Get the resulting mesh from the result bsp, and assign meshA.material to the resulting mesh

      let meshResult = CSG.toMesh(bspResult, meshA.matrix, meshA.material);

      meshResult.name = 'meshResult';
      meshResult.material = new THREE.MeshNormalMaterial()
      editor.sceneHelpers.add(meshResult);
    }
    return () => {

    }
  }, [containerEl]);


  return (
    <div className="ThreeEditor" ref={containerEl}>
      {editor &&
        <SampleComponent signal={editor.signals.objectSelected} ></SampleComponent>
      }
    </div>
  );
}

export default ThreeEditor;

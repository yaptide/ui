/* @flow */
import React from 'react';
import {
  Renderer,
  Scene,
  Mesh,
  Object3D,
} from 'react-three';
import {
  Vector3,
  BoxGeometry,
  MeshBasicMaterial,
  Quaternion,
} from 'three'; //eslint-disable-line
import * as Three from 'three'; //eslint-disable-line
import OrbitControls from 'three-orbitcontrols';
import ThreeBSP from 'ThreeCSG';
import ResizeHOC from './ResizeHOC';
import InteractiveCamera from './InteractiveCamera';

type Props = {
  width: number,
  height: number,
};

class Visualisation extends React.Component {
  props: Props;

  render() {
    const { width, height } = this.props;
    const cameraprops = {
      aspect: width / height,
      position: new Vector3(0, 0, 600),
      lookat: new Vector3(0, 0, 0),
    };
    let geometry = new ThreeBSP(new BoxGeometry(500, 100, 500));
    geometry = geometry.subtract(new ThreeBSP(new BoxGeometry(600, 50, 600)));

    return (
      <Renderer
        width={width}
        height={height}
        background={0x303030}
      >
        <Scene
          camera="maincamera"
          width={width}
          height={height}
          orbitControls={OrbitControls}
        >
          <InteractiveCamera name="maincamera" {...cameraprops} />
          <Object3D quaternion={new Quaternion()} position={new Vector3(0, 0, 0)}>
            <Mesh
              position={new Vector3(0, 0, 0)}
              geometry={geometry.toGeometry()}
              material={new MeshBasicMaterial({ color: 0x009900 })}
            />
          </Object3D>
        </Scene>
      </Renderer>
    );
  }
}

export default ResizeHOC(Visualisation);

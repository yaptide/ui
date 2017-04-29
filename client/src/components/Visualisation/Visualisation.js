/* @flow */
import React from 'react';
import {
  Renderer,
  Scene,
  Mesh,
  AxisHelper,
  PointLight,
} from 'react-three';
import {
  Vector3,
  MeshLambertMaterial,
} from 'three'; //eslint-disable-line
import * as Three from 'three'; //eslint-disable-line
import OrbitControls from 'three-orbitcontrols';
import type { Dim } from 'routes/Workspace/bodyModel';
import ResizeHOC from './ResizeHOC';
import InteractiveCamera from './InteractiveCamera';

type Props = {
  width: number,
  height: number,
  geometry: Array<{zone: Object, zoneData: Object, color: string, position: Dim }>,
};

class Visualisation extends React.Component {
  props: Props;

  render() {
    const { width, height } = this.props;
    const cameraprops = {
      aspect: width / height,
      position: new Vector3(0, 0, 50),
      lookat: new Vector3(0, 0, 0),
    };

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
          <AxisHelper />
          <PointLight position={{ x: 40, y: 40, z: -40 }} distance={100} />
          <PointLight position={{ x: -40, y: 40, z: -40 }} distance={100} />
          <PointLight position={{ x: 40, y: -40, z: -40 }} distance={100} />
          <PointLight position={{ x: -40, y: -40, z: -40 }} distance={100} />
          <PointLight position={{ x: 40, y: 40, z: 40 }} distance={100} />
          <PointLight position={{ x: -40, y: 40, z: 40 }} distance={100} />
          <PointLight position={{ x: 40, y: -40, z: 40 }} distance={100} />
          <PointLight position={{ x: -40, y: -40, z: 40 }} distance={100} />
          <InteractiveCamera name="maincamera" {...cameraprops} />
          {
            this.props.geometry.map((item, index) => (
              <Mesh
                key={index}
                position={new Vector3(item.position.x, item.position.y, item.position.z)}
                geometry={item.zone.toGeometry()}
                material={new MeshLambertMaterial({ color: item.color })}
              />
            ))
          }
        </Scene>
      </Renderer>
    );
  }
}

export default ResizeHOC(Visualisation);

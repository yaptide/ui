import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from 'three';

type HollowCylinderGeometryParameters = {
	innerRadius: number;
	outerRadius: number;
	height: number;
	thetaSegments: number;
	phiSegments: number;
	heightSegments: number;
	thetaStart: number;
	thetaLength: number;
	phiStart: number;
	phiLength: number;
};

/**
 * A class for generating cylindrical geometries with an optional hole in the center.
 *
 * Geometry is oriented along the z axis to match the standards for particle simulations.
 * @example
 * ```typescript
 * declare const scene: THREE.Scene;
 * const geometry = new HollowCylinderGeometry(3, 5, 20, 32);
 * const material = new THREE.MeshBasicMaterial({
 *     color: 0xffff00
 * });
 * const hollowCylinder = new THREE.Mesh(geometry, material);
 * scene.add(hollowCylinder);
 * ```
 * Implementation was based on:
 * @see {@link https://threejs.org/docs/index.html#api/en/geometries/CylinderGeometry | THREE.CylinderGeometry class}
 * @see {@link https://threejs.org/docs/?q=Cir#api/en/geometries/CircleGeometry | THREE.CircleGeometry class}
 */
export class HollowCylinderGeometry extends BufferGeometry {
	type: string;
	parameters: HollowCylinderGeometryParameters;
	constructor(
		innerRadius = 0,
		outerRadius = 1,
		height = 1,
		thetaSegments = 32,
		phiSegments = 1,
		heightSegments = 1,
		thetaStart = 0,
		thetaLength = Math.PI * 2,
		phiStart = 0,
		phiLength = Math.PI * 2
	) {
		super();
		this.type = 'HollowCylinderGeometry';
		this.parameters = {
			innerRadius,
			outerRadius,
			height,
			thetaSegments,
			phiSegments,
			heightSegments,
			thetaStart,
			thetaLength,
			phiStart,
			phiLength
		};

		const scope = this;

		thetaSegments = Math.floor(Math.max(3, thetaSegments));
		phiSegments = Math.floor(
			Math.max(1, outerRadius > 0 && outerRadius > innerRadius ? phiSegments : 0)
		);
		heightSegments = Math.floor(height > 0 ? heightSegments : 1);

		// buffers

		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		// helper variables

		let index = 0;
		const halfHeight = height / 2;
		let groupStart = 0;
		let outerTorsoIndexArray: number[][] = [];
		let innerTorsoIndexArray: number[][] = [];

		if (height > 0) {
			outerTorsoIndexArray = generateTorso(true);

			if (innerRadius > 0 && outerRadius > innerRadius)
				innerTorsoIndexArray = generateTorso(false);
		}

		if (outerRadius > 0 && outerRadius > innerRadius) {
			generateRing(true, 0);

			if (height > 0) generateRing(false, 2);
		}

		// build geometry

		this.setIndex(indices);
		this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

		function generateTorso(outer: boolean, groupIndex: number = outer ? 1 : 3) {
			const indexArray: number[][] = [];

			const normal = new Vector3();
			const vertex = new Vector3();

			let groupCount = 0;

			// generate vertices, normals and uvs

			for (let y = 0; y <= heightSegments; y++) {
				const indexRow = [];

				const v = y / heightSegments;

				// calculate the radius of the current row

				const radius = outer ? outerRadius : innerRadius;

				for (let x = 0; x < thetaSegments; x++) {
					const u = x / thetaSegments;

					const theta = u * thetaLength + thetaStart;

					const sinTheta = Math.sin(theta);
					const cosTheta = Math.cos(theta);

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = radius * cosTheta;
					vertex.z = -v * height + halfHeight;
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normal.set(sinTheta, 0, cosTheta).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(u, 1 - v);

					// save index of vertex in respective row

					indexRow.push(index++);
				}

				indexRow.push(indexRow[0]);

				// now save vertices of the row in our index array

				indexArray.push(indexRow);
			}
			// generate indices

			for (let x = 0; x < thetaSegments; x++) {
				for (let y = 0; y < heightSegments; y++) {
					// we use the index array to access the correct indices

					const a = indexArray[y][x];
					const b = indexArray[y + 1][x];
					const c = indexArray[y + 1][x + 1];
					const d = indexArray[y][x + 1];

					// faces
					if (outer) {
						indices.push(a, d, b);
						indices.push(b, d, c);
					} else {
						indices.push(a, b, d);
						indices.push(b, c, d);
					}

					// update group counter

					groupCount += 6;
				}
			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup(groupStart, groupCount, groupIndex);
			groupIndex++;

			// calculate new start value for groups

			groupStart += groupCount;

			return indexArray;
		}

		function generateRing(top: boolean, groupIndex: number = top ? 0 : 2) {
			const indexArray: number[][] = [];

			const normal = new Vector3();
			const vertex = new Vector3();
			const uv = new Vector2();

			let groupCount = 0;

			const sign = top ? 1 : -1;

			// add edge vertex to index array from innerTorso
			if (innerTorsoIndexArray.length > 0)
				indexArray.push(innerTorsoIndexArray[top ? 0 : innerTorsoIndexArray.length - 1]);

			// generate vertices, normals and uvs
			for (
				let y = innerTorsoIndexArray.length > 0 ? 1 : 0;
				y <= phiSegments - (outerTorsoIndexArray.length > 0 ? 1 : 0);
				y++
			) {
				const indexRow = [];

				// calculate the radius of the current row

				const v = y / phiSegments;
				const radius = innerRadius + (outerRadius - innerRadius) * v;

				for (let x = 0; x < thetaSegments; x++) {
					const u = x / thetaSegments;

					const theta = u * thetaLength + thetaStart;

					const sinTheta = Math.sin(theta);
					const cosTheta = Math.cos(theta);

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = radius * cosTheta;
					vertex.z = sign * halfHeight;

					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normal.set(0, sign, 0).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uv.x = cosTheta * 0.5 + 0.5;
					uv.y = sinTheta * 0.5 * sign + 0.5;
					uvs.push(uv.x, uv.y);

					// save index of vertex in respective row
					indexRow.push(index++);

					if (radius === 0) {
						indexRow.push(...new Array<number>(thetaSegments - 1).fill(indexRow[0]));

						break;
					}
				}

				indexRow.push(indexRow[0]);

				// now save vertices of the row in our index array

				indexArray.push(indexRow);
			}

			// add edge vertex to index array from outerTorso
			if (outerTorsoIndexArray.length > 0)
				indexArray.push(outerTorsoIndexArray[top ? 0 : outerTorsoIndexArray.length - 1]);

			// generate indices

			for (let x = 0; x < thetaSegments; x++) {
				for (let y = 0; y < phiSegments; y++) {
					// we use the index array to access the correct indices

					const a = indexArray[y][x];
					const b = indexArray[y + 1][x];
					const c = indexArray[y + 1][x + 1];
					const d = indexArray[y][x + 1];

					// faces
					if (top) {
						if (d !== a) indices.push(a, d, b);
						indices.push(b, d, c);
					} else {
						if (d !== a) indices.push(a, b, d);
						indices.push(b, c, d);
					}

					// update group counter

					groupCount += d !== a ? 6 : 3;
				}
			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup(groupStart, groupCount, groupIndex);
			groupIndex++;

			// calculate new start value for groups

			groupStart += groupCount;

			return indexArray;
		}
	}
}

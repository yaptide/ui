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
		phiSegments = Math.floor(Math.max(1, phiSegments));
		heightSegments = Math.floor(heightSegments);

		// buffers

		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		// helper variables

		let index = 0;
		const indexArray: number[][] = [];
		const halfHeight = height / 2;
		let groupStart = 0;

		if (height > 0) {
			generateTorso(true);
			if (innerRadius > 0) generateTorso(false);
		}
		if (outerRadius > 0) {
			generateRing(true);
			generateRing(false);
		}

		// build geometry

		this.setIndex(indices);
		this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

		function generateTorso(outer: boolean) {
			const normal = new Vector3();
			const vertex = new Vector3();

			let groupCount = 0;

			// this will be used to calculate the normal
			const slope = 0;

			// generate vertices, normals and uvs

			for (let y = 0; y <= heightSegments; y++) {
				const indexRow = [];

				const v = y / heightSegments;

				// calculate the radius of the current row

				const radius = outer ? outerRadius : innerRadius;

				for (let x = 0; x <= thetaSegments; x++) {
					const u = x / thetaSegments;

					const theta = u * thetaLength + thetaStart;

					const sinTheta = Math.sin(theta);
					const cosTheta = Math.cos(theta);

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = -v * height + halfHeight;
					vertex.z = radius * cosTheta;
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normal.set(sinTheta, slope, cosTheta).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(u, 1 - v);

					// save index of vertex in respective row

					indexRow.push(index++);
				}

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

					indices.push(a, b, d);
					indices.push(b, c, d);

					// update group counter

					groupCount += 6;
				}
			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup(groupStart, groupCount, outer ? 0 : 1);

			// calculate new start value for groups

			groupStart += groupCount;
		}

		function generateRing(top: boolean) {
			// some helper variables

			let groupCount = 0;

			const sign = top ? 1 : -1;

			let radius = innerRadius;
			const radiusStep = (outerRadius - innerRadius) / phiSegments;
			const vertex = new Vector3();
			const uv = new Vector2();

			// generate vertices, normals and uvs

			for (let j = 0; j <= phiSegments; j++) {
				for (let i = 0; i <= thetaSegments; i++) {
					// values are generate from the inside of the ring to the outside

					const segment = thetaStart + (i / thetaSegments) * thetaLength;

					// vertex

					vertex.x = radius * Math.cos(segment);
					vertex.z = radius * Math.sin(segment);
					vertex.y = halfHeight * sign;

					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normals.push(0, sign, 0);

					// uv

					uv.x = (vertex.x / outerRadius + 1) / 2;
					uv.y = ((sign * vertex.y) / outerRadius + 1) / 2;

					uvs.push(uv.x, uv.y);
				}

				// increase the radius for next row of vertices

				radius += radiusStep;
			}

			// indices

			for (let j = 0; j < phiSegments; j++) {
				const thetaSegmentLevel = j * (thetaSegments + 1);

				for (let i = 0; i < thetaSegments; i++) {
					const segment = i + thetaSegmentLevel;

					const a = segment;
					const b = segment + thetaSegments + 1;
					const c = segment + thetaSegments + 2;
					const d = segment + 1;

					// faces
					if (top === true) {
						indices.push(a, b, d);
						indices.push(b, c, d);
					} else {
						indices.push(b, a, d);
						indices.push(c, b, d);
					}
					groupCount += 6;
				}
			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup(groupStart, groupCount, top === true ? 2 : 3);

			// calculate new start value for groups

			groupStart += groupCount;
		}
	}
}

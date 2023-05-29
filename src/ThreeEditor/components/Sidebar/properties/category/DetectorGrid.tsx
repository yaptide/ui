import { useCallback } from 'react';
import { SetDetectGeometryCommand } from '../../../../js/commands/SetDetectGeometryCommand';
import { YaptideEditor } from '../../../../js/Editor';
import { Detector, isDetectGeometry } from '../../../../Simulation/Detectors/Detector';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { NumberPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function DetectorGrid(props: { editor: YaptideEditor; object: Detector }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const handleChanged = useCallback(
		(v: typeof watchedObject.geometryData) => {
			const { detectType } = watchedObject;
			const { xSegments, ySegments, zSegments, radialSegments } = v;
			switch (detectType) {
				case 'Mesh':
					editor.execute(
						new SetDetectGeometryCommand(editor, watchedObject.object, {
							xSegments,
							ySegments,
							zSegments
						})
					);
					break;
				case 'Cyl':
					editor.execute(
						new SetDetectGeometryCommand(editor, watchedObject.object, {
							radialSegments,
							zSegments
						})
					);
					break;
				default:
					break;
			}
		},
		[editor, watchedObject]
	);

	const fieldOptions = { min: 0, max: 1000000, precision: 0, step: 1 };

	const visibleFlag = isDetectGeometry(watchedObject);

	return (
		<PropertiesCategory
			category='Grid'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					{watchedObject.detectType === 'Mesh' && (
						<>
							<NumberPropertyField
								label='number of bins along X axis'
								value={watchedObject.geometryData.xSegments}
								{...fieldOptions}
								onChange={v =>
									handleChanged({ ...watchedObject.geometryData, xSegments: v })
								}
							/>
							<NumberPropertyField
								label='number of bins along Y axis'
								value={watchedObject.geometryData.ySegments}
								{...fieldOptions}
								onChange={v =>
									handleChanged({ ...watchedObject.geometryData, ySegments: v })
								}
							/>
						</>
					)}
					<NumberPropertyField
						label='number of bins along Z axis'
						value={watchedObject.geometryData.zSegments}
						{...fieldOptions}
						onChange={v =>
							handleChanged({ ...watchedObject.geometryData, zSegments: v })
						}
					/>
					{watchedObject.detectType === 'Cyl' && (
						<NumberPropertyField
							label='number of bins along the radius'
							value={watchedObject.geometryData.radialSegments}
							{...fieldOptions}
							onChange={v =>
								handleChanged({ ...watchedObject.geometryData, radialSegments: v })
							}
						/>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}

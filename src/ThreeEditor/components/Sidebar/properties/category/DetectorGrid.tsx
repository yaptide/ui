import { useCallback, useEffect, useState } from 'react';
import { useSignal, useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { Detector, isDetector } from '../../../../Simulation/Detectors/Detector';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { SetDetectGeometryCommand } from '../../../../js/commands/SetDetectGeometryCommand';
import { NumberPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

function flagValue(watchedObject: Detector) {
	return isDetector(watchedObject) && ['Mesh', 'Cyl'].some(v => v === watchedObject.detectorType);
}

export function DetectorGrid(props: { editor: YaptideEditor; object: Detector }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const [visibleFlag, setVisibleFlag] = useState(flagValue(watchedObject));

	useEffect(() => {
		setVisibleFlag(flagValue(watchedObject));
	}, [watchedObject]);

	useSignal(editor, 'detectTypeChanged', obj => setVisibleFlag(flagValue(obj as Detector)));

	const handleChanged = useCallback(
		(v: typeof watchedObject.geometryParameters) => {
			const { detectorType: detectType } = watchedObject;
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

	return (
		<PropertiesCategory
			category='Grid'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					{watchedObject.detectorType === 'Mesh' && (
						<>
							<NumberPropertyField
								label='number of bins along X axis'
								value={watchedObject.geometryParameters.xSegments}
								{...fieldOptions}
								onChange={v =>
									handleChanged({
										...watchedObject.geometryParameters,
										xSegments: v
									})
								}
							/>
							<NumberPropertyField
								label='number of bins along Y axis'
								value={watchedObject.geometryParameters.ySegments}
								{...fieldOptions}
								onChange={v =>
									handleChanged({
										...watchedObject.geometryParameters,
										ySegments: v
									})
								}
							/>
						</>
					)}
					<NumberPropertyField
						label='number of bins along Z axis'
						value={watchedObject.geometryParameters.zSegments}
						{...fieldOptions}
						onChange={v =>
							handleChanged({ ...watchedObject.geometryParameters, zSegments: v })
						}
					/>
					{watchedObject.detectorType === 'Cyl' && (
						<NumberPropertyField
							label='number of bins along the radius'
							value={watchedObject.geometryParameters.radialSegments}
							{...fieldOptions}
							onChange={v =>
								handleChanged({
									...watchedObject.geometryParameters,
									radialSegments: v
								})
							}
						/>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}

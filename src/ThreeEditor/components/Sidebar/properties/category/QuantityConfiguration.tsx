import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	canChangeMaterialMedium,
	canChangeNKMedium,
	canChangePrimaryMultiplier,
	DETECTOR_KEYWORD_OPTIONS,
	FLUKA_DETECTOR_KEYWORD_OPTIONS,
	MEDIUM_KEYWORD_OPTIONS} from '../../../../Simulation/Scoring/ScoringOutputTypes';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { ObjectSelectPropertyField } from '../fields/ObjectSelectPropertyField';
import {
	BooleanPropertyField,
	ConditionalNumberPropertyField,
	ConditionalObjectSelectPropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function QuantityConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringQuantity);

	const visibleFlag = isScoringQuantity(watchedObject);

	const setQuantityValue = (key: keyof ScoringQuantity, value: unknown) => {
		editor.execute(new SetQuantityValueCommand(editor, watchedObject.object, key, value));
	};

	const fields = (
		<>
			<ObjectSelectPropertyField
				label='Quantity type'
				value={watchedObject.keyword}
				options={
					editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT
						? DETECTOR_KEYWORD_OPTIONS
						: FLUKA_DETECTOR_KEYWORD_OPTIONS
				}
				onChange={v => setQuantityValue('keyword', v.uuid)}
			/>

			{canChangeNKMedium(watchedObject.keyword) &&
				editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
					<>
						<ObjectSelectPropertyField
							label='Medium'
							value={watchedObject.medium ?? MEDIUM_KEYWORD_OPTIONS.WATER}
							options={MEDIUM_KEYWORD_OPTIONS}
							onChange={v => setQuantityValue('medium', v.uuid)}
						/>
					</>
				)}

			{canChangeMaterialMedium(watchedObject.keyword) &&
				editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
					<BooleanPropertyField
						label='Override material'
						value={watchedObject.hasMaterial}
						onChange={v => setQuantityValue('hasMaterial', v)}
					/>
				)}

			{canChangePrimaryMultiplier(watchedObject.keyword) &&
				editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
					<ConditionalNumberPropertyField
						label='Primaries'
						precision={0}
						step={1}
						min={0}
						max={1000}
						value={watchedObject.primaries}
						enabled={watchedObject.hasPrimaries}
						onChange={v => setQuantityValue('primaries', v)}
						onChangeEnabled={v => setQuantityValue('hasPrimaries', v)}
					/>
				)}

			{Object.keys(editor.scoringManager.getFilterOptions()).length > 0 && (
				<ConditionalObjectSelectPropertyField
					label='Filter'
					value={watchedObject.filter?.uuid ?? ''}
					options={editor.scoringManager.getFilterOptions()}
					onChange={v =>
						setQuantityValue('filter', editor.scoringManager.getFilterByUuid(v.uuid))
					}
					enabled={watchedObject.hasFilter}
					onChangeEnabled={v => setQuantityValue('hasFilter', v)}
				/>
			)}

			{editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
				<ConditionalNumberPropertyField
					label='Rescale'
					value={watchedObject.rescale}
					onChange={v => setQuantityValue('rescale', v)}
					enabled={watchedObject.hasRescale}
					onChangeEnabled={v => setQuantityValue('hasRescale', v)}
				/>
			)}
		</>
	);

	return (
		<PropertiesCategory
			category='Quantity configuration'
			visible={visibleFlag}>
			{visibleFlag && fields}
		</PropertiesCategory>
	);
}

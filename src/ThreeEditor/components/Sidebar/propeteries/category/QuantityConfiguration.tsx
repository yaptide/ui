import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import {
	ConditionalNumberPropertyField,
	ConditionalObjectSelectPropertyField
} from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import {
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { isQuantity, ScoringQuantity } from '../../../../util/Scoring/ScoringQuantity';
import {
	DETECTOR_KEYWORD_OPTIONS,
	MEDIUM_KEYWORD_OPTIONS
} from '../../../../util/Scoring/ScoringOutputTypes';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';

export function QuantityConfiguration(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringQuantity);

	const visibleFlag = isQuantity(watchedObject);

	return (
		<PropertiesCategory category='Quantity configuration' visible={visibleFlag}>
			{visibleFlag && (
				<>
					<ObjectSelectPropertyField
						label='Quantity type'
						value={watchedObject.keyword}
						options={DETECTOR_KEYWORD_OPTIONS}
						onChange={v => {
							editor.execute(
								new SetQuantityValueCommand(
									editor,
									watchedObject.object,
									'keyword',
									v.uuid
								)
							);
						}}
					/>

					{['NEqvDose', 'NKERMA'].includes(watchedObject.keyword) && (
						<>
							<ObjectSelectPropertyField
								label='Medium'
								value={watchedObject.medium ?? MEDIUM_KEYWORD_OPTIONS.WATER}
								options={MEDIUM_KEYWORD_OPTIONS}
								onChange={v => {
									editor.execute(
										new SetQuantityValueCommand(
											editor,
											watchedObject.object,
											'medium',
											v.uuid
										)
									);
								}}
							/>
						</>
					)}

					{Object.keys(editor.detectManager.getFilterOptions()).length > 0 && (
						<ConditionalObjectSelectPropertyField
							label='Filter'
							value={watchedObject.filter?.uuid ?? ''}
							options={editor.detectManager.getFilterOptions()}
							onChange={v =>
								editor.execute(
									new SetQuantityValueCommand(
										editor,
										watchedObject.object,
										'filter',
										editor.detectManager.getFilterByUuid(v.uuid)
									)
								)
							}
							enabled={watchedObject.hasFilter}
							onChangeEnabled={v =>
								editor.execute(
									new SetQuantityValueCommand(
										editor,
										watchedObject.object,
										'hasFilter',
										v
									)
								)
							}
						/>
					)}

					<ConditionalNumberPropertyField
						label='Rescale'
						value={watchedObject.rescale}
						onChange={v => {
							editor.execute(
								new SetQuantityValueCommand(
									editor,
									watchedObject.object,
									'rescale',
									v
								)
							);
						}}
						enabled={watchedObject.hasRescale}
						onChangeEnabled={v => {
							editor.execute(
								new SetQuantityValueCommand(
									editor,
									watchedObject.object,
									'hasRescale',
									v
								)
							);
						}}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}

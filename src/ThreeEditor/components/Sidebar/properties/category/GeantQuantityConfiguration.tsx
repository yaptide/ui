import { MenuItem, Select } from '@mui/material';
import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import * as GeantScoring from '../../../../Simulation/Scoring/GeantScoringOutputTypes';
import {
	GeantScoringQuantity,
	isGeantScoringQuantity
} from '../../../../Simulation/Scoring/GeantScoringQuantity';
import { ObjectSelectPropertyField } from '../fields/ObjectSelectPropertyField';
import {
	ConditionalObjectSelectPropertyField,
	NumberPropertyField,
	PropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function GeantQuantityConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as GeantScoringQuantity
	);

	const visibleFlag = isGeantScoringQuantity(watchedObject);

	const setQuantityValue = (key: keyof GeantScoringQuantity, value: unknown) => {
		editor.execute(new SetQuantityValueCommand(editor, watchedObject.object, key, value));
	};

	return (
		<>
			<PropertiesCategory
				category='Quantity configuration'
				visible={visibleFlag}>
				{visibleFlag && (
					<>
						<ObjectSelectPropertyField
							label='Quantity type'
							value={watchedObject.quantityType}
							options={GeantScoring.SCORING_QUANTITY_TYPES}
							onChange={v => setQuantityValue('quantityType', v.uuid)}
						/>

						{Object.keys(editor.scoringManager.getFilterOptions()).length > 0 && (
							<ConditionalObjectSelectPropertyField
								label='Filter'
								value={watchedObject.filter?.uuid ?? ''}
								options={editor.scoringManager.getFilterOptions()}
								onChange={v =>
									setQuantityValue(
										'filter',
										editor.scoringManager.getFilterByUuid(v.uuid)
									)
								}
								enabled={watchedObject.hasFilter}
								onChangeEnabled={v => setQuantityValue('hasFilter', v)}
							/>
						)}
					</>
				)}
			</PropertiesCategory>
			<PropertiesCategory
				category='Histogram'
				visible={visibleFlag}>
				{visibleFlag && (
					<>
						<NumberPropertyField
							label='Number of bins'
							value={watchedObject.histogramNBins}
							onChange={v => setQuantityValue('histogramNBins', v)}
						/>
						<NumberPropertyField
							label='Lower limit'
							value={watchedObject.histogramLow}
							onChange={v => setQuantityValue('histogramLow', v)}
						/>
						<NumberPropertyField
							label='Upper limit'
							value={watchedObject.histogramHigh}
							onChange={v => setQuantityValue('histogramHigh', v)}
						/>
						<PropertyField label='Unit'>
							<Select
								variant={'standard'}
								sx={{ width: '100%' }}
								size='small'
								value={watchedObject.histogramUnit}
								onChange={event =>
									setQuantityValue('histogramUnit', event.target.value)
								}>
								{GeantScoring.SCORING_QUANTITY_UNITS[
									watchedObject.quantityType
								].map(unit => (
									<MenuItem
										key={unit}
										value={unit}>
										{unit}
									</MenuItem>
								))}
							</Select>
						</PropertyField>
						<PropertyField label='X Axis scale'>
							<Select
								variant={'standard'}
								sx={{ width: '100%' }}
								size='small'
								value={watchedObject.histogramXAxisScale}
								onChange={event =>
									setQuantityValue('histogramXAxisScale', event.target.value)
								}>
								{GeantScoring.X_AXIS_SCALE_OPTS.map(unit => (
									<MenuItem
										key={unit}
										value={unit}>
										{unit}
									</MenuItem>
								))}
							</Select>
						</PropertyField>
						<PropertyField label='X Axis bin scheme'>
							<Select
								variant={'standard'}
								sx={{ width: '100%' }}
								size='small'
								value={watchedObject.histogramXAxisBinScheme}
								onChange={event =>
									setQuantityValue('histogramXAxisBinScheme', event.target.value)
								}>
								{GeantScoring.X_AXIS_BIN_SCHEME_OPTS.map(unit => (
									<MenuItem
										key={unit}
										value={unit}>
										{unit}
									</MenuItem>
								))}
							</Select>
						</PropertyField>
					</>
				)}
			</PropertiesCategory>
		</>
	);
}

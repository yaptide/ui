import { MenuItem, Select } from '@mui/material';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isDifferentiable } from '../../../../Simulation/Scoring/ScoringOutputTypes';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { NumberPropertyField, PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

const kineticEnergyUnits = ['meV', 'eV', 'keV', 'MeV', 'GeV'];

const xAxisScaleOptions = ['none', 'log', 'log10', 'exp'];

const xAxisBinSchemeOptions = ['linear', 'log'];

export function GeantHistogramConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;
	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringQuantity
	);

	const visibleFlag =
		isScoringQuantity(watchedObject) &&
		editor.contextManager.currentSimulator === SimulatorType.GEANT4 &&
		watchedObject.keyword &&
		isDifferentiable(watchedObject.keyword);

	const setQuantityValue = (key: keyof ScoringQuantity, value: unknown) => {
		editor.execute(new SetQuantityValueCommand(editor, watchedObject.object, key, value));
	};

	return (
		<PropertiesCategory
			category='Histogram'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<NumberPropertyField
						label='Number of bins'
						precision={0}
						step={1}
						value={watchedObject.histogramNBins!}
						onChange={v => setQuantityValue('histogramNBins', v)}
					/>
					<NumberPropertyField
						label='Low'
						value={watchedObject.histogramMin!}
						onChange={v => setQuantityValue('histogramMin', v)}
					/>
					<NumberPropertyField
						label='High'
						value={watchedObject.histogramMax!}
						onChange={v => setQuantityValue('histogramMax', v)}
					/>
					<PropertyField label='Unit'>
						<Select
							variant={'standard'}
							sx={{ width: '100%' }}
							size='small'
							value={watchedObject.histogramUnit!}
							onChange={event =>
								setQuantityValue('histogramUnit', event.target.value)
							}>
							{kineticEnergyUnits.map(unit => (
								<MenuItem
									key={unit}
									value={unit}>
									{unit}
								</MenuItem>
							))}
						</Select>
					</PropertyField>
					<PropertyField label='X Axis Scale'>
						<Select
							variant={'standard'}
							sx={{ width: '100%' }}
							size='small'
							value={watchedObject.histogramXScale!}
							onChange={event =>
								setQuantityValue('histogramXScale', event.target.value)
							}>
							{xAxisScaleOptions.map(unit => (
								<MenuItem
									key={unit}
									value={unit}>
									{unit}
								</MenuItem>
							))}
						</Select>
					</PropertyField>
					<PropertyField label='X Axis Bin Scheme'>
						<Select
							variant={'standard'}
							sx={{ width: '100%' }}
							size='small'
							value={watchedObject.histogramXBinScheme!}
							onChange={event =>
								setQuantityValue('histogramXBinScheme', event.target.value)
							}>
							{xAxisBinSchemeOptions.map(unit => (
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
	);
}

import { Box, BoxProps } from '@mui/material';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../types/RequestTypes';
import { useSignal } from '../../../../util/hooks/signals';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { ParticleFilter } from '../../../Simulation/Scoring/ParticleFilter';
import { BeamConfiguration } from './category/BeamConfiguration';
import { CustomFilterConfiguration } from './category/CustomFilterConfiguration';
import { DetectorGrid } from './category/DetectorGrid';
import { GeantScoringFilterConfiguration } from './category/GeantScoringFilterConfiguration';
import { ObjectConfiguration } from './category/ObjectConfiguration';
import { ObjectDimensions } from './category/ObjectDimensions';
import { ObjectInfo } from './category/ObjectInfo';
import { ObjectMaterial } from './category/ObjectMaterial';
import { ObjectPlacement } from './category/ObjectPlacement';
import { OutputConfiguration } from './category/OutputConfiguration';
import { ParticleFilterConfiguration } from './category/ParticleFilterConfiguration';
import { QuantityConfiguration } from './category/QuantityConfiguration';
import { QuantityDifferentialScoring } from './category/QuantityDifferentialScoring';
import { ZoneOperations } from './category/ZoneOperations';

export function PropertiesPanel(props: { boxProps: BoxProps; editor: YaptideEditor }) {
	const { boxProps, editor } = props;
	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	const panelProps = { editor, object: selectedObject };

	return (
		<Box {...boxProps}>
			{selectedObject && (
				<>
					<ObjectInfo {...panelProps} />
					<ObjectPlacement {...panelProps} />
					<CustomFilterConfiguration {...panelProps} />
					<ParticleFilterConfiguration {...panelProps} />
					<GeantScoringFilterConfiguration {...panelProps} />
					<OutputConfiguration {...panelProps} />
					<QuantityConfiguration {...panelProps} />
					<QuantityDifferentialScoring {...panelProps} />
					<BeamConfiguration {...panelProps} />
					<ObjectConfiguration {...panelProps} />
					<ObjectDimensions {...panelProps} />
					<DetectorGrid {...panelProps} />
					<ZoneOperations {...panelProps} />
					<ObjectMaterial {...panelProps} />
				</>
			)}
		</Box>
	);
}

import * as React from 'react';
import { Box, BoxProps } from '@mui/material';
import { Object3D } from 'three';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { useCallback, useState } from 'react';
import { ObjectPlacement } from './category/ObjectPlacement';
import { ObjectInfo } from './category/ObjectInfo';
import { useSignal } from '../../../../util/hooks/signals';
import { ObjectDimensions } from './category/ObjectDimensions';
import { DetectorGrid } from './category/DetectorGrid';
import { ZoneOperations } from './category/ZoneOperations';
import { OutputConfiguration } from './category/OutputConfiguration';
import { QuantityConfiguration } from './category/QuantityConfiguration';
import { QuantityDifferentialScoring } from './category/QuantityDifferentialScoring';
import { BeamConfiguration } from './category/BeamConfiguration';
import { ObjectMaterial } from './category/ObjectMaterial';
import { FilterConfiguration } from './category/FilterConfiguration';
import { ObjectConfiguration } from './category/ObjectConfiguration';

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
					<FilterConfiguration {...panelProps} />
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

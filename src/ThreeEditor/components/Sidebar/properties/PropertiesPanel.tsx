import * as React from 'react';
import { BeamConfiguration } from './category/BeamConfiguration';
import { Box, BoxProps } from '@mui/material';
import { DetectorGrid } from './category/DetectorGrid';
import { FilterConfiguration } from './category/FilterConfiguration';
import { Object3D } from 'three';
import { ObjectConfiguration } from './category/ObjectConfiguration';
import { ObjectDimensions } from './category/ObjectDimensions';
import { ObjectInfo } from './category/ObjectInfo';
import { ObjectMaterial } from './category/ObjectMaterial';
import { ObjectPlacement } from './category/ObjectPlacement';
import { OutputConfiguration } from './category/OutputConfiguration';
import { QuantityConfiguration } from './category/QuantityConfiguration';
import { QuantityDifferentialScoring } from './category/QuantityDifferentialScoring';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { ZoneOperations } from './category/ZoneOperations';
import { useCallback, useState } from 'react';
import { useSignal } from '../../../../util/hooks/signals';

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

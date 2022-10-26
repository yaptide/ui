import * as React from 'react';
import { Box } from '@mui/material';
import { BoxProps } from '@mui/system/Box/Box';
import { Object3D } from 'three';
import { Editor } from '../../../js/Editor';
import { useCallback, useState } from 'react';
import { ObjectPlacement } from './category/ObjectPlacement';
import { ObjectInfo } from './category/ObjectInfo';
import { useSignal } from '../../../util/hooks/signals';
import { ObjectDimensions } from './category/ObjectDimensions';
import { DetectorGrid } from './category/DetectorGrid';
import { ZoneOperations } from './category/ZoneOperations';
import { OutputConfiguration } from './category/OutputConfiguration';
import { QuantityConfiguration } from './category/QuantityConfiguration';
import { QuantityDifferentialScoring } from './category/QuantityDifferentialScoring';
import { BeamConfiguration } from './category/BeamConfiguration';
import { ObjectMaterial } from './category/ObjectMaterial';
import { FilterConfiguration } from './category/FilterConfiguration';

export function PropertiesPanel(props: { boxProps: BoxProps; editor: Editor }) {
	const { boxProps, editor } = props;
	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	return (
		<Box {...boxProps}>
			{selectedObject && (
				<>
					<ObjectInfo editor={editor} object={selectedObject} />
					<ObjectPlacement editor={editor} object={selectedObject} />
					<FilterConfiguration editor={editor} object={selectedObject} />
					<OutputConfiguration editor={editor} object={selectedObject} />
					<QuantityConfiguration editor={editor} object={selectedObject} />
					<QuantityDifferentialScoring editor={editor} object={selectedObject} />
					<BeamConfiguration editor={editor} object={selectedObject} />
					<ObjectDimensions editor={editor} object={selectedObject} />
					<DetectorGrid editor={editor} object={selectedObject} />
					<ZoneOperations editor={editor} object={selectedObject} />
					<ObjectMaterial editor={editor} object={selectedObject} />
				</>
			)}
		</Box>
	);
}

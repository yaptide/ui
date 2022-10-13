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
import { ObjectGrid } from './category/ObjectGrid';

export function PropertiesPanel(props: { boxProps: BoxProps; editor: Editor }) {
	const { boxProps, editor } = props;
	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const handleObjectUpdate = useCallback((object: Object3D | null) => {
		setSelectedObject(object);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	return (
		<Box {...boxProps}>
			{selectedObject && (
				<>
					<ObjectInfo editor={editor} object={selectedObject} />
					<ObjectPlacement editor={editor} object={selectedObject} />
					<ObjectDimensions editor={editor} object={selectedObject} />
					<ObjectGrid editor={editor} object={selectedObject} />
				</>
			)}
		</Box>
	);
}

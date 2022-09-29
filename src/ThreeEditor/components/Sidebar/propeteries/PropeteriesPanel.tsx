import * as React from 'react';
import { Box } from '@mui/material';
import { BoxProps } from '@mui/system/Box/Box';
import { Object3D } from 'three';
import { Editor } from '../../../js/Editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ObjectInfo, ObjectPlacement } from './PropeteriesCategory';

export function PropertiesPanel(props: { boxProps: BoxProps; editor: Editor }) {
	const { boxProps, editor } = props;
	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const handleObjectUpdate = useCallback((object: Object3D | null) => {
		setSelectedObject(object);
	}, []);

	useEffect(() => {
		editor.signals.objectSelected.add(handleObjectUpdate);
		return () => {
			editor.signals.objectSelected.remove(handleObjectUpdate);
		};
	}, [editor.signals.objectSelected, handleObjectUpdate]);

	return (
		<Box {...boxProps}>
			{selectedObject && (
				<>
					<ObjectInfo editor={editor} object={selectedObject} />
					<ObjectPlacement editor={editor} object={selectedObject} />
					<ObjectInfo editor={editor} object={selectedObject} />
				</>
			)}
		</Box>
	);
}

import { Tree, TreeMethods } from '@minoru/react-dnd-treeview';
import { Divider } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Object3D } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { hasVisibleChildren } from '../../../../util/hooks/useKeyboardEditorControls';
import {
	SimulationSceneChild,
	isSimulationSceneContainer
} from '../../../Simulation/Base/SimulationContainer';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { ChangeObjectOrderCommand } from '../../../js/commands/ChangeObjectOrderCommand';
import './SidebarTree.style.css';
import { SidebarTreeItem, TreeItem } from './SidebarTreeItem';
import { isSimulationElement } from '../../../Simulation/Base/SimulationElement';

type TreeSource = SimulationSceneChild[];

export function SidebarTree(props: {
	editor: YaptideEditor;
	sources: TreeSource;
	dragDisabled?: boolean;
}) {
	const { editor, sources } = props;

	const treeRef = useRef<TreeMethods>(null);
	const treeId = useMemo(() => generateUUID(), []);

	const buildOptionsRecursively = useCallback(
		(object: SimulationSceneChild, index: number, parent: number = 0): TreeItem[] => {
			let nextParent = object.id;
			const validateElement = (object: Object3D): object is SimulationSceneChild => {
				return isSimulationElement(object) || isSimulationSceneContainer(object);
			};
			const elementToTreeItem = (
				object: SimulationSceneChild,
				parent: number,
				index: number
			): TreeItem => {
				const { id, name: text } = object;
				return {
					id,
					parent,
					droppable: true,
					text,
					data: {
						object,
						treeId,
						index
					}
				};
			};

			const children: TreeItem[] = [];

			if (!isSimulationSceneContainer(object))
				children.push(elementToTreeItem(object, parent, index));
			else if (!object.flattenOnOutliner)
				children.push(elementToTreeItem(object, parent, index));
			else nextParent = parent;

			if (object.children.length > 0) {
				const { children: items } = object;

				if (hasVisibleChildren(object))
					children.push(
						...items
							.filter(validateElement)
							.flatMap((child, idx) =>
								buildOptionsRecursively(child, idx, nextParent)
							)
					);
			}

			return children;
		},
		[treeId]
	);

	const [treeData, setTreeData] = useState<TreeItem[]>([]);

	const refreshTreeData = useCallback(() => {
		const options = sources.flatMap((source, idx) => buildOptionsRecursively(source, idx));
		setTreeData(options);
	}, [buildOptionsRecursively, sources]);

	const handleSelected = (object: Object3D | null) => {
		if (!object) return;

		objectRefs.current
			.get(object.uuid)
			?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	useEffect(() => {
		refreshTreeData();

		editor.signals.editorCleared.add(refreshTreeData);
		editor.signals.sceneGraphChanged.add(refreshTreeData);
		editor.signals.objectChanged.add(refreshTreeData);
		editor.signals.objectSelected.add(handleSelected);

		return () => {
			editor.signals.editorCleared.remove(refreshTreeData);
			editor.signals.sceneGraphChanged.remove(refreshTreeData);
			editor.signals.objectChanged.remove(refreshTreeData);
			editor.signals.objectSelected.remove(handleSelected);
		};
	}, [buildOptionsRecursively, editor, refreshTreeData]);

	const objectRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	const canDrop = (source: TreeItem | undefined, dropTargetId: string | number): boolean => {
		if (!source) return false;

		if (source.data?.treeId !== treeId) return false;

		return source.parent === dropTargetId; // only allow drop on same parent
	};

	return (
		<Tree
			classes={{
				root: 'editor-sidebar-tree'
			}}
			ref={treeRef}
			tree={treeData}
			rootId={0}
			onDrop={(_tree, { dragSource, relativeIndex }) => {
				if (relativeIndex === undefined)
					return console.warn(
						'relativeIndex is undefined. Probably you need disable sort option.'
					);

				if (dragSource?.data) {
					if (
						relativeIndex === dragSource.data.index ||
						relativeIndex - 1 === dragSource.data.index
					)
						return; // no change needed

					let newPosition =
						relativeIndex > (dragSource.data.index ?? 0)
							? relativeIndex - 1
							: relativeIndex;

					editor.execute(
						new ChangeObjectOrderCommand(editor, dragSource.data.object, newPosition)
					);
				}
			}}
			canDrop={(_, { dragSource, dropTargetId }) => {
				return canDrop(dragSource, dropTargetId);
			}}
			canDrag={node => !props.dragDisabled}
			sort={false}
			insertDroppableFirst={false}
			dropTargetOffset={5}
			placeholderRender={() => <Divider sx={{ borderBottomWidth: t => t.spacing(1) }} />}
			render={(node, { depth, isOpen, onToggle }) => (
				<SidebarTreeItem
					treeRef={treeRef.current}
					node={node}
					depth={depth}
					isOpen={isOpen}
					onToggle={onToggle}
					objectRefs={objectRefs}
					editor={editor}
				/>
			)}
		/>
	);
}

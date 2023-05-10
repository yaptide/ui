import { useCallback, useEffect, useRef, useState } from 'react';
import { Tree, TreeMethods } from '@minoru/react-dnd-treeview';
import { Object3D } from 'three';
import './SidebarTree.style.css';
import { Editor } from '../../../js/Editor';
import { SimulationElement } from '../../../Simulation/Base/SimElement';
import { SidebarTreeItem, TreeItem } from './SidebarTreeItem';
import { Divider } from '@mui/material';
import { hasVisibleChildren } from '../../../../util/hooks/useKeyboardEditorControls';
import { isOutput } from '../../../Simulation/Scoring/ScoringOutput';
import { isQuantity } from '../../../Simulation/Scoring/ScoringQuantity';
import { ChangeObjectOrderCommand } from '../../../js/commands/ChangeObjectOrderCommand';

type TreeSource = (Object3D[] | Object3D)[];

export function SidebarTree(props: { editor: Editor; sources: TreeSource }) {
	const { editor, sources } = props;

	const treeRef = useRef<TreeMethods>(null);

	const buildOption = useCallback(
		(
			object: Object3D | SimulationElement | undefined,
			items: Object3D[] | undefined,
			parentId: number
		): TreeItem[] => {
			if (!object) return [];

			if (!items) items = object.children;

			let children: TreeItem[] = [];
			if (hasVisibleChildren(object))
				children = items.map(child => buildOption(child, child.children, object.id)).flat();

			return [
				{
					id: object.id,
					parent: parentId,
					droppable: true,
					text: object.name,
					data: {
						object: object
					}
				},
				...children
			];
		},
		[]
	);

	const [treeData, setTreeData] = useState<TreeItem[]>([]);

	const refreshTreeData = useCallback(() => {
		const options = sources.flat().flatMap(source => buildOption(source, source.children, 0));
		setTreeData(options);
	}, [buildOption, sources]);

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
	}, [buildOption, editor, refreshTreeData]);

	const objectRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	const canDrop = (
		source: TreeItem | undefined,
		target: TreeItem | undefined,
		dropTargetId: string | number
	) => {
		if (!source) return false;

		const object3d = source.data?.object;

		if (isQuantity(object3d)) return object3d.parent === target?.data?.object;

		if (isOutput(object3d)) return source.parent === dropTargetId;

		return false;
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

				if (dragSource?.data)
					editor.execute(
						new ChangeObjectOrderCommand(editor, dragSource.data.object, relativeIndex)
					);
			}}
			canDrop={(_, { dropTarget, dragSource, dropTargetId }) => {
				return canDrop(dragSource, dropTarget, dropTargetId);
			}}
			canDrag={node => isQuantity(node?.data?.object) || isOutput(node?.data?.object)}
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

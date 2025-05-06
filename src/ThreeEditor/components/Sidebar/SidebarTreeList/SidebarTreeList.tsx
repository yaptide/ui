import { DropOptions, Tree } from '@minoru/react-dnd-treeview';
import { Divider } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { Object3D } from 'three';
import { generateUUID } from 'three/src/math/MathUtils.js';

import { MoveObjectInTreeCommand } from '../../../js/commands/MoveObjectInTreeCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationSceneChild } from '../../../Simulation/Base/SimulationContainer';
import { TreeItem, TreeItemData } from '../SidebarTree/SidebarTreeItem';
import { SidebarTreeListItem } from './SidebarTreeListItem';
import { useGenerateTreeData } from './useGenerateTreeData';

type TreeSource = SimulationSceneChild[];

function handleSelected(object: Object3D | null) {
	if (!object) {
		return;
	}

	document.getElementById(object.uuid)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function SidebarTreeList(props: {
	editor: YaptideEditor;
	sources: TreeSource;
	dragDisabled?: boolean;
	nestingAllowed?: boolean;
}) {
	const { editor, sources, nestingAllowed } = props;

	const treeId = useMemo(() => generateUUID(), []);
	const [treeData, refreshTreeData] = useGenerateTreeData(treeId, sources);

	useEffect(() => {
		refreshTreeData();

		editor.signals.editorCleared.add(refreshTreeData);
		editor.signals.objectChanged.add(refreshTreeData);
		editor.signals.objectAdded.add(refreshTreeData);
		editor.signals.objectRemoved.add(refreshTreeData);
		editor.signals.objectSelected.add(handleSelected);

		return () => {
			editor.signals.editorCleared.remove(refreshTreeData);
			editor.signals.objectChanged.remove(refreshTreeData);
			editor.signals.objectAdded.remove(refreshTreeData);
			editor.signals.objectRemoved.remove(refreshTreeData);
			editor.signals.objectSelected.remove(handleSelected);
		};
	}, [editor, refreshTreeData]);

	const handleDrop = useCallback(
		(tree: TreeItem[], dragDestination: { dragSource?: TreeItem; relativeIndex?: number }) => {
			const { dragSource, relativeIndex } = dragDestination;

			if (relativeIndex === undefined) {
				return console.warn(
					'relativeIndex is undefined; check if sort option is set to false.'
				);
			}

			if (!dragSource || !dragSource.data) {
				return;
			}

			const findObjectById = (id: string | number) => {
				for (const node of tree) {
					if (node.id === id) {
						return node;
					}
				}

				return null;
			};

			const dragObject = findObjectById(dragSource.id)!;
			const newParentUuid =
				dragObject.parent === 0 ? '' : findObjectById(dragObject.parent)?.data?.object.uuid;
			const newParent = newParentUuid === '' ? null : editor.objectByUuid(newParentUuid)!;

			if (newParent === dragSource.data.object) {
				return;
			}

			if (
				dragObject.parent != dragSource.parent ||
				(relativeIndex !== dragSource.data.index &&
					relativeIndex - 1 !== dragSource.data.index)
			) {
				editor.execute(
					new MoveObjectInTreeCommand(
						editor,
						dragSource.data.object,
						relativeIndex > (dragSource.data.index ?? 0)
							? relativeIndex - 1
							: relativeIndex,
						newParent
					)
				);
			}
		},
		[editor]
	);

	const canDrop = useCallback(
		(_: any, options: DropOptions<TreeItemData>): boolean | void => {
			const { dragSource, dropTargetId } = options;

			if (dragSource?.parent === dropTargetId) {
				// allow for reordering within current parent
				return true;
			}

			if (
				!dragSource ||
				dragSource.data?.treeId !== treeId ||
				(dragSource?.parent !== dropTargetId && !nestingAllowed)
			) {
				// sanity checks and obvious violations
				return false;
			}

			return; // let the default library logic handle the rest, i.e. moving subtree into itself
		},
		[treeId, nestingAllowed]
	);

	return (
		<Tree
			classes={{
				root: 'editor-sidebar-tree',
				dropTarget: 'editor-sidebar-drop-target'
			}}
			tree={treeData}
			rootId={0}
			sort={false}
			onDrop={handleDrop}
			canDrop={canDrop}
			dropTargetOffset={5}
			placeholderRender={() => <Divider className={'editor-sidebar-drop-target-divider'} />}
			render={(node, { depth, isOpen, onToggle, hasChild }) => (
				<SidebarTreeListItem
					node={node}
					depth={depth}
					hasChild={hasChild}
					isOpen={isOpen}
					onToggle={onToggle}
					editor={editor}
				/>
			)}
		/>
	);
}

import { Tree } from '@minoru/react-dnd-treeview';
import { Divider } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { Object3D } from 'three';
import { generateUUID } from 'three/src/math/MathUtils.js';

import { ChangeObjectOrderCommand } from '../../../js/commands/ChangeObjectOrderCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationSceneChild } from '../../../Simulation/Base/SimulationContainer';
import { TreeItem } from '../SidebarTree/SidebarTreeItem';
import { SidebarTreeListItem } from './SidebarTreeListItem';
import { useGenerateTreeData } from './useGenerateTreeData';

type TreeSource = SimulationSceneChild[];

export function SidebarTreeList(props: {
	editor: YaptideEditor;
	sources: TreeSource;
	dragDisabled?: boolean;
	nestingAllowed?: boolean;
}) {
	const { editor, sources, nestingAllowed } = props;

	const treeId = useMemo(() => generateUUID(), []);
	const [treeData, refreshTreeData] = useGenerateTreeData(treeId, sources);

	const handleSelected = (object: Object3D | null) => {
		if (!object) {
			return;
		}

		document
			.getElementById(object.uuid)
			?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

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

			if (!dragSource?.data) {
				return;
			}

			let parentChanged = false;

			for (const node of tree) {
				if (node.id === dragSource.id) {
					parentChanged = node.parent !== dragSource.parent;

					break;
				}
			}

			if (parentChanged) {
				//@todo change parent command
			} else {
				if (
					relativeIndex === dragSource.data.index ||
					relativeIndex - 1 === dragSource.data.index
				) {
					return;
				}

				editor.execute(
					new ChangeObjectOrderCommand(
						editor,
						dragSource.data.object,
						relativeIndex > (dragSource.data.index ?? 0)
							? relativeIndex - 1
							: relativeIndex
					)
				);
			}
		},
		[editor]
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
			canDrop={(_, { dragSource, dropTargetId }): boolean | void => {
				switch (true) {
					case !dragSource || dragSource.data?.treeId !== treeId:
						return false;
					case dragSource?.parent === dropTargetId || nestingAllowed:
						return true;
					default:
						return false;
				}
			}}
			dropTargetOffset={5}
			placeholderRender={() => <Divider className={'editor-sidebar-drop-target-divider'} />}
			render={(node, { depth, isDragging, isOpen, onToggle, hasChild }) => (
				<SidebarTreeListItem
					node={node}
					depth={depth}
					isDragging={isDragging}
					hasChild={hasChild}
					isOpen={isOpen}
					onToggle={onToggle}
					editor={editor}
				/>
			)}
		/>
	);
}

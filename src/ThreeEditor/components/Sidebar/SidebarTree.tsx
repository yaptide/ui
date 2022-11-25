import { useCallback, useEffect, useRef, useState } from 'react';
import { Tree } from '@minoru/react-dnd-treeview';
import { Object3D } from 'three';
import { Editor } from '../../js/Editor';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SimulationObject3D } from '../../util/SimulationBase/SimulationMesh';
import './SidebarTree.style.css';
import { Checkbox, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { SetValueCommand } from '../../js/commands/SetValueCommand';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { ISimulationObject } from '../../util/SimulationBase/SimulationObject';

export interface TreeItem {
	id: number;
	parent: number;
	droppable: boolean;
	text: string;
	data: {
		object: Object3D | SimulationObject3D;
	};
}

type TreeSource = (Object3D[] | Object3D)[];

function isHidable(object: Object3D | ISimulationObject) {
	if ('notHidable' in object) {
		return !object.notHidable;
	}
	return true;
}

export function SidebarTree(props: { editor: Editor; sources: TreeSource }) {
	const { editor, sources } = props;

	const handleDrop = (newTreeData: any) => setTreeData(newTreeData);

	const buildOption = useCallback(
		(
			object: Object3D | SimulationObject3D | undefined,
			items: Object3D[] | undefined,
			parentId: number
		): TreeItem[] => {
			if (!object) return [];

			if (!items) items = object.children;

			let children: TreeItem[] = [];
			if (!(object as SimulationObject3D).notVisibleChildren)
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

	return (
		<Tree
			classes={{
				root: 'editor-sidebar-tree'
			}}
			tree={treeData}
			rootId={0}
			onDrop={handleDrop}
			canDrop={(tree, { dragSourceId, dropTargetId, dragSource, dropTarget }) => {
				if (!dropTarget) return undefined;

				if ((dropTarget.data!.object as SimulationObject3D).notVisibleChildren)
					return false;

				if (dragSource?.parent === dropTargetId) return true;
				if (dragSource?.id === dropTarget?.id) return false;
				if (dragSource?.parent === 0) return false;
				return undefined;
			}}
			canDrag={node => {
				if ((node?.data?.object as SimulationObject3D).notDraggable) return false;
				if (node?.parent === 0) return false;
				return true;
			}}
			sort={false}
			insertDroppableFirst={false}
			dropTargetOffset={5}
			render={(node, { depth, isOpen, onToggle }) => (
				<div
					ref={ref => objectRefs.current.set(node.data!.object.uuid, ref!)}
					style={{
						marginLeft: depth * 15,
						color: editor.selected === node.data?.object ? 'red' : 'black',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center'
					}}>
					{node.data!.object.children.length > 0 &&
						!(node.data!.object as SimulationObject3D).notVisibleChildren && (
							<ChevronRightIcon
								onClick={onToggle}
								sx={{
									transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
									transition: 'transform 0.2s'
								}}
							/>
						)}
					<Stack
						direction='row'
						onClick={() => editor.selectById(node.data!.object.id)}
						width='100%'
						sx={{ cursor: 'pointer' }}>
						<Typography>
							{node.text} [{node.data!.object.id}]
						</Typography>
						{isHidable(node.data!.object) && (
							<Checkbox
								sx={{ padding: 0, marginLeft: 'auto' }}
								checked={node.data!.object.visible}
								onClick={e => e.stopPropagation()}
								onChange={(_, value) => {
									editor.execute(
										new SetValueCommand(
											editor,
											node.data!.object,
											'visible',
											value
										)
									);
								}}
								disabled={node.data!.object.parent?.visible === false}
								icon={<VisibilityOffIcon />}
								checkedIcon={<VisibilityIcon />}
							/>
						)}
					</Stack>
				</div>
			)}
		/>
	);
}

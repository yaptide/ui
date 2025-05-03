import { useCallback, useState } from 'react';
import { Object3D } from 'three';

import { hasVisibleChildren } from '../../../../util/hooks/useKeyboardEditorControls';
import {
	isSimulationSceneContainer,
	SimulationSceneChild
} from '../../../Simulation/Base/SimulationContainer';
import { isSimulationElement } from '../../../Simulation/Base/SimulationElement';
import { TreeItem } from '../SidebarTree/SidebarTreeItem';

function elementToTreeItem(
	object: SimulationSceneChild,
	parent: number,
	index: number,
	treeId: string
): TreeItem {
	const { id, name: text } = object;

	return {
		id,
		parent,
		droppable: true,
		text,
		data: { object, treeId, index }
	};
}

function validateElement(object: Object3D): object is SimulationSceneChild {
	return isSimulationElement(object) || isSimulationSceneContainer(object);
}

/**
 * Build tree options recursively
 *
 * Provided object is added to the tree if it is not a container
 * or if it is a container but its flattenOnOutliner flag is false
 *
 * Then function runs recursively on all children of the provided object
 * if it is a container and has visible children
 *
 * All elements that don't pass a validation with {@link validateElement} are filtered out
 */
function buildOptionsRecursively(
	object: SimulationSceneChild,
	index: number,
	treeId: string,
	parent: number = 0
): TreeItem[] {
	const children: TreeItem[] = [];

	if (!isSimulationSceneContainer(object) || !object.flattenOnOutliner) {
		children.push(elementToTreeItem(object, parent, index, treeId));
		parent = object.id;
	}

	if (object.children.length > 0 && hasVisibleChildren(object)) {
		const itemChildren = object.children
			.filter(validateElement)
			.flatMap((child, idx) => buildOptionsRecursively(child, idx, treeId, parent));
		children.push(...itemChildren);
	}

	return children;
}

export function useGenerateTreeData(
	treeId: string,
	sources: SimulationSceneChild[]
): [TreeItem[], () => void] {
	const [treeData, setTreeData] = useState<TreeItem[]>([]);

	const refreshTreeData = useCallback(() => {
		const options = sources.flatMap((source, idx) =>
			buildOptionsRecursively(source, idx, treeId)
		);
		setTreeData(options);
	}, [buildOptionsRecursively, sources]);

	return [treeData, refreshTreeData];
}

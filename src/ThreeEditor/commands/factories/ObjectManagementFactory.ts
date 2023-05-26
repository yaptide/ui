import { Capitalize as CapitalizeWord } from '../../../util/Capitalize';
import { Editor } from '../../js/Command';
import { SimulationSceneChild } from '../../Simulation/Base/SimulationContainer';
import { MethodArgs } from '../basic/AbstractCommand';
import { ActionCommand } from '../basic/ActionCommand';
import { SimulationElementManager } from '../../Simulation/Base/SimulationManager';

export class ObjectManagementFactory {
	editor: Editor;
	constructor(editor: Editor) {
		this.editor = editor;
	}
	createAddCommand<TName extends string, TChild extends SimulationSceneChild>(
		name: TName,
		element: TChild,
		target: SimulationElementManager<TName, TChild>
	) {
		return new ActionCommand(
			this.editor,
			target,
			`Add ${name}`,
			`add${CapitalizeWord(name)}`,
			`remove${CapitalizeWord(name)}`,
			[element] as MethodArgs<
				SimulationElementManager<TName, TChild>,
				`add${Capitalize<TName>}`
			>
		);
	}
	createRemoveCommand<TName extends string, TChild extends SimulationSceneChild>(
		name: TName,
		element: TChild,
		target: SimulationElementManager<TName, TChild>
	) {
		return new ActionCommand(
			this.editor,
			target,
			`Remove ${name}`,
			`remove${CapitalizeWord(name)}`,
			`add${CapitalizeWord(name)}`,
			[element] as MethodArgs<
				SimulationElementManager<TName, TChild>,
				`remove${Capitalize<TName>}`
			>
		);
	}
}

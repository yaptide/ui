import { CapitalizeString } from '../../../util/Capitalize';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneChild } from '../../Simulation/Base/SimulationContainer';
import { ManagerParams, SimulationElementManager } from '../../Simulation/Base/SimulationManager';
import { MethodArgs } from '../basic/AbstractCommand';
import { ActionCommand } from '../basic/ActionCommand';

/**
 * General factory for creating commands that add or remove objects from a manager.
 * @example
 * ```ts
 * declare const editor: Editor;
 * declare class Particle extends SimulationElement {}
 * declare const particleManager: SimulationElementManager<'particle', Particle>;
 *
 * const factory = new ObjectManagementFactory(editor);
 * const addParticleCommand = factory.createAddCommand(
 * 	'particle',
 * 	new Particle(editor, 'particle', 'particle'),
 * 	particleManager
 * );
 * addParticleCommand.execute(); // adds particle to manager
 * ```
 */
export class ObjectManagementFactory {
	editor: YaptideEditor;
	constructor(editor: YaptideEditor) {
		this.editor = editor;
	}

	createDuplicateCommand<
		TChild extends SimulationSceneChild,
		TManager extends SimulationElementManager<TNames[0], TChild, TNames[1]>,
		TNames extends [string, string] = ManagerParams<TChild, TManager>
	>(name: TNames[0], element: TChild, target: TManager) {
		return new ActionCommand(
			this.editor,
			target,
			`Duplicate ${name}`,
			`add${CapitalizeString(name)}`,
			`remove${CapitalizeString(name)}`,
			[element] as MethodArgs<TManager, `add${Capitalize<TNames[0]>}`>
		);
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
			`add${CapitalizeString(name)}`,
			`remove${CapitalizeString(name)}`,
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
			`remove${CapitalizeString(name)}`,
			`add${CapitalizeString(name)}`,
			[element] as MethodArgs<
				SimulationElementManager<TName, TChild>,
				`remove${Capitalize<TName>}`
			>
		);
	}
}

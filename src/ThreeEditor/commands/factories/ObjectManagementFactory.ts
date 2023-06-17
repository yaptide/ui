import { CapitalizeString } from '../../../util/Capitalize';
import { SimulationSceneChild } from '../../Simulation/Base/SimulationContainer';
import { MethodArgs } from '../basic/AbstractCommand';
import { ActionCommand } from '../basic/ActionCommand';
import { SimulationElementManager } from '../../Simulation/Base/SimulationManager';
import { YaptideEditor } from '../../js/YaptideEditor';

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

import { Command } from '../../ThreeEditor/commands/basic/AbstractCommand';
import { ObjectManagementFactory } from '../../ThreeEditor/commands/factories/ObjectManagementFactory';
import { YaptideEditor } from '../../ThreeEditor/js/YaptideEditor';
import { SimulationZone } from '../../ThreeEditor/Simulation/Base/SimulationZone';
import { Detector } from '../../ThreeEditor/Simulation/Detectors/Detector';
import {
	BasicFigure,
	BoxFigure,
	CylinderFigure,
	SphereFigure
} from '../../ThreeEditor/Simulation/Figures/BasicFigures';
import { ScoringFilter } from '../../ThreeEditor/Simulation/Scoring/ScoringFilter';
import { isOutput, ScoringOutput } from '../../ThreeEditor/Simulation/Scoring/ScoringOutput';
import {
	isScoringQuantity,
	ScoringQuantity
} from '../../ThreeEditor/Simulation/Scoring/ScoringQuantity';
import { BeamModulator } from '../../ThreeEditor/Simulation/SpecialComponents/BeamModulator';
import { CTCube } from '../../ThreeEditor/Simulation/SpecialComponents/CTCube';
import { BooleanZone } from '../../ThreeEditor/Simulation/Zones/BooleanZone';

/**
 * A function that returns an array of {@link CommandButtonProps} based on editor instance and condensed data.
 */
export const createCommandButtonProps = (
	editor: YaptideEditor,
	data: CommandButtonTuple[]
): CommandButtonProps[] => {
	return data.map(([label, command, disabled]) => ({
		label,
		onClick: () => (command ? editor.execute(command()) : undefined),
		disabled
	}));
};

/**
 * A function that returns {@link CommandButtonProps} grouped by category.
 * Each category is generated from a const data defined directly in this function.
 */
export const getAddElementButtonProps = (editor: YaptideEditor): GroupedCommandButtonProps => {
	const commandFactory = new ObjectManagementFactory(editor);
	const figuresTuple: CommandButtonTuple[] = [
		[
			'Box',
			() => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					new BoxFigure(editor),
					editor.figureManager
				);
			}
		],
		[
			'Cylinder',
			() => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					new CylinderFigure(editor),
					editor.figureManager
				);
			}
		],
		[
			'Sphere',
			() => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					new SphereFigure(editor),
					editor.figureManager
				);
			}
		]
	];

	const zonesTuple: CommandButtonTuple[] = [
		[
			'Boolean Zone',
			() => {
				return commandFactory.createAddCommand<'zone', SimulationZone>(
					'zone',
					new BooleanZone(editor),
					editor.zoneManager
				);
			}
		],
		['Tree Zone', undefined, true]
	];

	const detectorsTuple: CommandButtonTuple[] = [
		[
			'Detector',
			() => {
				return commandFactory.createAddCommand(
					'detector',
					new Detector(editor),
					editor.detectorManager
				);
			}
		]
	];

	const specialComponentsTuple: CommandButtonTuple[] = [
		[
			'CT Cube',
			() => {
				return commandFactory.createAddCommand(
					'CTCube',
					new CTCube(editor),
					editor.specialComponentsManager
				);
			},
			editor.specialComponentsManager.CTCubeContainer.children.length > 0
		],
		[
			'Beam Modulator',
			() => {
				return commandFactory.createAddCommand(
					'beamModulator',
					new BeamModulator(editor),
					editor.specialComponentsManager
				);
			},
			editor.specialComponentsManager.beamModulatorContainer.children.length > 0
		]
	];

	const filtersTuple: CommandButtonTuple[] = [
		[
			'Filter',
			() => {
				return commandFactory.createAddCommand(
					'filter',
					new ScoringFilter(editor),
					editor.scoringManager
				);
			}
		]
	];

	const outputsTuple: CommandButtonTuple[] = [
		[
			'Output',
			() => {
				return commandFactory.createAddCommand(
					'output',
					new ScoringOutput(editor),
					editor.scoringManager
				);
			}
		],
		[
			'Quantity',
			() => {
				return commandFactory.createAddCommand(
					'quantity',
					new ScoringQuantity(editor),
					isScoringQuantity(editor.selected)
						? editor.selected.parent?.parent
						: editor.selected
				);
			},
			!isOutput(editor.selected) && !isScoringQuantity(editor.selected)
		]
	];

	return {
		'Figures': createCommandButtonProps(editor, figuresTuple),
		'Zones': createCommandButtonProps(editor, zonesTuple),
		'Detectors': createCommandButtonProps(editor, detectorsTuple),
		'Special Components': createCommandButtonProps(editor, specialComponentsTuple),
		'Filters': createCommandButtonProps(editor, filtersTuple),
		'Outputs': createCommandButtonProps(editor, outputsTuple)
	};
};

//-----------------------------------------UtilityTypes-----------------------------------------//
export type CommandButtonProps = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};
type CommandButtonTuple =
	| [string, (() => Command) | undefined]
	| [string, (() => Command) | undefined, boolean];

type ManagerName = 'Figures' | 'Zones' | 'Detectors' | 'Special Components' | 'Filters' | 'Outputs';

type GroupedCommandButtonProps = Record<ManagerName, CommandButtonProps[]>;
//----------------------------------------------------------------------------------------------//

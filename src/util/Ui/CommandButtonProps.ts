import { SimulationZone } from '../../ThreeEditor/Simulation/Base/SimulationZone';
import { Detector } from '../../ThreeEditor/Simulation/Detectors/Detector';
import {
	BasicFigure,
	BoxFigure,
	CylinderFigure,
	SphereFigure
} from '../../ThreeEditor/Simulation/Figures/BasicFigures';
import { ScoringFilter } from '../../ThreeEditor/Simulation/Scoring/ScoringFilter';
import { ScoringOutput, isOutput } from '../../ThreeEditor/Simulation/Scoring/ScoringOutput';
import { ScoringQuantity, isQuantity } from '../../ThreeEditor/Simulation/Scoring/ScoringQuantity';
import { BeamModulator } from '../../ThreeEditor/Simulation/SpecialComponents/BeamModulator';
import { CTCube } from '../../ThreeEditor/Simulation/SpecialComponents/CTCube';
import { BooleanZone } from '../../ThreeEditor/Simulation/Zones/BooleanZone';
import { Command } from '../../ThreeEditor/commands/basic/AbstractCommand';
import { ObjectManagementFactory } from '../../ThreeEditor/commands/factories/ObjectManagementFactory';
import { YaptideEditor } from '../../ThreeEditor/js/YaptideEditor';

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

export const getAddElementButtonProps = (editor: YaptideEditor): GroupedCommandButtonProps => {
	const commandFactory = new ObjectManagementFactory(editor);
	const figuresTuple: CommandButtonTuple[] = [
		[
			'Box',
			(obj = new BoxFigure(editor)) => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					obj,
					editor.figureManager
				);
			}
		],
		[
			'Cylinder',
			(obj = new BoxFigure(editor)) => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					new CylinderFigure(editor),
					editor.figureManager
				);
			}
		],
		[
			'Sphere',
			(obj = new SphereFigure(editor)) => {
				return commandFactory.createAddCommand<'figure', BasicFigure>(
					'figure',
					obj,
					editor.figureManager
				);
			}
		]
	];
	const zonesTuple: CommandButtonTuple[] = [
		[
			'Boolean Zone',
			(obj = new BooleanZone(editor)) => {
				return commandFactory.createAddCommand<'zone', SimulationZone>(
					'zone',
					obj,
					editor.zoneManager
				);
			}
		],
		['Tree Zone', undefined, true]
	];
	const detectorsTuple: CommandButtonTuple[] = [
		[
			'Detector',
			(obj = new Detector(editor)) => {
				return commandFactory.createAddCommand('detector', obj, editor.detectorManager);
			}
		]
	];
	const specialComponentsTuple: CommandButtonTuple[] = [
		[
			'CT Cube',
			(obj = new CTCube(editor)) => {
				return commandFactory.createAddCommand(
					'CTCube',
					obj,
					editor.specialComponentsManager
				);
			},
			editor.specialComponentsManager.CTCubeContainer.children.length > 0
		],
		[
			'Beam Modulator',
			(obj = new BeamModulator(editor)) => {
				return commandFactory.createAddCommand(
					'beamModulator',
					obj,
					editor.specialComponentsManager
				);
			},
			editor.specialComponentsManager.beamModulatorContainer.children.length > 0
		]
	];
	const filtersTuple: CommandButtonTuple[] = [
		[
			'Filter',
			(obj = new ScoringFilter(editor)) => {
				return commandFactory.createAddCommand('filter', obj, editor.scoringManager);
			}
		]
	];
	const outputsTuple: CommandButtonTuple[] = [
		[
			'Output',
			(obj = new ScoringOutput(editor)) => {
				return commandFactory.createAddCommand('output', obj, editor.scoringManager);
			}
		],
		[
			'Quantity',
			(obj = new ScoringQuantity(editor)) => {
				return commandFactory.createAddCommand(
					'quantity',
					obj,
					isQuantity(editor.selected) ? editor.selected.parent : editor.selected
				);
			},
			!isOutput(editor.selected) && !isQuantity(editor.selected)
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

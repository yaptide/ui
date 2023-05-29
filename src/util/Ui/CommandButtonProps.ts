import { SimulationZone } from '../../ThreeEditor/Simulation/Base/SimZone';
import { Detector } from '../../ThreeEditor/Simulation/Detectors/Detector';
import {
	BasicFigure,
	BoxFigure,
	CylinderFigure,
	SphereFigure
} from '../../ThreeEditor/Simulation/Figures/BasicFigures';
import { DetectFilter } from '../../ThreeEditor/Simulation/Scoring/DetectFilter';
import { ScoringOutput, isOutput } from '../../ThreeEditor/Simulation/Scoring/ScoringOutput';
import { ScoringQuantity, isQuantity } from '../../ThreeEditor/Simulation/Scoring/ScoringQuantity';
import { BeamModulator } from '../../ThreeEditor/Simulation/SpecialComponents/BeamModulator';
import { CTCube } from '../../ThreeEditor/Simulation/SpecialComponents/CTCube';
import { BooleanZone } from '../../ThreeEditor/Simulation/Zones/BooleanZone';
import { Command } from '../../ThreeEditor/commands/basic/AbstractCommand';
import { ObjectManagementFactory } from '../../ThreeEditor/commands/factories/ObjectManagementFactory';
import { YaptideEditor } from '../../ThreeEditor/js/Editor';

export type CommandButtonProps = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};
type CommandButtonTuple = [string, Command | undefined] | [string, Command | undefined, boolean];

type ManagerName = 'Figures' | 'Zones' | 'Detectors' | 'Special Components' | 'Filters' | 'Outputs';

type GroupedCommandButtonProps = Record<ManagerName, CommandButtonProps[]>;

export const createCommandButtonProps = (
	editor: YaptideEditor,
	data: CommandButtonTuple[]
): CommandButtonProps[] => {
	return data.map(([label, command, disabled]) => ({
		label,
		onClick: () => (command ? editor.execute(command) : undefined),
		disabled
	}));
};

export const getAddElementButtonProps = (
	editor: YaptideEditor,
	selectedObject: YaptideEditor['selected']
): GroupedCommandButtonProps => {
	const commandFactory = new ObjectManagementFactory(editor);
	const figuresTuple: CommandButtonTuple[] = [
		[
			'Box',
			commandFactory.createAddCommand<'figure', BasicFigure>(
				'figure',
				new BoxFigure(editor),
				editor.figureManager
			)
		],
		[
			'Cylinder',
			commandFactory.createAddCommand<'figure', BasicFigure>(
				'figure',
				new CylinderFigure(editor),
				editor.figureManager
			)
		],
		[
			'Sphere',
			commandFactory.createAddCommand<'figure', BasicFigure>(
				'figure',
				new SphereFigure(editor),
				editor.figureManager
			)
		]
	];
	const zonesTuple: CommandButtonTuple[] = [
		[
			'Boolean Zone',
			commandFactory.createAddCommand<'zone', SimulationZone>(
				'zone',
				new BooleanZone(editor),
				editor.zoneManager
			)
		],
		['Tree Zone', undefined, true]
	];
	const detectorsTuple: CommandButtonTuple[] = [
		[
			'Detector',
			commandFactory.createAddCommand(
				'detector',
				new Detector(editor),
				editor.detectorManager
			)
		]
	];
	const specialComponentsTuple: CommandButtonTuple[] = [
		[
			'CT Cube',
			commandFactory.createAddCommand(
				'CTCube',
				new CTCube(editor),
				editor.specialComponentsManager
			),
			editor.specialComponentsManager.CTCubeContainer.children.length > 0
		],
		[
			'Beam Modulator',
			commandFactory.createAddCommand(
				'modulator',
				new BeamModulator(editor),
				editor.specialComponentsManager
			),
			editor.specialComponentsManager.modulatorContainer.children.length > 0
		]
	];
	const filtersTuple: CommandButtonTuple[] = [
		[
			'Filter',
			commandFactory.createAddCommand(
				'filter',
				new DetectFilter(editor),
				editor.detectorManager
			)
		]
	];
	const outputsTuple: CommandButtonTuple[] = [
		[
			'Output',
			commandFactory.createAddCommand(
				'output',
				new ScoringOutput(editor),
				editor.scoringManager
			)
		],
		[
			'Quantity',
			commandFactory.createAddCommand(
				'quantity',
				new ScoringQuantity(editor),
				isQuantity(selectedObject) ? selectedObject.parent : selectedObject
			),
			!isOutput(selectedObject) && !isQuantity(selectedObject)
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

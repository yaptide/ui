import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import TokenIcon from '@mui/icons-material/Token';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Object3D } from 'three';

import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { SimulatorType } from '../../../types/RequestTypes';
import { useSignal } from '../../../util/hooks/signals';
import { getAddElementButtonProps } from '../../../util/Ui/CommandButtonProps';
import { Context } from '../../js/EditorContext';
import { YaptideEditor } from '../../js/YaptideEditor';
import { PhysicConfiguration } from './properties/category/PhysicConfiguration';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { SidebarTreeList } from './SidebarTreeList/SidebarTreeList';
import { EditorSidebarTabTree } from './tabs/EditorSidebarTabTree';

interface EditorSidebarProps {
	editor: YaptideEditor;
}

export function EditorSidebar(props: EditorSidebarProps) {
	const { editor } = props;
	const simulator = editor.contextManager.currentSimulator;

	const [btnProps, setBtnProps] = useState(getAddElementButtonProps(editor));

	const handleObjectUpdate = useCallback(
		(o: Object3D) => {
			setBtnProps(getAddElementButtonProps(editor));
		},
		[editor]
	);

	useSignal(
		editor,
		['objectSelected', 'objectAdded', 'objectRemoved', 'objectChanged'],
		handleObjectUpdate
	);

	const [selectedTab, setSelectedTab] = useState<Context>('geometry');

	const handleContextChange = useCallback((context: Context) => {
		setSelectedTab(context);
	}, []);

	useEffect(() => {
		handleContextChange(editor.contextManager.currentContext);
		editor.signals.contextChanged.add(handleContextChange);

		return () => {
			editor.signals.contextChanged.remove(handleContextChange);
		};
	}, [editor, handleContextChange]);

	const treeSources = useMemo(() => getTreeSources(editor), [editor]);

	const geometryTabElements = getGeometryTabElements(simulator, btnProps, editor, treeSources);
	const scoringTabElements = getScoringTabElements(simulator, btnProps, editor, treeSources);

	return (
		<Box
			sx={{
				width: '100%',
				boxSizing: 'border-box',
				padding: 1,
				display: 'flex',
				flexDirection: 'column'
			}}>
			<StyledTabs
				value={selectedTab}
				onChange={(_event: SyntheticEvent, newValue: Context) =>
					(editor.contextManager.currentContext = newValue)
				}
				variant='fullWidth'
				sx={theme => ({ marginBottom: theme.spacing(2) })}>
				<StyledTab
					icon={<TokenIcon />}
					label='Geometry'
					value={'geometry'}
				/>
				<StyledTab
					icon={<SpeedIcon />}
					label='Scoring'
					value={'scoring'}
				/>
				<StyledTab
					icon={<SettingsIcon />}
					label='Settings'
					value={'settings'}
				/>
			</StyledTabs>
			<div>
				{selectedTab === 'geometry' && (
					<EditorSidebarTabTree editor={editor}>
						{geometryTabElements}
					</EditorSidebarTabTree>
				)}
				{selectedTab === 'scoring' && (
					<EditorSidebarTabTree editor={editor}>
						{scoringTabElements}
					</EditorSidebarTabTree>
				)}
			</div>
			<div>
				{selectedTab !== 'settings' ? (
					<>
						{editor.selected && (
							<Typography
								sx={{
									fontSize: '1rem',
									marginTop: '1rem',
									marginBottom: '.5rem'
								}}>
								Details
							</Typography>
						)}
						<PropertiesPanel
							editor={editor}
							boxProps={{ sx: { overflowY: 'auto' } }}
						/>
					</>
				) : (
					<Stack spacing={2}>
						<Box>
							<Typography
								sx={{
									fontSize: '1rem',
									marginBottom: '.5rem'
								}}>
								Beam
							</Typography>
							<PropertiesPanel
								editor={editor}
								boxProps={{
									sx: { overflowY: 'auto' }
								}}
							/>
						</Box>
						{editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
							<Box>
								<Typography
									sx={{
										fontSize: '1rem',
										marginBottom: '.5rem'
									}}>
									Physics
								</Typography>
								<PhysicConfiguration
									editor={editor}
									object={editor.physic}
								/>
							</Box>
						)}
					</Stack>
				)}
			</div>
		</Box>
	);
}

type TreeSources = ReturnType<typeof getTreeSources>;

function getTreeSources(editor: YaptideEditor) {
	const worldZone = [editor.zoneManager.worldZone];
	const zones = [editor.zoneManager.zoneContainer];
	const ctCube = [editor.specialComponentsManager.CTCubeContainer];
	const beamModulator = [editor.specialComponentsManager.beamModulatorContainer];

	return {
		figures: [editor.figureManager.figureContainer],
		worldZone,
		zones,
		allZones: [...worldZone, ...zones],
		detectors: [editor.detectorManager.detectorContainer],
		ctCube,
		beamModulator,
		specialComponents: [...ctCube, ...beamModulator],
		filters: [editor.scoringManager.filterContainer],
		outputs: [editor.scoringManager.outputContainer]
	};
}

function getGeometryTabElements(
	simulator: SimulatorType,
	btnProps: any,
	editor: YaptideEditor,
	sources: TreeSources
) {
	const commonElements = [
		{
			title: 'Figures',
			add: btnProps['Figures'],
			sources: sources.figures,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.figures}
				/>
			)
		},
		{
			title: 'Zones',
			add: btnProps['Zones'],
			sources: sources.allZones,
			tree: (
				<>
					<SidebarTreeList
						editor={editor}
						sources={sources.worldZone}
						dragDisabled
					/>
					<Divider sx={{ marginBottom: t => t.spacing(1) }} />
					<SidebarTreeList
						editor={editor}
						sources={sources.zones}
					/>
				</>
			)
		},
		{
			title: 'Detectors',
			add: btnProps['Detectors'],
			sources: sources.detectors,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.detectors}
				/>
			)
		}
	];

	const shieldhitElements = [
		...commonElements,
		{
			title: 'Special Components',
			add: btnProps['Special Components'],
			sources: sources.specialComponents,
			tree: (
				<>
					{editor.specialComponentsManager.CTCubeContainer.children.length > 0 ? (
						<>
							<SidebarTreeList
								editor={editor}
								sources={sources.ctCube}
								dragDisabled
								sortingDisabled
							/>

							<Divider sx={{ marginBottom: t => t.spacing(1) }} />
						</>
					) : undefined}
					<SidebarTreeList
						editor={editor}
						sources={sources.beamModulator}
						dragDisabled
						sortingDisabled
					/>
				</>
			)
		}
	];
	const flukaElements = [...commonElements];

	const geant4Elements = [
		{
			title: 'Hierarchy',
			add: btnProps['Figures'],
			sources: sources.figures,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.figures}
					nestingAllowed={true}
				/>
			)
		},
		{
			title: 'Detectors',
			add: btnProps['Detectors'],
			sources: sources.detectors,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.detectors}
				/>
			)
		}
	];

	switch (simulator) {
		case SimulatorType.SHIELDHIT:
			return shieldhitElements;
		case SimulatorType.FLUKA:
			return flukaElements;
		case SimulatorType.COMMON:
			return commonElements;
		case SimulatorType.GEANT4:
			return geant4Elements;
		default:
			return [];
	}
}

function getScoringTabElements(
	simulator: SimulatorType,
	btnProps: any,
	editor: YaptideEditor,
	sources: TreeSources
) {
	const commonElements = [
		{
			title: 'Filters',
			add: btnProps['Filters'],
			sources: sources.filters,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.filters}
				/>
			)
		},
		{
			title: 'Outputs',
			add: btnProps['Outputs'],
			sources: sources.outputs,
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={sources.outputs}
				/>
			)
		}
	];
	const shieldhitElements = [...commonElements];
	const flukaElements = [...commonElements];
	const geant4Elements = [...commonElements];

	switch (simulator) {
		case SimulatorType.SHIELDHIT:
			return shieldhitElements;
		case SimulatorType.FLUKA:
			return flukaElements;
		case SimulatorType.COMMON:
			return commonElements;
		case SimulatorType.GEANT4:
			return geant4Elements;
		default:
			return [];
	}
}

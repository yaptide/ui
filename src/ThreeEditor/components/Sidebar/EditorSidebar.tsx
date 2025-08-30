import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import TokenIcon from '@mui/icons-material/Token';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
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

	useSignal(editor, ['objectSelected', 'objectAdded', 'objectRemoved'], handleObjectUpdate);

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

	const geometryTabElements = getGeometryTabElements(simulator, btnProps, editor);
	const scoringTabElements = getScoringTabElements(simulator, btnProps, editor);

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
					<EditorSidebarTabTree>{geometryTabElements}</EditorSidebarTabTree>
				)}
				{selectedTab === 'scoring' && (
					<EditorSidebarTabTree>{scoringTabElements}</EditorSidebarTabTree>
				)}
			</div>
			<div>
				{selectedTab !== 'settings' ? (
					<>
						{editor.selected && (
							<Typography
								fontSize='1rem'
								sx={{ marginTop: '1rem', marginBottom: '.5rem' }}>
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
								fontSize='1rem'
								sx={{ marginBottom: '.5rem' }}>
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
									fontSize='1rem'
									sx={{ marginBottom: '.5rem' }}>
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

function getGeometryTabElements(simulator: SimulatorType, btnProps: any, editor: YaptideEditor) {
	const commonElements = [
		{
			title: 'Figures',
			add: btnProps['Figures'],
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.figureManager.figureContainer]}
				/>
			)
		},
		{
			title: 'Zones',
			add: btnProps['Zones'],
			tree: (
				<>
					<SidebarTreeList
						editor={editor}
						sources={[editor.zoneManager.worldZone]}
						dragDisabled
					/>
					<Divider sx={{ marginBottom: t => t.spacing(1) }} />
					<SidebarTreeList
						editor={editor}
						sources={[editor.zoneManager.zoneContainer]}
					/>
				</>
			)
		},
		{
			title: 'Detectors',
			add: btnProps['Detectors'],
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.detectorManager.detectorContainer]}
				/>
			)
		}
	];

	const shieldhitElements = [
		...commonElements,
		{
			title: 'Special Components',
			add: btnProps['Special Components'],
			tree: (
				<>
					{editor.specialComponentsManager.CTCubeContainer.children.length > 0 ? (
						<>
							<SidebarTreeList
								editor={editor}
								sources={[editor.specialComponentsManager.CTCubeContainer]}
								dragDisabled
								sortingDisabled
							/>

							<Divider sx={{ marginBottom: t => t.spacing(1) }} />
						</>
					) : undefined}
					<SidebarTreeList
						editor={editor}
						sources={[editor.specialComponentsManager.beamModulatorContainer]}
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
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.figureManager.figureContainer]}
					nestingAllowed={true}
				/>
			)
		},
		{
			title: 'Detectors',
			add: btnProps['Detectors'],
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.detectorManager.detectorContainer]}
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

function getScoringTabElements(simulator: SimulatorType, btnProps: any, editor: YaptideEditor) {
	const commonElements = [
		{
			title: 'Filters',
			add: btnProps['Filters'],
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.scoringManager.filterContainer]}
				/>
			)
		},
		{
			title: 'Outputs',
			add: btnProps['Outputs'],
			tree: (
				<SidebarTreeList
					editor={editor}
					sources={[editor.scoringManager.outputContainer]}
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

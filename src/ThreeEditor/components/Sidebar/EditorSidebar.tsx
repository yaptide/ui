import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import TokenIcon from '@mui/icons-material/Token';
import { AppBar, Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';
import { TabPanel } from '../../../WrapperApp/components/Panels/TabPanel';
import ScrollPositionManager from '../../../libs/ScrollPositionManager';
import { BoxFigure, CylinderFigure, SphereFigure } from '../../Simulation/Figures/BasicFigures';
import { isOutput } from '../../Simulation/Scoring/ScoringOutput';
import { isQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Editor } from '../../js/Editor';
import { Context } from '../../js/Editor.Context';
import { AddDetectGeometryCommand } from '../../js/commands/AddDetectGeometryCommand';
import { AddFilterCommand } from '../../js/commands/AddFilterCommand';
import { AddObjectCommand } from '../../js/commands/AddObjectCommand';
import { AddOutputCommand } from '../../js/commands/AddOutputCommand';
import { AddQuantityCommand } from '../../js/commands/AddQuantityCommand';
import { AddZoneCommand } from '../../js/commands/AddZoneCommand';
import { useSignal } from '../../../util/hooks/signals';
import { SidebarTree } from './SidebarTree/SidebarTree';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { PhysicConfiguration } from './properties/category/PhysicConfiguration';
import { BeamModifiersConfiguration } from './properties/category/RangeModulatorConfiguration';
import { EditorSidebarTabTree } from './tabs/EditorSidebarTabTree';
import { CTCube } from '../../Simulation/SpecialComponents/CTCube';

export function EditorSidebar(props: { editor: Editor }) {
	const { editor } = props;

	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	const [selectedTab, setSelectedTab] = useState<Capitalize<Context>>('Geometry');

	const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
		switch (newValue) {
			case 'Scoring':
				editor.contextManager.currentContext = 'scoring';
				break;
			case 'Settings':
				editor.contextManager.currentContext = 'settings';
				break;
			default:
				editor.contextManager.currentContext = 'geometry';
		}
	};

	const handleContextChange = useCallback((context: Context) => {
		switch (context) {
			case 'scoring':
				setSelectedTab('Scoring');
				break;
			case 'settings':
				setSelectedTab('Settings');
				break;
			default:
				setSelectedTab('Geometry');
		}
	}, []);

	useEffect(() => {
		handleContextChange(editor.contextManager.currentContext);
		editor.signals.contextChanged.add(handleContextChange);
		return () => {
			editor.signals.contextChanged.remove(handleContextChange);
		};
	}, [editor, handleContextChange]);

	const geometryTabElements = [
		{
			title: 'Figures',
			add: [
				{
					title: 'Box',
					onClick: () =>
						editor.execute(new AddObjectCommand(editor, new BoxFigure(editor)))
				},
				{
					title: 'Cylinder',
					onClick: () =>
						editor.execute(new AddObjectCommand(editor, new CylinderFigure(editor)))
				},
				{
					title: 'Sphere',
					onClick: () =>
						editor.execute(new AddObjectCommand(editor, new SphereFigure(editor)))
				},
				{
					title: 'CT',
					onClick: () => editor.execute(new AddObjectCommand(editor, new CTCube(editor)))
				}
			],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.scene.children]}
				/>
			)
		},
		{
			title: 'Zones',
			add: [
				{
					title: 'Zone',
					onClick: () => editor.execute(new AddZoneCommand(editor))
				}
			],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[
						editor.zoneManager.worldZone,
						editor.zoneManager.zoneContainer.children
					]}
				/>
			)
		},
		{
			title: 'Detectors',
			add: [
				{
					title: 'Detector',
					onClick: () => editor.execute(new AddDetectGeometryCommand(editor))
				}
			],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.detectManager.detectContainer.children]}
				/>
			)
		}
	];

	const scoringTabElements = [
		{
			title: 'Filters',
			add: [
				{
					title: 'Filter',
					onClick: () => editor.execute(new AddFilterCommand(editor))
				}
			],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.detectManager.filterContainer.children]}
				/>
			)
		},
		{
			title: 'Outputs',
			add: [
				{
					title: 'Output',
					onClick: () => editor.execute(new AddOutputCommand(editor))
				},
				{
					title: 'Quantity',
					onClick: () =>
						editor.execute(
							new AddQuantityCommand(
								editor,
								isQuantity(selectedObject) ? selectedObject.parent : selectedObject
							)
						),
					isDisabled: () => !isOutput(selectedObject) && !isQuantity(selectedObject)
				}
			],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.scoringManager.children]}
				/>
			)
		}
	];

	return (
		<>
			<AppBar
				position='relative'
				color='secondary'
				elevation={2}
				style={{
					borderBottom: 1,
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'stretch'
				}}>
				<Tabs
					value={selectedTab}
					onChange={handleChange}
					aria-label='basic tabs example'
					variant='fullWidth'>
					<Tab
						icon={<TokenIcon />}
						label='Geometry'
						value={'Geometry'}
						sx={{
							minHeight: 64
						}}
					/>
					<Tab
						icon={<SpeedIcon />}
						label='Scoring'
						value={'Scoring'}
						sx={{
							minHeight: 64
						}}
					/>
					<Tab
						icon={<SettingsIcon />}
						label='Settings'
						value={'Settings'}
						sx={{
							minHeight: 64
						}}
					/>
				</Tabs>
			</AppBar>
			<ScrollPositionManager scrollKey={`vertical-editor-sidebar`}>
				{({ connectScrollTarget }: { connectScrollTarget: (node: unknown) => void }) => {
					return (
						<div
							style={{
								overflow: 'auto',
								position: 'relative',
								height: '100%'
							}}
							ref={(node: HTMLDivElement) => connectScrollTarget(node)}>
							<TabPanel
								value={selectedTab}
								index={'Geometry'}
								persistentIfVisited>
								<EditorSidebarTabTree
									elements={geometryTabElements}></EditorSidebarTabTree>
							</TabPanel>
							<TabPanel
								value={selectedTab}
								index={'Scoring'}
								persistentIfVisited>
								<EditorSidebarTabTree
									elements={scoringTabElements}></EditorSidebarTabTree>
							</TabPanel>
							<TabPanel
								customCss={{ background: 'none' }}
								value={selectedTab}
								index={'Settings'}
								persistentIfVisited>
								<Stack
									sx={{ padding: '.5rem' }}
									spacing={2}>
									<Box>
										<Typography
											variant='h6'
											sx={{ margin: '0.5rem 0' }}>
											Beam
										</Typography>
										<PropertiesPanel
											editor={editor}
											boxProps={{
												sx: { marginTop: '.5rem', overflowY: 'auto' }
											}}
										/>
									</Box>
									<Divider light />
									<Box>
										<Typography
											variant='h6'
											sx={{ margin: '0.5rem 0' }}>
											Physics
										</Typography>
										<PhysicConfiguration
											editor={editor}
											object={editor.physic}
										/>
									</Box>
									<Divider light />
									<Box>
										<Typography
											variant='h6'
											sx={{ margin: '0.5rem 0' }}>
											Special Components
										</Typography>
										<BeamModifiersConfiguration editor={editor} />
									</Box>
								</Stack>
							</TabPanel>

							{selectedTab !== 'Settings' && (
								<PropertiesPanel
									editor={editor}
									boxProps={{
										sx: {
											marginTop: '1rem',
											padding: '0 .5rem',
											overflowY: 'auto'
										}
									}}
								/>
							)}
						</div>
					);
				}}
			</ScrollPositionManager>
		</>
	);
}

import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import TokenIcon from '@mui/icons-material/Token';
import { AppBar, Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';

import ScrollPositionManager from '../../../libs/ScrollPositionManager';
import { useSignal } from '../../../util/hooks/signals';
import { getAddElementButtonProps } from '../../../util/Ui/CommandButtonProps';
import { TabPanel } from '../../../WrapperApp/components/Panels/TabPanel';
import { Context } from '../../js/EditorContext';
import { YaptideEditor } from '../../js/YaptideEditor';
import { PhysicConfiguration } from './properties/category/PhysicConfiguration';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { SidebarTree } from './SidebarTree/SidebarTree';
import { EditorSidebarTabTree } from './tabs/EditorSidebarTabTree';

export function EditorSidebar(props: { editor: YaptideEditor }) {
	const { editor } = props;

	const [btnProps, setBtnProps] = useState(getAddElementButtonProps(editor));

	const handleObjectUpdate = useCallback(
		(o: Object3D) => {
			setBtnProps(getAddElementButtonProps(editor));
		},
		[editor]
	);

	useSignal(editor, ['objectSelected', 'objectAdded', 'objectRemoved'], handleObjectUpdate);

	const [selectedTab, setSelectedTab] = useState<Capitalize<Context>>('Geometry');

	const handleChange = (_event: SyntheticEvent, newValue: string) => {
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
			add: btnProps['Figures'],
			tree: (
				<SidebarTree
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
					<SidebarTree
						editor={editor}
						sources={[editor.zoneManager.worldZone]}
						dragDisabled
					/>
					<Divider sx={{ marginBottom: t => t.spacing(1) }} />
					<SidebarTree
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
				<SidebarTree
					editor={editor}
					sources={[editor.detectorManager.detectorContainer]}
				/>
			)
		},
		{
			title: 'Special Components',
			add: btnProps['Special Components'],
			tree: (
				<>
					{editor.specialComponentsManager.CTCubeContainer.children.length > 0 ? (
						<>
							<SidebarTree
								editor={editor}
								sources={[editor.specialComponentsManager.CTCubeContainer]}
								dragDisabled
							/>

							<Divider sx={{ marginBottom: t => t.spacing(1) }} />
						</>
					) : undefined}
					<SidebarTree
						editor={editor}
						sources={[editor.specialComponentsManager.beamModulatorContainer]}
						dragDisabled
					/>
				</>
			)
		}
	];

	const scoringTabElements = [
		{
			title: 'Filters',
			add: btnProps['Filters'],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.scoringManager.filterContainer]}
				/>
			)
		},
		{
			title: 'Outputs',
			add: btnProps['Outputs'],
			tree: (
				<SidebarTree
					editor={editor}
					sources={[editor.scoringManager.outputContainer]}
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
						<>
							<div
								style={{
									position: 'relative',
									height: 'fit-content'
								}}>
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
							</div>
							<div
								style={{
									overflow: 'auto',
									position: 'relative',
									height: '100%'
								}}
								ref={(node: HTMLDivElement) => connectScrollTarget(node)}>
								{selectedTab !== 'Settings' ? (
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
								) : (
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
									</Stack>
								)}
							</div>
						</>
					);
				}}
			</ScrollPositionManager>
		</>
	);
}

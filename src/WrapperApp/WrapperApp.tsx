import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SyntheticEvent, useEffect, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { useAuth } from '../services/AuthService';
import { useStore } from '../services/StoreService';
import { EditorToolbar } from '../ThreeEditor/components/Editor/EditorToolbar';
import SceneEditor from '../ThreeEditor/components/Editor/SceneEditor';
import { EditorSidebar } from '../ThreeEditor/components/Sidebar/EditorSidebar';
import { SimulationFetchSource, SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import { FullSimulationData } from '../types/SimulationService';
import { camelCaseToNormalText } from '../util/camelCaseToSentenceCase';
import HeaderPanel from './components/Header/HeaderPanel';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import LoginPanel from './components/Login/LoginPanel';
import { NavDrawerContext } from './components/NavPanel/NavDrawerContext';
import NavPanel from './components/NavPanel/NavPanel';
import { AboutPanel } from './components/Panels/AboutPanel';
import { ExamplePanel } from './components/Panels/ExamplePanel';
import { TabPanel } from './components/Panels/TabPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import { Geant4DatasetsType } from './components/Simulation/Geant4DatasetDownload';
import RunSimulationPanel from './components/Simulation/RunSimulationPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';
import { useRunGeant4LocalWorkerSimulation } from './UseRunGeant4LocalWorkerSimulation';
import { useRunRemoteWorkerSimulation } from './UseRunRemoteWorkerSimulation';

const StyledAppGrid = styled(Box)(({ theme }) => ({
	background: theme.palette.background.default,
	display: 'grid',
	width: '100%',
	height: '100vh',
	gridTemplateColumns:
		'[drawer-start] 200px [drawer-end content-start] 1fr [content-end sidebar-start] 370px [sidebar-end]',
	gridTemplateRows: '[header-start] 52px [header-end content-start] auto [content-end]',
	gap: 8,
	padding: 8,
	boxSizing: 'border-box',
	// Na małych ekranach (telefony) kolumna szuflady nawigacji (drawer) znika z siatki,
	// ponieważ NavPanel jest tam renderowany jako overlay (MUI Drawer) zamiast zajmować
	// stałe miejsce w layoucie. Dzięki temu treść (content) zaczyna się od lewej krawędzi.
	[theme.breakpoints.down('sm')]: {
		gridTemplateColumns:
			'[drawer-start drawer-end content-start] 1fr [content-end sidebar-start] 370px [sidebar-end]'
	}
}));

// Szerokość panelu nawigacji wyświetlanego jako overlay na urządzeniach mobilnych.
// Taka sama jak szerokość kolumny "drawer" używanej na desktopie (200px).
const MOBILE_NAV_DRAWER_WIDTH = 200;

function WrapperApp() {
	const { demoMode } = useConfig();
	const auth = useAuth();
	const { yaptideEditor, resultsSimulationData } = useStore();
	const [displayedSimulationData, setDisplayedSimulationData] = useState<
		FullSimulationData | undefined
	>();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = useState(true);
	const [tabsValue, setTabsValue] = useState('editor');

	// Wykrywanie urządzeń mobilnych (poniżej breakpointu 'sm') na podstawie motywu MUI.
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	// Stan kontrolujący widoczność overlayu NavPanel na urządzeniach mobilnych,
	// otwieranego przyciskiem hamburgera.
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const [
		simulationPanelPresentedSimulationsSource,
		setSimulationPanelPresentedSimulationsSource
	] = useState<SimulationFetchSource>('local');

	useEffect(() => {
		setSimulationPanelPresentedSimulationsSource(
			auth.isAuthorized && !demoMode ? 'remote' : 'local'
		);
	}, [auth, demoMode]);

	const [providedInputFiles, setProvidedInputFiles] = useState<SimulationInputFiles>();
	const [highlightRunForm, setHighLightRunForm] = useState(false);

	useEffect(() => {
		if (Object.keys(providedInputFiles ?? {}).length > 0) {
			setHighLightRunForm(true);
			const timeout = setTimeout(() => setHighLightRunForm(false), 2500);

			return () => {
				clearTimeout(timeout);
				setHighLightRunForm(false);
			};
		}
	}, [providedInputFiles]);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		if (newValue === 'login' && isAuthorized) logout();
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (!isAuthorized && !demoMode) setTabsValue('login');
		else setTabsValue('editor');
	}, [demoMode, isAuthorized]);

	useEffect(() => {
		if (
			tabsValue === 'simulations' || // simulations finishes when user has Simulations tab open
			resultsSimulationData?.source === 'onSelect' || // manually selected the results to display
			resultsSimulationData?.source === 'onLoad' // user loads different project
		) {
			setDisplayedSimulationData(resultsSimulationData?.data);

			if (resultsSimulationData?.source !== 'onLoad') {
				// when loading new project, we don't want to jump to results
				setTabsValue('results');
			}
		}
	}, [resultsSimulationData]);

	useEffect(() => {
		if (isAuthorized && tabsValue === 'login') setTabsValue('editor');
	}, [isAuthorized, tabsValue]);

	useEffect(() => {
		//The document.title is used by web browser to display a name on the browser tab.
		//There we would like to see the name extracted from a tabsValue, which can suggest user in which tab of our application is at the moment.
		//We want to make the text which be a title as a normal text, not camel case text, to make it similar to values of tabs user can see on navbar.
		document.title = camelCaseToNormalText(tabsValue); //e.g. we've got 'inputFiles' as a value of tabsValue and this function converts this value to 'Input Files'
	}, [tabsValue]);

	const runRemoteWorkerSimulation = useRunRemoteWorkerSimulation();
	const runGeant4LocalWorkerSimulation = useRunGeant4LocalWorkerSimulation();
	const runSimulation =
		yaptideEditor?.contextManager.currentSimulator === SimulatorType.GEANT4
			? runGeant4LocalWorkerSimulation
			: runRemoteWorkerSimulation;

	const [geant4DatasetType, setGeant4DatasetType] = useState<Geant4DatasetsType>(
		Geant4DatasetsType.FULL
	);

	// Wrapper na handleChange używany wewnątrz mobilnego overlayu nawigacji - po wybraniu
	// zakładki dodatkowo zamyka overlay, żeby nie zasłaniał zawartości.
	const handleMobileNavChange = (event: SyntheticEvent, newValue: string) => {
		handleChange(event, newValue);
		setMobileNavOpen(false);
	};

	return (
		<NavDrawerContext value={tabsValue}>
			<StyledAppGrid>
				{/* Przycisk hamburger widoczny tylko na urządzeniach mobilnych. NavPanel nie jest
				przypisany do żadnej konkretnej zakładki (widoczny zawsze), dlatego przycisk
				otwierający jego mobilny odpowiednik również musi być dostępny niezależnie od
				aktywnej zakładki - stąd pozycjonowanie "fixed" ponad całą siatką. */}
				{/* Przycisk chowa się całkowicie po otwarciu Drawer (zamiast np. tylko przygasać),
				żeby nie duplikować się wizualnie z zawartością wysuniętego panelu nawigacji. */}
				{isMobile && !mobileNavOpen && (
					<IconButton
						onClick={() => setMobileNavOpen(true)}
						aria-label='open navigation menu'
						size='large'
						sx={{
							'position': 'fixed',
							'top': 10,
							'left': 10,
							'zIndex': theme.zIndex.drawer + 1,
							'backgroundColor': 'background.paper',
							'boxShadow': 1,
							// Kwadratowy kształt z zaokrąglonymi rogami, taki sam promień
							// zaokrąglenia jak w NavPanelElement (theme.spacing(1)), zamiast
							// domyślnego okrągłego IconButton z MUI.
							'borderRadius': theme.spacing(1),
							'&:hover': {
								backgroundColor: theme.palette.action.hover
							}
						}}>
						<MenuIcon fontSize='large' />
					</IconButton>
				)}

				{/* NavPanel na desktopie - bez zmian, renderowany na stałe w kolumnie "drawer" siatki */}
				{!isMobile && (
					<TabPanel
						sx={{
							gridColumn: 'drawer-start / drawer-end',
							gridRow: 'header-start / content-end'
						}}>
						<NavPanel
							handleChange={handleChange}
							tabsValue={tabsValue}
							open={open}
							setOpen={setOpen}
						/>
					</TabPanel>
				)}

				{/* NavPanel na urządzeniach mobilnych - renderowany jako overlay (MUI Drawer)
				wysuwany od lewej strony ekranu, otwierany przyciskiem hamburgera powyżej.
				Zamyka się po kliknięciu poza jego obszarem (backdrop) lub po wybraniu zakładki. */}
				{isMobile && (
					<Drawer
						anchor='left'
						open={mobileNavOpen}
						onClose={() => setMobileNavOpen(false)}
						ModalProps={{ keepMounted: true }}
						// Stylizacja papieru Drawer dopasowana do wyglądu TabPanel (ten sam
						// border i elevation), żeby overlay wyglądał spójnie z resztą aplikacji.
						PaperProps={{
							elevation: 1,
							sx: {
								borderStyle: 'solid',
								borderWidth: 1,
								borderColor: 'divider'
							}
						}}>
						<Box sx={{ width: MOBILE_NAV_DRAWER_WIDTH, height: '100%' }}>
							<NavPanel
								handleChange={handleMobileNavChange}
								tabsValue={tabsValue}
								open={open}
								setOpen={setOpen}
							/>
						</Box>
					</Drawer>
				)}

				{/* Login screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['login']}>
					<LoginPanel />
				</TabPanel>
				{/* end Login screen */}

				{/* Examples screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['examples']}
					persistent>
					<ExamplePanel setTabsValue={setTabsValue} />
				</TabPanel>
				{/* end Examples screen*/}

				{/* Editor screen */}
				{/* Editor header */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / header-end'
					}}
					forTabs={['editor']}>
					<HeaderPanel handleTabChange={setTabsValue} />
				</TabPanel>

				{/* Editor content */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'content-start / content-end',
						position: 'relative'
					}}
					forTabs={['editor']}
					persistent>
					<SceneEditor focus={tabsValue === 'editor'} />
					<EditorToolbar
						editor={yaptideEditor}
						sx={{ position: 'absolute', top: 40, right: 10 }}
					/>
				</TabPanel>

				{/* Editor sidebar */}
				<TabPanel
					sx={{
						gridColumn: 'sidebar-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['editor']}>
					{yaptideEditor && <EditorSidebar editor={yaptideEditor} />}
				</TabPanel>
				{/* end Editor screen */}

				{/* Simulations screen */}
				{/* Content panel lists recent simulations */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['simulations']}>
					<SimulationPanel
						goToRun={(inputFiles?: SimulationInputFiles) => {
							setProvidedInputFiles(inputFiles);
						}}
						source={simulationPanelPresentedSimulationsSource}
						setSource={setSimulationPanelPresentedSimulationsSource}
					/>
				</TabPanel>

				{/* Simulations sidebar hosts a form to run the simulation and a list of running simulations */}
				{/* It's also visible in Results screen for quick access to interrupt and rerun the simulation */}
				<TabPanel
					sx={{
						gridColumn: 'sidebar-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['simulations', 'inputFiles', 'results']}>
					<RunSimulationPanel
						editorJson={yaptideEditor?.toSerialized()}
						inputFiles={providedInputFiles}
						highlight={highlightRunForm}
						clearInputFiles={() => setProvidedInputFiles(undefined)}
						runSimulation={runSimulation}
						setSource={setSimulationPanelPresentedSimulationsSource}
						geant4DatasetType={geant4DatasetType}
						setGeant4DatasetType={setGeant4DatasetType}
					/>
				</TabPanel>
				{/* end Simulations screen */}

				{/* Input files screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['inputFiles']}
					persistentIfVisited>
					<InputEditorPanel
						goToRun={(inputFiles?: SimulationInputFiles) => {
							setProvidedInputFiles(inputFiles);
						}}
					/>
				</TabPanel>
				{/* end Input files screen */}

				{/* Results screen */}

				{/* Content panel show the results of selected simulation */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['results']}
					persistent>
					<ResultsPanel simulation={displayedSimulationData} />
				</TabPanel>

				{/* Includes simulations sidebar to view running simulations, switch between partial results, or stop and rerun */}
				{/* end Results screen */}

				{/* About screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['about']}
					persistentIfVisited>
					<AboutPanel />
				</TabPanel>
				{/* end About screen */}
			</StyledAppGrid>
		</NavDrawerContext>
	);
}

export default WrapperApp;

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Box,
	Button,
	CircularProgress,
	ListItemButton,
	ListItemText,
	Popover,
	useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useDialog } from '../../../services/DialogService';
import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { useIsBackendAlive } from '../Simulation/SimulationsGrid/hooks/useBackendAliveEffect';

const SimulatorsDescriptions: Record<SimulatorType, { name: string; description: string }> = {
	common: {
		name: 'Common',
		description: 'Subset of options supported by ShieldHit and FLUKA'
	},
	shieldhit: {
		name: 'SHIELD-HIT12A',
		description: 'SHIELD-HIT12A instance running on PLGrid'
	},
	fluka: {
		name: 'FLUKA',
		description: 'FLUKA instance running on PLGrid'
	},
	geant4: {
		name: 'Geant4',
		description: 'Geant4 instance running locally within the browser'
	}
};

export interface SimulationControlsProps {
	handleTabChange: (tab: string) => void;
}

interface SimulationSelectItemProps {
	simulator: SimulatorType;
	onClick: () => void;
}

function SimulatorSelectItem({ simulator, onClick }: SimulationSelectItemProps) {
	return (
		<ListItemButton
			onClick={onClick}
			sx={{ '&:hover': { borderRadius: 1 } }}>
			<ListItemText
				primary={
					<Typography fontSize={14}>{SimulatorsDescriptions[simulator].name}</Typography>
				}
				secondary={
					<Typography fontSize={10}>
						{SimulatorsDescriptions[simulator].description}
					</Typography>
				}
			/>
		</ListItemButton>
	);
}

export default function SimulatorControls(props: SimulationControlsProps) {
	const { yaptideEditor, setSimulatorType } = useStore();
	const { demoMode } = useConfig();

	const isBackendAlive = useIsBackendAlive();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const { open: openSimulatorChangeDialog } = useDialog('simulatorChange');
	const theme = useTheme();

	const currentSimulator = yaptideEditor?.contextManager.currentSimulator;

	const changeSimulator = useCallback(
		(simulator: SimulatorType) => {
			const changinToOrFromGeant4 =
				yaptideEditor?.contextManager.currentSimulator === SimulatorType.GEANT4 ||
				simulator === SimulatorType.GEANT4;

			const modalText = changinToOrFromGeant4
				? 'Changing the simulator will clear the project. Are you sure you want to continue?'
				: "Changing to another simulator may result in data loss. It is only recommended to change from the 'Common' simulator to either 'Fluka' or 'Shieldhit'. Are you sure you want to continue?";

			if (currentSimulator === SimulatorType.COMMON && simulator !== SimulatorType.GEANT4) {
				setSimulatorType(simulator, changinToOrFromGeant4);
			} else {
				openSimulatorChangeDialog({
					text: modalText,
					closeAction() {},
					confirmAction() {
						setSimulatorType(simulator, changinToOrFromGeant4);
						setAnchorEl(null);
					}
				});
			}
		},
		[yaptideEditor, currentSimulator]
	);

	const simulatorReady = currentSimulator === SimulatorType.GEANT4 || isBackendAlive;

	return (
		<>
			<Typography
				color={simulatorReady ? 'primary' : theme.palette.grey['600']}
				sx={{ userSelect: 'none' }}>
				{simulatorReady
					? 'Connected'
					: demoMode
						? 'Unavailable in Demo Mode'
						: 'Unreachable'}
			</Typography>
			<Button
				sx={{
					height: '36px',
					width: '180px',
					marginLeft: 2
				}}
				size='large'
				onClick={event => setAnchorEl(event.currentTarget)}
				variant='contained'
				disableRipple>
				<ExpandMoreIcon />
				{yaptideEditor ? (
					<Typography
						textTransform='none'
						fontSize={14}
						sx={{ width: '100%' }}>
						{SimulatorsDescriptions[yaptideEditor.contextManager.currentSimulator].name}
					</Typography>
				) : (
					<CircularProgress
						size={16}
						sx={{ color: 'white', width: '100%' }}
					/>
				)}
			</Button>
			<Button
				variant='contained'
				disabled={!simulatorReady}
				onClick={() => props.handleTabChange('simulations')}
				disableRipple
				sx={{ ml: 1, height: '36px', width: '72px' }}>
				<Typography>Run</Typography>
			</Button>
			<Popover
				open={!!anchorEl}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}>
				<Box
					sx={{
						color: theme.palette.primary.contrastText,
						backgroundColor: theme.palette.primary.main,
						width: '240px',
						boxSizing: 'border-box',
						padding: 2
					}}>
					<SimulatorSelectItem
						simulator={SimulatorType.COMMON}
						onClick={() => {
							changeSimulator(SimulatorType.COMMON);
							setAnchorEl(null);
						}}
					/>
					<SimulatorSelectItem
						simulator={SimulatorType.SHIELDHIT}
						onClick={() => {
							changeSimulator(SimulatorType.SHIELDHIT);
							setAnchorEl(null);
						}}
					/>
					<SimulatorSelectItem
						simulator={SimulatorType.FLUKA}
						onClick={() => {
							changeSimulator(SimulatorType.FLUKA);
							setAnchorEl(null);
						}}
					/>
					<SimulatorSelectItem
						simulator={SimulatorType.GEANT4}
						onClick={() => {
							changeSimulator(SimulatorType.GEANT4);
							setAnchorEl(null);
						}}
					/>
				</Box>
			</Popover>
		</>
	);
}

import Block from '@mui/icons-material/Block';
import CloudOff from '@mui/icons-material/CloudOff';
import { AccordionDetails, AccordionSummary, Link, Typography, useTheme } from '@mui/material';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { SimulatorNames, SimulatorType } from '../../../types/RequestTypes';
import RecentSimulations from './RecentSimulations';
import { RunSimulationForm, RunSimulationFormProps } from './RunSimulationForm';

export default function RunSimulationPanel(props: RunSimulationFormProps) {
	const theme = useTheme();
	const { demoMode } = useConfig();
	const { yaptideEditor } = useStore();
	const { isAuthorized } = useAuth();

	const showRunForm =
		(!demoMode && isAuthorized) ||
		yaptideEditor?.contextManager.currentSimulator === SimulatorType.GEANT4;

	return showRunForm ? (
		<>
			<RunSimulationForm {...props} />
			<RecentSimulations />
		</>
	) : (
		<StyledAccordion
			expanded={true}
			sx={{ margin: theme.spacing(1), height: '100%' }}>
			<AccordionSummary>
				<Typography
					textTransform='none'
					fontSize={16}>
					Run new simulation
				</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: theme.spacing(1),
					minHeight: 600,
					padding: theme.spacing(2)
				}}>
				{demoMode && (
					<>
						<CloudOff
							color='disabled'
							sx={{ width: 48, height: 48 }}
						/>
						<Typography color='textDisabled'>Demo Mode</Typography>
						<Typography
							color='textDisabled'
							textAlign='center'>
							Running{' '}
							{yaptideEditor &&
								SimulatorNames.get(
									yaptideEditor.contextManager.currentSimulator
								)}{' '}
							is not possible in Demo Mode. For full version of the app, head to{' '}
							<Link
								color='secondary'
								underline='none'
								href={'https://yaptide.c3.plgrid.pl'}>
								yaptide.c3.plgrid.pl
							</Link>{' '}
							or follow{' '}
							<Link
								color='secondary'
								underline='none'
								href={'https://yaptide.github.io/for_developers/'}>
								installation steps
							</Link>{' '}
							to run it locally.
						</Typography>
						<Typography
							color='textDisabled'
							textAlign='center'>
							Note that you can still use Geant4.
						</Typography>
					</>
				)}
				{!demoMode && !isAuthorized && (
					<>
						<Block
							color='disabled'
							sx={{ width: 48, height: 48 }}
						/>
						<Typography color='textDisabled'>Login required</Typography>
						<Typography
							color='textDisabled'
							textAlign='center'>
							Running{' '}
							{yaptideEditor &&
								SimulatorNames.get(
									yaptideEditor.contextManager.currentSimulator
								)}{' '}
							requires login.
						</Typography>
					</>
				)}
			</AccordionDetails>
		</StyledAccordion>
	);
}

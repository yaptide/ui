import {
	Alert,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from '@mui/material';
import { useEffect } from 'react';

import { useSharedDatasetManager } from '../../../../services/Geant4DatasetContextProvider';
import {
	ConcreteDialogProps,
	CustomDialog
} from '../../../../ThreeEditor/components/Dialog/CustomDialog';

const datasetSummaries = [
	{
		name: 'G4EMLOW8.6.1',
		description:
			'Contains low-energy electromagnetic data used for accurate simulation of processes such as ionization, bremsstrahlung, and fluorescence for electrons, photons, and ions below 1 GeV.'
	},
	{
		name: 'G4ENSDFSTATE3.0',
		description:
			'Provides evaluated nuclear structure data (energy levels, half-lives, decay modes) derived from the ENSDF library for use in radioactive decay and photon evaporation simulations.'
	},
	{
		name: 'G4NDL4.7.1',
		description:
			'Neutron cross-section library for high-precision (HP) models, including data for elastic, inelastic, fission, and capture processes up to 20 MeV.'
	},
	{
		name: 'G4PARTICLEXS4.1',
		description:
			'Contains proton-, neutron-, pion-, and light-ion interaction cross sections used by the particle-level cross-section models for hadronic physics.'
	},
	{
		name: 'G4SAIDDATA2.0',
		description:
			'Data evaluated from the SAID database for proton, neutron, pion inelastic, elastic, and charge exchange cross sections of nucleons below 3 GeV'
	},
	{
		name: 'PhotonEvaporation6.1',
		description:
			'Data for photon emission and internal conversion following nuclear de-excitation, used by the photon evaporation model in radioactive decay and photo-nuclear processes.'
	}
];

export function DatasetsFullInfoDialog({ onClose }: ConcreteDialogProps) {
	const { datasetStatus, refresh } = useSharedDatasetManager();

	useEffect(() => {
		refresh();
	}, [refresh]);

	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='FULL Geant4 Datasets Info'
			contentText={`
                Downloading the FULL Geant4 datasets can significantly speed up simulations by providing local access to essential data files. 
                Data files will be stored in your browser's IndexedDB storage.`}
			body={
				<>
					<Alert
						severity='info'
						sx={{ mt: 1 }}>
						Simulation input data and results may be removed if you close the browser
						tab or restart your computer. In contrast, Geant4 datasets stored in your
						browser's cache (IndexedDB) are saved on your drive and persist across
						sessions.
					</Alert>
					<Alert
						severity='warning'
						sx={{ mt: 1 }}>
						If you clear your browser data (for example, using antivirus software or PC
						cleanup tools), you'll need to download these datasets again to ensure
						optimal simulation performance.
					</Alert>
					<TableContainer
						component={Paper}
						sx={{ mt: 1 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Cached</TableCell>
									<TableCell>Description</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{datasetSummaries.map(ds => (
									<TableRow
										key={ds.name}
										sx={{
											'&:nth-of-type(odd)': {
												backgroundColor: 'action.hover'
											},
											'&:last-child td, &:last-child th': { border: 0 },
											'verticalAlign': 'top'
										}}>
										<TableCell>{ds.name}</TableCell>
										<TableCell>
											{datasetStatus[ds.name]?.cached ? 'Yes' : 'No'}
										</TableCell>
										<TableCell>{ds.description}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			}>
			<Button
				onClick={() => {
					onClose();
				}}
				color='secondary'
				variant='contained'
				autoFocus>
				Close
			</Button>
		</CustomDialog>
	);
}

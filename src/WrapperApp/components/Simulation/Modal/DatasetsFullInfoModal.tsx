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
			'SAID-based cross-section data for pion-nucleon and nucleon-nucleon scattering, derived from the Scattering Analysis Interactive Dial-in (SAID) database.'
	},
	{
		name: 'G4PhotonEvaporation6.1',
		description:
			'Data for photon emission and internal conversion following nuclear de-excitation, used by the photon evaporation model in radioactive decay and photo-nuclear processes.'
	}
];

export function DatasetsFullInfoDialog({ onClose }: ConcreteDialogProps) {
	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='FULL Geant4 Datasets Info'
			contentText={`
                Downloading  FULLGeant4 datasets can significantly speed up simulations by providing local access to essential data files. 
                Data files will be stored in your browser's IndexedDB storage.
                Below is a summary of the datasets available for download:`}
			body={
				<>
					<Alert
						severity='info'
						sx={{ mt: 2 }}>
						Currently there is no indicator showing if you have already downloaded the
						datasets. Each time you start a new simulation with FULL datasets option,
						you have to press 'Start Download' button. If the datasets are already in
						your browser storage, the datasets will be loaded from cache.
					</Alert>
					<Alert
						severity='warning'
						sx={{ mt: 2 }}>
						Total size of downloaded datasets is about 2GB. Each time you clear your
						browser data, you will need to re-download these datasets for optimal
						simulation performance.
					</Alert>
					<TableContainer
						component={Paper}
						sx={{ mt: 2 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
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

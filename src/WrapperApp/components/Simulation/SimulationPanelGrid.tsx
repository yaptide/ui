import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { Box, Button, ButtonGroup, Grid, MenuItem, Pagination, Select } from '@mui/material';
import { InputFiles, OrderBy, OrderType } from '../../../services/RequestTypes';
import { JobStatusData } from '../../../services/ResponseTypes';
import { DEMO_MODE } from '../../../util/Config';
import SimulationStatus from './SimulationStatus';

export type SimulationPanelGridProps = {
	localSimulationData: JobStatusData[];
	simulationsStatusData: JobStatusData[];
	handleLoadResults: (id: string | null, simulation: JobStatusData) => void;
	handleShowInputFiles: (inputFiles?: InputFiles) => void;
	pageCount: number;
	page: number;
	pageSize: number;
	handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
	orderType: OrderType;
	orderBy: OrderBy;
	handleOrderChange: (orderType: OrderType, orderBy: OrderBy, pageSize: number) => void;
};

const reverseOrderType = (orderType: OrderType) => {
	return orderType === OrderType.ASCEND ? OrderType.DESCEND : OrderType.ASCEND;
};

export function SimulationPanelGrid(props: SimulationPanelGridProps) {
	const {
		localSimulationData,
		simulationsStatusData,
		handleLoadResults,
		handleShowInputFiles,
		pageCount,
		page,
		pageSize,
		handlePageChange,
		orderType,
		orderBy,
		handleOrderChange
	} = props;
	return (
		<>
			{!DEMO_MODE && (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 1
					}}>
					<ButtonGroup>
						<Button
							sx={{
								'&.MuiButton-root': {
									p: '.5rem',
									borderRadius: '4px 0 0 4px'
								},
								'& .MuiSvgIcon-root': {
									fontSize: '1rem'
								}
							}}
							onClick={() =>
								handleOrderChange(reverseOrderType(orderType), orderBy, pageSize)
							}>
							{orderType === OrderType.ASCEND ? (
								<KeyboardDoubleArrowDownIcon />
							) : (
								<KeyboardDoubleArrowUpIcon />
							)}
						</Button>
						<Select
							sx={{
								'&.MuiInputBase-root': {
									borderRadius: '0 4px 4px 0'
								},
								'& .MuiSelect-select': {
									fontSize: '1rem',
									p: '.5rem'
								}
							}}
							value={orderBy}
							onChange={e =>
								handleOrderChange(orderType, e.target.value as OrderBy, pageSize)
							}>
							<MenuItem value={OrderBy.START_TIME}>Start Time</MenuItem>
							<MenuItem value={OrderBy.END_TIME}>End Time</MenuItem>
						</Select>
					</ButtonGroup>
					<Select
						sx={{
							'&.MuiButton-root': {
								p: '.5rem'
							},
							'& .MuiSelect-select': {
								fontSize: '1rem',
								p: '.5rem'
							}
						}}
						value={pageSize}
						onChange={e =>
							handleOrderChange(orderType, orderBy, e.target.value as number)
						}>
						<MenuItem value={2}>2</MenuItem>
						<MenuItem value={4}>4</MenuItem>
						<MenuItem value={6}>6</MenuItem>
						<MenuItem value={8}>8</MenuItem>
						<MenuItem value={12}>12</MenuItem>
						<MenuItem value={16}>16</MenuItem>
						<MenuItem value={20}>20</MenuItem>
					</Select>
				</Box>
			)}
			<Grid
				container
				spacing={2}
				columns={{ md: 12, sm: 6, lg: 18 }}
				sx={{
					'flexGrow': 1,
					'alignContent': 'flex-start',
					'& .MuiGrid-item': {
						minHeight: '350px'
					}
				}}>
				<>
					{localSimulationData.map(simulation => (
						<Grid key={simulation.jobId} item xs={6}>
							<SimulationStatus
								simulation={simulation}
								loadResults={taskId => handleLoadResults(taskId, simulation)}
								showInputFiles={handleShowInputFiles}></SimulationStatus>
						</Grid>
					))}
					{simulationsStatusData.map((simulation, index) => (
						<Grid key={simulation.jobId} item xs={6}>
							<SimulationStatus
								simulation={simulation}
								loadResults={taskId => handleLoadResults(taskId, simulation)}
								showInputFiles={handleShowInputFiles}></SimulationStatus>
						</Grid>
					))}
				</>
			</Grid>
			{!DEMO_MODE && (
				<Pagination
					sx={{ display: 'flex', justifyContent: 'end', pb: 3 }}
					count={pageCount}
					page={page}
					onChange={handlePageChange}
				/>
			)}
		</>
	);
}

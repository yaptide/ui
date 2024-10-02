import { Button, Stack, Switch, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridValueGetter } from '@mui/x-data-grid';
import { ChangeEvent, useState } from 'react';

import { isCustomFilterJSON } from '../../../ThreeEditor/Simulation/Scoring/CustomFilter';
import { isParticleFilterJSON } from '../../../ThreeEditor/Simulation/Scoring/ParticleFilter';
import { convertToBestUnit } from '../../../util/convertUnits/Units';
import { pages0DToCsv } from '../../../util/csv/Csv';
import { saveString } from '../../../util/File';
import { EstimatorResults } from './ResultsPanel';

export interface TablePage0DItem {
	id: number;
	name: string;
	value: number;
	unit: string;
	filterName: string;
	filterRules: string;
}

const columns: GridColDef[] = [
	{ field: 'id', headerName: 'ID' },
	{ field: 'name', headerName: 'Name' },
	{ field: 'quantity', headerName: 'Quantity', flex: 1 },
	{
		field: 'value',
		headerName: 'Value',
		type: 'number',
		flex: 1,
		valueGetter: (value, row) => formatValue(row.value)
	},
	{ field: 'unit', headerName: 'Unit', width: 100 },
	{ field: 'filterName', headerName: 'Filter name', flex: 1 },
	{ field: 'filterRules', headerName: 'Filter rules', flex: 1 }
];

const formatValue = (value: number) => {
	const precision = 6;

	if (value >= 0.0001 && value <= 10000) return value.toPrecision(precision);
	else return value.toExponential(precision);
};

export default function TablePage0D(props: { estimator: EstimatorResults }) {
	const { estimator } = props;
	const { tablePages: pages } = estimator;

	const [isUnitFixed, setUnitFixed] = useState(false);

	const tablePages: TablePage0DItem[] = pages.map((page, idx) => {
		let convertedValue = isUnitFixed
			? null
			: convertToBestUnit(page.data.values[0], page.data.unit);

		let filterRules = '';

		if (isCustomFilterJSON(page.filterRef)) {
			filterRules =
				page.filterRef?.rules
					.map(rule => `${rule.keyword} ${rule.operator} ${rule.value}`)
					.join('; ') ?? '';
		} else if (isParticleFilterJSON(page.filterRef)) {
			filterRules = `${page.filterRef?.particle.name}`;
		}

		return {
			id: idx,
			name: page.name ?? '',
			quantity: page.data.name,
			value: convertedValue?.val ?? page.data.values[0],
			unit: convertedValue?.unit ?? page.data.unit,
			filterName: page.filterRef?.name ?? '',
			filterRules: filterRules
		};
	});

	const handleChangeUnitFixed = (event: ChangeEvent<HTMLInputElement>) => {
		setUnitFixed(event.target.checked);
	};

	const onClickSaveToFile = (pages: TablePage0DItem[]) => {
		saveString(pages0DToCsv(estimator, pages), `table_${estimator.name}.csv`);
	};

	return (
		<Box style={{ width: '100%', minHeight: '100px' }}>
			<Button
				color='secondary'
				sx={{ mt: '1rem', ml: '.5rem' }}
				onClick={() => onClickSaveToFile(tablePages)}>
				EXPORT TABLE TO CSV
			</Button>

			<Stack
				direction='row'
				spacing={1}
				alignItems='center'
				sx={{ marginLeft: '.5rem' }}>
				<Typography>Unit: Auto</Typography>
				<Switch
					checked={isUnitFixed}
					onChange={handleChangeUnitFixed}
					color='primary'
				/>
				<Typography>Fixed</Typography>
			</Stack>
			<DataGrid
				initialState={{ columns: { columnVisibilityModel: { id: false } } }}
				rows={tablePages}
				columns={columns}
				autoHeight
				getRowHeight={() => 'auto'}
				getEstimatedRowHeight={() => 200}
				sx={{
					'width': '100%',
					'& .MuiDataGrid-cell': {
						whiteSpace: 'normal !important',
						wordWrap: 'break-word !important'
					}
				}}
			/>
		</Box>
	);
}

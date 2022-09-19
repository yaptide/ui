import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
	{ field: 'value', headerName: 'Value', type: 'number', flex: 1 },
	{ field: 'unit', headerName: 'Unit', width: 100 },
	{ field: 'filterName', headerName: 'Filter name', flex: 1 },
	{ field: 'filterRules', headerName: 'Filter rules', flex: 1 }
];

export default function TablePage0D(props: { estimator: EstimatorResults }) {
	const { estimator } = props;
	const { tablePages: pages } = estimator;
	const tablePages: TablePage0DItem[] = pages.map((page, idx) => {
		return {
			id: idx,
			name: page.name ?? '',
			quantity: page.data.name,
			value: page.data.values[0],
			unit: page.data.unit,
			filterName: page.filterRef?.name ?? '',
			filterRules:
				page.filterRef?.rules
					.map(rule => `${rule.keyword} ${rule.operator} ${rule.value}`)
					.join('; ') ?? ''
		};
	});

	const onClickSaveToFile = (pages: TablePage0DItem[]) => {
		saveString(pages0DToCsv(estimator, pages), `table_${estimator.name}.csv`);
	};

	return (
		<Box style={{ width: '100%' }}>
			<Button sx={{ marginTop: '1rem' }} onClick={() => onClickSaveToFile(tablePages)}>
				EXPORT TABLE TO CSV
			</Button>

			<DataGrid
				initialState={{ columns: { columnVisibilityModel: { id: false } } }}
				rows={tablePages}
				columns={columns}
				autoHeight
				getRowHeight={() => 'auto'}
				getEstimatedRowHeight={() => 200}
				sx={{
					'& .MuiDataGrid-cell': {
						whiteSpace: 'normal !important',
						wordWrap: 'break-word !important'
					}
				}}
			/>
		</Box>
	);
}

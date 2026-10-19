import { render, screen } from '@testing-library/react';

import { Page2D } from '../../../../JsRoot/GraphData';
import { FullSimulationData } from '../../../../types/SimulationService';
import EstimatorTab from './EstimatorTab';

// the graphs themselves are not checked here
jest.mock('../../../../JsRoot/components/JsRootGraph0D', () => () => null);
jest.mock('../../../../JsRoot/components/JsRootGraph1D', () => () => null);
jest.mock('../../../../JsRoot/components/JsRootGraph2D', () => () => null);
jest.mock('../../../../JsRoot/components/JsRootMultiGraph1D', () => () => null);
jest.mock('../Results3D', () => () => null);
jest.mock('../ResultsTable', () => () => null);

const page = {
	dimensions: 2,
	name: 'Dose',
	metadata: { downsampled: { bins: [10000, 1, 10000], shown: [1000, 1, 1000] } }
} as unknown as Page2D;

describe('EstimatorTab', () => {
	it('tells a page is downsampled and links the full resolution results', () => {
		render(
			<EstimatorTab
				estimator={{
					name: 'XZ_map',
					pages: [page],
					gridPages: [page],
					tablePages: [],
					fullResolutionUrl: 'https://storage/XZ_map.bdo?signature=1'
				}}
				tabsValue={0}
				resultsGeneratedFromProjectFile={false}
				groupQuantities={false}
				simulation={{ jobId: 'job' } as FullSimulationData}
			/>
		);

		expect(screen.getByText('Shown at 1000 × 1000 of 10000 × 10000 bins')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Download full resolution' })).toHaveAttribute(
			'href',
			'https://storage/XZ_map.bdo?signature=1'
		);
	});
});

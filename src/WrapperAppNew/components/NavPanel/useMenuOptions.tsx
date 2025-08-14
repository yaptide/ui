import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import InfoIcon from '@mui/icons-material/Info';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { ReactElement, ReactNode } from 'react';

import { FullSimulationData } from '../../../services/ShSimulatorService';

export type MenuOption = {
	label: string;
	richLabel?: ReactNode;
	tooltipLabel?: string;
	description?: ReactNode;
	info?: ReactNode;
	value: string;
	disabled?: boolean;
	icon: ReactElement;
	separator?: boolean;
};

export function useMenuOptions(
	isAuthorized: boolean,
	resultsSimulationData: FullSimulationData | undefined,
	demoMode: boolean
) {
	// Order of elements in this list corresponds to their order in UI
	const menuOptions: MenuOption[] = [
		{
			label: 'Examples',
			tooltipLabel: 'Examples',
			value: 'examples',
			icon: <FolderSpecialIcon fontSize='large' />,
			separator: true
		},
		{
			label: 'Editor',
			tooltipLabel: 'Editor',
			value: 'editor',
			icon: <ViewInArIcon fontSize='large' />
		},
		{
			label: 'Input files',
			tooltipLabel: 'Input files',
			value: 'inputFiles',
			icon: <DescriptionIcon fontSize='large' />
		},
		{
			label: 'Results',
			tooltipLabel: 'Results',
			value: 'results',
			disabled: !resultsSimulationData,
			info: !resultsSimulationData ? 'There are no results to display.' : undefined,
			icon: <AutoGraphIcon fontSize='large' />
		},
		{
			label: 'About',
			tooltipLabel: 'About',
			value: 'about',
			icon: <InfoIcon fontSize='large' />
		}
	];

	// in regular mode (non-demo) insert at third position Simulation item
	// it has no use in demo mode, therefore was not added there earlier
	if (!demoMode) {
		menuOptions.splice(2, 0, {
			label: 'Simulations',
			tooltipLabel: 'Simulations',
			value: 'simulations',
			disabled: !isAuthorized,
			info: !isAuthorized ? 'You need to be logged in to use this feature.' : undefined,
			icon: <OndemandVideoIcon fontSize='large' />
		});
	}

	return menuOptions;
}

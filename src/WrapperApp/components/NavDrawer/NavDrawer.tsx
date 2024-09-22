import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import Menu from '@mui/icons-material/Menu';
import MenuOpen from '@mui/icons-material/MenuOpen';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { Box, FormControlLabel, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme } from '@mui/material/styles';
import { ReactElement, ReactNode, SyntheticEvent } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { NavDrawerList } from './NavDrawerList';

export type MenuOption = {
	label: string;
	richLabel?: ReactNode;
	tooltipLabel?: string;
	description?: ReactNode;
	info?: ReactNode;
	value: string;
	disabled?: boolean;
	icon: ReactElement;
};

type NavDrawerProps = {
	handleChange: (event: SyntheticEvent, value: string) => void;
	tabsValue: string;
	open: boolean;
	setOpen: (open: boolean) => void;
};

const openedMixin = (width: number, { transitions }: Theme): CSSObject => ({
	width,
	transition: transitions.create('width', {
		easing: transitions.easing.sharp,
		duration: transitions.duration.enteringScreen
	}),
	overflowX: 'hidden'
});

const closedMixin = ({ transitions, breakpoints, spacing }: Theme): CSSObject => ({
	transition: transitions.create('width', {
		easing: transitions.easing.sharp,
		duration: transitions.duration.leavingScreen
	}),
	overflowX: 'hidden',
	width: `calc(${spacing(7)} + 1px)`,
	[breakpoints.up('sm')]: {
		width: `calc(${spacing(8)} + 1px)`
	}
});

const DrawerHeader = styled('div')(({ theme }) => ({
	'display': 'flex',
	'alignItems': 'center',
	'justifyContent': 'flex-end',
	'padding': theme.spacing(0, 1),
	'marginRight': theme.spacing(0.5),
	'marginLeft': theme.spacing(2),
	'cursor': 'pointer',
	'&:hover .MuiIconButton-root': {
		backgroundColor: 'rgba(255, 255, 255, 0.08)'
	},
	// necessary for content to be below app bar
	...theme.mixins.toolbar
}));

const getDrawer = () =>
	styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(({ theme, open }) => ({
		width: theme.dimensions.navDrawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		boxSizing: 'border-box',
		...(open && {
			...openedMixin(theme.dimensions.navDrawerWidth, theme),
			'& .MuiDrawer-paper': openedMixin(theme.dimensions.navDrawerWidth, theme)
		}),
		...(!open && {
			...closedMixin(theme),
			'& .MuiDrawer-paper': closedMixin(theme)
		})
	}));

function NavDrawer({ handleChange, tabsValue, open, setOpen }: NavDrawerProps) {
	const { resultsSimulationData } = useStore();
	const { isAuthorized } = useAuth();

	const handleDrawerToggle = () => {
		setOpen(!open);
	};

	const Drawer = getDrawer();
	const { demoMode } = useConfig();

	// Order of elements in this list corresponds to their order in UI
	const menuOptions: MenuOption[] = [
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

	return (
		<Drawer
			variant='permanent'
			aria-label='Navigation drawer for the YAPTIDE application'
			aria-expanded={open ? 'true' : 'false'}
			open={open}>
			<Box
				sx={{
					position: 'sticky',
					top: 0,
					left: 0,
					background: ({ palette }) => palette.background.default,
					zIndex: ({ zIndex }) => zIndex.drawer
				}}>
				<DrawerHeader>
					<ListItemText
						primary={
							<FormControlLabel
								labelPlacement='start'
								sx={{
									margin: 0,
									display: 'flex',
									justifyContent: 'space-between'
								}}
								control={
									<IconButton
										aria-label={'Toggle drawer button'}
										onClick={handleDrawerToggle}>
										{open ? <Menu /> : <MenuOpen />}
									</IconButton>
								}
								label={
									<Typography
										sx={{
											opacity: open ? 1 : 0,
											fontSize: '1.5em',
											marginBlockStart: '0.67em',
											marginBlockEnd: '0.67em'
										}}>
										YAPTIDE
									</Typography>
								}
							/>
						}
					/>
				</DrawerHeader>
				<Divider />
			</Box>
			<NavDrawerList
				menuOptions={menuOptions}
				layout={open ? 'open' : 'closed'}
				handleChange={handleChange}
				tabsValue={tabsValue}
			/>
		</Drawer>
	);
}

export default NavDrawer;

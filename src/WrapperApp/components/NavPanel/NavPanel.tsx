import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GitHubIcon from '@mui/icons-material/GitHub';
import PersonIcon from '@mui/icons-material/Person';
import { Box, List, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { SyntheticEvent, useMemo } from 'react';

import { AuthContext, useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import deployInfo from '../../../util/identify/deployInfo.json';
import YaptideDark from './logos/Yaptide';
import YaptideLight from './logos/YaptideLight';
import NavPanelElement from './NavPanelElement';
import { useMenuOptions } from './useMenuOptions';

type NavPanelProps = {
	handleChange: (event: SyntheticEvent, value: string) => void;
	tabsValue: string;
	open: boolean;
	setOpen: (open: boolean) => void;
};

function Title() {
	const theme = useTheme();

	const Logo = theme.palette.mode === 'dark' ? YaptideDark : YaptideLight;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: theme.spacing(1)
			}}>
			<Logo
				width={54}
				height={54}
			/>
			<Typography sx={{ fontSize: 24, userSelect: 'none' }}>YAPTIDE</Typography>
		</Box>
	);
}

function LogInOut(props: {
	authContext: AuthContext;
	handleChange: (event: SyntheticEvent, value: string) => void;
}) {
	const { isAuthorized, user, logout } = props.authContext;

	const username = useMemo(
		() => (isAuthorized && user ? `Log out ${user.username}` : 'Log in'),
		[isAuthorized, user]
	);

	return (
		<List>
			<NavPanelElement
				menuOption={{
					label: username,
					richLabel: (
						<Typography
							component='div'
							sx={{
								marginRight: 1,
								textOverflow: 'ellipsis',
								overflow: 'hidden'
							}}>
							{isAuthorized && user ? (
								<Box>
									Log out{' '}
									<Box
										sx={{
											fontWeight: 'bold',
											overflowWrap: 'break-word',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
										{user.username}
									</Box>
								</Box>
							) : (
								'Log in'
							)}
						</Typography>
					),
					description: <Typography />,
					value: 'deployInfo',
					disabled: false,
					info: isAuthorized ? username : 'Log in',
					icon: <PersonIcon fontSize='large' />
				}}
				open={true}
				onClick={(event: SyntheticEvent<Element, Event>) => {
					if (isAuthorized) logout();
					else props.handleChange(event, 'login');
				}}
				buttonProps={{
					type: 'button'
				}}
			/>
		</List>
	);
}

export default function NavPanel(props: NavPanelProps) {
	const theme = useTheme();
	const { resultsSimulationData } = useStore();
	const auth = useAuth();
	const menuOptions = useMenuOptions(resultsSimulationData?.data);

	const { handleChange, tabsValue } = props;

	return (
		<Box
			aria-label='Navigation drawer for the YAPTIDE application'
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(1),
				width: '100%',
				height: '100%',
				boxSizing: 'border-box',
				padding: theme.spacing(1)
			}}>
			<Title />
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					flexGrow: 1
				}}>
				<LogInOut
					authContext={auth}
					handleChange={handleChange}
				/>
				<List>
					{menuOptions.map(menuOption => (
						<NavPanelElement
							key={menuOption.value}
							menuOption={menuOption}
							open={true}
							handleChange={props.handleChange}
							selected={menuOption.value === tabsValue}
						/>
					))}
				</List>
				<List>
					<NavPanelElement
						menuOption={{
							label: 'Documentation',
							tooltipLabel: 'Documentation',
							value: 'documentation',
							disabled: false,
							icon: <AutoStoriesIcon fontSize='large' />
						}}
						open={true}
						buttonProps={{
							href: 'https://yaptide.github.io/docs/',
							type: 'link'
						}}
					/>
					<NavPanelElement
						menuOption={{
							label: deployInfo.commit,
							value: 'deployInfo',
							disabled: false,
							info: (
								<>
									{`${deployInfo.date} ${deployInfo.commit}`}
									<br />
									{deployInfo.branch}
								</>
							),
							description: deployInfo.date,
							icon: <GitHubIcon fontSize='large' />
						}}
						open={true}
						buttonProps={{
							href: 'https://github.com/yaptide/ui/commit/' + deployInfo.commit,
							type: 'link'
						}}
					/>
				</List>
			</Box>
		</Box>
	);
}

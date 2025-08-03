import { Box } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { EditorToolbar } from '../../../ThreeEditor/componentsNew/Editor/EditorToolbar';
import { EditorMenu } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorMenu';
import { EditorTitleBar } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorTitlebar';
import { ProjectMenu } from './ProjectMenu';
import SimulatorSelect from './SimulatorSelect';

export default function HeaderPanel() {
	const { yaptideEditor } = useStore();

	return (
		<Box
			sx={{
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				flexGrow: 1,
				padding: 1
			}}>
			<Box sx={{ flexGrow: 1 }}>
				<ProjectMenu editor={yaptideEditor} />
				<EditorMenu editor={yaptideEditor} />
			</Box>
			<EditorTitleBar />
			<Box
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end'
				}}>
				<SimulatorSelect />
			</Box>
		</Box>
	);
}

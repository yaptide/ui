import { Box } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { EditorMenu } from '../../../ThreeEditor/components/Editor/Header/EditorMenu';
import { EditorTitleBar } from '../../../ThreeEditor/components/Editor/Header/EditorTitlebar';
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
			<Box sx={{ flexGrow: 1, flexBasis: 0 }}>
				<ProjectMenu editor={yaptideEditor} />
				<EditorMenu editor={yaptideEditor} />
			</Box>
			<EditorTitleBar sx={{ flexGrow: 1, flexBasis: 0 }} />
			<Box
				sx={{
					flexGrow: 1,
					flexBasis: 0,
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

import { Box, Button, LinearProgress, Typography } from '@mui/material';
import ky from 'ky';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../services/StoreService';
import { BACKEND_URL } from '../../util/Config';

interface SimulationPanelProps {
	onError?: (error: unknown) => void;
	onSuccess?: (result: unknown) => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { editorRef } = useStore();
	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const sendRequest = () => {
		setInProgress(true);
		ky.post(`${BACKEND_URL}/sh/demo`, {
			json: editorRef.current?.toJSON(),
			timeout: 30000
			/**
            Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
            If set to `false`, there will be no timeout.
            **/
		})
			.json()
			.then((response: unknown) => {
				console.log(response);
				props.onSuccess?.call(null, response);
			})
			.catch((error: unknown) => {
				console.error(error);
				props.onError?.call(null, error);
			})
			.finally(() => {
				setInProgress(false);
			});
	};

	useEffect(() => {
		let ignore = false;

		ky.get(`${BACKEND_URL}`)
			.json()
			.then((response: unknown) => {
				console.log(response);
				if (!ignore) setBackendAlive(true);
			})
			.catch((error: unknown) => {
				console.error(error);
				if (!ignore) setBackendAlive(false);
			});

		return () => {
			ignore = true;
		};
	}, []);

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(960px, 100%)',
				padding: '5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem'
			}}>
			<LinearProgress variant={isInProgress ? 'indeterminate' : 'determinate'} value={0} />
			<Button
				sx={{
					width: 'min(300px, 100%)',
					margin: '0 auto'
				}}
				onClick={sendRequest}>
				{isInProgress ? 'Stop' : 'Start'}
			</Button>
			<Typography>Backend status: {isBackendAlive ? 'alive' : 'dead'}</Typography>
		</Box>
	);
}

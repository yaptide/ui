import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { HTTPError } from 'ky';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../services/AuthService';
import { useStore } from '../../services/StoreService';
import { BACKEND_URL } from '../../util/Config';

interface SimulationPanelProps {
	onError?: (error: unknown) => void;
	onSuccess?: (result: unknown) => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { authKy } = useAuth();
	const { editorRef } = useStore();
	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const sendRequest = () => {
		setInProgress(true);
		authKy
			.post(`${BACKEND_URL}/sh/run`, {
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
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error?.response);
				props.onError?.call(null, error);
			})
			.finally(() => {
				setInProgress(false);
			});
	};

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		authKy
			.get(`${BACKEND_URL}`, { signal })
			.json()
			.then((response: unknown) => {
				console.log(response);
				setBackendAlive(true);
			})
			.catch((error: unknown) => {
				console.error(error);
				setBackendAlive(false);
			});

		return () => {
			controller.abort();
		};
	}, [authKy]);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		authKy
			.get(`${BACKEND_URL}`, { signal })
			.json()
			.then((response: unknown) => {
				console.log(response);
				setBackendAlive(true);
			})
			.catch((error: unknown) => {
				console.error(error);
				setBackendAlive(false);
			});

		return () => {
			controller.abort();
		};
	}, [authKy]);

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

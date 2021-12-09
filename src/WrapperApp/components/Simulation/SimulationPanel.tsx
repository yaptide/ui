import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	Typography
} from '@mui/material';
import { HTTPError } from 'ky';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { BACKEND_URL } from '../../../util/Config';
import SimulationStatus, { SimulationStatusData } from './SimulationStatus';

interface SimulationPanelProps {
	onError?: (error: unknown) => void;
	onSuccess?: (result: unknown) => void;
}

export interface IResponse {
	status: string;
	message: object;
}

export interface IRunResponse extends IResponse {
	message: {
		task_id: string;
	};
}
export interface IListResponse {
	message: {
		tasks_ids: string[];
	};
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { authKy } = useAuth();
	const { editorRef } = useStore();
	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const [simulationIDs, setSimulationIDs] = useState<string[]>([]);
	const [simulationsData, setSimulationsData] = useState<SimulationStatusData[]>([]);

	const sendRun = () => {
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
				const runResponse = response as IRunResponse;
				props.onSuccess?.call(null, response);
				getStatus(runResponse.message.task_id);
			})
			.catch((error: HTTPError) => {
				props.onError?.call(null, error);
			})
			.finally(() => {
				setInProgress(false);
			});
	};

	const getStatus = useCallback(
		(taskId: string, signal?: AbortSignal) => {
			return authKy
				.post(`${BACKEND_URL}/sh/status`, {
					signal,
					json: { task_id: taskId }
				})
				.json()
				.then((response: any) => {
					const data: SimulationStatusData = {
						uuid: taskId,
						status: response.state,
						message: response.status
					};
					return data;
				})
				.catch((error: HTTPError) =>
					error?.response?.json().then(value => {
						const data: SimulationStatusData = {
							uuid: taskId,
							status: value.state,
							message: value.status
						};
						return data;
					})
				);
		},
		[authKy]
	);

	const getSimulations = useCallback(() => {
		authKy
			.get(`${BACKEND_URL}/user/simulations`)
			.json()
			.then((response: unknown) => {
				const simulationList = (response as IListResponse).message.tasks_ids;
				setSimulationIDs(simulationList);
			})
			.catch((error: HTTPError) => {});
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
				getSimulations();
			})
			.catch((error: unknown) => {
				setBackendAlive(false);
			});

		return () => {
			controller.abort();
		};
	}, [authKy, getSimulations]);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const res = simulationIDs.map(uuid => getStatus(uuid, signal));

		Promise.all(res).then(values => {
			setSimulationsData([...values.filter(e => e)]);
		});

		return () => {
			controller.abort();
		};
	}, [authKy, getStatus, simulationIDs]);

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(960px, 100%)',
				padding: '5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				height: 'min-content'
			}}>
			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div'>
						Backend Status - {isBackendAlive ? 'ALIVE' : 'DEAD'}
					</Typography>
				</CardContent>
			</Card>

			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div'>
						Run Simulation
					</Typography>
					<LinearProgress
						variant={isInProgress ? 'indeterminate' : 'determinate'}
						value={0}
					/>
				</CardContent>
				<CardActions>
					<Button
						sx={{
							width: 'min(300px, 100%)',
							margin: '0 auto'
						}}
						onClick={sendRun}>
						{isInProgress ? 'Stop' : 'Start'}
					</Button>
				</CardActions>
			</Card>

			{simulationsData.map(simulation => (
				<SimulationStatus key={simulation.uuid} simulation={simulation}></SimulationStatus>
			))}
		</Box>
	);
}

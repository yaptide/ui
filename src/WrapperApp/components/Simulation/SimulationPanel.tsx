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
import useInterval from 'use-interval';
import { useAuth } from '../../../services/AuthService';
import { IResponseMsg } from '../../../services/ResponseTypes';
import { useStore } from '../../../services/StoreService';
import { BACKEND_URL } from '../../../util/Config';
import SimulationStatus, { SimulationStatusData } from './SimulationStatus';

interface SimulationPanelProps {
	onError?: (error: unknown) => void;
	onSuccess?: (result: unknown) => void;
}

interface ResShRun extends IResponseMsg {
	content: {
		task_id: string;
	};
}
interface ResUserSimulations extends IResponseMsg {
	content: {
		tasks_ids: string[];
	};
}

interface ResShStatusPending extends IResponseMsg {
	content: {
		state: 'PENDING';
	};
}

interface ResShStatusProgress extends IResponseMsg {
	content: {
		state: 'PROGRESS';
		info: {
			simulated_primaries: number;
			estimated?: {
				hours: number;
				minutes: number;
				seconds: number;
			};
		};
	};
}

interface ResShStatusFailure extends IResponseMsg {
	content: {
		state: 'FAILURE';
		error: string;
	};
}

interface ResShStatusCompleted extends IResponseMsg {
	content: {
		state: 'COMPLETED';
		result: object;
	};
}

type ResShStatus =
	| ResShStatusPending
	| ResShStatusProgress
	| ResShStatusFailure
	| ResShStatusCompleted;

export default function SimulationPanel(props: SimulationPanelProps) {
	const { authKy } = useAuth();
	const { editorRef } = useStore();
	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const [simulationIDs, setSimulationIDs] = useState<string[]>([]);
	const [simulationsData, setSimulationsData] = useState<SimulationStatusData[]>([]);

	const [simulationStatusInterval, setSimulationStatusInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

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
				const runResponse = response as ResShRun;
				props.onSuccess?.call(null, runResponse);
				setSimulationIDs(old => [runResponse.content.task_id, ...old]);
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
				.then((response: unknown) => {
					const { content } = response as ResShStatus;
					const data: SimulationStatusData = {
						uuid: taskId,
						status: content.state
					};
					switch (content.state) {
						case 'PENDING':
							break;
						case 'PROGRESS':
							data.counted = content.info.simulated_primaries;
							if (content.info.estimated) {
								const { hours, minutes, seconds } = content.info.estimated;
								data.estimatedTime =
									Date.now() + (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
							}
							break;
						case 'FAILURE':
							data.message = content.error;
							break;
					}

					return data;
				})
				.catch((error: HTTPError) => undefined);
		},
		[authKy]
	);

	const getSimulations = useCallback(() => {
		authKy
			.get(`${BACKEND_URL}/user/simulations`)
			.json()
			.then((response: unknown) => {
				const simulationList = (response as ResUserSimulations).content.tasks_ids;
				setSimulationIDs(simulationList);
			})
			.catch((_: HTTPError) => {});
	}, [authKy]);

	useEffect(() => {
		const { signal } = controller;

		authKy
			.get(`${BACKEND_URL}`, { signal })
			.json()
			.then((response: unknown) => {
				setBackendAlive(true);
				getSimulations();
			})
			.catch((error: unknown) => {
				setBackendAlive(false);
			});
	}, [authKy, controller, getSimulations]);

	const getSimulationsStatus = useCallback(
		(abortSignal?: AbortSignal) => {
			const res = simulationIDs.map(uuid => getStatus(uuid, abortSignal));

			return Promise.all(res).then(values => {
				if (values.includes(undefined)) getSimulations();

				return setSimulationsData(
					[...values.filter((e): e is SimulationStatusData => !!e)].reverse()
				);
			});
		},
		[getSimulations, getStatus, simulationIDs]
	);

	useEffect(() => {
		const { signal } = controller;

		getSimulationsStatus(signal).then(() => {
			setSimulationStatusInterval(5000);
		});

		return () => {
			controller.abort();
		};
	}, [controller, getSimulationsStatus, simulationIDs]);

	useInterval(
		() => {
			const { signal } = controller;
			getSimulationsStatus(signal);
		},
		simulationIDs.length > 0 ? simulationStatusInterval : null,
		true
	);

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

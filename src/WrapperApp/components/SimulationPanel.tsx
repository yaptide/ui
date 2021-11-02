import { Box, Button, LinearProgress } from '@mui/material';
import ky from 'ky';

import React, { useState } from "react";
import { useStore } from '../../services/StoreService';
import { BACKEND_URL } from '../../util/Config';

interface SimulationPanelProps {
    onError?: (error: unknown) => void;
    onSuccess?: (result: Object) => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
    const { editorRef } = useStore();
    const [isInProgress, setInProgress] = useState<boolean>(false);

    const sendRequest = () => {
        setInProgress(true);
        ky.post(`${BACKEND_URL}/sh/demo`, {
            json: editorRef.current?.toJSON(),
            timeout:13000    
            /**
            Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
            If set to `false`, there will be no timeout.
            **/
        })
            .json()
            .then((response:unknown) => {
                console.log(response);
                props.onSuccess?.call(null, response as Object);
            })
            .catch((error:unknown) => {
                props.onSuccess?.call(null, {error});
                console.log(error);
                props.onError?.call(null, error);
            }).finally(() => {
                setInProgress(false);
            });
    };

    return (
        <Box sx={{
            margin: "0 auto",
            width: "min(960px, 100%)",
            padding: "5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
        }}>
            <LinearProgress
                variant={
                    isInProgress ? 'indeterminate' : 'determinate'
                }
                value={0}
            />
            <Button
                sx={{
                    width: "min(300px, 100%)",
                    margin: "0 auto",
                }}
                onClick={sendRequest}

            >
                {isInProgress ? 'Stop' : 'Start'}
            </Button>
        </Box>
    );
}
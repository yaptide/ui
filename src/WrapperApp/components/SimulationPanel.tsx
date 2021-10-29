import { Box, Button, LinearProgress } from '@mui/material';
import React, { useState } from "react";

interface SimulationPanelProps {
    requestSimulation: () => void;
    onError: (error: unknown) => void;
    onSuccess: (result: unknown) => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
    const [isInProgress, setInProgress] = useState<boolean>(false);
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
                onClick={() => {
                    setInProgress((prev) => {
                        prev || props.requestSimulation();
                        return !prev
                    });
                }}
            >
                {isInProgress ? 'Stop' : 'Start'}
            </Button>
        </Box>
    );
}
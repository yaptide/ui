import { Grid, Tab, Tabs, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { SyntheticEvent, useState } from "react";
import JsRootGraph from "../../JsRoot/JsRootGraph";
import { TabPanel } from "./TabPanel";


interface ResultsPanelProps {
    data?: Object
}

const simulationData = (() => {
    const data = [];
    for (let index = 0; index < 5; index++) {
        const numberOfElements = Math.floor(Math.random() * 50) + 100;
        const obj = {
            uuid: index,
            name: `Scoring Mesh${index}`,
            graphs: Array(numberOfElements).fill(0).map((v, i) => {
                const rand = Math.round(Math.random() * numberOfElements) + 1;
                return { uuid: i, title: `Mesh${index} - Graph${i} - ${rand}`, value: rand }
            })
        }
        data.push(obj);
    }

    return data;
})();

const ResultsPanel = React.memo(function ResultsPanel(props: ResultsPanelProps) {
    const [tabsValue, setTabsValue] = useState<number>(simulationData[0].uuid);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100vw', width: '100%' }}>
            <Tabs sx={{ flexShrink: 0 }} orientation="vertical" variant="scrollable" value={tabsValue} onChange={handleChange} >
                {simulationData.map((meshResult) => {
                    return (<Tab key={meshResult.uuid} label={meshResult.name} value={meshResult.uuid} />);
                })}
            </Tabs>

            {simulationData.map((meshResult) => {
                return (
                    <TabPanel key={meshResult.uuid} value={tabsValue} index={meshResult.uuid} persistent >
                        <Grid key={meshResult.uuid} container spacing={1}>
                            {meshResult.graphs.map((graph) =>
                                <React.Fragment key={graph.uuid} >
                                    <Grid item xs={8}>
                                        <JsRootGraph data={graph} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography > Additional info:</Typography>
                                        <Typography > Title: {graph.title}</Typography>
                                    </Grid>
                                </React.Fragment>
                            )}
                        </Grid>
                    </TabPanel>
                );
            })}

        </Box>
    );
}, (prevProps, nextProps) => true);

export default ResultsPanel;
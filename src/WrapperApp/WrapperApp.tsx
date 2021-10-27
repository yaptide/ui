import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { SyntheticEvent, useState } from 'react';
import ThreeEditor from '../ThreeEditor/ThreeEditor';

import { css } from '@emotion/css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const tabPanelCss = css({ display: 'flex', flexGrow: 1 });

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      className={tabPanelCss}
      style={{ display: value !== index ? 'none' : '' }}
      {...other}
    >
      <Box className={tabPanelCss}>
        {children}
      </Box>
    </div>
  );
}


function WrapperApp() {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const demoMode = process.env.REACT_APP_TARGET === 'github';

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} >
          <Tab label="Editor" />
          <Tab label="Run" disabled={demoMode} />
          <Tab label="Results" disabled />
          <Tab label="Projects" disabled />
          <Tab label="Logout" disabled />
          <Tab label="About" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}  >
        <ThreeEditor></ThreeEditor>
      </TabPanel>
      {demoMode &&
        <TabPanel value={value} index={1}>
          Run Simulation
        </TabPanel>
      }
    </Box>
  );
}
export default WrapperApp;

import React, { useState } from "react";

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box } from '@mui/system';

import Extra from '../extra-component/extra';

import Logo from  '../../img/logo-fahrenheit-putih.png';

import '../../css/react-tabs.css';
import '../../css/adminlte.css';
import '../../css/custom.css';
import 'react-tabs/style/react-tabs.css';

export default function Home()
{
    const [value, setValue] = useState('1');
  
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
          <div align="center" style={{backgroundColor:"#085596"}}>
            <img src={Logo} alt="Logo" className="login-img-thumbnail"/>
          </div>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 0, borderColor: 'divider'}}>
              <TabList onChange={handleChange} aria-label="lab API tabs example">
    
                  <Tab label="Planning" value="1" />
                  <Tab label="Meeting" value="2" />
                  <Tab label="Extra" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1">Planning</TabPanel>
            <TabPanel value="2">Meeting</TabPanel>
            <TabPanel value="3"><Extra /></TabPanel>
          </TabContext>
          
        </>
      );
}
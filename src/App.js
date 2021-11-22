import React, { useEffect, useState } from 'react';

import { Box } from '@mui/system';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import './App.css';
import './css/adminlte.css';
import './css/custom.css';

import Logo from  './img/logo-fahrenheit-putih.png';

import Login from './component/login-component/login';
import Extra from './component/extra-component/extra';
import { getData } from './component/api-component/api';

function App() 
{
  const loadCurrentPosition = () =>
  {
    navigator.geolocation.getCurrentPosition(function(pos)
    {
      localStorage.setItem("lat",pos.coords.latitude);
      localStorage.setItem("long",pos.coords.longitude);

      getData("https://nominatim.openstreetmap.org/reverse","",{lat: pos.coords.latitude, lon: pos.coords.longitude, format: "jsonv2"})
      .then(response => localStorage.setItem("location", response.display_name))
      .catch(error => alert(error));

    }, function(error)
    {
      alert("Error Code : " + error.code + " , Error Message : " + error.message);
    });
  }

  useEffect(() => 
  {
    if("geolocation" in navigator)
    {
      loadCurrentPosition();
    }
    else
    {
      alert("Location Unavailable");
    }
  },[]);

  library.add(fas,far);

  const [value, setValue] = useState('1');
  
  const handleChange = (event, newValue) => {
      setValue(newValue);
  };

  var login = localStorage.getItem("userId");
  
  if(login === "" || login === null)
  {
    return (<Login />);
  }
  else
  {
    return(
    <>
      <div align="center" style={{backgroundColor:"#085596"}}>
        <img src={Logo} alt="Logo" className="login-img-thumbnail"/>
      </div>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 0, borderColor: 'divider'}}>
          <TabList onChange={handleChange} aria-label="CRS Tabs">

              <Tab label="Planning" value="1" />
              <Tab label="Meeting" value="2" />
              <Tab label="Extra" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">Planning</TabPanel>
        <TabPanel value="2">Meeting</TabPanel>
        <TabPanel value="3"><Extra /></TabPanel>
      </TabContext>
    </>);
  }
}

export default App;

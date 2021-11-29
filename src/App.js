import React, { useEffect } from 'react';
import { Outlet} from "react-router-dom";

import { ToastContainer } from 'react-toastify';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import './App.css';
import './css/adminlte.css';
import './css/custom.css';

import { Api } from './component/utilities/api';
import { LOCATION_SERVICES } from './config/config';

import AppsLogo from './component/utilities/logo';
import Login from './component/modules/login';
import NavTabs from './component/utilities/nav-tabs';

import AlertMessage from './component/utilities/alert-message';

function App() 
{
  const loadCurrentPosition = () =>
  {
    navigator.geolocation.getCurrentPosition(function(pos)
    {
      localStorage.setItem("lat",pos.coords.latitude);
      localStorage.setItem("long",pos.coords.longitude);

      Api(LOCATION_SERVICES).getApi("",{params :{lat: pos.coords.latitude, lon: pos.coords.longitude, format: "jsonv2"}})
      .then(response => localStorage.setItem("location", response.display_name))
      .catch(error => AlertMessage().showError(error));

    }, function(error)
    {
      AlertMessage().showError(error.message);
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

  var login = localStorage.getItem("userId");
  
  if(login === "" || login === null)
  {
    return (<Login />);
  }
  else
  {
    return(
    <>
      <AppsLogo />
      <NavTabs />
      <Outlet />
      <ToastContainer />
    </>);
  }
}

export default App;

import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import idbReady from 'safari-14-idb-fix';
import { openDB, deleteDB, wrap, unwrap } from 'idb';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

import './App.css';
import './css/adminlte.css';
import './css/custom.css';

import { Api } from './component/utilities/api';

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

      var tm = new Date().getUTCHours() + 7;
      if(tm > 24)
      {
        tm -= 24;
      }

      if(tm >= 6 && tm < 18)
      {
        Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-he-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
        .then(response => localStorage.setItem("location", response.data.items[0].title))
        .catch(error => AlertMessage().showError(error))
      }
      
      if(tm >= 18 && tm < 6)
      {
        Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
        .then(response => localStorage.setItem("location", response.data.features[0].properties.formatted))
        .catch(error => AlertMessage().showError(error))
      }

      // Api(NOMINATIM_SERVICES).getApi("",{params :{lat: pos.coords.latitude, lon: pos.coords.longitude, format: "jsonv2"}})
      // .then(response => localStorage.setItem("location", response.display_name))
      // .catch(error => AlertMessage().showError(error));

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
      alert("Geolocation Unavailable");
    }

    idbReady().then(() => 
    {
      // Safari has definitely figured out where IndexedDB is.
      // You can use IndexedDB as usual.      
      const openIdb =  window.indexedDB.open("CRSDB", 1);
      openIdb.onupgradeneeded = function(event)
      {
        var db = event.target.result;
        if(event.oldVersion === 0)
        {
          const doctorStore = db.createObjectStore('doctor', {keyPath : 'kdDokter'});
          const doctorIndex = doctorStore.createIndex('doctorNameIndex', 'doctorName');
          
          const planningStore = db.createObjectStore('planning', {keyPath : 'planningCode'});
          const planningIndex = planningStore.createIndex('dateIndex', 'createdDate');

          const meetingStore = db.createObjectStore('meeting', {keyPath : 'kdPlanning'});
          const meetingIndex = meetingStore.createIndex('dateIndex', 'createdDate');
        }
      }

      openIdb.onsuccess = function()
      {
        localStorage.setItem("openIdb", openIdb.result);
      }

      openIdb.onerror = function()
      {
        AlertMessage().showError(openIdb.error);        
      }
    });
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

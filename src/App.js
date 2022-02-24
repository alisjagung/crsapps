//React
import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";
//Idb
import idbReady from 'safari-14-idb-fix';
//Icon
import AppsLogo from './component/utilities/logo';
//Component
import { ToastContainer } from 'react-toastify';
//import moment from 'moment';
import 'moment-timezone';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { Api } from './component/utilities/api';
import Login from './component/modules/login';
import NavTabs from './component/utilities/nav-tabs';
import AlertMessage from './component/utilities/alert-message';
//CSS
import './App.css';
import './css/adminlte.css';
import './css/custom.css';

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
        .catch(error => AlertMessage().showError(error.response.data.message))
      }
      else
      {
        Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
        .then(response => localStorage.setItem("location", response.data.features[0].properties.formatted))
        .catch(error => AlertMessage().showError(error.response.data.message))
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
    // console.log(window.location);
    // console.log(window.location.hostname);
    // console.log(window.location.host);
    // console.log(window.location.origin);
    if("geolocation" in navigator)
    {
      loadCurrentPosition();
    }
    else
    {
      alert("Geolocation Unavailable");
    }

    // Comment - Launch Appreciation
    // idbReady().then(() => 
    // {
    //   //Safari has definitely figured out where IndexedDB is.
    //   //You can use IndexedDB as usual.      
      
    //   const openIdb =  window.indexedDB.open("CRSDB", 1);
    //   openIdb.onupgradeneeded = function(event)
    //   {
    //     var db = event.target.result;
    //     if(event.oldVersion === 0)
    //     {
    //       const doctorStore = db.createObjectStore('doctor', {keyPath : 'id', autoIncrement: true});
    //       const doctorCodeIndex = doctorStore.createIndex('doctorCodeIndex', 'kdDokter');
    //       const doctorIndex = doctorStore.createIndex('doctorNameIndex', 'doctorName');
          
    //       const planningStore = db.createObjectStore('planning', {keyPath : 'kdPlanning'});
    //       const planningIndex = planningStore.createIndex('dateIndex', 'createdDate');

    //       const meetingStore = db.createObjectStore('meeting', {keyPath : 'kdPlanning'});
    //       const meetingIndex = meetingStore.createIndex('dateIndex', 'createdDate');
    //       const meetingStatusPlanIndex = meetingStore.createIndex('statusPlanningIndex', 'statusPlanning');
    //     }
    //   }

    //   openIdb.onsuccess = function()
    //   {
    //     localStorage.setItem("openIdb", openIdb.result);
    //   }

    //   openIdb.onerror = function()
    //   {
    //     AlertMessage().showError(openIdb.error);        
    //   }
    // });
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

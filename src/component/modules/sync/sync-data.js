import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import idbReady from 'safari-14-idb-fix';

import {Button, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Api }  from '../../utilities/api';
import { MASTER_SERVICES } from '../../../config/config';
import AlertMessage from '../../utilities/alert-message';

export default function SyncData()
{
    const [insertProgress, setInsertProgress] = useState("Loading ...");
    const [deleteProgress, setDeleteProgress] = useState("Loading ...");
   
    function updateIDb(data)
    {
        idbReady().then(() =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction('doctor', 'readwrite');
                    const store = tx.objectStore('doctor');
                
                    //delete all data first
                    const clearIdb =  store.clear();
                    clearIdb.onsuccess = function()
                    {
                        setInterval(setDeleteProgress("Delete Current Data Completed"), 5000);
        
                        //add new data
                        const addIdb = data.map(function(item, index, arr) 
                        { 
                           const addData =  store.add(item);
                           addData.onerror = function(event)
                           {
                              var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                              AlertMessage().showError(errMessage);
                           }
                        });
                        
                    }
        
                    tx.oncomplete = function()
                    {
                        setInterval(setInsertProgress("Insert New Data Completed"), 5000);
                    }
                }
                catch(err)
                {
                    AlertMessage().showError(err.toString());
                }
                
            }

            openRequest.onerror = function()
            {
                AlertMessage().showError(openRequest.error.toString());
            }
        })
    }

    useEffect(()=>
    {        
        Api(MASTER_SERVICES + "dokter/load-dokter-by-ref").getApi("",{params: {refCode : localStorage.getItem("userRef"), startDataIndex : 0, perPage : 50000, filterBy : '', orderBy : 'kdReference', orderByDirection : 'asc'}})
        .then(response =>
        {
            if(response.isSuccess)
            {
                updateIDb(response.data);
            }
            else
            {
                AlertMessage().showError(response.message);
            }
            
        })
        .catch(error =>
        {
            AlertMessage().showError(error.message);
        });   
        
    },[]);

    return(
        <>
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="outlined" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            {/* Title */}
            <Typography variant="h6">SYNCHRONIZE</Typography>
            <br/>

            <Typography variant="body1">Doctor Data</Typography>
            <br />
            <p>Delete Current Record Data on Indexed DB : {deleteProgress}</p>
            <br />
            <p>Insert New Record Data on Indexed DB : {insertProgress}</p>

            <ToastContainer />
        </>
    );
}
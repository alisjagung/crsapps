//React
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//Material
import { Button, Box, Card, CardContent, Typography } from '@mui/material';
//Idb
import idbReady from 'safari-14-idb-fix';
//Icon
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
//Component
import { ToastContainer } from 'react-toastify';
import { Api }  from '../../utilities/api';
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
                        setInterval(setDeleteProgress("Completed"), 5000);
        
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
                        setInterval(setInsertProgress("Completed"), 5000);
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

    // Comment - Launch Appreciation
    useEffect(()=>
    {        
        // Api(process.env.REACT_APP_MASTER_SERVICES + "dokter/load-dokter-by-ref").getApi("",{params: {refCode : localStorage.getItem("userRef"), startDataIndex : 0, perPage : 50000, filterBy : '', orderBy : 'kdReference', orderByDirection : 'asc'}})
        // .then(response =>
        // {
        //     if(response.isSuccess)
        //     {
        //         updateIDb(response.data);
        //     }
        //     else
        //     {
        //         AlertMessage().showError(response.message);
        //     }
            
        // })
        // .catch(error =>
        // {
        //     AlertMessage().showError(error.response.data.message);
        // });   
        
    },[]);

    return(
        <>
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            {/* Title */}
            <Typography variant="h5">SYNCHRONIZE</Typography>
            <br/>

            <Typography variant="h6">Doctor Data</Typography>
            <br />

            <p style={{color: "#FF0000"}}><em>*please wait until all status become completed.</em></p>

            <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#000000', backgroundColor: '#bbdefb'}}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography variant="h6">Delete Current Record Data</Typography>
                    </CardContent>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography variant="h6" color="#FF0000"><strong>{deleteProgress}</strong></Typography>     
                    </CardContent>
                </Box>
            </Card>
            <br />

            <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#000000', backgroundColor: '#bbdefb'}}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography variant="h6">Insert New Record Data</Typography>
                    </CardContent>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography variant="h6" color="#FF0000"><strong>{insertProgress}</strong></Typography>     
                    </CardContent>
                </Box>
            </Card>

            <ToastContainer />
        </>
    );
}
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
import moment from 'moment';
import 'moment-timezone';
import { ToastContainer } from 'react-toastify';
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default function UploadData()
{
    const [insertProgress, setInsertProgress] = useState("Loading ...");

    //Update Data on DB
    function updatePlanningDataDB()
    {
        idbReady().then(() =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction('meeting', 'readwrite');
                    const store = tx.objectStore('meeting');
                    const statusPlanIndex = store.index('statusPlanningIndex');

                    //get meeting data with status planning = 'Realized'
                    const uploadReqIdb =  statusPlanIndex.getAll('Realized');
                    uploadReqIdb.onsuccess = function()
                    {
                        var arrRealizedData = uploadReqIdb.result;
                        var arrKdPlanning = [];
                        
                        arrRealizedData.map(item => 
                        {
                            item.statusUpload = 'Uploaded';
                            item.uploadedDate = moment().tz("Asia/Jakarta").format();
                            item.statusApproval = 'Waiting for Approval';
                            
                            var dataPlanning = {};
                            dataPlanning.kdUser = item.kdUser;
                            dataPlanning.kdPlanning = item.kdPlanning;
                            arrKdPlanning.push(dataPlanning);
                        });

                        //update data on database
                        var updateData = new FormData();
                        updateData.append("listPlanning", JSON.stringify(arrKdPlanning));

                        Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/update-planning-status").putApi(updateData, {})
                        .then(response => 
                        {
                            //console.log(response);
                            AlertMessage().showSuccess(response.data);
                            setInsertProgress("Completed");
                        })
                        .catch(error => 
                        {
                            if(error.response === undefined)
                            {
                                AlertMessage().showError(error.message);
                            }
                            else
                            {
                                AlertMessage().showError(error.response.data.message);
                            }                                        
                        })
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

    //Update Data on Idb
    function updatePlanningDataIdb()
    {
        idbReady().then(() =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction('meeting', 'readwrite');
                    const store = tx.objectStore('meeting');
                    const statusPlanIndex = store.index('statusPlanningIndex');

                    //get meeting data with status planning = 'Realized'
                    const uploadReqIdb =  statusPlanIndex.getAll('Realized');
                    uploadReqIdb.onsuccess = function()
                    {
                        var arrRealizedData = uploadReqIdb.result;
                        
                        arrRealizedData.map(item => 
                        {
                            item.statusUpload = 'Uploaded';
                            item.uploadedDate = moment().tz("Asia/Jakarta").format();
                            item.statusApproval = 'Waiting for Approval';
                        });
                        
                        for(var i = 0 ; i < arrRealizedData.length ; i++)
                        {             
                            const putData = store.put(arrRealizedData[i]);
                            putData.onerror = function(event)
                            {
                                var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                                AlertMessage().showError(errMessage);
                            }
                        }
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
        //updatePlanningDataDB();
        //updatePlanningDataIdb();
    },[]);

    return(
        <>
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            {/* Title */}
            <Typography variant="h5">UPLOAD REALIZED/FINALIZED PLANNING DATA</Typography>
            <br/>

            <Typography variant="h6">Planning Data</Typography>
            <br />

            <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#000000', backgroundColor: '#bbdefb'}}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography variant="h6">Upload Realized/Finalized Planning Data</Typography>
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
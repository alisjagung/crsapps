//React
import React, { useEffect, useState } from 'react';
//Material
import { AppBar, Box, Button, Card, CardContent, Dialog, Divider, Grid,
    IconButton, List, ListItem, Stack, Typography, Toolbar, TextField } from '@mui/material';
//Icon
import CloseIcon from '@mui/icons-material/Close';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CheckIcon from '@mui/icons-material/Check';
//Component
import moment from 'moment';
import 'moment-timezone';
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default function JoinVisit()
{
    //Data States
    const [joinVisitList, setJoinVisitList] = useState([]);
    const [detailDataObj, setDetailDataObj] = useState({});
    const [partnerLatitude, setPartnerLatitude] = useState('Loading...');
    const [partnerLongitude, setPartnerLongitude] = useState('Loading...');
    const [partnerAddress, setPartnerAddress] = useState('Loading...');

    //Dialog States
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    //Styles
    const style = {
        card : 
        {
            display: 'flex', justifyContent: 'space-between', 
            alignItems: 'stretch', color: '#1565c0', 
            backgroundColor: '#90caf9', width: '100%'
        },
        fabStyle : 
        {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
            zIndex: 1234 
        }
    };

    //Set Location
    const setLocation = () =>
    {
        navigator.geolocation.getCurrentPosition(function(pos) 
        {
            var tm = new Date().getUTCHours() + 7;
            if(tm > 24)
            {
                tm -= 24;
            }
        
            if(tm >= 6 && tm < 18)
            {
                Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-he-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                .then(response => 
                {
                    setPartnerLatitude(pos.coords.latitude);
                    setPartnerLongitude(pos.coords.longitude);
                    setPartnerAddress(response.data.items[0].title);
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
            else
            {
                Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                .then(response => 
                {
                    setPartnerLatitude(pos.coords.latitude);
                    setPartnerLongitude(pos.coords.longitude);
                    setPartnerAddress(response.data.features[0].properties.formatted);
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
        });            
    }

    //Load Pending Join Visit
    const LoadPendingJoinVisit = () =>
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "joinvisit/load-pending-join-visit-by-user-partner").getApi("",{params :{partnerUserCode: localStorage.getItem("userId")}})
        .then(response =>
        {
            if(response.data.length > 0)
            {
                setJoinVisitList(response.data);
            }
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

    //Show Detail Data
    const showDetailData = (item) =>
    {
        setLocation();
        setDetailDataObj(item);
        setShowDetailDialog(true);
    }

    //Update Join Visit Status on IDb
    const setJVMeetingDetailIDb = (kdPlanning, status) =>
    {
        const openRequest = indexedDB.open("CRSDB", 1);
        openRequest.onsuccess = function()
        {
            const openIdb = openRequest.result;
            try
            {
                const tx = openIdb.transaction("meeting", "readwrite");
                const store = tx.objectStore("meeting");
            
                var reqData = store.get(kdPlanning);
                reqData.onsuccess = function()
                {
                    if(reqData.result !== undefined)
                    {
                        var dt = reqData.result;

                        dt.joinVisitStatus = status;
                        dt.updatedBy = localStorage.getItem("userId");
                        dt.updatedDate = moment().tz('Asia/Jakarta').format();

                        var reqPutData = store.put(dt);
                        reqPutData.onsuccess = function()
                        {

                        }

                        reqPutData.onerror = function()
                        {
                            AlertMessage().showError(reqPutData.error.toString());
                        }
                    }
                }
            }
            catch(err)
            {
                AlertMessage().showError(err.toString());
            }
        };

        openRequest.onerror = function()
        {
            AlertMessage().showError(openRequest.error.toString());
        }
    }

    //Join Visit Approval
    const updateStatusApproval = (kdPlanning, status) =>
    {
        setJVMeetingDetailIDb(kdPlanning, status);
        
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "joinvisit/approval-join-visit").putApi("",{params: {kdPlanning : kdPlanning, partnerUserCode : localStorage.getItem("userId") , joinVisitStatus : status }})
        .then(response => 
        {   
            //console.log(response);
            if(response.isSuccess)
            {   
                setShowDetailDialog(false);

                var arrJoinVisitList = [...joinVisitList];
                var itemIndex = arrJoinVisitList.filter(w => w.kdPlanning == kdPlanning);
            
                arrJoinVisitList.splice(itemIndex, 1);
                setJoinVisitList(arrJoinVisitList);

                AlertMessage().showSuccess(status + " " + kdPlanning + " Success");
                //window.location.reload();
            }
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

    const approveJoinVisit = (kdPlanning) =>
    {
        var isValid = false;

        var creatorLat = detailDataObj.latitude.toFixed(4);
        var creatorLong = detailDataObj.longitude.toFixed(4);

        var partnerLat = parseFloat(partnerLatitude).toFixed(4);
        var partnerLong = parseFloat(partnerLongitude).toFixed(4);

        var diffLat = parseInt(Math.abs(Math.abs(creatorLat) - Math.abs(partnerLat)).toFixed(0));
        var diffLong = parseInt(Math.abs(Math.abs(creatorLong) - Math.abs(partnerLong)).toFixed(0));

        if(diffLat === 0 && diffLong === 0)
        {
            isValid = true;
            updateStatusApproval(kdPlanning, 'Approved');
        }
        else
        {
            AlertMessage().showError("Location Mismatch")
        }
        
    }

    const rejectJoinVisit = (kdPlanning) =>
    {
        updateStatusApproval(kdPlanning, 'Rejected');
    }

    
    useEffect(() => 
    {
        LoadPendingJoinVisit();
    }, []);
    
    
    return(
        <>
        <Typography variant="h5" style={{textAlign:"center"}}>JOIN VISIT LIST</Typography>
        <br/>
        
        {/* Join Visit Data List */}
        <List>
            {joinVisitList.map((item, index, arr) => 
            {
                return(
                        <div key={item.kdPlanning}>
                        <ListItem
                            key={item.kdPlanning}
                        >
                            <Card elevation={0} sx={style.card}>
                                <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="body2">{item.kdPlanning}</Typography>
                                        <Typography variant="h6"><strong>{item.namaDokter}</strong></Typography>
                                        <Typography variant="body1">[{item.spes}]</Typography> 
                                        <br/>      
                                        <Typography variant="body2"><em>{item.alamatDokter}</em></Typography>
                                    </CardContent>
                                </Box>
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="body2" color="#FF0000"><strong>Join Visit Status : {item.joinVisitStatus}</strong></Typography>     
                                    </CardContent>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Button variant="contained" onClick={() => showDetailData(item)} endIcon={<DoubleArrowIcon />}>Detail</Button>
                                    </CardContent>
                                </Box>
                            </Card> 
                                                    
                        </ListItem>                            
                        <Divider variant="middle" />                        
                        </div>                        
                    );
                })}
        </List>

        {/* Join Visit Detail Dialog Modal */}
        <Dialog open={showDetailDialog} fullScreen>                
            <AppBar sx={{position : 'relative'}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => setShowDetailDialog(false)}><CloseIcon /></IconButton>
                    &nbsp;&nbsp;
                    <Typography variant='h6'>Join Visit Detail Data</Typography>
                </Toolbar>
            </AppBar>
            <br/>

            <Stack direction='row'>
                <Grid item sm={2}>
                    <Button variant="contained" color="success" onClick={() => approveJoinVisit(detailDataObj.kdPlanning)} startIcon={<CheckIcon />}>Approve</Button>
                </Grid>   
                &nbsp;                              
                <Grid item sm={2}>
                    <Button variant="contained" color="error" onClick={() => rejectJoinVisit(detailDataObj.kdPlanning)} startIcon={<CloseIcon />}>Reject</Button>
                </Grid>  
            </Stack>
            <br/><br/>
            
            <p style={{color: "#0000FF", textDecoration: "underline"}}>Join Visit Status : {detailDataObj.joinVisitStatus}</p>
            <br/>
            
            <Stack direction="column" spacing={2}>
                <Grid item sm={12}>
                    <TextField label="User" value={detailDataObj.kdDokter + " - " + detailDataObj.namaDokter} fullWidth disabled />
                </Grid>  
                <Grid item sm={12}>
                    <TextField label="Meeting Location" value={detailDataObj.latitude + " , " + detailDataObj.longitude} fullWidth disabled />
                </Grid>  
                <Grid item sm={12}>
                    <TextField label="Meeting Address" multiline rows={5} value={detailDataObj.address === undefined ? "" : detailDataObj.address} fullWidth disabled />
                </Grid>    
                <Grid item sm={12}>
                    <TextField label="Your Location" value={partnerLatitude + " , " + partnerLongitude} fullWidth disabled />
                </Grid>  
                <Grid item sm={12}>
                    <TextField label="Your Address" multiline rows={5} value={partnerAddress} fullWidth disabled />
                </Grid>
            </Stack>
        </Dialog>        
        </>
    );
}
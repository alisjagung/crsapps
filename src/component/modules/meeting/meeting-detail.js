import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Link , useParams, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Checkbox, Card, CardContent, Fab, Dialog, Divider, Grid,
    IconButton, InputAdornment, List, ListItem, Stack, Typography, Toolbar, TextField, Icon } from '@mui/material';

import moment from 'moment';
import idbReady from 'safari-14-idb-fix';
import SignaturePad from 'react-signature-pad-wrapper';
import Resizer from "react-image-file-resizer";

import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera  from '@mui/icons-material/PhotoCamera';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { Api }  from '../../utilities/api';
import BackdropLoader  from '../../utilities/backdrop-loader';
import AlertMessage from '../../utilities/alert-message';

export default function MeetingDetail(props)
{
    //Data States
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [doctorNote, setDoctorNote] = useState('');
    const [meetingDetail, setMeetingDetail] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [doctorSign, setDoctorSign] = useState('');
    const [meetingDetailObj, setMeetingDetailObj] = useState({});

    //Sign Dialog States
    const [showSignatureDialog, setShowSignatureDialog] = useState(false);

    //Ref
    const signPadRef = useRef(SignaturePad);
    const openLoaderButtonRef = useRef(null);
    const hideLoaderButtonRef = useRef(null);
    const loaderRef = useRef(null);

    //Set Fab location
    const fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
        zIndex: 1234 
    };

    //Params Id from URL to Load Detail
    var urlParams = useParams();
    var id = urlParams.id;
        
    //Update Doctor Note Data
    const onDoctorNoteChange = (e) =>
    {
        setDoctorNote(e.target.value);
    }

    //Update Meeting Detail Data
    const onMeetingDetailChange = (e) =>
    {
        setMeetingDetail(e.target.value);
    }

    //Toggle Open Signature Dialog
    const onSignatureOpen = () =>
    {
        setShowSignatureDialog(true);
    }

    //Toggle Close Signature Dialog
    const onSignatureClose = () =>
    {
        setShowSignatureDialog(false);
    }

    //Clear Signature
    const handleClearSign = () =>
    {
        signPadRef.current.instance.clear();
    }

    //Save Signature
    const handleSaveSign = () =>
    {
        var signData = signPadRef.current.toDataURL();
        setDoctorSign(signData);
    }

    //Selfie
    const onSelfieChange = (e) =>
    {
        var img = e.target.files[0];
        setCompress(img);
    }

    //Compress Image
    const setCompress = (params) =>
    {
        Resizer.imageFileResizer(
            params,
            640,
            480,
            "JPEG",
            80,
            0,
            (uri) => 
            {
                setUserPhoto(uri);
            },
            "base64",
            640,
            480
            );
    }

    //Go to Up
    const onButtonUpClick = () =>
    {
        window.scrollTo(0, 0);
    }

    //Load Meeting Data from IDb
    const LoadMeetingDetailIDb = () =>
    {
        const openRequest = indexedDB.open("CRSDB", 1);
        openRequest.onsuccess = function()
        {
            const openIdb = openRequest.result;
            try
            {
                const tx = openIdb.transaction("meeting", "readonly");
                const store = tx.objectStore("meeting");
            
                var reqData = store.get(id);
                reqData.onsuccess = function()
                {
                    if(reqData.result !== undefined)
                    {
                        setLocation();
                        setDoctorNote(reqData.result.doctorNote);
                        setMeetingDetail(reqData.result.meetingDetail);
                        setUserPhoto(reqData.result.userPhoto);
                        setDoctorSign(reqData.result.doctorSign);
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
                        setLatitude(pos.coords.latitude);
                        setLongitude(pos.coords.longitude);
                        setAddress(response.data.items[0].title);
                    })
                .catch(error => AlertMessage().showError(error))
            }
            else
            {
                Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                .then(response => 
                    {
                        setLatitude(pos.coords.latitude);
                        setLongitude(pos.coords.longitude);
                        setAddress(response.data.features[0].properties.formatted);
                    })
                .catch(error => AlertMessage().showError(error))
            }                              
        });            
    }

    //Finalize Meeting
    const finalizeMeeting = () =>
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
                   
                    var reqData = store.get(id);
                    reqData.onsuccess = function()
                    {
                        if(reqData.result !== undefined)
                        {
                            var meetingDetailObj = reqData.result;

                            meetingDetailObj.latitude = latitude;
                            meetingDetailObj.longitude = longitude;
                            meetingDetailObj.address = address;
                            meetingDetailObj.doctorNote = doctorNote;
                            meetingDetailObj.meetingDetail = meetingDetail;
                            meetingDetailObj.userPhoto = userPhoto;
                            meetingDetailObj.doctorSign = doctorSign;
                            meetingDetailObj.statusPlanning = "Realized";
                            meetingDetailObj.dateRealization = moment(new Date()).format("YYYY-MM-DD HH:MM:SS");
                            
                            const putData = store.put(meetingDetailObj);
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

    useLayoutEffect(() => 
    {
        openLoaderButtonRef.current.click();
        LoadMeetingDetailIDb();
        hideLoaderButtonRef.current.click();
    }, []);

    return(
        <>
            {/* Go to Up Button */}
            <Fab size="medium" color="primary" aria-label="up" style={fabStyle} onClick={onButtonUpClick}>
                <KeyboardArrowUpIcon />
            </Fab>

            {/* Loader Manipulation Component */}
            <Button hidden={true} ref={openLoaderButtonRef} onClick={() => loaderRef.current.setHidden(false)}>Show Loader</Button>
            <Button hidden={true} ref={hideLoaderButtonRef} onClick={() => loaderRef.current.setHidden(true)}>Hide Loader</Button>
            <BackdropLoader ref={loaderRef} />

            {/* Navigation, Action Button */}
            <Link to="/meeting"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;

            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={finalizeMeeting}>
                Finalize
            </Button>&nbsp;&nbsp;&nbsp;

            <hr />

            <Typography variant="h5">MEETING DETAIL</Typography>
            <br/>

            {/* Form Data */}
            <Stack direction='column' spacing={2}>
                <Grid item sm={12}>
                    <TextField label="Location" value={latitude + " , " + longitude} fullWidth disabled />
                </Grid>  
                <Grid item sm={12}>
                    <TextField label="Address" multiline rows={5} value={address} fullWidth disabled />
                </Grid>    
                <Grid item sm={12}>
                    <TextField label="Doctor's Note" multiline rows={5} value={doctorNote} onChange={onDoctorNoteChange} fullWidth />
                </Grid>                     
                <Grid item sm={12}>
                    <TextField label="Meeting Detail" multiline rows={5} value={meetingDetail} onChange={onMeetingDetailChange} fullWidth />
                </Grid>
                <Grid item sm={12}>
                    <input 
                        accept="image/*"
                        id="icon-button-file"
                        type="file"
                        capture="environment"
                        onChange={onSelfieChange}
                        style={{display:"none"}}
                        fullWidth
                    />
                </Grid>
                <Grid item sm={12}>
                    <label htmlFor="icon-button-file">       
                        <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
                            Take Photo
                        </Button> 
                    </label>
                </Grid>
                <Grid item sm={12} hidden={userPhoto === undefined || userPhoto === "" || userPhoto === null ? true : false}>
                    <label>Photo Preview</label>
                    <Box>
                        <img src={userPhoto} alt="preview" style={{width: 240, height: 320}} />
                    </Box>
                </Grid>
                <Grid item sm={12}>
                    <Button variant="contained" component="span" startIcon={<BorderColorIcon />} onClick={onSignatureOpen}>
                        Take Signature
                    </Button> 
                </Grid>
                <Grid item sm={12} hidden={doctorSign === undefined || doctorSign === "" || doctorSign === null ? true : false}>
                    <label>Signature Preview</label>
                    <Box>
                        <img src={doctorSign} alt="preview" style={{width: 240, height: 320}} />
                    </Box>
                </Grid>
            </Stack>

        {/* Doctor Sign Dialog Modal */}
        <Dialog open={showSignatureDialog} onClose={onSignatureClose}>                
            <Grid container>
                <Grid item sm={12}>
                    <SignaturePad ref={signPadRef} redrawOnResize options={{backgroundColor: 'rgb(255, 255, 255)', penColor: 'rgb(0, 0, 255)'}} />
                </Grid>
                <Stack direction="row" spacing={1}>
                    <IconButton aria-label='clear' onClick={handleClearSign}><ReplayIcon /></IconButton>
                    <IconButton aria-label='save' onClick={() => handleSaveSign()}><SaveIcon /></IconButton>
                    <IconButton aria-label='close' onClick={onSignatureClose}><CloseIcon /></IconButton>
                </Stack>
            </Grid>
        </Dialog>                                 
     </>
    );
}
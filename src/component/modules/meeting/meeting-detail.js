//React
import React, { useLayoutEffect, useState, useRef } from 'react';
import { Link , useParams } from "react-router-dom";
//Material
import { AppBar, Box, Button, Card, CardContent, Fab, Dialog, Divider, FormControlLabel, Grid,
    IconButton, List, ListItem, Radio, RadioGroup,  Stack, Typography, Toolbar, TextField } from '@mui/material';
//Idb
import idbReady from 'safari-14-idb-fix';
//Icon
//import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera  from '@mui/icons-material/PhotoCamera';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
//Component
import moment from 'moment';
import SignaturePad from 'react-signature-pad-wrapper';
import Resizer from "react-image-file-resizer";
import { Api }  from '../../utilities/api';
import BackdropLoader  from '../../utilities/backdrop-loader';
import AlertMessage from '../../utilities/alert-message';

export default function MeetingDetail(props)
{
    //Data States
    const [detailObj, setDetailObj] = useState({});
    const [latitude, setLatitude] = useState('Loading...');
    const [longitude, setLongitude] = useState('Loading...');
    const [address, setAddress] = useState('Loading...');
    const [doctorNote, setDoctorNote] = useState('');
    const [meetingDetail, setMeetingDetail] = useState('');
    // const [userPhotoFile, setUserPhotoFile] = useState({});
    // const [doctorSignFile, setDoctorSignFile] = useState({});
    
    //Join Visit States
    const [joinVisitPartnerList, setJoinVisitPartnerList] = useState([]);
    const [joinVisitPartner, setJoinVisitPartner] = useState('');
    const [hideJoinVisitInfo, setHideJoinVisitInfo] = useState(true);
    const [joinVisitInfo, setJoinVisitInfo] = useState('');
    const [joinVisitInfoStatus, setJoinVisitInfoStatus] = useState('');

    //Loader State
    const [hideLoader, setHideLoader] = useState(true);  

    //Preview
    const [userPhoto, setUserPhoto] = useState('');
    const [doctorSign, setDoctorSign] = useState('');
    
    //Check Finalize States
    const [isFinalize, setIsFinalize] = useState(false);

    //Sign Dialog States
    const [showSignatureDialog, setShowSignatureDialog] = useState(false);

    //Join Visit Dialog States
    const [showJoinVisitDialog, setShowJoinVisitDialog] = useState(false);

    //Ref
    const signPadRef = useRef(SignaturePad);

    //Styles : Set Fab location
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

    //--- START UTILITIES RELATED ---//

     //Go to Up
     const onButtonUpClick = () =>
     {
         window.scrollTo(0, 0);
     }

    //Convert Base 64 to File
    const dataURLtoFile = (dataurl, filename) => 
    {
 
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = window.atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--)
        {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, {type:mime});
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
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                    setAddress(response.data.features[0].properties.formatted);
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

    //--- END UTILITIES RELATED ---//


    //--- START MEETING DETAIL DATA/IMAGES STATES RELATED ---//

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
        setShowSignatureDialog(false);
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

    //--- END MEETING DETAIL DATA STATES/IMAGES RELATED ---//

    //--- START JOIN VISIT RELATED ---//

    //Show Join Visit Dialog + Load Join Visit Partner List
    const loadJoinVisit = () =>
    {
        Api(process.env.REACT_APP_AUTH_SERVICES + "load-join-visit-partner").getApi("",{params :{userCode: localStorage.getItem("userId"), role: localStorage.getItem("userRole")}})
        .then(response =>
        {
            //console.log(response.data);
            if(response.data.length > 0)
            {
                var arrJoinVisit = response.data.filter(w => w.kdUser !== localStorage.getItem("userId"));
                setJoinVisitPartnerList(arrJoinVisit);
            }
        })
        .then(res =>
        {
            setShowJoinVisitDialog(true);
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

    const setJoinVisit = () =>
    {
        //update data on idb
        setJVMeetingDetailIDb();

        var joinVisitForm = new FormData();

        joinVisitForm.append("kdUser", localStorage.getItem("userId"));
        joinVisitForm.append("latitude", latitude);
        joinVisitForm.append("longitude", longitude);
        joinVisitForm.append("address", address);
        joinVisitForm.append("kdPlanning", id);
        joinVisitForm.append("isJoinVisit", true);
        joinVisitForm.append("joinVisitPartner", joinVisitPartner);
        joinVisitForm.append("joinVisitStatus","Pending");

        //update data on database
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "joinvisit/add-join-visit").postApi(joinVisitForm, {})
        .then(response => 
        {
            //console.log(response);
            AlertMessage().showSuccess(response.data);
            setShowJoinVisitDialog(false);
            setJoinVisitInfoStatus("Pending");
            setJoinVisitInfo("Join Visit Status : ");
            setHideJoinVisitInfo(false);
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

    //Update Meeting Data from IDb
    const setJVMeetingDetailIDb = () =>
    {
        const openRequest = indexedDB.open("CRSDB", 1);
        openRequest.onsuccess = function()
        {
            const openIdb = openRequest.result;
            try
            {
                const tx = openIdb.transaction("meeting", "readwrite");
                const store = tx.objectStore("meeting");
            
                var reqData = store.get(id);
                reqData.onsuccess = function()
                {
                    if(reqData.result !== undefined)
                    {
                        var dt = reqData.result;

                        dt.isJoinVisit = true;
                        dt.latitude = latitude;
                        dt.longitude = longitude;
                        dt.address = address;
                        dt.joinVisitPartner = joinVisitPartner;
                        dt.joinVisitStatus = "Pending";

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

    //--- END JOIN VISIT RELATED ---//

    //--- START MEETING DETAIL DATA RELATED ---//

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
                        if(reqData.result.isJoinVisit === false && reqData.result.statusPlanning !== "Realized")
                        {
                            setLocation();
                        }
                        
                        setDetailObj(reqData.result);
                        setLatitude(reqData.result.latitude);
                        setLongitude(reqData.result.longitude);
                        setAddress(reqData.result.address);
                        setDoctorNote(reqData.result.doctorNote);
                        setMeetingDetail(reqData.result.meetingDetail);
                        setUserPhoto(reqData.result.userPhotoBase64);
                        setDoctorSign(reqData.result.doctorSignBase64);
                        
                        if(reqData.result.isJoinVisit === true)
                        {
                            setJoinVisitInfoStatus(reqData.result.joinVisitStatus);
                            setJoinVisitInfo("Join Visit Status : ");
                            setHideJoinVisitInfo(false);
                        }

                        if(reqData.result.statusPlanning === "Realized")
                        {
                            setIsFinalize(true);
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

    //Data Validation
    const ValidateMeetingData = () =>
    {
        var valid = true;

        if(doctorNote === "" || doctorNote === undefined)
        {
            valid = false;
            AlertMessage().showError("Doctor Note Required");
        }

        if(meetingDetail === "" || meetingDetail === undefined)
        {
            valid = false;
            AlertMessage().showError("Meeting Details Required");
        }

        if(userPhoto === "" || userPhoto === undefined)
        {
            valid = false;
            AlertMessage().showError("User Photo / Selfie Required");
        }

        if(doctorSign === "" || doctorSign === undefined)
        {
            valid = false;
            AlertMessage().showError("Doctor Sign Required");
        }

        return valid;
    }

    //Finalize Data on Idb
    const updateMeetingIdb = () =>
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
                            meetingDetailObj.userPhotoBase64 = userPhoto;
                            meetingDetailObj.doctorSignBase64 = doctorSign;
                            meetingDetailObj.statusPlanning = "Realized";
                            meetingDetailObj.dateRealization = moment().tz("Asia/Jakarta").format();
                         
                            const putData = store.put(meetingDetailObj);

                            putData.onsuccess = function(event)
                            {
                                setIsFinalize(true);                                    
                            }
            
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

    //Finalize Data on Database
    const updateMeetingDB = (id) =>
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
                            meetingDetailObj.userPhotoBase64 = userPhoto;
                            meetingDetailObj.doctorSignBase64 = doctorSign;
                            meetingDetailObj.statusPlanning = "Realized";
                            meetingDetailObj.dateRealization = moment().tz("Asia/Jakarta").format();

                            meetingDetailObj.userPhotoFile = dataURLtoFile(userPhoto, "User Photo - " + reqData.result.kdPlanning + ".jpeg");
                            meetingDetailObj.doctorSignFile = dataURLtoFile(doctorSign, "Doctor Sign - " + reqData.result.kdPlanning + ".jpeg");
                    
                            var updateData = new FormData();
                                
                            for(var i in meetingDetailObj)
                            {
                                updateData.append(i, meetingDetailObj[i]);
                            }
                    
                            Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/update-planning").putApi(updateData, {headers: {'Content-Type':'multipart/form-data'}})
                            .then(response => 
                            {
                                //console.log(response);
                                if(response.isSuccess)
                                {
                                    updateMeetingIdb();
                                    AlertMessage().showSuccess(response.data);
                                }
                                else
                                {
                                    AlertMessage().showError(response.message);
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

    //Finalize Meeting
    const finalizeMeeting = () =>
    {
        var isValid = ValidateMeetingData();
        if(isValid)
        {
            updateMeetingDB(id);
        }
    }

    //--- END MEETING DETAIL DATA RELATED ---//

    useLayoutEffect(() => 
    {
        setHideLoader(false);
        LoadMeetingDetailIDb();
        setHideLoader(true);
    }, []);

    return(
        <>
            {/* Go to Up Button */}
            <Fab size="medium" color="primary" aria-label="up" style={fabStyle} onClick={onButtonUpClick}>
                <KeyboardArrowUpIcon />
            </Fab>

            {/* Loader Component */}
            <BackdropLoader hideLoader={hideLoader} />

            {/* Navigation, Action Button */}
            <Link to="/meeting"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;

            {/* disabled={isFinalize === true ? true : false} */}
            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={finalizeMeeting} disabled={isFinalize === true ? true : (hideJoinVisitInfo === true ? false : (joinVisitInfoStatus === "Approved" ? (detailObj.createdBy === localStorage.getItem("userId") ? false : true) : true))}>
                Finalize
            </Button>&nbsp;&nbsp;&nbsp;

            <Button variant="contained" color="primary" startIcon={<PeopleAltIcon />} onClick={loadJoinVisit} disabled={isFinalize === true ? true : (hideJoinVisitInfo === true ? false : true)}>
                Join Visit
            </Button>&nbsp;&nbsp;&nbsp;

            <hr />

            <Typography variant="h5">MEETING DETAIL</Typography>
            <br/>
            
            <p style={{color: "#0000FF", textDecoration: "underline"}} hidden={hideJoinVisitInfo}><strong>{joinVisitInfo} {joinVisitInfoStatus}</strong></p>

            {/* Form Data */}
            <Stack direction='column' spacing={2}>
                <Grid item sm={12}>
                    <TextField label="Location" value={latitude + " , " + longitude} fullWidth disabled />
                </Grid>  
                <Grid item sm={12}>
                    <TextField label="Address" multiline rows={5} value={address} fullWidth disabled />
                </Grid>    
                <Grid item sm={12}>
                    <TextField label="Doctor's Note" multiline rows={5} value={doctorNote} onChange={onDoctorNoteChange} fullWidth disabled={isFinalize === true ? true : false} />
                </Grid>                     
                <Grid item sm={12}>
                    <TextField label="Meeting Detail" multiline rows={5} value={meetingDetail} onChange={onMeetingDetailChange} fullWidth disabled={isFinalize === true ? true : false} />
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
                        <Button variant="contained" component="span" startIcon={<PhotoCamera />} disabled={(address === undefined || address === 'Loading...') ? true : (isFinalize === true ? true : false)}>
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
                    <Button variant="contained" component="span" startIcon={<BorderColorIcon />} onClick={onSignatureOpen} disabled={(address === undefined || address === 'Loading...') ? true : (isFinalize === true ? true : false)}>
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

        {/* Join Visit Partner Dialog Modal */}
        <Dialog open={showJoinVisitDialog} onClose={() => setShowJoinVisitDialog(false)}>                
            <AppBar sx={{position : 'relative'}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => setShowJoinVisitDialog(false)}><CloseIcon /></IconButton>
                    &nbsp;&nbsp;
                    <Typography variant='h6'>Join Visit Partner List</Typography>
                </Toolbar>
            </AppBar>
            <br/>
            <Box sx={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={setJoinVisit}>
                    Choose Join Visit Partner
                </Button>
            </Box>
            <br/>
            <List>
            <RadioGroup
                name="joinVisitRadioGroup"
                value={joinVisitPartner}
                onChange={(e) => setJoinVisitPartner(e.target.value)}
            >
            {joinVisitPartnerList.map(item => 
                {
                    return(
                        <div key={item.kdUser}>
                        <ListItem
                            key={item.kdUser}
                            secondaryAction={
                                <FormControlLabel value={item.kdUser} control={<Radio />} label="" />
                            }
                        >
                            <Card elevation={0} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#1976d2', shadows: 'none !important'}}>
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="h6"><strong>{item.kdUser} - {item.nameUser}</strong></Typography>
                                    </CardContent>
                                </Box>
                            </Card>                       
                        </ListItem>
                        <Divider variant="middle" /> 
                        </div>
                    );
                })}
            </RadioGroup> 
           </List>
        </Dialog>                                 
     </>
    );
}
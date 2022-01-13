import React, { useEffect, useRef, useState } from 'react';
import { Link , useParams, useNavigate } from "react-router-dom";

import { AppBar, Box, Button, Dialog,
        Grid, IconButton, MenuItem, Typography, Toolbar } from '@mui/material';
        
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import { PhotoCamera } from '@mui/icons-material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import InputAdornment from '@mui/material/InputAdornment';

import { ThemeProvider } from "@mui/styles";
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import MUIDataTable from "mui-datatables";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import moment from 'moment';
import Resizer from "react-image-file-resizer";
import watermarkjs from 'watermarkjs';

import { Api }  from '../../utilities/api';
import BackdropLoader  from '../../utilities/backdrop-loader';
import AlertMessage from '../../utilities/alert-message';

import './custom.css';

export default function Appreciation(params)
{  
    const openLoaderButtonRef = useRef(null);
    const hideLoaderButtonRef = useRef(null);
    const loaderRef = useRef(null);

    const [showCustCodeDialog, setShowCustCodeDialog] = useState(false);  

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [location, setLocation] = useState('');
    const [pic, setPic] = useState('');
    const [userCode, setUserCode] = useState('');
    const [userName, setUserName] = useState('');
    const [custCode, setCustCode] = useState('');
    const [custCodeList, setCustCodeList] = useState([]);
    const [dtTime, setDtTime] = useState('');
    const [notes, setNotes] = useState('');
    const [imageFile, setImageFile] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const [helperText, setHelperText] = useState('');

    const navigate = useNavigate();

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

    // Validation
    var valid = true;
    
    //Params Id from URL to Load Detail
    var urlParams = useParams();
    var id = urlParams.id;

    //Themes for MUI Datatable
    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    //MUI Datatable Options
    const custCodeDialogOptions = {
        download : false,
        filter : false,
        print : false,
        rowsPerPageOptions : [],
        serverSide : true,
        selectableRows : 'none',
        selectableRowsHeader : false,
        selectableRowsHideCheckboxes : true,
        sort : false,
        viewColumns : false,
        onRowClick : (rowData, rowMeta) => 
        { 
            setCustCode(rowData[0]);     
            setShowCustCodeDialog(false); 
        },
        onSearchChange : (searchText) =>
        {
            //Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : searchText, orderBy : 'KdDokter', orderByDirection : 'asc'}})
            Api(process.env.REACT_APP_MASTER_SERVICES + "dokter/load-dokter-by-ref").getApi("",{params: {refCode : localStorage.getItem("userRef"), startDataIndex : 0, perPage : 10, filterBy : searchText, orderBy : 'kdReference', orderByDirection : 'asc'}})
                .then(response =>
            {
                setCustCodeList(response.data);
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            });   
        },
    };

    useEffect(() => 
    {
        if (id !== undefined)
        {
            openLoaderButtonRef.current.click();

            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-id").getApi("",{params: {id : id}})
            .then(response =>
                {
                    if(response.data !== undefined)
                    {
                        setLatitude(response.data.latitude);
                        setLongitude(response.data.longitude);
                        setLocation(response.data.location);
                        setPic(response.data.picrole);
                        setUserCode(response.data.userCode);
                        setUserName(response.data.creatorName);
                        setCustCode(response.data.customerCode);
                        setDtTime(response.data.apprDate);
                        setNotes(response.data.apprInfo);
                        setImageFile(response.data.file);
                        setImagePreview(response.data.fileBase64);              
                        setHelperText('');     
                    }
                    else
                    {
                        AlertMessage().showError(response.message);
                    }
                    hideLoaderButtonRef.current.click();
                })
            .catch(error =>
                {
                    AlertMessage().showError(error.message);
                })   

                hideLoaderButtonRef.current.click();
        }
        else
        {
            openLoaderButtonRef.current.click();
            
            if(!checkLocation())
            {
                AlertMessage().showError("Location Undefined : Please Logout, Enable Location on Your Device, and Login Again");
            }

            navigator.geolocation.getCurrentPosition(function(pos) 
            {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
                
                var tm = new Date().getUTCHours() + 7;
                if(tm > 24)
                {
                  tm -= 24;
                }
          
                if(tm >= 6 && tm < 18)
                {
                  Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-he-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                  .then(response => setLocation(response.data.items[0].title))
                  .catch(error => AlertMessage().showError(error))
                }
                
                if(tm >= 18 && tm < 6)
                {
                  Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                  .then(response => setLocation(response.data.features[0].properties.formatted))
                  .catch(error => AlertMessage().showError(error))
                }                

            });
            
            //setLocation(localStorage.getItem("location"));
            setPic(localStorage.getItem("userRole"));
            setUserCode(localStorage.getItem("userId"));
            setUserName(localStorage.getItem("userDisplayName"));
            setCustCode('');
            setDtTime((moment(new Date().now).format("YYYY-MM-DD")));
            setNotes('');
            setImageFile('');
            setImagePreview('');
            setHelperText('*Mandatory Field');

            //Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : '', orderBy : 'KdDokter', orderByDirection : 'asc'}})
            Api(process.env.REACT_APP_MASTER_SERVICES + "dokter/load-dokter-by-ref").getApi("",{params: {refCode : localStorage.getItem("userRef"), startDataIndex : 0, perPage : 10, filterBy : '', orderBy : 'kdReference', orderByDirection : 'asc'}})
            .then(response =>
            {
                setCustCodeList(response.data);
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            });   

            hideLoaderButtonRef.current.click();
        }
    }, []);

    //Check if Location = null
    const checkLocation = () =>
    {
        var locationValid = true;
        
        if(localStorage.getItem("location") === "" || localStorage.getItem("location") === null || localStorage.getItem("location") === undefined)
        {
            locationValid = false;
        }

        return locationValid;
    }

    //Change Datetime
    const onDtChange = (newValue) =>
    {
        setDtTime(newValue);
    }

    //Calculate Font Size
    const getFontSize = (fileWidth) =>
    {
        var result =  Math.floor(fileWidth*0.017) + 'px Arial';
        return result;
    }

    //Add Watermark
    const setWatermark = (params) =>
    {
        return watermarkjs([params])
        .blob(function(file) 
        {
            var ctxRect = file.getContext('2d');
            ctxRect.save();
            ctxRect.fillStyle = "yellow";
            ctxRect.fillRect(0, file.height - (file.height/40), file.width, file.height - (file.height/20));
            ctxRect.restore();

            var ctxText = file.getContext('2d');
            ctxText.save();
            ctxText.font = getFontSize(file.width);
            ctxText.fillStyle = "black";

            var dt = new Date();
            var wmText = dt.getDate().toString() + "/" + (dt.getMonth() + 1).toString() + "/" + dt.getFullYear().toString() + " " + localStorage.getItem("location");
        
            ctxText.fillText(wmText, 0, file.height - (file.height/80));
            ctxText.restore();

            return file;
        })
    }

    //Compress Image
    const setCompress = (params) =>
    {
        var dt = new Date();
        var dtString = dt.getDate().toString() + "-" + (dt.getMonth() + 1).toString() + "-" + dt.getFullYear().toString() + "-" + dt.getHours().toString() + "-" + dt.getMinutes().toString() + "-" + dt.getSeconds().toString() + "-" + dt.getMilliseconds().toString();
        
        var objFile = new File([params], userCode + "-" + custCode + "-" + dtString + ".jpeg");
        Resizer.imageFileResizer(
            objFile,
            640,
            480,
            "JPEG",
            80,
            0,
            (uri) => 
            {
                setImagePreview(URL.createObjectURL(uri));
                setImageFile(uri);
                hideLoaderButtonRef.current.click();   
            },
            "file",
            640,
            480
            );
    }

    //Image Processing
    const onImageChange = (e) =>
    {
        var imgFile = e.target.files[0];
        if(imgFile)
        {
            openLoaderButtonRef.current.click(); 
            try 
            {
                setWatermark(imgFile)
                .then(imgBlob => 
                    {
                        setCompress(imgBlob);
                    })
                .catch(err => 
                    {
                        AlertMessage().showError(err);
                    });   
            } 
            catch (error) 
            {
                AlertMessage().showError(error);
            }
        }
    }

    //Toggle Open Dialog
    const onCustCodeClick = () =>
    {
       setShowCustCodeDialog(true);
    }

    //Toggle Close Dialog
    const onCustCodeDialogClose = () =>
    {
        setShowCustCodeDialog(false);
    }

    //Validate Data
    const validateData = () =>
    {
        var valid = true;

        if(checkLocation() === false)
        {
            valid = false;
            AlertMessage().showError("Location Undefined : Please Logout, Enable Location on Your Device, and Login Again");
            return;
        }

        if(pic === "" || pic === undefined)
        {
            valid = false;
            AlertMessage().showError("PIC Role Required");
            return;
        }

        if(notes === "" || notes === undefined)
        {
            valid = false;
            AlertMessage().showError("Notes Required");
            return;
        }

        if(custCode === "" || custCode === undefined)
        {
            valid = false;
            AlertMessage().showError("Customer Code Required");
            return;
        }

        if(imageFile === "" || imageFile === undefined)
        {
            valid = false;
            AlertMessage().showError("Photo Required");
            return;
        }
    }

    //Save Data
    const saveAppreciation = () =>
    {
        validateData();
        if(valid)
        {        
            openLoaderButtonRef.current.click();

            var formData = new FormData();

            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("location", location);
            formData.append("picRole", pic);
            formData.append("userCode", userCode);
            formData.append("creatorName", localStorage.getItem("userDisplayName"))
            formData.append("customerCode", custCode);
            formData.append("apprDate", dtTime);
            formData.append("apprInfo", notes);
            formData.append("file", imageFile);

            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/add-appreciation").postApi(formData, {headers: {'Content-Type':'multipart/form-data'}})
            .then(response =>
                {
                    AlertMessage().showSuccess(response.data);
                    if(response.id !== 0 && response.id !== undefined)
                    {
                        navigate("/extra/appreciation/" + response.id, {replace : true});
                    }
                })
            .then(() => 
                {
                    hideLoaderButtonRef.current.click();
                })
            .catch(error =>
                {
                    AlertMessage().showError(error.response.data.message);

                    setLatitude(latitude);
                    setLongitude(longitude);
                    setLocation(location);
                    setPic(pic);
                    setUserCode(userCode);
                    setCustCode(custCode);
                    setDtTime(dtTime);
                    setNotes(notes);
                    setImageFile(imageFile);

                    setImagePreview(URL.createObjectURL(imageFile));
                    hideLoaderButtonRef.current.click();
                })
        }
        
    }

    //resend email
    const resendEmail = (id) =>
    {
        openLoaderButtonRef.current.click(); 
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/resend-notification?id=" + id).postApi({},{})
            .then(response =>
                {
                    AlertMessage().showSuccess(response.data);
                })
            .catch(error =>
                {
                    AlertMessage().showError(error.message);
                })
        hideLoaderButtonRef.current.click();
    }

    //go to up
    const onButtonUpClick = () =>
    {
        window.scrollTo(0, 0);
    }
    
    return(
    // Appreciation Form Data
    <div className="appr">
        {/* Go to Up Button */}
        <Fab size="medium" color="primary" aria-label="up" style={fabStyle} onClick={onButtonUpClick}>
            <KeyboardArrowUpIcon />
        </Fab>

        {/* Loader Manipulation Component */}
        <Button hidden={true} ref={openLoaderButtonRef} onClick={() => loaderRef.current.setHidden(false)}>Show Loader</Button>
        <Button hidden={true} ref={hideLoaderButtonRef} onClick={() => loaderRef.current.setHidden(true)}>Hide Loader</Button>
        <BackdropLoader ref={loaderRef} />

        {/* Navigation, Action Button */}
        <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
            Back
        </Button></Link>&nbsp;&nbsp;&nbsp;

        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={saveAppreciation} disabled={id === undefined ? false : true}>
            Save
        </Button>&nbsp;&nbsp;&nbsp;

        {/* <LoadingButton
            color="success"
            onClick={saveAppreciation}
            loading={loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="outlined"
            disabled={id === undefined ? false : true}
        >
            Save
         </LoadingButton> */}
        
        
        <Button variant="contained" startIcon={<EmailIcon />} onClick={() => resendEmail(id)} disabled={id === undefined ? true : false}>
            Resend Email
        </Button>
        <hr />

        {/* Title */}
       <Typography variant="h5">APPRECIATION</Typography>
       <br/>

       {/* Form Data */}
        <Grid container spacing={2}>
            <Grid item sm={6}>
                <TextField label="Latitude" variant="outlined" helperText={helperText} value={latitude} style={{width:"33ch"}}  disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Longitude" variant="outlined" helperText={helperText} value={longitude} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={12}>
             <TextField label="Location" helperText={helperText} multiline rows={7} value={location} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField select label="PIC" variant="outlined" helperText={helperText} 
                    value={pic} onChange={(e) => setPic(e.target.value)} style={{width:"33ch"}} 
                    disabled={id === undefined ? false : true}>
                    <MenuItem key="MR" value="MR">MR</MenuItem>
                    <MenuItem key="SPV" value="SPV">AM</MenuItem>
                    <MenuItem key="DSM" value="DSM">RM</MenuItem>
                    <MenuItem key="RSM" value="RSM">SM</MenuItem>
                    <MenuItem key="Audit" value="Audit">Audit</MenuItem>
                </TextField>
            </Grid>
            <Grid item sm={6}>
                <TextField label="UserCode" variant="outlined" helperText={helperText} value={userCode} style={{width:"33ch"}} hidden={true} disabled />
                <TextField label="Name" variant="outlined" helperText={helperText} value={userName} style={{width:"33ch"}} hidden={true} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Customer Code" variant="outlined" helperText={helperText} 
                    value={custCode} onChange={(e) => setCustCode(e.target.value)} 
                    style={{width:"33ch"}} 
                    InputProps={{endAdornment: <InputAdornment position="end">
                        <IconButton onClick={onCustCodeClick} disabled={id === undefined ? false : true}>
                            <SearchIcon />
                        </IconButton></InputAdornment>}}
                    disabled={true}>
                </TextField>
            </Grid>
            <Grid item sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                        label="Date"
                        inputFormat="dd-MMM-yyyy"
                        value={dtTime}
                        minDate={id === undefined ? new Date() : dtTime}
                        maxDate={id === undefined ? new Date() : dtTime}
                        onChange={onDtChange}
                        renderInput={(params) => <TextField {...params} helperText={helperText} />}
                        disabled
                    />
                </LocalizationProvider>
            </Grid>
            <Grid item sm={12}>
                <TextField label="Notes" variant="outlined" helperText={helperText}
                    multiline rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} 
                    style={{width:"33ch"}}
                    disabled={id === undefined ? false : true}
                     />
            </Grid>
            <Grid item sm={12}>
            <input 
                accept="image/*"
                id="icon-button-file"
                type="file"
                capture="environment"
                onChange={onImageChange}
                style={{visibility:"hidden"}}
                disabled={id === undefined ? (checkLocation() ? false : true) : true}
            />
            </Grid>
            <Grid item sm={12}>
                <label htmlFor="icon-button-file">       
                    <Button variant="contained" component="span" startIcon={<PhotoCamera />} disabled={id === undefined ? (checkLocation() ? false : true) : true}>
                        Take Photo
                    </Button> 
                </label>
            </Grid>
            <Grid item sm={12} hidden={imagePreview === undefined || imagePreview === "" || imagePreview === null ? true : false}>
                <label>Photo Preview</label>
                <Box>
                    <img src={imagePreview} alt="preview" />
                </Box>
            </Grid>
        </Grid>

        {/* Customer Dialog Modal */}
        <Dialog fullScreen open={showCustCodeDialog} onClose={onCustCodeDialogClose}>
            <AppBar sx={{position : 'relative'}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onCustCodeDialogClose} ><CloseIcon /></IconButton>
                </Toolbar>
                <ThemeProvider theme={theme}>
                    <MUIDataTable 
                        title="Customer List" 
                        columns={["kdDokter", "namaDokter", "spes", "alamat", "kota", "aktif", "buildNumber"]} 
                        data={custCodeList} 
                        options={custCodeDialogOptions} 
                    />
                </ThemeProvider>
            </AppBar>
        </Dialog>
    </div>
    );
}
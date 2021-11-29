import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Link , useParams } from "react-router-dom";

import { AppBar,  Backdrop, CircularProgress,  Box, Button, Dialog,
        Grid, IconButton, MenuItem, Typography, Toolbar } from '@mui/material';
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

import moment from 'moment';
import Resizer from "react-image-file-resizer";
import watermarkjs from 'watermarkjs';

import { Api }  from '../utilities/api';
import BackdropLoader  from '../utilities/backdrop-loader';
import { PLANMEET_SERVICES } from '../../config/config';
import { MASTER_SERVICES } from '../../config/config';
import AlertMessage from '../utilities/alert-message';

export default function Appreciation(params)
{  
    const [showLoader, setShowLoader] = useState(false);
    const [showCustCodeDialog, setShowCustCodeDialog] = useState(false);  
    // const showLoaderRef = useRef(null);
    // const hideLoaderRef = useRef(null);
    // const loaderRef = useRef(<BackdropLoader />);

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [location, setLocation] = useState('');
    const [pic, setPic] = useState('');
    const [userCode, setUserCode] = useState('');
    const [custCode, setCustCode] = useState('');
    const [custCodeList, setCustCodeList] = useState([]);
    const [dtTime, setDtTime] = useState('');
    const [notes, setNotes] = useState('');
    const [imageFile, setImageFile] = useState('');
    const [imagePreview, setImagePreview] = useState('');

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
        viewColumns : false,
        onRowClick : (rowData, rowMeta) => 
        { 
            // console.log(rowData);
            // console.log(rowMeta);
            setCustCode(rowData[0]);     
            setShowCustCodeDialog(false); 
        },
        onSearchChange : (searchText) =>
        {
            Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : searchText, orderBy : 'KdDokter', orderByDirection : 'asc'}})
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

    useLayoutEffect(() => 
    {
        if (id !== undefined)
        {
            Api(PLANMEET_SERVICES + "appreciation/load-appreciation-by-id").getApi("",{params: {id : id}})
            .then(response =>
                {
                    setLatitude(response.data.latitude);
                    setLongitude(response.data.longitude);
                    setLocation(response.data.location);
                    setPic(response.data.picrole);
                    setUserCode(response.data.userCode);
                    setCustCode(response.data.customerCode);
                    setDtTime(response.data.apprDate);
                    setNotes(response.data.apprInfo);
                    setImageFile(response.data.file);
                    setImagePreview(URL.createObjectURL(response.data.file));                   
                })
            .catch(error =>
                {
                    AlertMessage().showError(error);
                })   
                    
        }
        else
        {
            setShowLoader(true);
            setLatitude(localStorage.getItem("lat"));
            setLongitude(localStorage.getItem("long"));
            setLocation(localStorage.getItem("location"));
            setPic('');
            setUserCode(localStorage.getItem("userId"));
            setCustCode('');
            setDtTime((moment(new Date().now).format("YYYY-MM-DD")));
            setNotes('');
            setImageFile('');
            setImagePreview('');

            Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : '', orderBy : 'KdDokter', orderByDirection : 'asc'}})
            .then(response =>
            {
                setCustCodeList(response.data);
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            });   
            
            setShowLoader(false);
        }
    }, []);


    const onDtChange = (newValue) =>
    {
        setDtTime(newValue);
    }

    const getFontSize = (fileWidth) =>
    {
        var result =  Math.floor(fileWidth*0.017) + 'px Arial';
        return result;
    }

    const setWatermark = (params) =>
    {
        return watermarkjs([params])
        .blob(function(file) 
        {
            var ctxRect = file.getContext('2d');
            console.log("width:" + file.width + "; height:" + file.height);
            ctxRect.save();
            ctxRect.fillStyle = "yellow";
            ctxRect.fillRect(0, file.height - (file.height/40), file.width, file.height - (file.height/20));
            ctxRect.restore();

            var ctxText = file.getContext('2d');
            ctxText.save();
            ctxText.font = getFontSize(file.width);
            console.log(ctxText.font);
            ctxText.fillStyle = "black";

            var dt = new Date();
            var wmText = dt.getDate() + "/" + dt.getMonth() + "/" + dt.getFullYear() + " " + localStorage.getItem("location");
        
            ctxText.fillText(wmText, 0, file.height - (file.height/80));
            ctxText.restore();

            return file;
        })
    }

    const setCompress = (params) =>
    {
        var dt = new Date();
        var dtString = dt.getDate() + "-" + dt.getMonth() + "-" + dt.getFullYear() + "-" + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds() + "-" + dt.getMilliseconds();
        
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
                setShowLoader(false);
            },
            "file",
            640,
            480
            );
    }

    const onImageChange = (e) =>
    {
        var imgFile = e.target.files[0];
        if(imgFile)
        {
            setShowLoader(true);
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

    const onCustCodeClick = () =>
    {
       setShowCustCodeDialog(true);
    }

    const onCustCodeDialogClose = () =>
    {
        setShowCustCodeDialog(false);
    }

    const validateData = () =>
    {
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

    const saveAppreciation = () =>
    {
        validateData();
        if(valid)
        {
            setShowLoader(true);
            console.log(valid);
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

            Api(PLANMEET_SERVICES + "appreciation/add-appreciation").postApi(formData, {headers: {'Content-Type':'multipart/form-data'}})
            .then(response =>
                {
                    AlertMessage().showSuccess(response.data);
                })
            .catch(error =>
                {
                    //console.log(error.response.data);
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
                })
                setShowLoader(false);
        }
    }
    
    return(
    // Appreciation Form Data
    <div className="appr">
        <Link to="/extra"><Button variant="outlined" startIcon={<ArrowBackIcon />}>
            Back
        </Button></Link>&nbsp;&nbsp;&nbsp;
        <Button variant="outlined" color="success" startIcon={<SaveIcon />} onClick={saveAppreciation} disabled={id === undefined ? false : true}>
            Save
        </Button>
        {/* <Button ref={showLoaderRef} onClick={() => loaderRef.current.showLoader(true)}>Show Loader</Button>
        <Button ref={hideLoaderRef} onClick={() => loaderRef.current.showLoader(false)}>Hide Loader</Button> */}
        <hr />
       <Typography variant="h6">APPRECIATION</Typography>
       <br/>
        <Grid container spacing={2}>
            <Grid item sm={6}>
                <TextField label="Latitude" variant="outlined" value={latitude} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Longitude" variant="outlined" value={longitude} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={12}>
             <TextField label="Location" multiline rows={7} value={location} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField select label="PIC" variant="outlined" value={pic} onChange={(e) => setPic(e.target.value)} style={{width:"33ch"}} 
                    disabled={id === undefined ? false : true}>
                    <MenuItem key="MR" value="MR">MR</MenuItem>
                    <MenuItem key="AM" value="AM">AM</MenuItem>
                    <MenuItem key="RM" value="RM">RM</MenuItem>
                    <MenuItem key="SM" value="SM">SM</MenuItem>
                </TextField>
            </Grid>
            <Grid item sm={6}>
                <TextField label="Name" variant="outlined" value={userCode} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Customer Code" variant="outlined" value={custCode} onChange={(e) => setCustCode(e.target.value)} 
                    style={{width:"33ch"}} 
                    InputProps={{endAdornment: <InputAdornment position="end"><IconButton onClick={onCustCodeClick}><SearchIcon /></IconButton></InputAdornment>}}
                    disabled={id === undefined ? false : true}>
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
                        renderInput={(params) => <TextField {...params} />}
                        disabled
                    />
                </LocalizationProvider>
            </Grid>
            <Grid item sm={12}>
                <TextField label="Notes" variant="outlined" multiline rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} 
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
                disabled={id === undefined ? false : true}
            />
            </Grid>
            <Grid item sm={12}>
                <label htmlFor="icon-button-file">       
                    <Button variant="contained" component="span" startIcon={<PhotoCamera />} disabled={id === undefined ? false : true}>
                        Take Photo
                    </Button> 
                </label>
            </Grid>
            <Grid item sm={12}>
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

        {/* Loader */}
        <BackdropLoader showLoader={showLoader}  />
    </div>
    );
}
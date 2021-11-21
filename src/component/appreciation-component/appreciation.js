import React, {useState} from 'react';

import { Backdrop, Button, CircularProgress, Grid, MenuItem, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { PhotoCamera } from '@mui/icons-material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import { Box } from '@mui/system';

import Resizer from "react-image-file-resizer";
import watermarkjs from 'watermarkjs';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Appreciation(params)
{
    const [imageFile, setImageFile] = useState('');
    const [showLoader, setShowLoader] = useState(false);

    const [value, setValue] = useState(new Date().now);

    const handleChange = (newValue) => {
        setValue(newValue);
    };

    //resize image and preview
    const getFontSize = (fileWidth) =>
    {
        var result =  Math.floor(fileWidth*0.017) + 'px Arial';
        console.log(result);
        return result;
    }

    const onImageChange = (e) =>
    {
        var imgFile = e.target.files[0];

       if(imgFile)
       {
           setShowLoader(true);
           console.log(showLoader);
           try 
           {
            watermarkjs([imgFile])
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
                //ctxText.fillText("2021-11-11 11:11:11 -6.1894404 106.8454332", 0, file.height - (file.height/100));
                ctxText.fillText(wmText, 0, file.height - (file.height/80));
                ctxText.restore();

                return file;
            })
            .then(imgBlob => 
                {
                    var objFile = new File([imgBlob], "CustomFileName.jpeg");
                    Resizer.imageFileResizer(
                        objFile,
                        640,
                        480,
                        "JPEG",
                        80,
                        0,
                        (uri) => 
                        {
                            setImageFile(uri);
                            setShowLoader(false);
                            console.log(showLoader);
                        },
                        "base64",
                        640,
                        480
                        );
                })
            .catch(err => alert(err));   
           } catch (error) 
           {
               alert(error);
           }
       }
    }
    
    console.log(params);
    return(
    <div className="appr">
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => params.setModule("default")}>
            Back
        </Button>
        <hr />
       <Typography variant="h6">APPRECIATION</Typography>
       <br/>
        <Grid container spacing={2}>
            <Grid item sm={6}>
                <TextField label="Latitude" variant="outlined" value={localStorage.getItem("lat")} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Longitude" variant="outlined" value={localStorage.getItem("long")} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={12}>
             <TextField label="Location" multiline rows={7} value={localStorage.getItem("location")} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField select label="PIC" variant="outlined" value="RM" style={{width:"33ch"}} disabled>
                    <MenuItem key="MR" value="MR">MR</MenuItem>
                    <MenuItem key="AM" value="AM">AM</MenuItem>
                    <MenuItem key="RM" value="RM">RM</MenuItem>
                    <MenuItem key="SM" value="SM">SM</MenuItem>
                </TextField>
            </Grid>
            <Grid item sm={6}>
                <TextField label="Name" variant="outlined" value={localStorage.getItem("userId")} style={{width:"33ch"}} disabled />
            </Grid>
            <Grid item sm={6}>
                <TextField label="Customer Code" variant="outlined" value="0001023" style={{width:"33ch"}} />
            </Grid>
            <Grid item sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                        label="Date"
                        inputFormat="dd-MMM-yyyy"
                        value={value}
                        onChange={handleChange}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </Grid>
            <Grid item sm={12}>
                <TextField label="Keterangan" variant="outlined" placeholder="Informasi dan Keterangan" style={{width:"33ch"}} />
            </Grid>
            <Grid item sm={12}>
            <input 
                accept="image/*"
                id="icon-button-file"
                type="file"
                capture="environment"
                onChange={onImageChange}
                style={{visibility:"hidden"}}
            />
            </Grid>
            <Grid item sm={12}>
                <label htmlFor="icon-button-file">       
                    <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
                        Take Photo
                    </Button> 
                </label>
            </Grid>
            <Grid item sm={12}>
                <label>Photo Preview</label>
                <Box>
                    <img src={imageFile} alt="preview" />
                </Box>
            </Grid>
        </Grid>

        <Backdrop 
            sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={showLoader}>
                <CircularProgress color="inherit" />
            </Backdrop>
    </div>
    );
}
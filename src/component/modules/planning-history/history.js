//React
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
//Material
import { AppBar, Box, Button, Dialog, Fab,
    IconButton, MenuItem,  Typography, Toolbar, TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import { ThemeProvider } from "@mui/styles";
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import MUIDataTable from "mui-datatables";
//Icon
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
//import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
//Component
import moment from 'moment';
import 'moment-timezone';
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';
import BackdropLoader  from '../../utilities/backdrop-loader';

export default function History()
{
    //Loader State
    const [hideLoader, setHideLoader] = useState(true);

    //Filter & List Data State
    const [filterDate, setFilterDate] = useState(moment().tz('Asia/Jakarta').format());
    const [listItem, setListItem] = useState([]); 
    
    //Show/Hide Dialog State
    const [showUserPhotoDialog, setShowUserPhotoDialog] = useState(false);
    const [showDoctorSignDialog, setShowDoctorSignDialog] = useState(false);
    
    //Image State
    const [userPhoto, setUserPhoto] = useState('');
    const [doctorSign, setDoctorSign] = useState('');

    //Themes for MUI Datatable
    const crTheme = createTheme();
    const theme = responsiveFontSizes(crTheme);    
    
    //Columns for MUI Datatable
    const pmColumns = [
        {
            name : "kdPlanning",
            label : "Planning Code",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        },
        {
            name : "namaDokter",
            label : "Doctor Name",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        },
        {
            name : "spes",
            label : "Specialization",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        },
        {
            name : "alamatDokter",
            label : "Doctor Address",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        },
        {
            name : "kdPlanning",
            label : "User Photo",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                customBodyRender: (value, tableMeta, updateValue) => 
                {
                    return(
                        <Button startIcon={<VisibilityIcon />} onClick={() => loadUserPhoto(value)}>Show User Photo</Button>
                    );
                }
            }
        },            {
            name : "kdPlanning",
            label : "Doctor Sign",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                customBodyRender: (value, tableMeta, updateValue) => 
                {
                    return(
                        <Button startIcon={<VisibilityIcon />} onClick={() => loadDoctorSign(value)}>Show Doctor Sign</Button>
                    );
                }
            }
        },
        {
            name : "statusPlanning",
            label : "Planning Status",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        },
        {
            name : "statusUpload",
            label : "Upload Status",
            options :
            {
                setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
            }                
        }
    ];

    //MUI Datatable Options
    const pmOptions = {
        download : false,
        filter : false,
        print : false,
        rowsPerPage: 10,
        rowsPerPageOptions : [],
        search : false,
        //serverSide : true,
        selectableRows : 'none',
        selectableRowsHeader : false,
        selectableRowsHideCheckboxes : true,
        sort : false,
        viewColumns : false,
    };

    //Styles : Set Fab location
    const fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 50,
        left: 'auto',
        position: 'fixed',
        zIndex: 1234 
    };
        
    //Load Data
    const loadData = () =>
    {
        var filterString = moment(filterDate).tz('Asia/Jakarta').format("YYYY-MM-DD");

        if(filterString !== '' && filterString !== undefined)
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/load-planning-by-user-date").getApi("",{params: {userCode : localStorage.getItem("userId"), dateString: filterString }})
            .then(response => 
            {
                setListItem(response.data);
                setHideLoader(true);
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
    
    //Show User Photo
    const loadUserPhoto = (kdPlanning) =>
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/load-planning-by-id").getApi("",{params: {id : kdPlanning }})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                setUserPhoto(response.data.userPhotoBase64);
                setShowUserPhotoDialog(true);
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

    //Show Doctor Sign
    const loadDoctorSign = (kdPlanning) =>
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/load-planning-by-id").getApi("",{params: {id : kdPlanning }})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                setDoctorSign(response.data.doctorSignBase64);
                setShowDoctorSignDialog(true);
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

    //Execute Search
    const handleSearch = () =>
    {
        loadData();
    }

    //Date Filter State Update Handler
    const handleDateChange = (newValue) =>
    {
        setFilterDate(newValue);
    }

    //Go to Up
    const onButtonUpClick = () =>
    {
        window.scrollTo(0, 0);
    } 

    useEffect(() => 
    {
        loadData();
    }, [])
    
    return(
        <>
            <BackdropLoader hideLoader={hideLoader} />

            {/* Go to Up Button */}
            <Fab size="medium" color="primary" aria-label="up" style={fabStyle} onClick={onButtonUpClick}>
                <KeyboardArrowUpIcon />
            </Fab>
            
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            {/* Title */}
            <Typography variant="h5" style={{textAlign:"center"}}>PLANNING HISTORY</Typography>
            <br/>

            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                        mask="__-__-____"
                        label="Created Date"
                        inputFormat="dd-MM-yyyy"
                        maxDate={new Date()}
                        value={filterDate}
                        onChange={handleDateChange}
                        renderInput={(params) => <TextField {...params}  />}
                    />
                </LocalizationProvider>
                &nbsp;
                <IconButton onClick={handleSearch} color="primary">
                    <SearchIcon />
                </IconButton>
            </Box>
            <br/>
            <ThemeProvider theme={theme}>
                <MUIDataTable 
                    title="Planning List" 
                    columns={pmColumns} 
                    data={listItem} 
                    options={pmOptions} 
                />
            </ThemeProvider>

            {/* Planning Image Dialog */}
            <Dialog fullScreen open={showUserPhotoDialog} onClose={() => setShowUserPhotoDialog(false)}>
                <AppBar sx={{position : 'relative'}}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setShowUserPhotoDialog(false)} ><CloseIcon /></IconButton>
                        &nbsp;&nbsp;
                        <Typography variant='h6'>User Photo Preview</Typography>
                    </Toolbar>
                </AppBar>
                <br/>
                <img src={userPhoto} alt="preview" />
            </Dialog>

            {/* Planning Doctor Sign Dialog */}
            <Dialog fullScreen open={showDoctorSignDialog} onClose={() => setShowDoctorSignDialog(false)}>
                <AppBar sx={{position : 'relative'}}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setShowDoctorSignDialog(false)} ><CloseIcon /></IconButton>
                        &nbsp;&nbsp;
                        <Typography variant='h6'>Doctor Sign Preview</Typography>
                    </Toolbar>
                </AppBar>
                <br/>
                <img src={doctorSign} alt="preview" />
            </Dialog>
        </>
    );
}
//React
import React, { useEffect, useState } from 'react';
//Material
import { AppBar, Box, Button, Checkbox, Card, CardContent, Dialog, Divider,
    IconButton, List, ListItem, Typography, Toolbar, TextField } from '@mui/material';
import { useConfirmDialog } from 'react-mui-confirm';
//IDb
import idbReady from 'safari-14-idb-fix';
//Icon
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
//Component
import moment from 'moment';
import 'moment-timezone';
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default function Planning()
{
    const [showCustCodeDialog, setShowCustCodeDialog] = useState(false); 
    const [filter, setFilter] = useState('');
    const [delCounter, setDelCounter] = useState(0);

    //Original Array of Data from Database
    const [custCodeList, setCustCodeList] = useState([]);

    //Array contains Selected Customer
    const [custSelected, setCustSelected] = useState([]);

    //Confirm Dialog
    const confirmDialog = useConfirmDialog();

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

    //--- START INITIAL ---//

    //Set Initial View
    const setDataView = () =>
    {
        const openRequest = indexedDB.open("CRSDB", 1);
        openRequest.onsuccess = function()
        {
            const openIdb = openRequest.result;
            try
            {
                const tx = openIdb.transaction("planning", "readonly");
                const store = tx.objectStore("planning");
            
                var reqData = store.getAll();
                reqData.onsuccess = function()
                {
                    if(reqData.result.length > 0)
                    {
                        setCustSelected(reqData.result);
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
    }

    //--- END INITIAL ---//

    //--- START CUSTOMER / DOCTOR, PLANNING DATA RELATED ---//
    
    //Toggle Open Dialog
    const onCustCodeClick = () =>
    {
        setShowCustCodeDialog(true);
        onDeleteExpiredPlanning();
    }

    //Toggle Close Dialog
    const onCustCodeDialogClose = () =>
    {
        setShowCustCodeDialog(false);
    }    

    //Load Doctor Data
    const loadDoctor = (filter) =>
    {
        var strFilter = filter === "" || filter === undefined ? '' : filter;

        if(strFilter !== '')
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction("doctor", "readwrite");
                    const store = tx.objectStore("doctor");
                
                    var reqData = store.getAll();
                    reqData.onsuccess = function()
                    {
                        strFilter = strFilter.toLowerCase().trim();
                        if(reqData.result.length > 0)
                        {
                            var arrResult = reqData.result.filter(function(item, index, arr)
                            {   
                                if(item.doctorName !== undefined && item.doctorName !== null)
                                {
                                    if(item.doctorName.toLowerCase().trim().indexOf(strFilter) >= 0)
                                    {
                                        return item;
                                    }
                                    // else
                                    // {
                                    //     if(item.alamat !== undefined && item.alamat !== null)
                                    //     {
                                    //         if(item.alamat.toLowerCase().trim().indexOf(strFilter) > 0)
                                    //         {
                                    //             return item;
                                    //         }
                                    //     }
                                    // }
                                }
                            });

                            setCustCodeList(arrResult);
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
        }
        else
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction("doctor", "readwrite");
                    const store = tx.objectStore("doctor");
                
                    var reqData = store.getAll(undefined, 30);
                    reqData.onsuccess = function()
                    {
                        setCustCodeList(reqData.result);  
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
        }

        // Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : strFilter, orderBy : 'KdDokter', orderByDirection : 'asc'}})
        //     .then(response =>
        //     {
        //         setCustCodeList(response.data);
        //     })
        //     .catch(error =>
        //     {
        //         AlertMessage().showError(error);
        //     });   
    }

    //Set Filter
    // const onFilterChange = (e) =>
    // {
    //     setFilter(e.target.values);
    // }

    //Toggle Customer Check/Unchecked
    const onCustChecked = (e, item) =>
    {
        var confirmMessage = "";
        if(e.target.checked)
        {
            confirmMessage = "Add this Doctor to Planning?";
        }
        else
        {
            confirmMessage = "Remove this Doctor from Planning?";
        }

        confirmDialog({
            title: confirmMessage,
            onConfirm: () =>
            {
                const currentIndex = custSelected.map(item => item.kdDokter).indexOf(item.kdDokter);
                const tempChecked = [...custSelected];
                
                var planItem = mapCustomedItem(item);

                if(currentIndex === -1)
                {
                    tempChecked.push(planItem);
                    addPlanningData(planItem);
                }
                else
                {
                    tempChecked.splice(currentIndex, 1); //remove item from array : (selectedIndex, number of item to be removed)
                    removePlanningData(planItem.kdPlanning)
                }
    
                setCustSelected(tempChecked); 
            }
        });
    }

    //Map Customer Object Data to Customed Object (Add Status and Planning Code)
    const mapCustomedItem = (item) =>
    {
        var customedItem = {};
        
        customedItem.kdUser = localStorage.getItem("userId");

        var date = new Date();
        var dt = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        var mt = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
        var yr = date.getFullYear().toString();

        var dtString = dt.concat(mt).concat(yr);

        customedItem.kdPlanning = item.kdDokter + "-" + dtString + "-" + localStorage.getItem("userId");
        customedItem.datePlanning = moment().tz("Asia/Jakarta").format();
        customedItem.dateRealization = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
        customedItem.uploadedDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
        customedItem.approvalDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();

        customedItem.statusPlanning = "Preparation";
        customedItem.statusUpload = "Local";
        customedItem.statusApproval = "Draft";

        customedItem.latitude = 0;
        customedItem.longitude = 0;
        customedItem.address = "";
        customedItem.meetingDetail = "";

        customedItem.kdDokter = item.kdDokter;
        customedItem.namaDokter = item.doctorName;
        customedItem.spes = item.spes;
        customedItem.alamatDokter = item.alamat;
        customedItem.kota = item.kota;

        customedItem.doctorNote = "";
        customedItem.userPhotoFileName = "";
        customedItem.userPhotoFileType = "";
        customedItem.userPhotoFileLocation = "";

        customedItem.doctorSignFileName = "";
        customedItem.doctorSignFileType = "";
        customedItem.doctorSignFileLocation = "";

        customedItem.isJoinVisit = false;
        customedItem.joinVisitPartner = "";
        customedItem.joinVisitLatitude = 0;
        customedItem.joinVisitLongitude = 0;
        customedItem.joinVisitLocation = "";
        customedItem.joinVisitStatus = "";
        
        customedItem.createdDate = moment().add(-1,'days').tz("Asia/Jakarta").format();
        customedItem.createdBy = localStorage.getItem("userId");

        customedItem.updatedDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
        customedItem.updatedBy = localStorage.getItem("userId");

        //customedItem.createdDate = moment(new Date()).add(-1,'days').format("YYYY-MM-DD");

        return customedItem;
    }

    //Add Planning to IDb
    const addPlanningData = (dataItem) =>
    {
        idbReady()
        .then(response =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                try
                {
                    const openIdb = openRequest.result;
                    const tx = openIdb.transaction('planning', 'readwrite');
                    const store = tx.objectStore('planning');
                
                    //add new data
                    const addData = store.add(dataItem);
                    addData.onerror = function(event)
                    {
                       var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                       AlertMessage().showError(errMessage);
                    }
                }
                catch(err)
                {
                    AlertMessage().showError(err.toString());
                }
            }
        })
        .catch(err =>
        {
            AlertMessage().showError(err.toString());
        });
    }

    //Update Planning Data on IDb from Database
    const updatePlanningData = () =>
    {
        idbReady().then(() =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                try
                {
                    const tx = openIdb.transaction('planning', 'readwrite');
                    const store = tx.objectStore('planning');
                
                    //delete all data first
                    const clearIdb =  store.clear();
                    clearIdb.onsuccess = function()
                    {
                        //add new data from database
                        custSelected.map(function(item, index, arr) 
                        { 
                           addPlanningData(item);
                        });
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

    //Remove Planning from IDb
    const removePlanningData = (kdPlanning) =>
    {
        idbReady()
        .then(response =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                try
                {
                    const openIdb = openRequest.result;
                    const tx = openIdb.transaction('planning', 'readwrite');
                    const store = tx.objectStore('planning');
                
                    //add new data
                    const delData = store.delete(kdPlanning);
                    delData.onerror = function(event)
                    {
                       var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                       AlertMessage().showError(errMessage);
                    }
                }
                catch(err)
                {
                    AlertMessage().showError(err.toString());
                }
            }
        })
        .catch(err =>
        {
            AlertMessage().showError(err.toString());
        });
    }

    //--- END CUSTOMER / DOCTOR, PLANNING DATA RELATED ---//

    //--- START FINALIZE PLANNING, ADD MEETING RELATED ---//

    //Finalize Planning
    const onFinalize = () =>
    {
        onDeleteExpiredPlanning();

        var isValid = true;
        var currentUserRole = localStorage.getItem("userRole");

        if(currentUserRole === "MR" || currentUserRole === "SPV")
        {
            if(custSelected.length < 6)
            {
                isValid = false;
                AlertMessage().showError("Please Fulfill Minimum Quota of Visit Plan (6 Customer)");
                return isValid;
            }
        }
        const validateData = new FormData();
        validateData.append("listPlanning", JSON.stringify(custSelected))

        Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/validate-planning").postApi(validateData, {})
        .then(response =>
        {
            if(response.isSuccess)
            {
                confirmDialog({
                    title: "Finalize Today's Planning? This Cannot be Undone",
                    onConfirm: () =>
                    {
                        //add meeting data to database and idb
                        addMeetingData(custSelected);
                        
                        updateStatusPlanning();
        
                        //insert data to database
                        const pData = new FormData();
                        pData.append("listPlanning", JSON.stringify(custSelected))
                        Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/add-planning").postApi(pData, {})
                        .then(response =>
                        {
                            if(response.isSuccess)
                            {
                                AlertMessage().showSuccess(response.data);
                                updateStatusPlanning();
                                setCustSelected([]);
                                deletePlanningIdb();
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
                  });
            }
            else
            {
                isValid = false;
                AlertMessage().showError(response.message);
                return isValid;
            }

        })
        .catch(error =>
        {
            isValid = false;
            if(error.response === undefined)
            {
                AlertMessage().showError(error.message);
            }
            else
            {
                AlertMessage().showError(error.response.data.message);
            } 
            return isValid;           
        })

        return isValid;
    }

    //Add Meeting to IDb when Finalize
    const addMeetingData = (arrItem) =>
    {
        idbReady()
        .then(response =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                try
                {
                    const openIdb = openRequest.result;
                    const tx = openIdb.transaction('meeting', 'readwrite');
                    const store = tx.objectStore('meeting');
                
                    //add new data
                    const meetingData = mapMeetingData(arrItem);

                    for(var i = 0; i < meetingData.length; i++)
                    {
                        const addData = store.add(meetingData[i]);
                        addData.onerror = function(event)
                        {
                            var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                            AlertMessage().showError(errMessage);
                        }
                    }                    
                }
                catch(err)
                {
                    AlertMessage().showError(err.toString());
                }
            }
        })
        .catch(err =>
        {
            AlertMessage().showError(err.toString());
        });
    }

    //Map Planning Data to Meeting Data
    const mapMeetingData = (arrItem) =>
    {
        var arrMeeting = [];
        for(var i = 0; i < arrItem.length; i++)
        {
            var objMeeting = {};

            objMeeting.dataIndex = i;
            objMeeting.kdUser = localStorage.getItem("userId");

            objMeeting.kdPlanning = arrItem[i].kdPlanning;
            objMeeting.datePlanning = arrItem[i].createdDate;
            objMeeting.dateRealization = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
            objMeeting.uploadedDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
            objMeeting.approvalDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
            objMeeting.statusApproval = "Draft";
            objMeeting.statusPlanning = "Pending";
            objMeeting.statusUpload = "Local";
            
            objMeeting.latitude = "";
            objMeeting.longitude = "";
            objMeeting.address = "";
            objMeeting.meetingDetail = "";
            
            objMeeting.kdDokter = arrItem[i].kdDokter;
            objMeeting.namaDokter = arrItem[i].namaDokter;
            objMeeting.alamatDokter = arrItem[i].alamatDokter;
            objMeeting.spes = arrItem[i].spes;
            objMeeting.kota = arrItem[i].kota;
            objMeeting.doctorNote = "";
            objMeeting.userPhoto = "";
            objMeeting.doctorSign = "";

            objMeeting.isJoinVisit = false;
            objMeeting.joinVisitPartner = "";
            objMeeting.joinVisitLatitude = 0;
            objMeeting.joinVisitLongitude = 0;
            objMeeting.joinVisitLocation = "";
            objMeeting.joinVisitStatus = "";
            
            objMeeting.createdDate = moment().tz("Asia/Jakarta").format();
            objMeeting.createdBy = localStorage.getItem("userId");
            objMeeting.updatedDate = moment("1900-01-01","YYYY-MM-DD").tz("Asia/Jakarta").format();
            objMeeting.updatedBy = localStorage.getItem("userId");

            arrMeeting.push(objMeeting);
        }

        return arrMeeting;
    }

    //Update Status Planning from Preparation to Pending
    const updateStatusPlanning = () =>
    {
        //update state 
        var planStateData = custSelected;
        planStateData.map(item => item.statusPlanning = "Pending");
        setCustSelected(planStateData);

        //update Idb
        idbReady()
        .then(response => 
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                const openIdb = openRequest.result;
                const tx = openIdb.transaction("planning", "readwrite");
                const store = tx.objectStore("planning");
                
                //update data
                const getPlanningIdb = store.getAll();
                getPlanningIdb.onsuccess = function()
                {
                    try
                    {
                        var arrPlanning = getPlanningIdb.result;
                        arrPlanning.map(item => item.statusPlanning = "Pending");
                    
                        for(var i = 0; i < arrPlanning.length; i++)
                        {
                            const putData = store.put(arrPlanning[i]);
                            putData.onerror = function(event)
                            {
                                var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                                AlertMessage().showError(errMessage);
                            }
                        }
                        setCustSelected(arrPlanning);
                    }
                    catch(err)
                    {
                        AlertMessage().showError(err.toString());
                    }
                }

                getPlanningIdb.onerror = function(event)
                {
                    AlertMessage().showError(event.error.toString());
                }
            }

            openRequest.onerror = function(event)
            {
                AlertMessage().showError(event.error.toString());
            }
        });
    }

    //Delete Planning Data on Idb
    const deletePlanningIdb = () =>
    {
        const openRequest = indexedDB.open("CRSDB", 1);
        openRequest.onsuccess = function()
        {
            const openIdb = openRequest.result;
            try
            {
                const tx = openIdb.transaction('planning', 'readwrite');
                const store = tx.objectStore('planning');
            
                //delete all data first
                const clearIdb =  store.clear();
                clearIdb.onsuccess = function()
                {
                    
                }

                clearIdb.onerror = function()
                {
                    AlertMessage().showError(clearIdb.error.toString());
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
    }

    //--- END FINALIZE PLANNING, ADD MEETING RELATED ---//

    //--- START DELETE EXPIRED RELATED ---//

    //Delete Expired Planning (H + 1, Status : Preparation)
    const onDeleteExpiredPlanning = () =>
    {
        //delete from state, if any
        var dataArr = custSelected.filter(item => item.statusPlanning === "Preparation");
        var today = moment().tz("Asia/Jakarta").format();
        var expiredIndex = dataArr.filter(function(item, index, arr)
        {
            var arrDate = moment(item.createdDate).format();
            var dateDiff = moment(today).subtract(arrDate, 'days');
            if (dateDiff > 0)
            {
                return index;
            }
        });

        if(expiredIndex.length > 0)
        {
            expiredIndex.map(function(item, index, arr)
            {
                console.log("masuk sini");
                custSelected.splice(item, 1);
                setDelCounter(delCounter + 1);
            })
            
        }
        
        //delete from indexed db, if any
        idbReady()
        .then(response =>
        {
            const openRequest = indexedDB.open("CRSDB", 1);
            openRequest.onsuccess = function()
            {
                try
                {
                    const openIdb = openRequest.result;
                    const tx = openIdb.transaction('planning', 'readwrite');
                    const store = tx.objectStore('planning');
                    const storeIndex = store.index('dateIndex');

                    //delete expired data
                    var yday = moment().tz("Asia/Jakarta").add(-1, 'days').format();
                    
                    const delRequest = storeIndex.getAllKeys(IDBKeyRange.upperBound(yday));
                    
                    delRequest.onsuccess = function()
                    {
                        if(delRequest.result.length > 0)
                        {
                            var delArr = delRequest.result;
                            for(var i = 0; i < delArr.length; i++)
                            {
                                var delData = store.delete(delArr[i]);
                                delData.onsuccess = function()
                                {
                                    console.log(delData.result);
                                    setDelCounter(delCounter + 1);
                                }
                                
                                delData.onerror = function(event)
                                {
                                    console.log(event.error.toString());
                                }

                            }
                        }
                    }

                    delRequest.onerror = function(event)
                    {
                        AlertMessage().showError(event.error.toString());
                    }
                
                }
                catch(err)
                {
                    AlertMessage().showError(err.toString());
                }
            }
        })
        .catch(err =>
        {
            AlertMessage().showError(err.toString());
        });
    }

    //--- END DELETE EXPIRED RELATED ---//

    // Comment - Launch Appreciation
    useEffect(() => 
    {
        //loadDoctor('');
        //setDataView();
        //onDeleteExpiredPlanning();

        //setInterval(() => onDeleteExpiredPlanning(), 1000);
    }, []);

    // useEffect(() => 
    // {
    //     loadDoctor(filter);
    // }, [filter]);

    return(
        <>
           {/* Add Customer Button */}
           {/* // Comment - Launch Appreciation - Disabled */}
           <Fab size="medium" color="primary" aria-label="add" style={fabStyle} onClick={onCustCodeClick}>
                <AddIcon />
            </Fab>

            {/* Hidden Button to Remove Yesterday's Planning */}
            {/* <Button variant="outlined" color="primary" onClick={onDeleteExpiredPlanning}>
                Delete
            </Button> */}

            {/* Finalize Planning (Update Status) */}
            <Button variant="contained" color="success" startIcon={<PlaylistAddCheckIcon />} onClick={onFinalize} disabled={custSelected.length !== 0 ? false : true} sx={{marginLeft:"30px"}}>
                Finalize
            </Button>

            {/* Customer List */}
            <List>
                   {custSelected.map(item => 
                    {
                        return(
                            <div key={item.kdDokter}>
                            <ListItem
                                key={item.kdDokter}
                            >
                                <Card elevation={0} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#1976d2',  width: '100%'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="body2">{item.kdPlanning}</Typography>
                                            <Typography variant="h6"><strong>{item.namaDokter}</strong></Typography>
                                            <Typography variant="body1">[{item.spes}]</Typography> 
                                            <br/>      
                                            <Typography variant="body2"><em>{item.alamat}</em></Typography>
                                        </CardContent>
                                            {/* <CardContent sx={{flex: '1 0 auto'}}>
                                                <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                            </CardContent> */}
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="body2" color="#FF0000"><strong>{item.statusPlanning}</strong></Typography>     
                                        </CardContent>
                                    </Box>
                                </Card>                       
                            </ListItem>
                            <Divider variant="middle" /> 
                            </div>
                        );
                    })}
                </List>

            {/* Customer Dialog Modal */}
            <Dialog fullScreen open={showCustCodeDialog} onClose={onCustCodeDialogClose}>
                <AppBar sx={{position : 'relative'}}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={onCustCodeDialogClose} ><CloseIcon /></IconButton>
                        &nbsp;&nbsp;
                        <Typography variant='h6'>Doctor List</Typography>
                    </Toolbar>
                </AppBar>
                <br/>
                <p style={{color: "#FF0000"}}><em>*please make sure you already have synchronized doctor data.</em></p>
                <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                    <TextField label="Search" variant="outlined"
                            value={filter} onChange={(e) => setFilter(e.target.value)}
                            placeholder='type doctor name'/>
                    <IconButton onClick={() => loadDoctor(filter)} color="primary">
                        <SearchIcon />
                    </IconButton>                       
                </Box>
                <br/>
                <List>
                   {custCodeList.map(item => 
                    {
                        return(
                            <div key={item.kdDokter}>
                            <ListItem
                                key={item.kdDokter}
                                secondaryAction={
                                    <Checkbox
                                        edge="end" 
                                        onChange={(e) => onCustChecked(e, item)}
                                        checked={custSelected.map(arrItem => arrItem.kdDokter).indexOf(item.kdDokter) !== -1}
                                        disabled={custSelected.map(function (arrItem, arrIndex, arr)
                                            {
                                                if(arrItem.kdDokter && arrItem.statusPlanning === "Pending")
                                                {
                                                    return arrItem.kdDokter;
                                                }
                                            }).indexOf(item.kdDokter) !== -1}
                                    />
                                }
                            >
                                <Card elevation={0} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#1976d2', shadows: 'none !important'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="h6"><strong>{item.kdDokter} - {item.doctorName}</strong></Typography>
                                            <Typography variant="body1">{item.spes}</Typography> 
                                            <br/>      
                                            <Typography variant="body2"><em>{item.alamat}</em></Typography>
                                        </CardContent>
                                            {/* <CardContent sx={{flex: '1 0 auto'}}>
                                                <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                            </CardContent> */}
                                    </Box>
                                </Card>                       
                            </ListItem>
                            <Divider variant="middle" /> 
                            </div>
                        );
                    })}
                </List>
            </Dialog>
        </>
    );
}
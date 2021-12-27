import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, Checkbox, Card, CardContent, Dialog, Divider,
    IconButton, InputAdornment, List, ListItem, Typography, Toolbar, TextField } from '@mui/material';

import moment from 'moment';
import idbReady from 'safari-14-idb-fix';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

import { Api }  from '../../utilities/api';
import BackdropLoader  from '../../utilities/backdrop-loader';
import { PLANMEET_SERVICES } from '../../../config/config';
import { MASTER_SERVICES } from '../../../config/config';
import AlertMessage from '../../utilities/alert-message';

export default function Planning()
{
    const [showCustCodeDialog, setShowCustCodeDialog] = useState(false); 
    const [filter, setFilter] = useState('');
    const [custCode, setCustCode] = useState('');

    //original array of data from database
    const [custCodeList, setCustCodeList] = useState([]);

    //array contains selected customer
    const [custSelected, setCustSelected] = useState([]);

    //set Fab locaion
    const fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    };

    const loadDoctor = (filter) =>
    {
        var strFilter = filter === "" || filter === undefined ? '' : filter;

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
                    setCustCodeList(reqData.result);    
                }
            }
            catch(err)
            {
                console.log(err);
                AlertMessage().showError(err.toString());
            }
        }

        openRequest.onerror = function()
        {
            AlertMessage().showError(openRequest.error.toString());
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

    //Set Filter
    // const onFilterChange = (e) =>
    // {
    //     setFilter(e.target.values);
    // }

    //Map Customer Object Data to Customed Object (Add Status and Planning Code)
    const mapCustomedItem = (item) =>
    {
        var customedItem = {};
        customedItem.kdDokter = item.kdDokter;
        customedItem.doctorName = item.doctorName;
        customedItem.spes = item.spes;
        customedItem.alamat = item.alamat;
        customedItem.status = "Preparation";
        customedItem.createdDate = moment(new Date()).add(-1,'days').format("YYYY-MM-DD");

        var date = new Date();
        var dt = date.getDate().toString();
        var mt = (date.getMonth() + 1).toString();
        var yr = date.getFullYear().toString();

        var dtString = dt.concat(mt).concat(yr);

        customedItem.planningCode = item.kdDokter + "-" + dtString + "-" + localStorage.getItem("userId");

        return customedItem;
    }

    //Toggle Customer Check/Unchecked
    const onCustChecked = (e, item) =>
    {
        console.log(e.target.checked);
        var confirmMessage = "";
        if(e.target.checked)
        {
            confirmMessage = "Add this Doctor to Planning?";
        }
        else
        {
            confirmMessage = "Remove this Doctor from Planning?";
        }

        if(window.confirm(confirmMessage))
        {
            const currentIndex = custSelected.map(item => item.kdDokter).indexOf(item.kdDokter);
            const tempChecked = [...custSelected];

            if(currentIndex === -1)
            {
                tempChecked.push(mapCustomedItem(item));
                addData(mapCustomedItem(item));
            }
            else
            {
                tempChecked.splice(currentIndex, 1); //remove item from array : (selectedIndex, number of item to be removed)
            }

            setCustSelected(tempChecked);
            
        }

        console.log(custSelected);
    }

    //Add Planning to IDb
    const addData = (dataItem) =>
    {
        idbReady()
        .then(response =>
        {
            console.log(response);
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

    //Finalize Planning
    const onFinalize = () =>
    {
        var currentUserRole = localStorage.getItem("userRole");
        if(currentUserRole === "MR" || currentUserRole === "SPV")
        {
            if(custSelected.length < 6)
            {
                AlertMessage().showError("Please Fulfill Minimum Quota of Visit Plan (6 Customer)");
            }
        }
    }

    //Delete Expired Planning (H + 1, Status : Preparation)
    const onDeleteExpiredPlanning = () =>
    {
        //delete from state, if any
        var dataArr = custSelected.filter(item => item.status == "preparation");
        var today = moment(new Date()).format("YYYY-MM-DD");
        console.log("today : " + today);
        var expiredIndex = dataArr.filter(function(item, index, arr)
        {
            var dateDiff = moment(today).subtract(item.createdDate, 'days');
            if (dateDiff > 0)
            {
                return index;
            }
        });
        console.log(expiredIndex);

        if(expiredIndex.length > 0)
        {
            expiredIndex.map(function(item, index, arr)
            {
                custSelected.splice(item,1);
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
                    var yday = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD");
                    const delRequest = storeIndex.getAllKeys(IDBKeyRange.upperBound(yday));
                    console.log(delRequest);
                    delRequest.onsuccess = function()
                    {
                        if(delRequest.result !== undefined && delRequest.length > 0)
                        {
                            var delArr = delRequest.result;
                            delArr.map(item => store.delete(item));
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

    useEffect(() => 
    {
        loadDoctor('');
        onDeleteExpiredPlanning();
    }, []);

    useEffect(() => 
    {
        loadDoctor(filter);
    }, [filter]);

    return(
        <>
           {/* Add Customer Button */}
           <Fab size="medium" color="primary" aria-label="add" style={fabStyle} onClick={onCustCodeClick}>
                <AddIcon />
            </Fab>

            {/* Hidden Button to Remove Yesterday's Planning */}
            {/* <Button variant="outlined" color="primary" onClick={onDeleteExpiredPlanning}>
                Delete
            </Button> */}

            {/* Finalize Planning (Update Status) */}
            <Button variant="outlined" color="success" startIcon={<PlaylistAddCheckIcon />} onClick={onFinalize} disabled={custSelected.length !== 0 ? false : true}>
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
                                            <Typography variant="body2">{item.planningCode}</Typography>
                                            <Typography variant="h6"><strong>{item.kdDokter} - {item.doctorName}</strong></Typography>
                                            <Typography variant="body1">{item.spes}</Typography> 
                                            <br/>      
                                            <Typography variant="body2"><em>{item.alamat}</em></Typography>
                                        </CardContent>
                                            {/* <CardContent sx={{flex: '1 0 auto'}}>
                                                <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                            </CardContent> */}
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="body2" color="#FF0000"><strong>{item.status}</strong></Typography>     
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
                <Box sx={{display: 'flex', justifyContent: 'space-around'}}>
                    <TextField label="Search" variant="outlined"
                            value={filter} onChange={(e) => setFilter(e.target.value)} 
                            InputProps={{endAdornment: 
                                <InputAdornment position="end">
                                    <IconButton><SearchIcon />
                                    </IconButton>
                                </InputAdornment>}}
                    />   
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
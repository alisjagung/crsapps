import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, Checkbox, Card, CardActions, CardContent, Dialog, Divider,
    Grid, IconButton, InputAdornment, List, ListItem, MenuItem, Typography, Toolbar, TextField } from '@mui/material';

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

        Api(MASTER_SERVICES + "dokter/load-dokter").getApi("",{params: {startDataIndex : 0, perPage : 10, filterBy : strFilter, orderBy : 'KdDokter', orderByDirection : 'asc'}})
            .then(response =>
            {
                setCustCodeList(response.data);
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            });   
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
    const onFilterChange = (e) =>
    {
        setFilter(e.target.values);
    }

    //Search Customer Data
    const handleSearch = () =>
    {
        
    }

    //Map Customer Object Data to Customed Object (Add Status and Planning Code)
    const mapCustomedItem = (item) =>
    {
        var customedItem = {};
        customedItem.kdDokter = item.kdDokter;
        customedItem.namaDokter = item.namaDokter;
        customedItem.spes = item.spes;
        customedItem.alamat = item.alamat;
        customedItem.status = "Preparation";

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
            }
            else
            {
                tempChecked.splice(currentIndex, 1); //remove item from array : (selectedIndex, number of item to be removed)
            }

            setCustSelected(tempChecked);
        }

        console.log(custSelected);
    }

    //Finalize Planning
    const onFinalize = () =>
    {
        var currentUserRole = localStorage.getItem("userRole");
        if(currentUserRole == "MR" || currentUserRole == "SPV")
        {
            if(custSelected.length < 5)
            {
                AlertMessage().showError("Please Fulfill Minimum Quota of Visit Plan (6 Customer)");
            }
        }
    }

    useEffect(() => 
    {
        loadDoctor('');
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
                                            <Typography variant="h6"><strong>{item.kdDokter} - {item.namaDokter}</strong></Typography>
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
                                    <IconButton onClick={handleSearch}><SearchIcon />
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
                                            <Typography variant="h6"><strong>{item.kdDokter} - {item.namaDokter}</strong></Typography>
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
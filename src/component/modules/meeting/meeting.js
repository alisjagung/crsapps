//React
import React from 'react';
import { Link } from "react-router-dom";
//Material
import { Box, Button, Card, CardContent, Divider, List, ListItem, Typography } from '@mui/material';
//Idb
import idbReady from 'safari-14-idb-fix';
//Icon
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
//Component
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default class Meeting extends React.Component
{
    constructor(props)
    {
        // Comment - Launch Appreciation : load idb, arr data
        super(props);
        
        this.LoadMeetingData = this.LoadMeetingData.bind(this);
        this.updateMeetingData = this.updateMeetingData.bind(this);

        //this.LoadMeetingData();

        this.state = {
            showDetailMeetingDialog : false,
            showSignatureDialog : false,
            selfiePreview : '',
            signPreview : '',
            arrMeetingData : [],
            meetingData : {},

        };
    }

    //Styles
    style = {
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

    //--- START MEETING DATA RELATED ---//

    //Load Meeting Data
    LoadMeetingData()
    {
        try
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "planning/load-today-planning-by-user").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter : "", page : 1}})
            .then(response =>
            {
                if(response.data !== undefined)
                {
                    localStorage.setItem("arrMeetingData", JSON.stringify(response.data));
                    this.setState({arrMeetingData : JSON.parse(localStorage.getItem("arrMeetingData"))});
                }

                //update data on idb from database
                this.updateMeetingData();
            })
            .catch(error =>
            {
                const openRequest = indexedDB.open("CRSDB", 1);
                openRequest.onsuccess = function()
                {
                    const openIdb = openRequest.result;
                    try
                    {
                        const tx = openIdb.transaction("meeting", "readonly");
                        const store = tx.objectStore("meeting");
                    
                        var reqData = store.getAll();
                        reqData.onsuccess = function()
                        {
                            if(reqData.result.length > 0)
                            {
                                localStorage.setItem("arrMeetingData", JSON.stringify(reqData.result));
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
        catch(err)
        {
            AlertMessage().showError(err.toString());
        }
    }

    //Update Meeting Data on IDb
    updateMeetingData()
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

                    //delete all data first
                    const clearIdb =  store.clear();
                    clearIdb.onsuccess = function()
                    {
                        //add new data from database
                        var arrMeeting = JSON.parse(localStorage.getItem("arrMeetingData"));

                        arrMeeting.map(function(item, index, arr) 
                        { 
                            //add new data
                            const addData = store.add(item);
                            addData.onerror = function(event)
                            {
                                var errMessage = event.target.error.name.toString + " : " + event.target.error.message.toString();
                                AlertMessage().showError(errMessage);
                            }
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

    //--- END MEETING DATA RELATED ---//

   componentDidMount()
   {
       
   }

    render()
    {
        return(
            <>
            {/* Meeting Data List */}
            <List>
            {this.state.arrMeetingData.map((item, index, arr) => 
            {
                return(
                        <div key={item.kdPlanning}>
                        <ListItem
                            key={item.kdPlanning}
                        >
                            <Card elevation={0} sx={this.style.card}>
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
                                        <Typography variant="body2" color="#FF0000"><strong>{item.statusPlanning}</strong></Typography>     
                                    </CardContent>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Link to={`/meeting-detail/${item.kdPlanning}`}>
                                            <Button variant="contained" endIcon={<DoubleArrowIcon />}>Detail</Button>
                                        </Link>
                                    </CardContent>
                                </Box>
                            </Card> 
                                                    
                        </ListItem>                            
                        <Divider variant="middle" />                        
                        </div>                        
                    );
                })}
        </List>
        </>
        );
    }
}
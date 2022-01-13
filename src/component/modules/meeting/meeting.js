import React from 'react';
import { Link } from "react-router-dom";
import { Box, Button, Card, CardContent, Divider,
   List, ListItem, Typography } from '@mui/material';

import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'

import { Api }  from '../../utilities/api';
import BackdropLoader  from '../../utilities/backdrop-loader';
import AlertMessage from '../../utilities/alert-message';

export default class Meeting extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            showDetailMeetingDialog : false,
            showSignatureDialog : false,
            selfiePreview : '',
            signPreview : '',
            arrMeetingData : [],
            meetingData : {},

        };

        this.onMeetingCardClick = this.onMeetingCardClick.bind(this);
        this.onMeetingDetailClose = this.onMeetingDetailClose.bind(this);
        this.LoadMeetingIDb = this.LoadMeetingIDb.bind(this);
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

    //Load Meeting Data from IDb
    LoadMeetingIDb()
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
        };

        openRequest.onerror = function()
        {
            AlertMessage().showError(openRequest.error.toString());
        }
    }

    //Toggle Open Meeting Detail Dialog
    onMeetingCardClick(index)
    {
        var arrData =  [...this.state.arrMeetingData];
        var data = arrData[index];
        
        if (data.address == "" || data.address == undefined || data.address == null)
        {   
            //set location
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
                            localStorage.setItem("latMeeting", pos.coords.latitude);
                            localStorage.setItem("longMeeting", pos.coords.longitude);
                            localStorage.setItem("locMeeting", response.data.items[0].title);
                        })
                    .catch(error => AlertMessage().showError(error))
                }
                else
                {
                    Api(process.env.REACT_APP_MASTER_SERVICES + "location/load-ga-location").getApi("",{params :{latitude: pos.coords.latitude, longitude: pos.coords.longitude}})
                    .then(response => 
                        {
                            localStorage.setItem("latMeeting", pos.coords.latitude);
                            localStorage.setItem("longMeeting", pos.coords.longitude);
                            localStorage.setItem("locMeeting", response.data.features[0].properties.formatted);
                        })
                    .then(res =>
                        {
                            data.latitude = localStorage.getItem("latMeeting");
                            data.longitude = localStorage.getItem("longMeeting");
                            data.address = localStorage.getItem("locMeeting");                    
                        })
                    .catch(error => AlertMessage().showError(error))
                }                              
            });

            this.setState({meetingData : data}, () => 
            {
               //console.log(this.state.meetingData);
               this.setState({showDetailMeetingDialog : true});
            });

         }
    }

   //Toggle Close Meeting Detail Dialog
   onMeetingDetailClose(index, dataObj)
   {
    var tempArr = [...this.state.arrMeetingData];

    tempArr[index].latitude = dataObj.latitude;
    tempArr[index].longitude = dataObj.longitude;
    tempArr[index].address = dataObj.address;
    tempArr[index].doctorNote = dataObj.doctorNote;
    tempArr[index].meetingDetail = dataObj.meetingDetail;
    tempArr[index].userPhoto = dataObj.userPhoto;
    tempArr[index].doctorSign = dataObj.doctorSign;

    this.setState({arrMeetingData : tempArr}, () => {this.setState({showDetailMeetingDialog : false})});
   }
   
    componentDidMount()
    {
        //load meeting from idb
        //this.LoadMeetingIDb();
        //this.setState({arrMeetingData : JSON.parse(localStorage.getItem("arrMeetingData"))});
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
                                        <Typography variant="h6"><strong>{item.doctorName}</strong></Typography>
                                        <Typography variant="body1">[{item.doctorSpec}]</Typography> 
                                        <br/>      
                                        <Typography variant="body2"><em>{item.doctorAddress}</em></Typography>
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
//React
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
//Material
import { Avatar, Box, Button, Card, CardContent, Divider, Typography, Stack } from '@mui/material';
//Icon
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TagIcon from '@mui/icons-material/Tag';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
//Component
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default function UserProfile()
{
    const [avatarInitial, setAvatarInitial] = useState('');

    const userId = localStorage.getItem("userId");
    const loginName = localStorage.getItem("userDisplayName");
    const userRef = localStorage.getItem("userRef");
    const userRole = localStorage.getItem("userRole");
    const leaderCode = localStorage.getItem("leaderCode")
    
    const [leaderName, setLeaderName] = useState('');

    useEffect(() => 
    {
        if(loginName !== "" && loginName !== undefined)
        {
            var strArray = loginName.split(" ");
            var initialResult = "";

            for(var i = 0; i < strArray.length; i++)
            {
                var tempInitial = strArray[i].charAt(0);
                initialResult += tempInitial;
            }

            setAvatarInitial(initialResult);
        }

        Api(process.env.REACT_APP_AUTH_SERVICES + "load-user-by-ref").getApi("", {params: {refCode : leaderCode}})
        .then(response =>
        {
            if(response.data !== undefined)
            {
                setLeaderName(response.data.nameUser);
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
    }, []);

    return(
        <>
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            {/* Title */}
            <Typography variant="h6" style={{textAlign: "center", justifyContent: "center"}}>PROFILE</Typography>
            <br/><br/>

            <Stack direction='column' spacing={2} sx={{textAlign: "center", justifyContent: "center"}}>
                
                <div style={{textAlign: "center", justifyContent: "center", margin: "0 auto"}}>
                    <Avatar sx={{backgroundColor:'#085596', width: 178, height: 178, fontSize: '72px'}} >{avatarInitial}</Avatar>
                </div>
                
                <p style={{fontSize: "36px"}}><strong>{loginName}</strong></p>
                <p style={{fontSize: "20px", opacity: "0.5"}}>{userRole}</p>

                <Card sx={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', color: '#000000', backgroundColor: '#90caf9'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <PersonIcon sx={{width: 70, height: 70}} />
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flex: '1 0 auto', position: "relative", top: "50%", paddingTop: "36px;"}}>
                            <p style={{fontSize: "20px"}}>UserCode</p>
                            <p style={{fontSize: "20px", opacity: "0.8"}}>{userId}</p>
                        </CardContent>
                    </Box>
                </Card>
                <Divider variant="middle" />                       


                <Card sx={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', color: '#000000', backgroundColor: '#90caf9'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <TagIcon sx={{width: 70, height: 70}} />
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flex: '1 0 auto', position: "relative", top: "50%", paddingTop: "36px;"}}>
                            <p style={{fontSize: "20px"}}>Ref Code</p>
                            <p style={{fontSize: "20px", opacity: "0.8"}}>{userRef}</p>
                        </CardContent>
                    </Box>
                </Card>
                <Divider variant="middle" />                       


                <Card sx={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', color: '#000000', backgroundColor: '#90caf9'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <SupervisorAccountIcon sx={{width: 70, height: 70}} />
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <CardContent sx={{flex: '1 0 auto', position: "relative", top: "50%", paddingTop: "36px;"}}>
                            <p style={{fontSize: "20px"}}>Leader Name</p>
                            <p style={{fontSize: "20px", opacity: "0.8"}}>{leaderName}</p>
                        </CardContent>
                    </Box>
                </Card>
            </Stack>
        </>        
    );
}
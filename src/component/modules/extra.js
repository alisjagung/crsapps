import React from "react";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Card, CardActions, CardContent, Typography} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Extra()
{
    const arrIcon = [
        {"id": 1, "icon": ["fas","coffee"], "title": "Profile", "route": "profile"},
        {"id": 2, "icon": ["fas","calendar-alt"], "title": "History", "route": "history"},
        {"id": 3, "icon": ["fas","medal"], "title": "Appreciation", "route": "appreciation"},
        {"id": 4, "icon": ["fas","calendar"], "title": "Appreciation History", "route": "appreciation-list"},
        {"id": 5, "icon": ["fas","sync"], "title": "Synchronize", "route": "sync"},
        {"id": 6, "icon": ["fas","cloud-upload-alt"], "title": "Upload", "route": "upload"},
        //{"id": 7, "icon": ["fas","sign-out-alt"], "title": "Logout", "route": "logout"}
    ]

    const navigate = useNavigate();

    const handleExtraMenuClick = (item) =>
    {
        if(item.route === "logout")
        {
            localStorage.setItem("userId","");
            window.location.href="/crs-mobile/";
        }
        else
        {
            navigate(item.route, {replace: true});
        }
        
    }

    return(
        <>
        <Box sx={{flexGrow:1}}>
            <Grid container rowSpacing={{ xs: 2, md: 3 }} columnSpacing={{ xs: 4, sm: 8, md: 12 }} alignItems="center" justifyContent="center">
            {arrIcon.map(item => 
            {
                return (
                        <Grid item xs={4} sm={4} md={4} key={item.id} onClick={() => handleExtraMenuClick(item)}>
                            <Card style={{backgroundColor:"#0B70C6", color:"#FFFFFF"}}>
                                <CardContent style={{textAlign:"center", justifyContent:"center"}}>
                                    <FontAwesomeIcon icon={item.icon}  />
                                </CardContent>
                                <CardActions style={{alignItems:"center",justifyContent:"center"}}>
                                    <Typography variant="subtitle1" noWrap={true}>
                                        {item.title}
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>
                );
            })}
            </Grid>
        </Box>
        </>    
    );
}

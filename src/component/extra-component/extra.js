import React, { useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Card, CardActions, CardContent, Typography} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Appreciation from "../appreciation-component/appreciation";

export default function Extra()
{
    const [module, setModule] = useState("default");
    const arrIcon = [
        {"id": 1, "icon": ["fas","coffee"], "title": "Profile", "route":"default"},
        {"id": 2, "icon": ["fas","calendar-alt"], "title": "History" , "route":"default"},
        {"id": 3, "icon": ["fas","medal"], "title": "Appreciation", "route":"appr"},
        {"id": 4, "icon": ["fas","sync"], "title": "Synchronize" , "route":"default"},
        {"id": 5, "icon": ["fas","cloud-upload-alt"], "title": "Upload" , "route":"default"},
        {"id": 6, "icon": ["fas","sign-out-alt"], "title": "Logout", "route":"logout"}
    ]

    if(module === "default")
    {
        return(
            <>
            <Box sx={{flexGrow:1}}>
                <Grid container rowSpacing={{ xs: 2, md: 3 }} columnSpacing={{ xs: 4, sm: 8, md: 12 }} alignItems="center" justifyContent="center">
                {arrIcon.map(item => 
                {
                    return (
                            <Grid item xs={4} sm={4} md={4} key={item.id}>
                                <Card style={{backgroundColor:"#0B70C6", color:"#FFFFFF"}} onClick={() => setModule(`${item.route}`)}>
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
    else
    {   
        if(module === "appr")
        {
            return (<Appreciation setModule={setModule}  />);
        }
        else if(module === "logout")
        {
            localStorage.setItem("userId","");
            window.location = "/";
        }
        else
        {
            setModule("default");
        }
    }

}

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button, Drawer, Divider, IconButton, Tabs, Tab, Typography, Avatar } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import GroupIcon from '@mui/icons-material/Group';

export default function NavTabs()
{
    const tabRoutes = ['/planning','/meeting','/extra'];
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [avatarInitial, setAvatarInitial] = useState('');
    const container = window !== undefined ? () => window.document.body : undefined;

    const loginName = localStorage.getItem("userDisplayName");
    const userRole = localStorage.getItem("userRole");
    
    var currentRoutes = useLocation().pathname;
    var currentTab = tabRoutes.filter(item => currentRoutes.indexOf(item) !== -1)[0];

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
    }, []);

    const toggleDrawerOpen = () =>
    {
        setDrawerOpen(true);
    }

    const toggleDrawerClose = () =>
    {
        setDrawerOpen(false);
    }

    const handleLogout = () =>
    {
        localStorage.setItem("userId", "");
        window.location.href = "crs-mobile/login";
    }

    return(
        <>
        <Tabs variant="scrollable" scrollButtons="auto" value={currentTab} aria-label="CRS Tabs" style={{marginLeft:'16px'}}>
            <IconButton onClick={toggleDrawerOpen} edge="start">
                <MenuIcon />
            </IconButton>
            {userRole !== "MR" && <Tab label="Approval" value="/approval" to="/approval" component={Link}  />}
            <Tab label="Planning" value="/planning" to="/planning" component={Link} />
            <Tab label="Meeting" value="/meeting" to="/meeting" component={Link} />
            <Tab label="Extra" value="/extra" to="/extra" component={Link}  />
        </Tabs>

        <Drawer
            anchor="left"
            container={container}
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawerClose}
            ModalProps={{keepMounted: true}}
            sx={{
                width : 200,
                flexShrink: 0,
                '& .MuiDrawer-paper' : {width:200, boxSizing: "border-box"}
            }}
        >
            {/* <IconButton onClick={toggleDrawerClose}>
                <ChevronLeftIcon />
            </IconButton>
            <Divider /> */}
            <div className="drawer-body" style={{marginTop:20}}>
                <Avatar sx={{backgroundColor:'#085596', width: 56, height: 56}}>{avatarInitial}</Avatar>
                <div style={{marginTop:10}}></div>
                <Typography variant="subtitle2">{loginName}</Typography>
                <div style={{marginTop:10}}></div>
                <Divider />
                <div style={{marginTop:10}}></div>
                <Button variant="text" startIcon={<GroupIcon />} sx={{color: '#000000'}}>Join Visit</Button>
                <Button variant="text" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{color: '#000000'}}>Logout</Button>
            </div>
        </Drawer>
        <br />
        </>
    );
}
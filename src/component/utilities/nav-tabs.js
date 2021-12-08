import React from "react";
import { Link, useLocation } from "react-router-dom";

import { Tabs, Tab, Typography } from "@mui/material";

export default function NavTabs()
{
    const tabRoutes = ['/planning','/meeting','/extra'];
    var currentRoutes = useLocation().pathname;
    var currentTab = tabRoutes.filter(item => currentRoutes.indexOf(item) !== -1)[0];

    return(
        <>
            <Tabs value={currentTab} aria-label="CRS Tabs">
                <Tab label="Planning" value="/planning" to="/planning" component={Link} />
                <Tab label="Meeting" value="/meeting" to="/meeting" component={Link} />
                <Tab label="Extra" value="/extra" to="/extra" component={Link}  />
            </Tabs>
            <Typography variant="subtitle2" style={{textAlign:"right"}}>Welcome, {localStorage.getItem("userDisplayName")}</Typography>
            <hr/>
        </>
    );
}
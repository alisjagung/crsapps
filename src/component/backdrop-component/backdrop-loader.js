import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

export default function BackdropLoader (params)
{
    return(
        <>
            <Backdrop 
            sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={true}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}
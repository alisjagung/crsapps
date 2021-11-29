import React, { useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";

export default function BackdropLoader (params)
{
    const [openLoader, setOpenLoader] = useState(false);

    const showLoader = (value) =>
    {
        //setOpenLoader(value);
        console.log(value);
    }

    return(
        <>
            <Backdrop 
            sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={params.showLoader}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}
import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

export default class BackdropLoader extends React.Component
{
    openLoader = false;

    constructor(props)
    {
        super(props);
        this.showLoader = this.showLoader.bind(this);
    }
   
    showLoader(value)
    {
       this.openLoader = value;
       console.log(value);
       this.forceUpdate();
    }

    render()
    {
        return(
            <>
                <Backdrop 
                sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={this.openLoader}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </>
        );
    }

    
}
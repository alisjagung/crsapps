import React from "react";
import LoaderIcon from '../../img/loader-gif.gif';

export default class BackdropLoader extends React.Component
{
    openLoader = false;

    constructor(props)
    {
        super(props);
        this.setHidden = this.setHidden.bind(this);
    }
   
    setHidden(value)
    {
       this.openLoader = value;
       console.log(value);
       this.forceUpdate();
    }

    render()
    {
        return(
            <>
                {/* <Backdrop 
                sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={this.openLoader}>
                    <CircularProgress color="inherit" />
                </Backdrop> */}
                <div className="loaderclassName" style={{position: "fixed", top: 0, width: "100%", height: "100%", zIndex: 1234, backgroundColor: "rgba(0, 0, 0, 0.6)"}} hidden={this.openLoader}>
                    <div style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
                        <img src={LoaderIcon} alt="Loading..." className="ajax-loader" />
                    </div>
                </div>  
            </>
        );
    }

    
}
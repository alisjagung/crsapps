import React from "react";
import LoaderIcon from '../../img/loader-gif.gif';

export default class BackdropLoader extends React.Component
{
    //hideLoader = false;

    constructor(props)
    {
        super(props);
        //this.setHidden = this.setHidden.bind(this);

        // if(props.hideLoader !== undefined)
        // {
        //     //console.log(props.hideLoader);
        //     //this.setHidden(props.hideLoader);
        // }
    }
   
    // setHidden(value)
    // {
    //    this.hideLoader = value;
    //    this.forceUpdate();
    // }

    render()
    {
        return(
            <>
                {/* <Backdrop 
                sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={this.hideLoader}>
                    <CircularProgress color="inherit" />
                </Backdrop> */}
                <div className="loaderclassName" style={{position: "fixed", top: 0, width: "100%", height: "100%", zIndex: 1234, backgroundColor: "rgba(0, 0, 0, 0.6)"}} hidden={this.props.hideLoader}>
                    <div style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
                        <img src={LoaderIcon} alt="Loading..." className="ajax-loader" />
                    </div>
                </div>  
            </>
        );
    }

    
}
import React from 'react';
import { Link } from "react-router-dom";

import moment from 'moment';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Backdrop, CircularProgress } from '@mui/material';

import { ToastContainer } from 'react-toastify';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Api }  from '../utilities/api';
import { PLANMEET_SERVICES } from '../../config/config';
import AlertMessage from '../utilities/alert-message';
import CustomListItem from '../utilities/list-item';

export default class AppreciationHistory extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            showLoader: false,
            listItem: []
        }
    }

    componentDidMount()
    {
        this.setState({showLoader: true});
    }

    componentDidUpdate()
    {
        Api(PLANMEET_SERVICES + "appreciation/load-appreciation-by-user").getApi("",{params: {userCode : localStorage.getItem("userId")}})
        .then(response =>
            {
                var tempArr = [];
                response.data.map(function(currentItem, index, arr)
                {
                    var tempObj = {};

                    tempObj.key = "id";
                    tempObj.id = currentItem.id;
                    tempObj.url = "/extra/appreciation/";
                    tempObj.title = currentItem.customerCode;
                    tempObj.subtitle = moment(currentItem.apprDate,"YYYY-MM-DD").format("DD-MM-YYYY");
                    tempObj.content = currentItem.location;
                    tempObj.status = "Saved";
                    
                    tempArr.push(tempObj);  
                    return true;
                })
                this.setState({listItem: tempArr});
                this.setState({showLoader: false});
            })
        .catch(error =>
            {
                AlertMessage().showError(error);
            })
    }

        
    render()
    {
        return(
            <div className="appr-hist">
            <Link to="/extra"><Button variant="outlined" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
                <hr />
                <Typography variant="h6">APPRECIATION HISTORY</Typography>
                <br/>
                {/* <CustomListItem listItem={listItem} textColor="#01579B" bgColor="#FFCDD2" module="hist" type="non-approval" /> */}
                {/* <CustomListItem listItem={listItem} textColor="#01579B" bgColor="#BBDEFB" module="hist" type="non-approval" /> */}
                <CustomListItem listItem={this.state.listItem} textColor="#01579B" bgColor="#BBDEFB" module="appr-hist" type="non-approval" />
                
                <ToastContainer />
                
                <Backdrop 
                    sx={{color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1}}
                    open={this.state.showLoader}>
                        <CircularProgress color="inherit" />
                </Backdrop>
            </div>
        );
    }
}
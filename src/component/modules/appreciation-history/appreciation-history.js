import React from 'react';
import { Link } from "react-router-dom";

import moment from 'moment';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import SearchIcon from '@mui/icons-material/Search';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { Api }  from '../../utilities/api';

import './custom.css';

import AlertMessage from '../../utilities/alert-message';
import BackdropLoader  from '../../utilities/backdrop-loader';

export default class AppreciationHistory extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            showLoader: false,
            listItem: [],
            page: 1,
            filter: ''
        }

        this.loaderRef = React.createRef();
        this.openLoaderButtonRef = React.createRef();
        this.hideLoaderButtonRef = React.createRef();

        this.loadData = this.loadData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.infiniteScroll = this.infiniteScroll.bind(this);
    }

    //Set Fab location
    fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
        zIndex: 1234 
    };

    loadData(pageNum, filterString)
    {
        this.openLoaderButtonRef.current.click();

        if(filterString !== '' && filterString !== undefined)
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-user").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter : filterString, page : pageNum}})
            .then(response => 
            {
                this.setState({listItem : [...response.data]});
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            })

        }
        else
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-user").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter : filterString, page : pageNum}})
            .then(response => 
            {
                this.setState({listItem : [...this.state.listItem, ...response.data]});
            })
            .catch(error =>
            {
                AlertMessage().showError(error);
            })
        }

        this.hideLoaderButtonRef.current.click();
    }

    handleFilterChange(e)
    {
        this.setState({filter: e.target.value});
    }

    handleSearch()
    {
        this.loadData(this.state.page, this.state.filter);
    }

    infiniteScroll()
    {
        if(window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight)
        {
            var newPage = this.state.page;
            newPage++;
            this.setState({page : newPage});

            this.loadData(this.state.page, this.state.filter);
        }
    }

    componentDidMount()
    {
        window.addEventListener('scroll', this.infiniteScroll);
        this.openLoaderButtonRef.current.click();

        this.loadData(this.state.page, this.state.filter);

        this.hideLoaderButtonRef.current.click();
    }

    //go to up
    onButtonUpClick()
    {
        window.scrollTo(0, 0);
    }
        
    render()
    {
        return(
        <>
            {/* Loader Manipulation Component */}
            <Button hidden={true} ref={this.openLoaderButtonRef} onClick={() => this.loaderRef.current.setHidden(false)}>Show Loader</Button>
            <Button hidden={true} ref={this.hideLoaderButtonRef} onClick={() => this.loaderRef.current.setHidden(true)}>Hide Loader</Button>
            <BackdropLoader ref={this.loaderRef} />

            {/* Go to Up Button */}
            <Fab size="medium" color="primary" aria-label="up" style={this.fabStyle} onClick={this.onButtonUpClick}>
                <KeyboardArrowUpIcon />
            </Fab>
            
            {/* Navigation, Action Button */}
            <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                Back
            </Button></Link>&nbsp;&nbsp;&nbsp;
            <hr />

            <Box sx={{display: 'flex', justifyContent: 'space-around'}}>
            <TextField label="Search" variant="outlined"
                    value={this.state.filter} onChange={this.handleFilterChange} 
                    InputProps={{endAdornment: 
                        <InputAdornment position="end">
                            <IconButton onClick={this.handleSearch}><SearchIcon />
                            </IconButton>
                        </InputAdornment>}}
            />   
            </Box>
            <br/>
            {this.state.listItem.map(item => 
                {
                    return(
                        <div id={item.id} key={item.id}>
                            <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#000000', backgroundColor: '#90caf9'}}>
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="h6">{item.customerCode} &nbsp;&nbsp;({item.creatorName})</Typography>
                                        <Typography variant="subtitle1">{moment(item.apprDate,"YYYY-MM-DD").format("DD-MM-YYYY")}</Typography>       
                                        <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                    </CardContent>
                                        {/* <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                        </CardContent> */}
                                </Box>
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="subtitle2" color="#FF0000"><strong>Saved</strong></Typography>     
                                    </CardContent>
                                    <CardActions>
                                        <Link to={`/extra/appreciation/${item.id}`}><Button><DoubleArrowIcon /></Button></Link>
                                    </CardActions>
                                </Box>
                            </Card>
                            <Divider variant="middle" />                       
                        </div>
                    );
                })} 
        </>
        );
    }
}
import React  from 'react';
import { Link } from "react-router-dom";

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

export default class CustomListItem extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            arrItem: [],
            keyword: ''
        }
    }

    componentDidUpdate(prevProps) 
    {
        if(this.props.listItem !== prevProps.listItem)
        {
            this.setState({arrItem: this.props.listItem});
            console.log(this.state.arrItem);
        }
    }

    handleSearch()
    {
        if(this.state.keyword !== "" && this.state.keyword !== undefined)
        {
            var allItemArr = this.props.listItem;
            var filteredArr = [];
            var kword = this.state.keyword.toString().trim().toLowerCase();
            for(var i = 0; i < allItemArr.length; i++)
            {
                for(var key in allItemArr[i])
                {   
                    var vl = allItemArr[i][key].toString().trim().toLowerCase();
                    if(vl.indexOf(kword) !== -1)
                    {
                        filteredArr.push(allItemArr[i]);
                    }
                }
            }
            this.setState({arrItem: filteredArr});
        }
        else
        {
            this.setState({arrItem: this.props.listItem});
        }
    }

    setTextColor(item)
    {
        return this.props.textColor;
    }

    setBgColor(item)
    {
        var module = this.props.module;
        if(module !== "" && module !== undefined)
        {
            module = module.toString().trim().toLowerCase();
            if(module.indexOf("history") !== -1)
            {
                var status = item.status;
                if(status !== "" && status !== undefined)
                {
                    status = status.toString().trim().toLowerCase()
                    if(status.indexOf("local") !== -1)
                    {
                        return "#FFCDD2";
                    }
                    else if(status.indexOf("upload") !== -1)
                    {
                        return "#BBDEFB";
                    }
                    else
                    {
                        return this.props.bgColor;
                    }
                }
                else
                {
                    return this.props.bgColor;
                }
            }
            else
            {
                return this.props.bgColor;
            }
        }
        else
        {
            return this.props.bgColor;
        }
    }

    render()
    {
        return(
            <>
                <Box sx={{display: 'flex', justifyContent: 'space-around'}}>
                    <TextField label="Search" value={this.state.keyword} onChange={(e) => this.setState({keyword: e.target.value})}  
                        InputProps={{endAdornment: <InputAdornment position="end"><IconButton onClick={this.handleSearch}><SearchIcon /></IconButton></InputAdornment>}}></TextField>
                </Box>
                <br/>
                {this.state.arrItem.map(item => 
                    {
                        return(
                            <div id={item.id} key={item.id}>
                                <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: this.setTextColor(item), backgroundColor: this.setBgColor(item)}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="h6">{item.title}</Typography>
                                            <Typography variant="subtitle1">{item.subtitle}</Typography>       
                                        </CardContent>
                                            <CardContent sx={{flex: '1 0 auto'}}>
                                                <Typography variant="subtitle2"><em>{item.content}</em></Typography>
                                            </CardContent>
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="subtitle2" color="#FF0000"><strong>{item.status}</strong></Typography>     
                                        </CardContent>
                                        <CardActions>
                                            <Link to={item.url + item.id}><Button><DoubleArrowIcon /></Button></Link>
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
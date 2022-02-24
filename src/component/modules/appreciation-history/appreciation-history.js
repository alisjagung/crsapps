//React
import React from 'react';
import { Link } from "react-router-dom";
//Material
import { AppBar, Box, Button, Dialog, Fab,
    IconButton, MenuItem,  Typography, Toolbar, TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import { ThemeProvider } from "@mui/styles";
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import MUIDataTable from "mui-datatables";
//Icon
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
//import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
//Component
import moment from 'moment';
import 'moment-timezone';
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';
import BackdropLoader  from '../../utilities/backdrop-loader';
import Select from 'react-select'
//import Appreciation from '../appreciation/appreciation';
//CSS
import './custom.css';

export default class AppreciationHistory extends React.Component
{
    //Styles : Set Fab location
    fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 50,
        left: 'auto',
        position: 'fixed',
        zIndex: 1234 
    };
    
    constructor(props)
    {
        super(props);
        
        //States
        this.state = {
            hideLoader: true,
            showDetailData: false,

            dataId: 0,
            listItem: [],
            page: 1,
            totalData: 1,
            totalPage: 1,

            //filter: '',
            filterCustCode: [],
            filterPICName: [],
            filterApprDate: [],
            filterDate: moment().tz('Asia/Jakarta').format(),
            filterText: '',
            filterColumn: '',
            
            // hideTextFilter: false,
            // hideDateFilter: true,
            hideCustCodeFilter: true,
            hidePICNameFilter: true,
            hideApprDateFilter: true, 
            yearText: '',
            previousYearText: '',
            
            imgSource: '',
            showImageDialog: false
            //monthText: '',
            //monthList: ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"]
        }

        //Bind Function
        this.loadData = this.loadData.bind(this);
        
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleFilterColumnChange = this.handleFilterColumnChange.bind(this);
        this.handleFilterEventChange = this.handleFilterEventChange.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.loadPagingData = this.loadPagingData.bind(this);

        // this.handleDateChange = this.handleDateChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleDetailButtonClick = this.handleDetailButtonClick.bind(this);
        
        this.loadAppreciation = this.loadAppreciation.bind(this);
        this.loadAppreciationLocation = this.loadAppreciationLocation.bind(this);

        //Filter Related
        this.loadFilterHierarchyTeam = this.loadFilterHierarchyTeam.bind(this);
        this.loadFilterAppreciationCust = this.loadFilterAppreciationCust.bind(this);

        //this.infiniteScroll = this.infiniteScroll.bind(this);
    }

    //After Render Process
    componentDidMount()
    {
        // window.addEventListener('scroll', this.infiniteScroll);

        const d = new Date();
        //this.setState({monthText : this.state.monthList[d.getMonth()], yearText: d.getFullYear()});
        this.setState({yearText: d.getFullYear(), previousYearText: d.getFullYear() - 1});

        //this.loadData(this.state.page, this.state.filter, this.state.filterColumn);
        //this.loadFilterHierarchyTeam();
        //this.loadFilterAppreciationCust();
    }
    
    //Load Filter Hierarchy Team
    loadFilterHierarchyTeam(filterText)
    {
        Api(process.env.REACT_APP_AUTH_SERVICES + "load-hierarchy-team-paging").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), startDataIndex: "0", filterBy: filterText}})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                if(response.data.length > 0)
                {
                    var arrResponse = [...response.data];
                    var arrFilterPic = [];
    
                    arrResponse.map(item => 
                    {
                        var filterObj = {};
                        filterObj.value = item.nameUser;
                        filterObj.label = item.nameUser;
                        arrFilterPic.push(filterObj);
                    });
                    
                    this.setState({filterPICName : arrFilterPic});
                    this.setState({hideLoader : true});
                }
            }
        })
        .catch(error =>
        {
            if(error.response === undefined)
            {
                AlertMessage().showError(error.message);
            }
            else
            {
                AlertMessage().showError(error.response.data.message);
            }
        })
    }

    //Load Filter Appreciation Customer List
    loadFilterAppreciationCust(filterType, filterText)
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-team-list").getApi("", {params: {userCode: localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter: filterText, filterColumn: filterType, page : 1, mode : "yeartoyear", option : "loadFilterData"}})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                if(response.data.length > 0)
                {
                    var responseData = response.data;

                    // var responseCustData = [...new Set(responseData.map(item => item.customerCode))];
                    // var responseDateData = [...new Set(responseData.map(item => item.apprDate))];

                    var responseCustData = responseData.map(item => item.customerCode);
                    var responseDateData = responseData.map(item => item.apprDate);

                    if(filterType === "CustomerCode")
                    {
                        var arrCustCode = [];
                        responseCustData.map(item =>
                        {
                            var objCustCode = {};
                            objCustCode.value = item;
                            objCustCode.label = item;
                            arrCustCode.push(objCustCode);
                        });

                        this.setState({filterCustCode: arrCustCode});
                        this.setState({hideLoader : true});                        
                    }

                    if(filterType === "ApprDate")
                    {
                        var arrCustDate = [];
                        responseDateData.map(item =>
                        {
                            var objCustDate = {};
                            objCustDate.value = moment(item).format("YYYY-MM-DD");
                            objCustDate.label = moment(item).format("DD-MMM-YYYY");
                            arrCustDate.push(objCustDate);
                        });

                        this.setState({filterApprDate: arrCustDate});
                        this.setState({hideLoader : true});      
                    }
                    
                }
            }
        })
        .catch(error =>
        {
            if(error.response === undefined)
            {
                AlertMessage().showError(error.message);
            }
            else
            {
                AlertMessage().showError(error.response.data.message);
            }
        })
    }

    //Load Data
    loadData(pageNum, filterString, filterColumn)
    {
        // if(filterColumn === 'ApprDate')
        // {
        //     filterString = moment(this.state.filterDate).tz('Asia/Jakarta').format("YYYY-MM-DD");
        // }

        if(filterString !== '' && filterString !== undefined)
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-team-list").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter : filterString, filterColumn : filterColumn, page : pageNum, mode : "yeartoyear", option : ""}})
            .then(response => 
            {
                this.setState({listItem : [...response.data], totalData : response.totalData, totalPage : response.totalPage}, () => this.setState({hideLoader : true}));
            })
            .catch(error =>
            {
                if(error.response === undefined)
                {
                    AlertMessage().showError(error.message);
                }
                else
                {
                    AlertMessage().showError(error.response.data.message);
                }
            })
        }
        else
        {
            Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-team-list").getApi("",{params: {userCode : localStorage.getItem("userId"), role: localStorage.getItem("userRole"), filter : "", filterColumn : "", page : pageNum, mode : "yeartoyear", option : ""}})
            .then(response => 
            {
                this.setState({listItem : [...this.state.listItem, ...response.data]}, () => this.setState({hideLoader : true}));
            })
            .catch(error =>
            {
                if(error.response === undefined)
                {
                    AlertMessage().showError(error.message);
                }
                else
                {
                    AlertMessage().showError(error.response.data.message);
                }
            })
        }
    }

    //Column Filter Change Handler
    handleFilterColumnChange(e)
    {
        this.setState({hideLoader: false});
        this.setState({filterColumn: e.target.value});
        this.setState({filterText: ""});
        
        if(e.target.value === "NameUser")
        {
            this.setState({hideCustCodeFilter: true, hidePICNameFilter: false, hideApprDateFilter: true});
            this.loadFilterHierarchyTeam('');
        }
        else
        {   
            if(e.target.value === "CustomerCode")
            {
                this.setState({hideCustCodeFilter: false, hidePICNameFilter: true, hideApprDateFilter: true});
            }
            else
            {
                this.setState({hideCustCodeFilter: true, hidePICNameFilter: true, hideApprDateFilter: false});
            }

            this.loadFilterAppreciationCust(e.target.value,"");
        }

        // if(e.target.value === "ApprDate")
        // {
        //     this.setState({hideTextFilter: true, filter: "", hideDateFilter: false});
        // }
        // else
        // {
        //     this.setState({hideTextFilter: false, hideDateFilter: true, filterDate: moment().tz('Asia/Jakarta').format()});
        // }
    }

    //Date Filter State Update Handler
    // handleDateChange(newValue)
    // {
    //     this.setState({filterDate: newValue});
    // }

    //Search Specific Text on Filter Handler
    handleFilterChange(e)
    {
        //this.setState({filter: e.target.value});
        if(this.state.filterColumn === "NameUser")
        {
            this.loadFilterHierarchyTeam(e.target.value);
        }
        else
        {
            this.loadFilterAppreciationCust(this.state.filterColumn, e.target.value);
        }
    }

    //React Select Event Change
    handleFilterEventChange(selectedOption, actionTypes)
    {
        console.log(actionTypes);
        if(actionTypes.action == "clear")
        {
            this.setState({filterText: ""});
        }
        else
        {
            if(selectedOption === undefined || selectedOption === null)
            {

            }
            else
            {
                this.setFilter(selectedOption.value);
            }
        }
    }

    //Set Filter Value for Search Handler
    setFilter(filterValue)
    {
        this.setState({filterText: filterValue});
    }

    //Load Paging Data
    loadPagingData(currentPage)
    {
        this.setState({page: currentPage + 1}, () =>
        {
            this.handleSearch();
        })
    }

    //Execute Search
    handleSearch()
    {
        this.loadData(this.state.page, this.state.filterText, this.state.filterColumn);
    }

    //Show Detail Data
    handleDetailButtonClick(id)
    {
        this.setState({dataId : id}, this.setState({showDetailData : true}));
    }

    //Load Appreciation Images
    loadAppreciation(paramsId)
    {
        this.setState({hideLoader : false});
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-id").getApi("",{params: {id : paramsId}})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                this.setState({imgSource : response.data.fileBase64}, () => this.setState({showImageDialog : true}, () => this.setState({hideLoader : true})));
            }
        })
        .catch(error =>
        {
            if(error.response === undefined)
            {
                AlertMessage().showError(error.message);
            }
            else
            {
                AlertMessage().showError(error.response.data.message);
            }
        })
    }

    //Load Appreciation Location on GMaps
    loadAppreciationLocation(paramsId)
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "appreciation/load-appreciation-by-id").getApi("",{params: {id : paramsId}})
        .then(response => 
        {
            if(response.data !== undefined)
            {
                var latitude = response.data.latitude;
                var longitude = response.data.longitude;
                window.open("https://www.google.com/maps/@" + latitude + "," + longitude + ",15z", "_blank", "noopener, noreferrer")
            }
        })
        .catch(error =>
        {
            if(error.response === undefined)
            {
                AlertMessage().showError(error.message);
            }
            else
            {
                AlertMessage().showError(error.response.data.message);
            }
        })
    }

    //Go to Up
    onButtonUpClick()
    {
        window.scrollTo(0, 0);
    }    

    // infiniteScroll()
    // {
    //     if(window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight)
    //     {
    //         var newPage = this.state.page;
    //         newPage++;
    //         this.setState({page : newPage});

    //         this.loadData(this.state.page, this.state.filter);
    //     }
    // }

    render()
    {
        //Themes for MUI Datatable
        const crTheme = createTheme();
        const theme = responsiveFontSizes(crTheme);
    
        //MUI Datatable Custom Columns
        const apprAuditRoleColumns = [
            {
                name : "latitude",
                label : "Latitude",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "longitude",
                label : "Longitude",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "location",
                label : "Location",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "id",
                label : "Google Maps Link",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                    customBodyRender: (value, tableMeta, updateValue) => 
                    {
                        return(
                            <Button startIcon={<VisibilityIcon />} onClick={() => this.loadAppreciationLocation(value)}>Show on Google Maps</Button>
                        );                        
                    }
                }
            },
            {
                name : "picrole",
                label : "PIC Role",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "nameUser",
                label : "PIC Name",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "customerCode",
                label : "Customer Code",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "apprInfo",
                label : "Appreciation Info/Notes",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }
            },
            {
                name : "apprDate",
                label : "Appreciation Date",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                    customBodyRender: (value, tableMeta, updateValue) =>
                    {
                        return moment(value).tz('Asia/Jakarta').format("DD-MMM-YYYY");
                    }
                }
            },
            {
                name : "id",
                label : "Appreciation Photo",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                    customBodyRender: (value, tableMeta, updateValue) => 
                    {
                        return(
                            <Button startIcon={<VisibilityIcon />} onClick={() => this.loadAppreciation(value)}>Show Images</Button>
                        );
                    }
                }
            },
    
        ];

        const apprColumns = [
            {
                name : "latitude",
                label : "Latitude",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "longitude",
                label : "Longitude",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "location",
                label : "Location",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "picrole",
                label : "PIC Role",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "nameUser",
                label : "PIC Name",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "customerCode",
                label : "Customer Code",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "apprInfo",
                label : "Appreciation Info/Notes",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } })
                }                
            },
            {
                name : "apprDate",
                label : "Appreciation Date",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                    customBodyRender: (value, tableMeta, updateValue) =>
                    {
                        return moment(value).tz('Asia/Jakarta').format("DD-MMM-YYYY");
                    }
                }
            },
            {
                name : "id",
                label : "Appreciation Photo",
                options :
                {
                    setCellHeaderProps: value => ({ style: { fontWeight: 'bold', backgroundColor: '#90caf9' } }),
                    customBodyRender: (value, tableMeta, updateValue) => 
                    {
                        return(
                            <Button startIcon={<VisibilityIcon />} onClick={() => this.loadAppreciation(value)}>Show Images</Button>
                        );
                    }
                }
            },
    
        ];
    
        //MUI Datatable Options
        const apprOptions = {
            download : false,
            filter : false,
            print : false,
            page: this.state.page - 1,
            count: this.state.totalData,
            rowsPerPage: 20,
            rowsPerPageOptions : [],
            search : false,
            serverSide : true,
            selectableRows : 'none',
            selectableRowsHeader : false,
            selectableRowsHideCheckboxes : true,
            sort : false,
            viewColumns : false,
            onChangePage : (currentPage) => this.loadPagingData(currentPage)
        };     

        return(
            <>
                <BackdropLoader hideLoader={this.state.hideLoader} />

                {/* Go to Up Button */}
                <Fab size="medium" color="primary" aria-label="up" style={this.fabStyle} onClick={this.onButtonUpClick}>
                    <KeyboardArrowUpIcon />
                </Fab>
                
                {/* Navigation, Action Button */}
                <Link to="/extra"><Button variant="contained" startIcon={<ArrowBackIcon />}>
                    Back
                </Button></Link>&nbsp;&nbsp;&nbsp;
                <hr />
    
                {/* Title */}
                <Typography variant="h5" style={{textAlign:"center"}}>{this.state.previousYearText} - {this.state.yearText} APPRECIATION HISTORY</Typography>
                <br/>
    
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <TextField select label="Filter By" variant="outlined" value={this.state.filterColumn} onChange={this.handleFilterColumnChange} style={{width:"33ch"}}>
                        <MenuItem key="CustomerCode" value="CustomerCode">Customer Code</MenuItem>
                        <MenuItem key="PICName" value="NameUser">PIC Name</MenuItem>
                        <MenuItem key="ApprDate" value="ApprDate">Appreciation Date</MenuItem>
                    </TextField>
                    &nbsp;

                    <div className='filterCustCode' hidden={this.state.hideCustCodeFilter}>
                        <Select id="txtFilterCustCode" options={this.state.filterCustCode} isClearable={true} onKeyDown={(e) => this.handleFilterChange(e)} onChange={(selectedOption, act) => this.handleFilterEventChange(selectedOption, act)} />
                    </div>
                    <div className='filterPICName' hidden={this.state.hidePICNameFilter}>
                        <Select id="txtFilterPICName" options={this.state.filterPICName} isClearable={true} onKeyDown={(e) => this.handleFilterChange(e)} onChange={(selectedOption, act) => this.handleFilterEventChange(selectedOption, act)} />
                    </div>
                    <div className='filterApprDate' hidden={this.state.hideApprDateFilter}>
                        <Select id="txtFilterApprDate" options={this.state.filterApprDate} isClearable={true} onKeyDown={(e) => this.handleFilterChange(e)} onChange={(selectedOption, act) => this.handleFilterEventChange(selectedOption, act)} />
                    </div> 

                    {/* <TextField label="Search" variant="outlined" hidden={this.state.hideTextFilter}
                        value={this.state.filter} onChange={this.handleFilterChange} 
                    /> */}
    
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                            mask="__-__-____"
                            label="Date"
                            inputFormat="dd-MM-yyyy"
                            maxDate={new Date()}
                            value={this.state.filterDate}
                            onChange={this.handleDateChange}
                            renderInput={(params) => <TextField {...params} hidden={this.state.hideDateFilter} style={{width:"33ch"}} />}
                        />
                    </LocalizationProvider> */}
                    &nbsp;
                    <IconButton onClick={this.handleSearch} color="primary">
                        <SearchIcon />
                    </IconButton>
                </Box>
                <br/>
                <ThemeProvider theme={theme}>
                    <MUIDataTable 
                        title="Appreciation List" 
                        columns={localStorage.getItem("userRole") === "Audit" ? apprAuditRoleColumns : apprColumns} 
                        data={this.state.listItem} 
                        options={apprOptions} 
                    />
                </ThemeProvider>

                {/* Appreciation Image Dialog */}
                <Dialog fullScreen open={this.state.showImageDialog} onClose={() => this.setState({showImageDialog : false})}>
                    <AppBar sx={{position : 'relative'}}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => this.setState({showImageDialog : false})} ><CloseIcon /></IconButton>
                            &nbsp;&nbsp;
                            <Typography variant='h6'>Appreciation Photo Preview</Typography>
                        </Toolbar>
                    </AppBar>
                    <br/>
                    <img src={this.state.imgSource} alt="preview" />
                </Dialog>

                {/* {this.state.listItem.map(item => 
                    {
                        return(
                            <div id={item.id} key={item.id}>
                                <Card sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#000000', backgroundColor: '#90caf9'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="h6">{item.customerCode} &nbsp;&nbsp;({item.nameUser})</Typography>
                                            <Typography variant="subtitle1">{moment(item.apprDate,"YYYY-MM-DD").format("YYYY-MM-DD")}</Typography>       
                                            <Typography variant="subtitle2"><em>{item.location}</em></Typography>
                                        </CardContent>
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="subtitle2" color="#FF0000"><strong>Saved</strong></Typography>     
                                        </CardContent>
                                        <CardActions>
                                            <Button variant="contained" onClick={() => this.handleDetailButtonClick(item.id)} endIcon={<DoubleArrowIcon />}>Detail</Button>
                                        </CardActions>
                                    </Box>
                                </Card>
                                <Divider variant="middle" />                       
                            </div>
                        );
                    })
                }      */}
                {/* Appreciation Detail Data Dialog */}
                {/* <Dialog fullScreen open={this.state.showDetailData} onClose={() => this.setState({showDetailData : false})}>
                    <AppBar sx={{position : 'relative'}}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => this.setState({showDetailData : false})} ><CloseIcon /></IconButton>
                            &nbsp;&nbsp;
                            <Typography variant='h6'>Detail Data</Typography>
                        </Toolbar>
                    </AppBar>
                    <br/>
                    <Appreciation id={this.state.dataId} disabledBackButton={true} source="appr-hist" />
                </Dialog> */}
            </>
        );
    }
}
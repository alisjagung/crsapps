//React
import React, { useEffect, useState } from 'react';
//Material
import { AppBar, Box, Button, Card, CardContent, Dialog, Divider, Grid,
    IconButton, List, ListItem, Stack, Typography, Toolbar, TextField } from '@mui/material';
//Icon
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
//Component
import { Api }  from '../../utilities/api';
import AlertMessage from '../../utilities/alert-message';

export default function Approval()
{
    const [approvalList, setApprovalList] = useState([]);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);

    const [dataDetail, setDataDetail] = useState({});

    useEffect(() => 
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "approval/load-approval-by-leader").getApi("",{params: {leaderRefCode : localStorage.getItem("userRef"), filter : "", page : 1}})
        .then(response => 
        {   
            if(response.data !== undefined)
            {
                setApprovalList(response.data);
            }
            else
            {
                setApprovalList([]);
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
    }, []);

    const showDetailApprovalData = (kdPlanning) =>
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "approval/load-approval-data").getApi("",{params: { planningCode : kdPlanning }})
        .then(response => 
        {   
            if(response.data !== undefined)
            {   
                setDataDetail(response.data);
                setShowApprovalDialog(true);
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

    const updateStatusApproval = (kdPlanning, status) =>
    {
        Api(process.env.REACT_APP_PLANMEET_SERVICES + "approval/update-status-approval").getApi("",{params: { planningCode : kdPlanning, statusApproval : status }})
        .then(response => 
        {   
            console.log(response);
            if(response.isSuccess)
            {   
                setShowApprovalDialog(false);

                var arrApprovalList = [...approvalList];
                var itemIndex = arrApprovalList.filter(w => w.kdPlanning == kdPlanning);
            
                arrApprovalList.splice(itemIndex, 1);
                setApprovalList(arrApprovalList);

                AlertMessage().showSuccess(status + " " + kdPlanning + " Success");
                //window.location.reload();
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

    const approveData = (kdPlanning) =>
    {
        updateStatusApproval(kdPlanning, 'Approved');
    }

    const rejectData = (kdPlanning) =>
    {
        updateStatusApproval(kdPlanning, 'Rejected');
    }

    return(        
        <>
            <Typography variant="h5" style={{textAlign:"center"}}>APPROVAL LIST</Typography>
            <br/>
            
            <List>
                {approvalList.map(item => 
                {
                    return(
                        <div key={item.kdPlanning}>
                            <ListItem key={item.kdPlanning}>
                                <Card elevation={0} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', color: '#1565c0', backgroundColor: '#90caf9', width: '100%'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                        <Typography variant="body2">{item.kdPlanning}</Typography>
                                                <Typography variant="h6"><strong>{item.namaDokter}</strong></Typography>
                                                <Typography variant="body1">[{item.spes}]</Typography> 
                                                <br/>      
                                                <Typography variant="body2"><em>{item.alamat}</em></Typography>
                                        </CardContent>
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Typography variant="body2" color="#FF0000"><strong>{item.statusApproval}</strong></Typography>     
                                        </CardContent>
                                        <CardContent sx={{flex: '1 0 auto'}}>
                                            <Button variant="contained" onClick={() => showDetailApprovalData(item.kdPlanning)} endIcon={<DoubleArrowIcon />}>Detail</Button>
                                    </CardContent>
                                    </Box>
                                </Card>                       
                            </ListItem>
                            <Divider variant="middle" /> 
                        </div>
                    );
                })}
            </List>
            
            {/* Detail Data */}
            <Dialog fullScreen open={showApprovalDialog}>
                <AppBar sx={{position : 'relative'}}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setShowApprovalDialog(false)}><CloseIcon /></IconButton>
                        &nbsp;&nbsp;
                        <Typography variant='h6'>Detail Data</Typography>
                    </Toolbar>
                </AppBar>
                <br/>

                <Stack direction='row'>
                    <Grid item sm={2}>
                        <Button variant="contained" color="success" onClick={() => approveData(dataDetail.kdPlanning)} startIcon={<CheckIcon />}>Approve</Button>
                    </Grid>   
                    &nbsp;                              
                    <Grid item sm={2}>
                        <Button variant="contained" color="error" onClick={() => rejectData(dataDetail.kdPlanning)} startIcon={<CloseIcon />}>Reject</Button>
                    </Grid>  
                </Stack>
                <br/><br/>
                <Stack direction='column' spacing={2}>
                    <Grid item sm={12}>
                        <TextField label="User Code" variant="outlined" value={dataDetail.kdUser + " - " + dataDetail.nameUser} fullWidth disabled />
                    </Grid>
                    <Grid item sm={12}>
                        <TextField label="Doctor Code" variant="outlined" value={dataDetail.kdDokter + " - " + dataDetail.namaDokter} fullWidth disabled />
                    </Grid>
                    <Grid item sm={12}>
                        <label>Current Signature</label>
                        <Box>
                            <img src={dataDetail.doctorSignBase64} alt="preview" style={{width: 240, height: 320}} />
                        </Box>
                    </Grid>   
                    <Grid item sm={12}>
                        <label>Last Signature</label>
                        <Box>
                            <img src={dataDetail.lastDoctorSignBase64} alt="preview" style={{width: 240, height: 320}} />
                        </Box>
                    </Grid>                               
                </Stack>
            </Dialog>
        </>
    );
}
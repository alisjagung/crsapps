import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import Logo from '../../img/logo-fahrenheit-putih.png';
import '../../css/custom.css';

import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Api }  from '../utilities/api';
import AlertMessage from '../utilities/alert-message';

export default function Login()
{
    const [username, setUsername] = useState('');
    const [pwd, setPwd] = useState('');
    //const navigate = useNavigate();

    const browserWidth = window.innerWidth;
    const browserHeight = window.innerHeight;

    console.log(browserWidth + " " + browserHeight);

    const onUsernameChange = (e) =>
    {
        setUsername(e.target.value);
    }

    const onPasswordChange = (e) =>
    {
        setPwd(e.target.value);
    }

    const handleSubmit = () =>
    {  
        Api(process.env.REACT_APP_AUTH_SERVICES + "user-login?apps=crs").postApi({kdUser : username, password : pwd}, {})
        .then(response =>
        {
           if(response.isSuccess)
           {
            localStorage.setItem("userId", response.data.kdUser);
            localStorage.setItem("userRef", response.data.kdReference);
            localStorage.setItem("userDisplayName", response.data.nameUser);
            localStorage.setItem("userRole", response.data.role);
            //navigate("/planning", {replace : true});
            window.location.href = "/crs-mobile/planning";
           }
           else
           {
            AlertMessage().showError(response.message);
           }
            
        })
        .catch(error =>
        {
            AlertMessage().showError(error.message);
        });   
    }
    
    return(
    <div style={{backgroundColor:"#085596 !important"}}>
        <div className="hold-transition login-page">
            <div className="login-box">
                <div className="login-logo">
                    <img src={Logo} className="login-img-thumbnail" alt="fahrenheit-logo" />
                </div>
                <div className="login-card-new">
                    <div className="card-body login-card-body-new">
                        <p className="login-box-msg"><b>CRS</b>Login</p>

                        <form name="loginForm" id="login-form">
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="User Code" value={username} onChange={onUsernameChange} required />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <FontAwesomeIcon icon={["fas","envelope"]}  />
                                    </div>
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input type="password" className="form-control" placeholder="Password" value={pwd} onChange={onPasswordChange} required />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                    <FontAwesomeIcon icon={["fas","lock"]}  />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <button type="button" className="btn btn-light btn-block" onClick={handleSubmit}>Sign In</button>
                                    {/* <a className="btn btn-light btn-block" href='#faceid-login'>Next</a> */}
                                </div>
                            </div>
                            {/* <br/>
                            <div className="row">
                                <a style={{color: "#FFFFFF", textDecoration: "underline", textAlign: "center"}}>Register New Face ID</a>
                            </div> */}
                        </form>
                    </div>
                </div>
            </div>        
        </div>
        {/* <div id='faceid-login' style={{backgroundColor:"#085596", width : browserWidth, height : browserHeight}}>
            <p style={{color: "#FFFFFF"}}>Face ID Login Here</p>
            <div className='row'>
                <div className='col-12'>
                    <button type="button" className="btn btn-light btn-block">Sign In</button>                    
                </div>
            </div>
        </div> */}
        <ToastContainer />
    </div>
    );
}
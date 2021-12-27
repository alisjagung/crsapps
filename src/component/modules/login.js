import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import Logo from '../../img/logo-fahrenheit-putih.png';
import '../../css/custom.css';

import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Api }  from '../utilities/api';
import { AUTH_SERVICES } from '../../config/config';
import AlertMessage from '../utilities/alert-message';

export default function Login()
{
    const [username, setUsername] = useState('');
    const [pwd, setPwd] = useState('');
    //const navigate = useNavigate();

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
       
        Api(AUTH_SERVICES + "user-login?apps=crs").postApi({kdUser : username, password : pwd}, {})
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
            console.log("masuk catch");
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
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>        
        </div>
        <ToastContainer />
    </div>
    );
}
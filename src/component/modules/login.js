import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../img/logo-fahrenheit-putih.png';
import '../../css/custom.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Login()
{
    const [username, setUsername] = useState('');
    const [pwd, setPwd] = useState('');
    const navigate = useNavigate();

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
        localStorage.setItem("userId", username);
        localStorage.setItem("userDisplayName", "User Test");
        navigate("/planning", {replace : true});
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

                        <form name="loginForm" id="login-form" onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Username" value={username} onChange={onUsernameChange} required />
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
                                    <button type="submit" className="btn btn-light btn-block">Sign In</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>        
        </div>
    </div>
    );
}
import React from 'react';
import Logo from  '../../img/logo-fahrenheit-putih.png';

export default function AppsLogo()
{
    return(
      <div align="center" style={{backgroundColor:"#085596"}}>
        <img src={Logo} alt="Logo" className="login-img-thumbnail"/>
      </div>
    );
}
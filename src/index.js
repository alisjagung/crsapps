import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';

import Login from './component/modules/login';
import Planning from './component/modules/planning/planning';
import Meeting from './component/modules/meeting';
import Extra from './component/modules/extra';

import UserProfile from './component/modules/user-profile';
import History from './component/modules/history';
import Appreciation from './component/modules/appreciation/appreciation';
import AppreciationHistory from './component/modules/appreciation-history/appreciation-history';

import SyncData from './component/modules/sync/sync-data';
import UploadData from './component/modules/upload-data';
import NotFound from './component/modules/not-found';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import './index.css';

ReactDOM.render(
  //<React.StrictMode>
    // <BrowserRouter>
    <BrowserRouter basename="/crs-mobile/">
      <Routes>
          <Route path="/" element={<App />}>
            <Route path="planning" element={<Planning />} />
            <Route path="meeting" element={<Meeting />} />
            <Route path="extra" element={<Extra />} />              
            <Route path="extra/profile" element={<UserProfile />} />
            <Route path="extra/history" element={<History />} />
            <Route path="extra/appreciation" element={<Appreciation />}>
              <Route path=":id" element={<Appreciation />} />
            </Route>
            <Route path="extra/appreciation-list" element={<AppreciationHistory />} />
            <Route path="extra/sync" element={<SyncData />} />
            <Route path="extra/upload" element={<UploadData />} />
            <Route path="login" element={<Login />}  />
            <Route path="extra/logout"  />
            <Route 
              path="*" 
              element={<NotFound />}
            />              
          </Route>
      </Routes>
    </BrowserRouter>,
  //</React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

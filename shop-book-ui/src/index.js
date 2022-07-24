import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Products from './Products';
import Customers from './Customers';
import { BrowserRouter as Router, Route , Link, Routes, HashRouter} from "react-router-dom";
import NavigationBar from './NavigationBar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Router>
      <NavigationBar/>
      {/* forcerefresh not working so instead made a call  to window.location.reload onclick of Link*/}
      <Routes forceRefresh={true}>
        <Route path="/" element={<App/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/customers" element={<Customers/>}/>
       </Routes>
     </Router>
  </React.StrictMode>
);


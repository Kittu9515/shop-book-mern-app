import {Link,BrowserRouter as Router} from 'react-router-dom';
import {App,navBar,MainHeading} from './App.css';

export default function NavigationBar(){
    return(
     <div className='App'>
        <h1 className='MainHeading'>Shop Book</h1>
        <div className='navBar'>
            <Link to="/" onClick={window.location.reload}>Home</Link> &nbsp;&nbsp;&nbsp;
            <Link to="/products" onClick={window.location.reload}>Products</Link> &nbsp;&nbsp;&nbsp;
            <Link to="/customers" onClick={window.location.reload}>Customers</Link>
        </div>
      </div>
    );
}
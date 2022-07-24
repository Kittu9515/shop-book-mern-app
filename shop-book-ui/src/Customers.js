import { useEffect, useState } from 'react';
import useCollapse from 'react-collapsed';
import axios from 'axios';

export default function Customers(){
    const perPage = 10;
    const [totalPageCount,setTotalPageCount] = useState(1);
    const [pageCount,setPageCount] = useState(1);
    const [loading,setLoading] = useState(false);
    const [showAddPanel,setShowAddPanel] = useState(false);
    const [localStoreCustomers,setLocalStoreCustomers] = useState([]);
    const [customers,setCustomers] = useState([]);
    const [products,setProducts] = useState([]);
    const [image,setImage] = useState();
   
    useEffect(()=>{
        fetchCustomersData();
    },[]);

    useEffect(()=>{
        setCustomers(localStoreCustomers.slice((pageCount-1)*perPage,pageCount*perPage));
    },[pageCount]);

    function Section(props) {
        const config = {
            defaultExpanded: false,
            collapsedHeight: props.collapsedHeight || 0
        };
        const { getCollapseProps, getToggleProps, isExpanded } = useCollapse(config);
      return (
        <div className="collapsible">
            <div className="header" {...getToggleProps()}>
                <div className="title">{props.title}</div>
                <div className="icon">
                    <i className={'fas fa-chevron-circle-' + (isExpanded ? 'up' : 'down')}></i>
                </div>
            </div>
            <div {...getCollapseProps()}>
                <div className="content">
                    {props.children}
                </div>
            </div>
        </div>
        );
      }

    async function fetchCustomersData(){
        //call api to get data & store it in localStoreProducts
        try{
            let resp = await axios.get(`http://localhost:8888/api/customers`);
            console.log(resp.data.customers);
            //setLocalStoreProducts(data);
            //set totalpageCount by doing totalCount/perPage
            setLocalStoreCustomers(resp.data.customers);
            //setProducts should get called after we fetch data
            //setLocalStoreProducts is assigning in asynchronous somehow so adding data from resp only
            setPageCount(1);
            setTotalPageCount(resp.data.customers.length/perPage);
            setCustomers(resp.data.customers.slice((pageCount-1)*perPage,pageCount*perPage));
            resp = await axios.get(`http://localhost:8888/api/products`);
            console.log(resp.data.products);
            //setLocalStoreProducts(data);
            //set totalpageCount by doing totalCount/perPage
            let pros = [];
            resp.data.products.map(product=>{
                    pros.push(product.name);
            })
            setProducts(pros);
            console.log(pros);
        }catch(error){
            console.log(error);
        }
    }

    let handleSearchChange = e =>{
        console.log(e.target.value);
        let textToSearch = e.target.value;
        setLoading(true);
        const result = localStoreCustomers.filter((customer)=>customer.name.includes(textToSearch));
        setTotalPageCount(result.length/perPage);
        setPageCount(1);
        setCustomers(result.slice((pageCount-1)*perPage,pageCount*perPage));
        setLoading(false);
    }

    let handleSubmit = async e => {
        e.preventDefault();
        console.log(e.target[3].id);
        console.log(e.nativeEvent.submitter.value);
        if(e.nativeEvent.submitter.value === "Update"){
            console.log(e);
            //get the updated values & submit in DB
            try{
                const customer = {
                    name:e.target[0].value,
                    amount:parseInt(e.target[1].value),
                    transactions:e.target[2].value,
                }
             let resp = await axios.put(`http://localhost:8888/api/customer/`+e.target[4].id,customer);
             console.log(resp);
             alert(`${e.target[0].value} updated successfully`);
            //  fetchCustomersData();
            }
            catch(error)
            {
                console.log(error);
            }
        }else{
            try{
             let resp = await axios.delete(`http://localhost:8888/api/customer/`+e.target[3].id);
             console.log(resp);
             alert(`${e.target[0].value} deleted successfully`);
             fetchCustomersData();
            }
            catch(error)
            {
                console.log(error);
            }
        }
    }

    let handleAddSubmit = async e => {
        e.preventDefault();
        console.log(e.nativeEvent.submitter.value);
        if(e.nativeEvent.submitter.value === "Add"){
            console.log(e);
            //Add product in DB
            try{
                const customer = {
                    name:e.target[0].value,
                    amount:e.target[1].value,
                    transactions:e.target[2].value,
                }
             let resp = await axios.post(`http://localhost:8888/api/customer`,customer);
             alert(`${e.target[0].value} added successfully`);
             setShowAddPanel(false);
             fetchCustomersData();
            }
            catch(error)
            {
                console.log(error);
            }
        }
    }

    let uploadFile = (e)=>{
            console.log(e.target.files[0]);
           setImage(URL.createObjectURL(e.target.files[0]));
    }

    return(
        <div className='child App'>
           <span className='subHeading'>Customers</span>
           <input type="text" id="searchText" defaultValue={""} size="28" onChange={handleSearchChange}/>
           <input type="button" value="Add customer" onClick={()=>{setShowAddPanel(true)}}/>          
           <table border='0' cellPadding='5' cellSpacing='0'>
           {
           customers.length!=0 ? !loading ? customers.map((customer) => {
              return (
                <Section title={customer.name} key={customer._id}>
                <form onSubmit={handleSubmit}>
                <tr>
                    <td>Name</td> 
                    <td> <input type="text" defaultValue={customer.name||''}/></td>
                </tr>
                <tr>
                    <td>Amount</td> 
                    <td>
                        <input type="text" defaultValue={customer.amount||''}/>
                    </td>
                 </tr>
                 <tr>
                    <td></td> 
                    <td>
                        <textArea rows="10" id={customer.id+"textArea"} >
                            {customer.transactions||''}
                        </textArea>
                    </td>
                 </tr>
                 {/* <tr >
                    <td colSpan={2}>
                        <input type="file" name="upload" style={{marginLeft:100}} onChange={uploadFile}/>
                    </td>
                 </tr>
                 <tr>
                    <td colSpan={2}>
                         <img src={image||''} width="200px" height="200px" style={{marginLeft:100}}/>
                    </td>
                 </tr> */}
                 <tr>
                    <td>

                    </td>
                    <td>
                        <input type="submit" id ={customer._id} value="Update"/>
                        <input type="submit" id ={customer._id} value="Delete"/>
                    </td>
                 </tr>
                 </form>
                 <br/>
                 </Section>
              )
            }):<center style={{color:"grey"}}>Loading...</center>:
            <pre style={{color:"grey"}}>No customers found</pre>
           }
           </table>
           <div className="bottom">
            <input className="addButton" type='button' style={{marginLeft:"50px"}} disabled={pageCount<=1} onClick={() => {setPageCount(pageCount-1);console.log(pageCount)}} value="<"/>
            <input className="addButton" type='button' disabled={pageCount>=totalPageCount} onClick={() => {setPageCount(pageCount+1);console.log(pageCount)}} value=">"/>
           </div>
           { showAddPanel && 
                <div className={showAddPanel ?'as-popup-container':'as-popup-container hide'} style={{height:"400px"}}>
                <center>
                <span className='subHeading'>Add Customer</span>
                <form onSubmit={handleAddSubmit}>
                    <table border='0' cellPadding='5' cellSpacing='0'>
                        <tr>
                            <td>Name</td> 
                            <td> <input type="text" defaultValue=''/></td>
                        </tr>
                        <tr>
                            <td>Amount</td> 
                            <td>
                                <input type="text" defaultValue=''/>
                            </td>
                        </tr>
                        <tr>
                            <td></td> 
                            <td>
                                <textArea rows="10" defaultValue={''}/>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>
                                <input type="submit" value="Add" />
                                <input type="button" value="Close" onClick={()=>{setShowAddPanel(false)}}/>
                            </td>
                        </tr>
                    </table>
                 </form>
                 </center> 
                </div>
            }
        </div>
        
    );
}
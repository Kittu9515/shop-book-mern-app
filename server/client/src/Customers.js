import { useEffect, useState } from 'react';
import useCollapse from 'react-collapsed';
import axios from 'axios';
import {Buffer} from 'buffer';

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
            setLoading(true);
            let resp = await axios.get(`/api/customers`);
            console.log(resp.data.customers);
            //setLocalStoreProducts(data);
            //set totalpageCount by doing totalCount/perPage
            setLocalStoreCustomers(resp.data.customers);
            //setProducts should get called after we fetch data
            //setLocalStoreProducts is assigning in asynchronous somehow so adding data from resp only
            resp.data.customers.map((customer)=>{
                    let newData = Buffer.from(customer.image).toString("base64")
                    customer.image=newData;
                    console.log("base64 encoded string")
                    console.log(customer.image);
            })
            setPageCount(1);
            setTotalPageCount(resp.data.customers.length/perPage);
            setCustomers(resp.data.customers.slice((pageCount-1)*perPage,pageCount*perPage));
            resp = await axios.get(`/api/products`);
            console.log(resp.data.products);
            //setLocalStoreProducts(data);
            //set totalpageCount by doing totalCount/perPage
            let pros = [];
            resp.data.products.map(product=>{
                    pros.push(product.name);
            })
            setProducts(pros);
            console.log(pros);
            setLoading(false);
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
            console.log(e.target[3].files[0]);
            const file = e.target[3].files[0];
            file.originalname = e.target[0].value;
            console.log(file);
            const fd = new FormData();
            fd.append("image",file,e.target[0].value);
            fd.append("filename",e.target[0].value);
            fd.append("name",e.target[0].value)
            fd.append("amount",e.target[1].value==''?0:parseInt(e.target[1].value));
            fd.append("transactions",e.target[2].value);
            try{
                // const customer = {
                //     name:e.target[0].value,
                //     amount:parseInt(e.target[1].value),
                //     transactions:e.target[2].value,
                //     image:img,
                // }
             let resp = await axios.put(`/api/customer/`+e.target[4].id,fd);
             console.log(resp);
             alert(`${e.target[0].value} updated successfully`);
             fetchCustomersData();
            }
            catch(error)
            {
                console.log(error);
            }
        }else{
            try{
             let resp = await axios.delete(`/api/customer/`+e.target[4].id);
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
                const file = e.target[3].files[0];
                file.originalname = e.target[0].value;
                const fd = new FormData();
                fd.append("image",file,e.target[0].value);
                fd.append("filename",e.target[0].value);
                fd.append("name",e.target[0].value)
                fd.append("amount",e.target[1].value==''?0:parseInt(e.target[1].value));
                fd.append("transactions",e.target[2].value);
                const customer = {
                    name:e.target[0].value,
                    amount:e.target[1].value,
                    transactions:e.target[2].value,
                }
             let resp = await axios.post(`/api/customer`,fd);
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
            !loading ? customers.map((customer) => {
              return (
                <Section title={customer.name} key={customer._id}>
                <form onSubmit={handleSubmit} Content-Type="multipart/form-data">
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
                 <tr >
                    <td colSpan={2}>
                        <input type="file" name="image" id="image" style={{marginLeft:100}}/>
                    </td>
                 </tr>
                 <tr>
                    <td colSpan={2}>
                         <img src={`data:image/png;base64,${customer.image}`} width="200px" height="200px" alt="No Image" style={{marginLeft:100}}/>
                    </td>
                 </tr>
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
            }):<center style={{color:"grey"}}>Loading...</center>}
           {
                customers.length==0 && !loading &&
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
                        <tr >
                        <td colSpan={2}>
                            <input type="file" name="image" id="image" alt="No Image" style={{marginLeft:100}}/>
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
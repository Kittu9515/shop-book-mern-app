import { useEffect, useState } from 'react';
import useCollapse from 'react-collapsed';
import axios from 'axios';

export default function Products(){
    const perPage = 10;
    const [totalPageCount,setTotalPageCount] = useState(1);
    const [pageCount,setPageCount] = useState(1);
    const [loading,setLoading] = useState(false);
    const [showAddPanel,setShowAddPanel] = useState(false);
    const [localStoreProducts,setLocalStoreProducts] = useState([]);
    const [products,setProducts] = useState([]);

    
    useEffect(()=>{
        fetchProductsData();
    },[]);

    useEffect(()=>{
       setProducts(localStoreProducts.slice((pageCount-1)*perPage,pageCount*perPage));
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

    async function fetchProductsData(){
        //call api to get data & store it in localStoreProducts
        try{
            let resp = await axios.get(`/api/products`);
            console.log(resp.data.products);
            //setLocalStoreProducts(data);
            //set totalpageCount by doing totalCount/perPage
            setLocalStoreProducts(resp.data.products);
            //setProducts should get called after we fetch data
            //setLocalStoreProducts is assigning in asynchronous somehow so adding data from resp only
            setPageCount(1);
            setTotalPageCount(resp.data.products.length/perPage);
            setProducts(resp.data.products.slice((pageCount-1)*perPage,pageCount*perPage));
        }catch(error){
            console.log(error);
        }
    }

    let handleSearchChange = e =>{
        console.log(e.target.value);
        let textToSearch = e.target.value;
        setLoading(true);
        const result = localStoreProducts.filter((product)=>product.name.includes(textToSearch));
        setTotalPageCount(result.length/perPage);
        setPageCount(1);
        setProducts(result.slice((pageCount-1)*perPage,pageCount*perPage));
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
                const product = {
                    name:e.target[0].value,
                    price:parseInt(e.target[1].value),
                    quantity:parseInt(e.target[2].value),
                }
             let resp = await axios.put(`/api/product/`+e.target[3].id,product);
             console.log(resp);
             alert(`${e.target[0].value} updated successfully`);
            //  fetchProductsData();
            }
            catch(error)
            {
                console.log(error);
            }
        }else{
            try{
             let resp = await axios.delete(`/api/product/`+e.target[3].id);
             console.log(resp);
             alert(`${e.target[0].value} deleted successfully`);
             fetchProductsData();
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
                const product = {
                    name:e.target[0].value,
                    price:e.target[1].value,
                    quantity:e.target[2].value,
                }
             let resp = await axios.post(`/api/product`,product);
             alert(`${e.target[0].value} added successfully`);
             setShowAddPanel(false);
             fetchProductsData();
            }
            catch(error)
            {
                console.log(error);
            }
        }
    }
    let sort = () => {
        setLoading(true);
        const result = localStoreProducts;  
        result.sort((o1,o2)=>{
            if(o1.quantity<o2.quantity)
                return -1;
            else if(o1.quantity>o2.quantity)
                return 1;
            return 0;
        })   
        setTotalPageCount(result.length/perPage);
        setPageCount(1);
        setProducts(result.slice((pageCount-1)*perPage,pageCount*perPage));
        setLoading(false);
        alert("sorted based on quantity successfully");
    }

    return(
        <div className='child App'>
           <span className='subHeading'>Products</span>
           <input type="text" id="searchText" defaultValue={""} size="28" onChange={handleSearchChange}/>
           <input type="button" value="Add product" onClick={()=>{setShowAddPanel(true)}}/>  
           <input type="button" value="sort" onClick={sort}/>  
           <table border='0' cellPadding='5' cellSpacing='0'>
           {
           products.length!=0 ? !loading ? products.map((product) => {
              return (
                <Section title={product.name} key={product._id}>
                <form onSubmit={handleSubmit}>
                <tr>
                    <td>Name</td> 
                    <td> <input type="text" defaultValue={product.name||''}/></td>
                </tr>
                <tr>
                    <td>Price</td> 
                    <td>
                        <input type="text" defaultValue={product.price||''}/>
                    </td>
                 </tr>
                 <tr>
                    <td>Quantity</td> 
                    <td>
                        <input type="text" defaultValue={product.quantity||''}/>
                    </td>
                 </tr>
                 <tr>
                    <td>

                    </td>
                    <td>
                        <input type="submit" id ={product._id} value="Update"/>
                        <input type="submit" id ={product._id} value="Delete"/>
                    </td>
                 </tr>
                 </form>
                 <br/>
                 </Section>
              )
            }):<center style={{color:"grey"}}>Loading...</center>:
            <pre style={{color:"grey"}}>No products found</pre>
           }
           </table>
           <div className="bottom">
            {/* <input className="addButton" type='button' value="+"/> */}
            <input className="addButton" type='button' style={{marginLeft:"50px"}} disabled={pageCount<=1} onClick={() => {setPageCount(pageCount-1);console.log(pageCount)}} value="<"/>
            <input className="addButton" type='button' disabled={pageCount>=totalPageCount} onClick={() => {setPageCount(pageCount+1);console.log(pageCount)}} value=">"/>
           </div>
           { showAddPanel && 
                <div className={showAddPanel ?'as-popup-container':'as-popup-container hide'}>
                <center>
                <span className='subHeading'>Add Product</span>
                <form onSubmit={handleAddSubmit}>
                    <table border='0' cellPadding='5' cellSpacing='0'>
                        <tr>
                            <td>Name</td> 
                            <td> <input type="text" defaultValue=''/></td>
                        </tr>
                        <tr>
                            <td>Price</td> 
                            <td>
                                <input type="text" defaultValue=''/>
                            </td>
                        </tr>
                        <tr>
                            <td>Quantity</td> 
                            <td>
                                <input type="text" defaultValue=''/>
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
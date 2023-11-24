import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import Sidebar from './SideBar';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDeleted, setIsDeleted] = useState(false);

    let navigate = useNavigate();

    const getAdminProducts = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/products`, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
    
            console.log('Admin Products Data:', data); // Log the received data
            setProducts(data.products);
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    useEffect(() => {
        getAdminProducts();

        if (error) {
            toast.error(error, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

        if (deleteError) {
            toast.error(deleteError, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

        if (isDeleted) {
            toast.success('Product deleted successfully', {
                position: toast.POSITION.BOTTOM_RIGHT
            });
            navigate('/admin/products');
            setIsDeleted(false);
            setDeleteError('');
        }
    }, [error, deleteError, isDeleted]);

    const deleteProduct = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API}/api/v1/admin/product/${id}`, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            setIsDeleted(true);
            setLoading(false);
        } catch (error) {
            setDeleteError(error.response.data.message);
        }
    };

    const productsList = () => {
        const data = {
            columns: [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Price',
                    field: 'price',
                    sort: 'asc'
                },
                {
                    label: 'Stock',
                    field: 'stock',
                    sort: 'asc'
                },
                {
                    label: 'Brand',
                    field: 'brand',
                    sort: 'asc'
                },
                {
                    label: 'Category',
                    field: 'category', // Make sure 'category' is explicitly defined here
                    sort: 'asc'
                },
                {
                    label: 'Images',
                    field: 'images',
                    sort: 'asc',
                },
                {
                    label: 'Actions',
                    field: 'actions',
                },
            ],
            rows: []
        };
    
        products.forEach((product) => {
            console.log('Product:', product); // Log each product
    
            const images = product.images.map((image) => (
                <img key={image._id} src={image.url} alt="Product Image" className="mr-2" width="50" height="50" />
            ));
    
            data.rows.push({
                id: product._id,
                name: product.name,
                price: `$${product.price}`,
                stock: product.stock,
                brand: product.brand ? product.brand.name : '', // Make sure product.brand exists
                category: product.category ? product.category.name : '', // Make sure product.category exists
                images: <div>{images}</div>,
                actions: (
                    <Fragment>
                        <Link to={`/admin/product/${product._id}`} className="btn btn-primary py-1 px-2 ml-2">
                            <i className="fa fa-edit"></i>
                        </Link>
                        <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteProductHandler(product._id)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </Fragment>
                ),
            });
        });
    
        console.log('Data:', data); // Log the final data object
    
        return data;
    };
    

    const deleteProductHandler = (id) => {
        deleteProduct(id);
    };

    return (
        <Fragment>
            <MetaData title={'All Products'} />
            <div className="row">
                <div className="col-md-2 p-0">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <Fragment>
                        <h1 className="my-5">All Products</h1>

                        {loading ? <Loader /> : (
                            <MDBDataTable
                                data={productsList()}
                                className="px-3"
                                bordered
                                striped
                                hover
                            />
                        )}

                    </Fragment>
                </div>
            </div>
        </Fragment>
    );
};

export default ProductsList;
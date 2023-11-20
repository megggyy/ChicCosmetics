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

const BrandsList = () => {
    const [brands, setBrands] = useState([]);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDeleted, setIsDeleted] = useState(false);

    let navigate = useNavigate();

    const getAdminBrands = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/brands`, config);
            console.log(data);
            setBrands(data.brands);
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
        }
    }

    useEffect(() => {
        getAdminBrands();

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
            toast.success('Brand deleted successfully', {
                position: toast.POSITION.BOTTOM_RIGHT
            });
            navigate('/admin/brands');
            setIsDeleted(false);
            setDeleteError('');
        }
    }, [error, deleteError, isDeleted]);

    const deleteBrand = async (id) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            };
            const { data } = await axios.delete(`${process.env.REACT_APP_API}/api/v1/admin/brand/${id}`, config);

            setIsDeleted(data.success);
            setLoading(false);
        } catch (error) {
            setDeleteError(error.response.data.message);
        }
    };

    const brandsList = () => {
        const data = {
            columns: [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Brand Name',
                    field: 'name',
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

        brands.forEach(brand => {
            const images = brand.images.map((image) => (
                <img key={image._id} src={image.url} alt="Category Image" className="mr-2" width="50" height="50" />
              ));
            data.rows.push({
                id: brand._id,
                name: brand.name,
                images: <div>{images}</div>,
                actions: 
                    <Fragment>
                        <Link to={`/admin/brand/${brand._id}`} className="btn btn-primary py-1 px-2 ml-2">
                            <i className="fa fa-edit"></i>
                        </Link>
                        <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteBrandHandler(brand._id)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </Fragment>
                
            })
        })

        return data;
    };

    const deleteBrandHandler = (id) => {
        deleteBrand(id);
    };

    return (
        <Fragment>
            <MetaData title={'All Brands'} />
            <div className="row">
                <div className="col-md-2 p-0">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <Fragment>
                        <h1 className="my-5">All Brands</h1>

                        {loading ? <Loader /> : (
                            <MDBDataTable
                                data={brandsList()}
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

export default BrandsList;

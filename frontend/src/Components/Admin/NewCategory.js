import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewCategory = () => {

    const [name, setName] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState('')
    const [category, setCategory] = useState({})
    let navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.set('name', name);

        images.forEach(image => {
            formData.append('images', image)
        })
        
        newCategory(formData)
    }

    const onChange = e => {
        const files = Array.from(e.target.files)
        setImagesPreview([]);
        setImages([])
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                    setImages(oldArray => [...oldArray, reader.result])
                }
            }
            
            reader.readAsDataURL(file)
        })
       
    }


    const newCategory = async (formData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/admin/category/new`, formData, config);
            setLoading(false);
            setSuccess(data.success);
            setCategory(data.category)
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    useEffect(() => {

        if (error) {
            toast.error(error, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

        if (success) {
            navigate('/admin/categories');
            toast.success('Category created successfully', {
                position: toast.POSITION.BOTTOM_RIGHT
            })

        }

    }, [error, success,])

    return (
        <Fragment>
            <MetaData title={'New Category'} />
            <div className="row">
                <div className="col-md-2 p-0">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <Fragment>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={submitHandler} encType="multipart/form-data">
                                <h1>New Category</h1>

                                <div className="form-group">
                                    <label htmlFor="name_field">Category Name</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category Images</label>

                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            name="images"
                                            className="custom-file-input"
                                            id="customFile"
                                            onChange={onChange}
                                            multiple
                                        />
                                        <label className="custom-file-label" htmlFor="customFile">
                                            Choose Images
                                        </label>
                                    </div>
                                    {imagesPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}

                                </div>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                >
                                    CREATE
                                </button>
                            </form>
                        </div>
                    </Fragment>
                </div>
            </div>
        </Fragment>
    );
};

export default NewCategory;

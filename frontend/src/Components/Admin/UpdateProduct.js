import React, { Fragment, useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import { getToken } from '../../utils/helpers';

import { useFormik } from 'formik';
import * as Yup from 'yup';

const UpdateProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [error, setError] = useState('')
    const [product, setProduct] = useState({})
    const [loading, setLoading] = useState(true)
    const [updateError, setUpdateError] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)

    const [brand, setBrand] = useState(''); // New state for brand
    const [brands, setBrands] = useState([]); // State to store brands

    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const { id } = useParams();
    let navigate = useNavigate();

    const errMsg = (message = '') => toast.error(message, {
        position: toast.POSITION.BOTTOM_CENTER
    });
    const successMsg = (message = '') => toast.success(message, {
        position: toast.POSITION.BOTTOM_CENTER
    });

    const getProductDetails =  async (id) => {
        try {
           const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/${id}`)
           setProduct(data.product)
           setLoading(false)
           
        } catch (error) {
            setError(error.response.data.message)
            
        }
    }
      
    const updateProduct = async (id, productData)  => {
        try {
           
            const config = {
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/admin/product/${id}`, productData, config)
            setIsUpdated(data.success)
           
        } catch (error) {
            setUpdateError(error.response.data.message)
            
        }
    }

    const getAdminBrands = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${getToken()}`,
                },
            };

            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/brands`, config);
            setBrands(data.brands);
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
        }
    }

    const getAdminCategories = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${getToken()}`,
                },
            };

            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/categories`, config);
            setCategories(data.categories);
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
        }
    }

    const submitHandler = () => {
        const formData = new FormData();
        formData.set('name', name);
        formData.set('price', price);
        formData.set('description', description);
        formData.set('stock', stock);
        formData.set('brand', brand); 
        formData.set('category', category);
        images.forEach(image => {
            formData.append('images', image)
        })
        updateProduct(product._id, formData)
    }

    const onChange = (e) => {
        const files = Array.from(e.target.files)
        setImagesPreview([]);
        setImages([])
        setOldImages([])

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

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        price: Yup.number().required('Price is required').positive('Price must be positive'),
        description: Yup.string().required('Description is required'),
        stock: Yup.number().required('Stock is required').positive('Stock must be positive'),
        brand: Yup.string().required('Brand is required'),
        category: Yup.string().required('Category is required'),
    });

      const formik = useFormik({
        initialValues: {
          name: "product.name" || "",
          price: 0,
          description: "product.description" || "",
          category: "product.category" || "",
          brand: "product.brand" || "",
          stock: 0},
        validationSchema,
        onSubmit: (values) => {
          try {
            submitHandler(values);
            console.log("Submitting review with values:", values);
          } catch (error) {
            console.error("Error submitting review:", error);
          }
        },
      });

    useEffect(() => {
        getAdminBrands();
        getAdminCategories();
        if (product && product._id !== id) {
            getProductDetails(id)
        } else {
            setName(product.name);
            setPrice(product.price);
            setDescription(product.description);
            setSeller(product.seller);
            setStock(product.stock)
            setOldImages(product.images || [])
        }
        if (error) {
            errMsg(error)
            
        }
        if (updateError) {
            errMsg(updateError);
           
        }
        if (isUpdated) {
            navigate('/admin/products');
            successMsg('Product updated successfully');
           
        }
    }, [error, isUpdated, updateError, product, id])

    // const submitHandler = (e) => {
    //     e.preventDefault();
    //     const formData = new FormData();
    //     formData.set('name', name);
    //     formData.set('price', price);
    //     formData.set('description', description);
    //     formData.set('stock', stock);
    //     // formData.set('seller', seller);
    //     formData.set('brand', brand); // Include brand in the form data
    //     formData.set('category', category);
    //     images.forEach(image => {
    //         formData.append('images', image)
    //     })
    //     updateProduct(product._id, formData)
    // }

    // const onChange = e => {
    //     const files = Array.from(e.target.files)
    //     setImagesPreview([]);
    //     setImages([])
    //     setOldImages([])
    //     files.forEach(file => {
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             if (reader.readyState === 2) {
    //                 setImagesPreview(oldArray => [...oldArray, reader.result])
    //                 setImages(oldArray => [...oldArray, reader.result])
    //             }
    //         }
    //         reader.readAsDataURL(file)
    //     })
    // }
    return (
        <Fragment>
            <MetaData title={'Update Product'} />
            <div className="row">
            <div className="col-md-2 p-0">
            <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <Fragment>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={formik.handleSubmit} encType='multipart/form-data'>
                                <h1>Update Product</h1>
                                <div className="flex items-center ">
                                    <input
                                    type="text"
                                    id="name_field"
                                    className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        formik.setFieldValue("name", e.target.value);
                                    }}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                    <div className="invalid-feedback">{formik.errors.name}</div>
                                     )}
                                </div>
                                
                                <div className="form-group">
                                    <label
                                        htmlFor="price_field"
                                        className="text-mg text-black text-left flex"
                                    >
                                        Price
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                        type="number"
                                        id="price_field"
                                        className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}                                        
                                        value={price}
                                        onChange={(e) => {
                                            setPrice(e.target.value);
                                            formik.setFieldValue("price", e.target.value);
                                        }}
                                        />
                                       {formik.touched.price && formik.errors.price && (
                                        <div className="invalid-feedback">{formik.errors.price}</div>
                                        )}
                                    </div>
                                    </div>

                                    <div className="form-group">
                                    <label
                                        htmlFor="description_field"
                                        className="text-mg text-black  text-left flex"
                                    >
                                        Description
                                    </label>
                                    <div className="flex items-center">
                                        <textarea
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        id="description_field"
                                        rows="8"
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                            formik.setFieldValue("description", e.target.value);
                                        }}
                                        ></textarea>
                                        {formik.touched.name && formik.errors.name && (
                                            <div className="invalid-feedback">{formik.errors.name}</div>
                                        )}
                                    </div>
                                    </div>
                                {/* <div className="form-group">
                                    <label htmlFor="seller_field">Seller Name</label>
                                    <input
                                        type="text"
                                        id="seller_field"
                                        className="form-control"
                                        value={seller}
                                        onChange={(e) => setSeller(e.target.value)}
                                    />
                                </div> */}

                                <div className="form-group">
                                    <label
                                        htmlFor="stock_field"
                                        className="text-mg text-black  text-left flex"
                                    >
                                        Stock
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                        type="number"
                                        id="stock_field"
                                        className={`form-control ${formik.touched.stock && formik.errors.stock ? 'is-invalid' : ''}`}
                                        value={stock}
                                        onChange={(e) => {
                                            setStock(e.target.value);
                                            formik.setFieldValue("stock", e.target.value);
                                        }}
                                        />
                                        {formik.touched.stock && formik.errors.stock && (
                                            <div className="invalid-feedback">{formik.errors.stock}</div>
                                        )}
                                    </div>
                                    </div>

                                <div className="form-group">
                                <label
                                    htmlFor="brand_field"
                                    className="text-mg text-black  text-left flex"
                                >
                                    Brand
                                </label>
                                <div className="flex items-center">
                                    <select
                                    className={`form-control ${formik.touched.brand && formik.errors.brand ? 'is-invalid' : ''}`}
                                    id="brand_field"
                                    value={brand}
                                    onChange={(e) => {
                                        setBrand(e.target.value);
                                        formik.setFieldValue("brand", e.target.value);
                                    }}
                                    >
                                    {brands.map((brand) => (
                                            <option key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                               
                                    {formik.touched.brand && formik.errors.brand && (
                                        <div className="invalid-feedback">{formik.errors.brand}</div>
                                    )}
                                </div>
                                </div>

                                <div className="form-group">
                                <label
                                    htmlFor="category_field"
                                    className="text-mg text-black  text-left flex"
                                >
                                    Category
                                </label>
                                <div className="flex items-center">
                                    <select
                                    className={`form-control ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                                    id="category_field"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        formik.setFieldValue("category", e.target.value);
                                    }}
                                    >
                                       {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.category && formik.errors.category && (
                                        <div className="invalid-feedback">{formik.errors.category}</div>
                                    )}
                                </div>
                                </div>
                                {/* <div className='form-group'>
                                    <label>Images</label>
                                    <div className='custom-file'>
                                        <input
                                            type='file'
                                            name='images'
                                            className='custom-file-input'
                                            id='customFile'
                                            onChange={onChange}
                                            multiple
                                        />
                                        <label className='custom-file-label' htmlFor='customFile'>
                                            Choose Images
                                        </label>
                                    </div>
                                    {oldImages && oldImages.map(img => (
                                        <img key={img} src={img.url} alt={img.url} className="mt-3 mr-2" width="55" height="52" />
                                    ))}
                                    {imagesPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}
                                </div> */}
                                          <div className='form-group'>
                                    <label>Images</label>
                                    <div className='custom-file'>
                                        <input
                                            type='file'
                                            name='images'
                                            className='custom-file-input'
                                            id='customFile'
                                            onChange={onChange}
                                            multiple
                                        />
                                        <label className='custom-file-label' htmlFor='customFile'>
                                            Choose Images
                                        </label>
                                    </div>
                                    {oldImages && oldImages.map(img => (
                                        <img key={img} src={img.url} alt={img.url} className="mt-3 mr-2" width="55" height="52" />
                                    ))}
                                    {imagesPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}
                                </div>
                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading ? true : false}
                                >
                                    UPDATE
                                </button>
                            </form>
                        </div>
                    </Fragment>
                </div>
            </div>
        </Fragment>
    )
}

export default UpdateProduct
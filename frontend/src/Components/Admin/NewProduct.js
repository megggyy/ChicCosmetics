import React, { Fragment, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { getToken } from '../../utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const NewProduct = () => {

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState('')
    const [product, setProduct] = useState({})

    const [brand, setBrand] = useState(''); // New state for brand
    const [brands, setBrands] = useState([]); // State to store brands

    const [category, setCategory] = useState('');
    const [ categories, setCategories] = useState([]);

    let navigate = useNavigate()
    
    const submitHandler = () => {
    

        const formData = new FormData();
        formData.set('name', name);
        formData.set('price', price);
        formData.set('description', description);
        formData.set('stock', stock);
        // formData.set('seller', seller);
        formData.set('brand', brand); // Include brand in the form data

        formData.set('category', category);

        images.forEach(image => {
            formData.append('images', image)
        })
        
        newProduct(formData)
    }

    const onChange = (e) => {
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
            // console.log(reader)
        })
       
    }
    const newProduct = async (formData) => {
       
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/admin/product/new`, formData, config)
            setLoading(false)
            setSuccess(data.success)
            setProduct(data.product)
        } catch (error) {
            setError(error.response.data.message)

        }
    }

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        price: Yup.number().required('Price is required').positive('Price must be positive'),
        description: Yup.string().required('Description is required'),
        stock: Yup.number().required('Stock is required').positive('Stock must be positive'),
        brand: Yup.string().required('Brand is required'),
        category: Yup.string().required('Category is required'),
        images: Yup.string().required('Image is required'),
      });

      const formik = useFormik({
        initialValues: {
          name: "",
          price: 0,
          description: "",
          category: "",
          stock: 0,
          brand: "",
          images: "",
        },
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

    const getAdminCategories = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/categories`, config);
            console.log(data);
            setCategories(data.categories);
            setLoading(false);
        } catch (error) {
            setError(error.response.data.message);
        }
    }
    useEffect(() => {
        getAdminBrands();
        getAdminCategories();
        if (error) {
            toast.error(error, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

        if (success) {
            navigate('/admin/products');
            toast.success('Product created successfully', {
                position: toast.POSITION.BOTTOM_RIGHT
            })

        }

    }, [error, success,])


    return (
        <Fragment>
            <MetaData title={'New Product'} />
            <div className="row">
            <div className="col-md-2 p-0">
            <Sidebar />
          </div>

                <div className="col-12 col-md-10">
                    <Fragment>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={formik.handleSubmit} encType='multipart/form-data'>
                                <h1>New Product</h1>

                                <div className="form-group">
                                <label
                                    htmlFor="name_field"
                                    className="text-mg text-black  text-left flex"
                                >
                                    Name
                                </label>
                                <div className="flex items-center ">
                                    <input
                                    type="text"
                                    id="name_field"
                                    className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                    value={formik.values.name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        formik.setFieldValue("name", e.target.value);
                                    }}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                    <div className="invalid-feedback">{formik.errors.name}</div>
                                     )}
                                </div>
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
                                        type="text"
                                        id="price_field"
                                        className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}                                        value={formik.values.price}
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
                                        value={formik.values.description}
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
                                        value={formik.values.stock}
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

                                {/* <div className="form-group">
                                    <label htmlFor="brand_field">Brand</label>
                                    <select className="form-control" id="brand_field" value={brand} onChange={(e) => setBrand(e.target.value)}>
                                        <option value="" disabled>
                                            Select a brand
                                        </option>
                                        {brands.map((brand) => (
                                            <option key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

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
                                    value={formik.values.brand}
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
                                    value={formik.values.category}
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

                                <div className="form-group">
                                <label className=" text-mg text-black  text-left flex mb-2">
                                    Images
                                </label>
                                    <div className="custom-file">
                                    <input
                                        type="file"
                                        name="images"
                                        className={`custom-file-input ${formik.touched.images && formik.errors.images ? 'is-invalid' : ''}`}
                                        id="customFile"
                                        onChange={(event) => {
                                        onChange(event);
                                        formik.setFieldValue(
                                            "images",
                                            event.currentTarget.files
                                        );
                                        formik.setFieldTouched("images", true, false);
                                        }}
                                        multiple
                                    />
                                    <label
                                    htmlFor="customFile"
                                    className="custom-file-label px-4 py-2 border-2 border-black rounded-md cursor-pointer bg-white text-black hover:bg-black hover:text-white"
                                    >
                                    Choose Images
                                    </label>
                                    {formik.touched.images && formik.errors.images && (
                                    <div className="invalid-feedback">{formik.errors.images}</div>
                                    )}
                                </div>
                                <div className="flex flex-row mb-2">
                                    {imagesPreview.map((img) => (
                                    <img
                                        src={img}
                                        key={img}
                                        alt="Images Preview"
                                        className="my-3 mr-2 "
                                        width="55"
                                        height="52"
                                    />
                                    ))}
                                </div>
                                </div>


                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                // disabled={loading ? true : false}
                                >
                                    CREATE
                                </button>

                            </form>
                        </div>
                    </Fragment>
                </div>
            </div>

        </Fragment>
    )
}
export default NewProduct
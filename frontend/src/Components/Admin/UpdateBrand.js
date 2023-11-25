import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UpdateBrand = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdated, setIsUpdated] = useState(false);
  const [brand, setBrand] = useState({});
  const [oldImages, setOldImages] = useState([]);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const { id } = useParams();
  let navigate = useNavigate();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  };

  const getBrandDetails = async (id) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/brand/${id}`, config);
      setBrand(data.brand);
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const updateBrand = async (id, brandData) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${getToken()}`
            }
        }
      const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/admin/brand/${id}`, brandData, config);
      setIsUpdated(data.success);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const submitHandler = () => {

    const formData = new FormData();
    formData.set("name", name);

    images.forEach(image => {
      formData.append("images", image);
    });

    updateBrand(brand._id, formData);
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesPreview([]);
    setImages([]);
    setOldImages([]); // Reset oldImages when new images are selected

    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setImagesPreview((oldArray) => [...oldArray, reader.result]);
                setImages((oldArray) => [...oldArray, reader.result]);
            }
        };
        reader.readAsDataURL(file);
    });
};


  const validationSchema = Yup.object({
    name: Yup.string().required('Brand Name is required'),
  });

  const formik = useFormik({
    initialValues: {
        name: brand.name || "",
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

  useEffect(() => {
    if (brand && brand._id !== id) {
      getBrandDetails(id);
    } else {
        setName(brand.name);
        setOldImages(brand.images || []); // Ensure oldImages is an array even if brand.images is undefined
    }
    if (error) {
      toast.error(error, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
    if (isUpdated) {
      navigate('/admin/brands');
      toast.success('Brand updated successfully', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  }, [error, isUpdated, brand, id]);

  return (
    <Fragment>
      <MetaData title={'Update Brand'} />
      <div className="row">
        <div className="col-md-2 p-0">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <Fragment>
            <div className="wrapper my-5">
              <form className="shadow-lg" onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <h1>Update Brand</h1>
                <div className="form-group">
                  <label htmlFor="name_field">Brand Name</label>
                  <input
                    type="text"
                    id="name_field"
                    name="name"
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
  );
};

export default UpdateBrand;
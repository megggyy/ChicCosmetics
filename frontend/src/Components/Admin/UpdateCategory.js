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

const UpdateCategory = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdated, setIsUpdated] = useState(false);
  const [category, setCategory] = useState({});
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

  const getCategoryDetails = async (id) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/category/${id}`, config);
      setCategory(data.category);
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${getToken()}`
            }
        }
      const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/admin/category/${id}`, categoryData, config);
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

    updateCategory(category._id, formData);
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
    images: Yup.string().required('Category images are required'),
  });

  const formik = useFormik({
    initialValues: {
        images: category.images || "",
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
    if (category && category._id !== id) {
      getCategoryDetails(id);
    } else {
        setName(category.name);
        setOldImages(category.images || []);
    }
    if (error) {
      toast.error(error, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
    if (isUpdated) {
      navigate('/admin/categories');
      toast.success('Category updated successfully', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  }, [error, isUpdated, category, id]);

  return (
    <Fragment>
      <MetaData title={'Update Category'} />
      <div className="row">
        <div className="col-md-2 p-0">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <Fragment>
            <div className="wrapper my-5">
              <form className="shadow-lg" onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <h1>Update Category</h1>
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
                <div className='form-group'>
                      <label>Images</label>
                        <div className='custom-file'>
                          <input
                            type='file'
                            name='images'
                            className={`custom-file-input ${formik.touched.images && formik.errors.images ? 'is-invalid' : ''}`}
                            id='customFile'
                            onChange={(event) => {
                              onChange(event);
                              formik.setFieldValue("images", event.currentTarget.files);
                              formik.setFieldTouched("images", true, false);
                            }}
                            multiple
                          />
                          <label className='custom-file-label' htmlFor='customFile'>
                              Choose Images
                          </label>
                          {formik.touched.images && formik.errors.images && (
                            <div className="invalid-feedback">{formik.errors.images}</div>
                          )}
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

export default UpdateCategory;
import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Sidebar from './SideBar';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const NewBrand = () => {
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [brand, setBrand] = useState({});
  let navigate = useNavigate();

  const submitHandler = () => {

    const formData = new FormData();
    formData.set("name", name);

    images.forEach((image) => {
      formData.append("images", image);
    });

    newBrand(formData);
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesPreview([]);
    setImages([]);
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

  const newBrand = async (formData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      };

      const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/admin/brand/new`, formData, config);
      setLoading(false);
      setSuccess(data.success);
      setBrand(data.brand);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Brand Name is required'),
    images: Yup.string().required('Brand Images are required'),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
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

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }

    if (success) {
      navigate('/admin/brands');
      toast.success('Brand created successfully', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  }, [error, success]);

  return (
    <Fragment>
    <MetaData title={'New Brand'} />
    <div className="row">
      <div className="col-md-2 p-0">
        <Sidebar />
      </div>

      <div className="col-12 col-md-10">
        <div className="wrapper my-5">
          <form className="shadow-lg" onSubmit={formik.handleSubmit} encType="multipart/form-data">
            <h1>New Brand</h1>

            <div className="form-group">
              <label htmlFor="name_field">Brand Name</label>
              <input
                type="text"
                id="name_field"
                name="name"
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

            <div className="form-group">
              <label>Brand Images</label>

              <div className="custom-file">
                <input
                  type="file"
                  name="images"
                  className={`custom-file-input ${formik.touched.images && formik.errors.images ? 'is-invalid' : ''}`}
                  id="customFile"
                  onChange={(event) => {
                    onChange(event);
                    formik.setFieldValue("images", event.currentTarget.files);
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
              {imagesPreview.map((img) => (
                <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
              ))}
            </div>

            <button id="login_button" type="submit" className="btn btn-block py-3">
              CREATE
            </button>
          </form>
        </div>
      </div>
    </div>
  </Fragment>
);
};

export default NewBrand;
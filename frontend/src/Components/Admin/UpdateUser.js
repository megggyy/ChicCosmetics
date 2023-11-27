import React, { Fragment, useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { errMsg, successMsg } from '../../utils/helpers';
import { getToken } from '../../utils/helpers';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();
    const config = {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`
        }
    }
    const getUserDetails = async (id) => {
    
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/admin/user/${id}`,config)
            setUser(data.user)
            setLoading(false)
            
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    const updateUser = async (id, userData) => {
        try {
            const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/admin/user/${id}`, userData, config)
            setIsUpdated(data.success)
            setLoading(false)
            
        } catch (error) {
           setError(error.response.data.message)
        }
    }

    useEffect(() => {
        // console.log(user && user._id !== userId);
        if (user && user._id !== id) {
            getUserDetails(id)
        } else {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role)
        }
        if (error) {
            errMsg(error);
            setError('');
        }
        if (isUpdated) {
            successMsg('User updated successfully')
            navigate('/admin/users')
           
        }
    }, [error, isUpdated, id, user])
    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('role', role);
        updateUser(user._id, formData)
    }

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().required('Email is required'),
    
    });
    const formik = useFormik({
        initialValues: {
          name: "user.name" || "",
          email: "user.email" || ""
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

    return (
        <Fragment>
            <MetaData title={`Update User`} />
            <div className="row">
            <div className="col-md-2 p-0">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg"onSubmit={submitHandler}>
                                <h1 className="mt-2 mb-5">Update User</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="name"
                                        id="name_field"
                                        className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                        name='name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                    <div className="invalid-feedback">{formik.errors.name}</div>
                                     )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                                        name='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}

                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="invalid-feedback">{formik.errors.email}</div>
                                        )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_field">Role</label>
                                    <select
                                        id="role_field"
                                        className="form-control"
                                        name='role'
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn update-btn btn-block mt-4 mb-3" >Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default UpdateUser
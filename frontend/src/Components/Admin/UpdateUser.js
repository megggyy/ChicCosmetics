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
    const [errors, setErrors] = useState({});
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
        if (validateForm()) {
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('role', role);
        updateUser(user._id, formData)}
    }

    const validateForm = () => {
        const errors = {};
    
        if (!name.trim()) {
          errors.name = 'name is required';
        }
    
        if (!email.trim()) {
          errors.email = 'Email is required';
        }
        
        setErrors(errors);
    
        // If there are no errors, return true; otherwise, return false
        return Object.keys(errors).length === 0;
      };

    

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
                                        className={`form-control ${errors.name && 'is-invalid'}`}
                                        name='name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                     {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className={`form-control ${errors.email && 'is-invalid'}`}
                                        name='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}

                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
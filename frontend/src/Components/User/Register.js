import React, { Fragment, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Metadata from '../Layout/MetaData'
import axios from 'axios'

const Register = () => {

    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })

    const { name, email, password } = user;


    const [avatar, setAvatar] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({});
   

    let navigate = useNavigate()
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
        if (error) {
            console.log(error)
           setError()
        }

    }, [error, isAuthenticated,])

    const submitHandler = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const formData = new FormData();
            formData.set('name', user.name);
            formData.set('email', user.email);
            formData.set('password', user.password);
      
            avatar.forEach(avatars => {
              formData.append("avatar", avatars);
            });
      
            register(formData);
          }
    }

    
  const onChange = e => {
  const files = Array.from(e.target.files)
  setAvatarPreview([]);
  setAvatar([])
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(oldArray => [...oldArray, reader.result])
        setAvatar(oldArray => [...oldArray, reader.result])
      }
    };

    reader.readAsDataURL(file);
  });
};

const validateForm = () => {
    const errors = {};

    if (!user.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!user.email.trim()) {
      errors.email = 'Email is required';
    }

    if (!user.password.trim()) {
      errors.password = 'Password is required';
    }

    setErrors(errors);

    // If there are no errors, return true; otherwise, return false
    return Object.keys(errors).length === 0;
  };



    const register = async (userData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/register`, userData, config)
            console.log(data.user)
            setIsAuthenticated(true)
            setLoading(false)
            setUser(data.user)
            navigate('/')

        } catch (error) {
            setIsAuthenticated(false)
            setLoading(false)
            setUser(null)
            setError(error)
            console.log(error)
        }
    }


    return (
        <Fragment>
            <Metadata title={'Register User'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className={`form-control ${errors.name && 'is-invalid'}`}
                                name='name'
                                value={name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
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
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className={`form-control ${errors.password && 'is-invalid'}`}
                                name='password'
                                value={password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                            />
                             {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        {/* <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept="images/*"
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div> */}

                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            name="avatar"
                                            className="custom-file-input"
                                            id="customFile"
                                            onChange={onChange}
                                            multiple
                                        />
                                        <label className="custom-file-label" htmlFor="customFile">
                                            Choose Images
                                        </label>
                                    </div>
                                    {avatarPreview.map(img => (
                                        <img src={img} key={img} alt="Images Preview" className="mt-3 mr-2" width="55" height="52" />
                                    ))}

                              

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                            // disabled={loading ? false : true}
                        >
                            REGISTER
                        </button>
                    </form>
                </div>
                
            </div>
       <br></br>  <br></br> <br></br>  <br></br>
        </Fragment>
        
    )
}

export default Register
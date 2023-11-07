import React, { Fragment, useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../../utils/helpers';

const UpdateProfile = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
  const [error, setError] = useState('')
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  let navigate = useNavigate();

  const getProfile = async () => {
    const config = {
      headers: {
        // 'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    }
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/me`, config)
      setUser(data.user)
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setAvatarPreview(user.avatar.url)
      }
      setLoading(false)

    } catch (error) {
      toast.error("invalid user or password", {
        position: toast.POSITION.BOTTOM_RIGHT
      })
    }

  }

  const updateProfile = async (userData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getToken()}`
        }
      }
      const { data } = await axios.put('/api/v1/me/update', userData, config)
      setIsUpdated(true)
    } catch (error) {
      toast.error(error.response.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT
      })
    }
  }
  useEffect(() => {
    getProfile()

    if (isUpdated) {
      toast.success('User updated successfully', {
        position: toast.POSITION.BOTTOM_RIGHT
      })
      navigate('/me', { replace: true })
    }
  }, [])

  const submitHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set('name', name);
    formData.set('email', email);
    formData.set('avatar', avatar);

    (updateProfile(formData))
  }

  const onChange = e => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result)
        setAvatar(reader.result)
      }
    }

    reader.readAsDataURL(e.target.files[0])

  }
  console.log(user)
  return (
    <Fragment>
      <MetaData title={'Update Profile'} />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
            <h1 className="mt-2 mb-5">Update Profile</h1>

            <div className="form-group">
              <label htmlFor="email_field">Name</label>
              <input
                type="name"
                id="name_field"
                className="form-control"
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='form-group'>
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
                    accept='image/*'
                    onChange={onChange}
                  />
                  <label className='custom-file-label' htmlFor='customFile'>
                    Choose Avatar
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
          </form>
        </div>
      </div>
    </Fragment>
  )
}

export default UpdateProfile
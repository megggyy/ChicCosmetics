import React, { Fragment, useState, useEffect } from 'react';
import MetaData from '../Layout/MetaData'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../../utils/helpers';
import { Carousel } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';


const UpdateProfile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatars, setAvatars] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [oldImages, setOldImages] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  const { id } = useParams();
  let navigate = useNavigate();

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/me`, config)
      console.log('User Data:', data); // Log user data to the console
      setName(data.user.name);
      setEmail(data.user.email);
      setAvatarPreview(data.user.avatar.map((avatar) => avatar.url));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('User not found', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  };

  const updateProfile = async (userData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getToken()}`
      }
    };
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/me/update`, userData, config)
      setIsUpdated(data.success);
      //setLoading(false);
      toast.success('User updated', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      navigate('/me', { replace: true });
    } catch (error) {
      //console.log(error);
      toast.error('User not found', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  };

  const submitHandler = () => {

    const formData = new FormData();
    formData.set("name", name);

    avatars.forEach(avatar => {
      formData.append("avatar", avatar);
    });

    updateProfile(user._id, formData);
  };
  

//   const updateProduct = async (id, productData)  => {
//     try {
       
//         const config = {
//             headers: {
//                 'Content-Type': 'application/json', 
//                 'Authorization': `Bearer ${getToken()}`
//             }
//         }
//         const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/admin/product/${id}`, productData, config)
//         setIsUpdated(data.success)
       
//     } catch (error) {
//         setUpdateError(error.response.data.message)
        
//     }
// }
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
});

const formik = useFormik({
  initialValues: {
      name: user.name || "",
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

const onChange = (e) => {
  if (e.target.name === 'avatar') {
      const files = e.target.files;
      const previews = [];
      const avatarArray = [];

      for (let i = 0; i < files.length; i++) {
          const reader = new FileReader();
          reader.onload = () => {
              if (reader.readyState === 2) {
                  previews.push(reader.result);
                  if (previews.length === files.length) {
                      setAvatarPreview(previews);
                  }
              }
          };
          reader.readAsDataURL(files[i]);

          avatarArray.push(files[i]);
      }

      setAvatars(avatarArray);
  } else {
    
  }
};


  useEffect(() => {
    getProfile(user.id);
  }, []);

//   const submitHandler = async () => {
//     //e.preventDefault();
//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('email', email);

//     // avatars.forEach((file, index) => {
//     //     formData.append('avatar', file); // Ensure 'avatar' matches the Multer field name
//     // });

//     avatars.forEach(avatar => {
//       formData.append("avatar", avatar);
//     });

//     await updateProfile(formData);
// };
  

  
  console.log(user);
  return (
    <Fragment>
    <MetaData title={'Update Profile'} />
    <div className="row">
      <div className="col-md-2 p-0">
        
      </div>
      <div className="col-12 col-md-10">
        <Fragment>
          <div className="wrapper my-5">
            <form className="shadow-lg" onSubmit={formik.handleSubmit} encType="multipart/form-data">
              <h1>Update Profile</h1>
              <div className="form-group">
                <label htmlFor="name_field">Name</label>
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
              <div className="mb-3">
                    <label className="small mb-1" htmlFor="inputEmailAddress">Email address</label>
                    <input className="form-control" id="inputEmailAddress" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
              <div className='form-group'>
                                  <label>Avatars</label>
                                  <div className='custom-file'>
                                      <input
                                          type='file'
                                          name='avatar'
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
                                  {avatarPreview.map(img => (
                                      <img src={img} key={img} alt="Avatars Preview" className="mt-3 mr-2" width="55" height="52" />
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

export default UpdateProfile;
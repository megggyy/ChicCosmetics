import React, { Fragment, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GoogleLog from "react-google-login";
import Loader from "../Layout/Loader";
import Metadata from "../Layout/MetaData";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { authenticate } from "../../utils/helpers";
import { getUser } from "../../utils/helpers";
import "./Login.css";

import FacebookLogin from "react-facebook-login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  let location = useLocation();
  const redirect = location.search
    ? new URLSearchParams(location.search).get("redirect")
    : "";
  // const notify = (error) => toast.error(error, {
  //     position: toast.POSITION.BOTTOM_RIGHT
  // });

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/login`,
        { email, password },
        config
      );
      console.log(data);
      authenticate(data, () => navigate("/"));
      window.location.reload();
    } catch (error) {
      toast.error("invalid user or password", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const resgoogle = async (response) => {
    try {
      const { data } = await axios.post("http://localhost:8001/api/v1/g-log", {
        tokenId: response.tokenId,
      });
      console.log("Received from server:", data.user);

      sessionStorage.setItem("user", JSON.stringify(data.user));
      console.log(
        "Stored in session storage:",
        JSON.parse(sessionStorage.getItem("user"))
      );

      authenticate(data, () => {
        navigate("/");
        window.location.reload();

        toast.success("Logged in successfully", {
          position: "top-right",
        });
        
        const user = JSON.parse(sessionStorage.getItem("user"));
        console.log("Retrieved from session storage:", user);
        console.log(user.name, user.email, user.avatar);
      });
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
      }
      toast.error("Google Login Failed", {
        position: "top-right",
      });
    }
  };

  const responseFacebook = async (response) => {
    try {
      console.log(response)
       
      const {accessToken, userID} = response
      const { data } = await axios.post('http://localhost:8001/api/v1/facebook_login', {accessToken, userID})
      // const { data } = await axios.post(
      //   `${process.env.REACT_APP_API}/api/v1/facebook_login`,
      //   { accessToken, userID }
      // );
     
 
      if (data && data.user) {
        console.log("Received from server:", data.user);
 
        sessionStorage.setItem("user", JSON.stringify(data.user));
 
        // Retrieve the user data from session storage
        const userJson = sessionStorage.getItem("user");
       
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log("Stored in session storage:", user);
       
          authenticate(data, () => {
            toast.success("Logged in successfully", {
              position: "top-right",
            });
            navigate("/");
            console.log("Retrieved from session storage:", user);
            console.log(user.name, user.email, user.avatar);
          });
        } else {
          console.error("No user data in session storage");
        }
      } else {
        console.error("No user data in server response");
      }
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
      }
      toast.error("Facebook Login Failed", {
        position: "top-right",
      });
    }
  }



  useEffect(() => {
    if (getUser() && redirect === "shipping") {
      navigate(`/${redirect}`);
    }
  }, []);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <Metadata title={"Login"} />

          <div className="row wrapper">
            <div className="col-10 col-lg-5">
              <form className="shadow-lg login-form" onSubmit={submitHandler}>
                <h1 className="mb-3">Login</h1>
                <div className="form-group">
                  <label htmlFor="email_field">Email</label>
                  <input
                    type="email"
                    id="email_field"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password_field">Password</label>
                  <input
                    type="password"
                    id="password_field"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Link to="/password/forgot" className="float-right mb-4">
                  Forgot Password?
                </Link>

                <button
                  id="login_button"
                  type="submit"
                  className="btn btn-block py-3"
                >
                  LOGIN
                </button>
                <br></br>
                <GoogleLog
                clientId="487035883817-4qg72avlq84pfgrjjmhiigjcb832qgom.apps.googleusercontent.com"
                onSuccess={resgoogle}
                cookiePolicy={"single_host_origin"}
                icon="fa-brands fa-google"
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="google-login-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="55%"
                      viewBox="0 0 500 500"
                      fill="#ffffff"
                      className="google-icon"
                    >
                      <path
                        style={{ color: "white" }}
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                      />
                    </svg>
                    <span> Login with Google</span>
                  </button>
                )}
              />
           <div className="col-span-2 sm:col-span-3 ">
               
               <FacebookLogin
                 appId="1559365501504920"
                 autoLoad={false}
                 fields="name,email,picture"
                 callback={responseFacebook}
                 cssClass="h-12 px-5  bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-xl cursor-pointer "
                 icon="fa-facebook pr-2"
               /> 
                </div>
                <Link to="/register" className="float-right mt-3">
                  New User?
                </Link>
              </form>
            </div>
          </div>
        </Fragment>
      )}
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </Fragment>
  );
};

export default Login;

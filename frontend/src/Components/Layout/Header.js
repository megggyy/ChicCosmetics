import React, { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import Search from './Search'
import axios from 'axios'
import { logout, getUser } from '../../utils/helpers'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


const Header = ({ cartItems }) => {
    const [user, setUser] = useState({})
    const navigate = useNavigate()

    const logoutUser = async () => {
        try {
            await axios.get(`${process.env.REACT_APP_API}/api/v1/logout`)
            setUser({})
            logout(() => navigate('/'))
            window.location.reload();
        } catch (error) {
            toast.error(error.response.data.message)

        }
    }
    const logoutHandler = () => {
        logoutUser();
        toast.success('Logging Out', {
            position: toast.POSITION.BOTTOM_RIGHT
        });
        window.location.reload();

    }

    useEffect(() => {
        setUser(getUser())
    }, [])

    return (
        <Fragment>
            <nav className="navbar row custom-nav">
                <Link to="/" style={{ textDecoration: 'none' }} >
                    <div className="col-12 col-md-3">
                        <div className="navbar-brand">
                            <img src="./images/chiccosmeticslogo.png" width={"200"}/>
                        </div>
                    </div>
                </Link>
                <div className="col-12 col-md-6 mt-2 mt-md-0">
                    <Search />
                </div>

                <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
                    <Link to="/wishlist" style={{ textDecoration: 'none' }} >
                        <span id="cart" className="ml-3">Wishlist</span>
                        <span className="ml-1" id="">{}</span>
                        {/*<span className="ml-1" id="cart_count">2</span>*/}
                    </Link>
                    <Link to="/cart" style={{ textDecoration: 'none' }} >
                        <span id="cart" className="ml-3">Cart</span>
                        <span className="ml-1" id="cart_count">{cartItems.length}</span>
                        {/*<span className="ml-1" id="cart_count">2</span>*/}
                    </Link>
                    {user ? (<div className="ml-4 dropdown d-inline">
                        <Link to="#!" className="btn dropdown-toggle text-white mr-4" type="button" id="dropDownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <figure className="avatar avatar-nav">
                            <img
                            src={user.avatar && user.avatar.length > 0 && user.avatar[0].url}
                            // src={user.avatar && user.avatar.url}
                            alt={user && user.name}
                            className="rounded-circle"
                            />
                            </figure>
                            <span>{user && user.name}</span>
                        </Link>

                        <div className="dropdown-menu" aria-labelledby="dropDownMenuButton">
                            {user && user.role === 'admin' && (
                                <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                            )}
                            <Link className="dropdown-item" to="/orders/me">Orders</Link>
                            <Link className="dropdown-item" to="/me">Profile</Link>

                            <Link
                                className="dropdown-item text-danger" to="/" onClick={logoutHandler}
                            >
                                Logout
                            </Link>
                        </div>
                    </div>) : <Link to="/login" className="btn ml-4" id="login_btn">Login</Link>}

                    {/* <span id="cart" className="ml-3">Cart</span>
                    <span className="ml-1" id="cart_count">2</span> */}
                </div>
            </nav>
        </Fragment>
    )
}

export default Header
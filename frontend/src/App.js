import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Header from "./Components/Layout/Header";
import Footer from "./Components/Layout/Footer";
import Home from "./Components/Home";
import ProductDetails from "./Components/Product/ProductDetails";
import Login from "./Components/User/Login";
import Register from "./Components/User/Register";
import Profile from "./Components/User/Profile";
import UpdateProfile from "./Components/User/UpdateProfile";
import UpdatePassword from "./Components/User/UpdatePassword";
import ForgotPassword from "./Components/User/ForgotPassword";
import NewPassword from "./Components/User/NewPassword";
import Cart from "./Components/Cart/Cart";
import Shipping from "./Components/Cart/Shipping";
import ConfirmOrder from "./Components/Cart/ConfirmOrder";
import Payment from "./Components/Cart/Payment";
import OrderSuccess from "./Components/Cart/OrderSuccess";
import ListOrders from "./Components/Order/ListOrders";

import OrderDetails from "./Components/Order/OrderDetails";
import UsersList from "./Components/Admin/UsersList";
import UpdateUser from "./Components/Admin/UpdateUser.js";
import Dashboard from "./Components/Admin/Dashboard";
import ProductsList from "./Components/Admin/ProductsList";
import NewProduct from "./Components/Admin/NewProduct";
import UpdateProduct from "./Components/Admin/UpdateProduct";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Navbar } from "react-bootstrap";

import Topbar from "./Components/Layout/Topbar";
import Featured from "./Components/Layout/Featured";
import ProductReviews from "./Components/Admin/ProductReviews";
import Swal from "sweetalert2";
import ProtectedRoute from "./Components/Route/ProtectedRoute";
import Offer from "./Components/Layout/Offer";
import ProductSection from "./Components/Product/ProductSection";
import { gapi } from "gapi-script";

import Brands from "./Components/Layout/Brands";

import NewBrand from "./Components/Admin/NewBrand.js";
import BrandsList from "./Components/Admin/BrandsList.js";
import UpdateBrand from "./Components/Admin/UpdateBrand.js";

import NewCategory from "./Components/Admin/NewCategory.js";
import CategoriesList from "./Components/Admin/CategoriesList.js";
import UpdateCategory from "./Components/Admin/UpdateCategory.js";

import OrdersList from "./Components/Admin/OrdersList";
import ProcessOrder from "./Components/Admin/ProcessOrder";

import UserWishlist from "./Components/User/userWishlist.js";
import Shop from "./Components/Shop.js";

function App() {
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId:
          "487035883817-4qg72avlq84pfgrjjmhiigjcb832qgom.apps.googleusercontent.com",
        scope: "",
      });
    }

    gapi.load("client:auth2", start);
  });

  const [state, setState] = useState({
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
    shippingInfo: localStorage.getItem("shippingInfo")
      ? JSON.parse(localStorage.getItem("shippingInfo"))
      : {},
  });

  const addItemToCart = async (id, quantity) => {
    console.log(id, quantity);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/product/${id}`
      );
      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0].url,
        stock: data.product.stock,
        quantity: quantity,
      };

      const isItemExist = state.cartItems.find(
        (i) => i.product === item.product
      );
      console.log(isItemExist, state);

      if (isItemExist) {
        setState({
          ...state,
          cartItems: state.cartItems.map((i) =>
            i.product === isItemExist.product ? item : i
          ),
        });
      } else {
        setState({
          ...state,
          cartItems: [...state.cartItems, item],
        });
      }

      toast.success("Item Added to Cart", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_LEFT,
      });
      // navigate('/')
    }
  };
  const removeItemFromCart = async (id) => {
    setState({
      ...state,
      cartItems: state.cartItems.filter((i) => i.product !== id),
    });
  };

  const saveShippingInfo = async (data) => {
    setState({
      ...state,
      shippingInfo: data,
    });
    localStorage.setItem("shippingInfo", JSON.stringify(data));
  };

  //Template
  function RenderRoutes() {
    const location = useLocation();

    return (
      <div>
        {location.pathname === "/" && <Topbar />}
        {location.pathname === "/" && <Featured />}
        {location.pathname === "/" && <Brands />}
        {location.pathname === "/" && <Offer />}
        {/* {location.pathname === "/" && <ProductSection />} */}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Router>
        <Header cartItems={state.cartItems} />
        <RenderRoutes />
        <Routes>
          <Route path="/" element={<Home />} exact="true" />
          <Route
            path="/product/:id"
            element={
              <ProductDetails
                cartItems={state.cartItems}
                addItemToCart={addItemToCart}
              />
            }
            exact="true"
          />
          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<Register />} exact="true" />
          <Route path="/me" element={<Profile />} exact="true" />
          <Route path="/me/update" element={<UpdateProfile />} exact="true" />
          <Route path="/password/update" element={<UpdatePassword />} />
          <Route
            path="/password/forgot"
            element={<ForgotPassword />}
            exact="true"
          />
          <Route
            path="/password/reset/:token"
            element={<NewPassword />}
            exact="true"
          />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={state.cartItems}
                addItemToCart={addItemToCart}
                removeItemFromCart={removeItemFromCart}
              />
            }
            exact="true"
          />
          <Route
            path="/shipping"
            element={
              <Shipping
                shipping={state.shippingInfo}
                saveShippingInfo={saveShippingInfo}
              />
            }
          />
          <Route
            path="/confirm"
            element={
              <ConfirmOrder
                cartItems={state.cartItems}
                shippingInfo={state.shippingInfo}
              />
            }
          />
          <Route
            path="/payment"
            element={
              <Payment
                cartItems={state.cartItems}
                shippingInfo={state.shippingInfo}
              />
            }
          />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/orders/me" element={<ListOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/dashboard" element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
          <Route path="/admin/products" element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            } />
          <Route path="/admin/product" element={
              <ProtectedRoute isAdmin={true}>
                <NewProduct />
              </ProtectedRoute>
            } />
          <Route path="/admin/brand" element={
              <ProtectedRoute isAdmin={true}>
                <NewBrand />
              </ProtectedRoute>
            } />
          <Route path="/admin/brands" element={
              <ProtectedRoute isAdmin={true}>
                <BrandsList />
              </ProtectedRoute>
            }/>
          <Route path="/admin/brand/:id" element={
              <ProtectedRoute isAdmin={true}>
                <UpdateBrand />
              </ProtectedRoute>
            } />
          <Route path="/admin/category" element={
              <ProtectedRoute isAdmin={true}>
                <NewCategory />
              </ProtectedRoute>
            } />
          <Route path="/admin/categories" element={
              <ProtectedRoute isAdmin={true}>
                <CategoriesList />
              </ProtectedRoute>
            } />
          <Route path="/admin/category/:id" element={
              <ProtectedRoute isAdmin={true}>
                <UpdateCategory />
              </ProtectedRoute>
            } />
          <Route path="/admin/product/:id" element={
              <ProtectedRoute isAdmin={true}>
                <UpdateProduct />
              </ProtectedRoute>
            } />
          <Route path="/admin/users" element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            } />
          <Route path="/admin/orders" element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            } />
          <Route path="/admin/order/:id" element={
              <ProtectedRoute isAdmin={true}>
                <ProcessOrder />
              </ProtectedRoute>
            }/>
          <Route path="/admin/user/:id" element={
              <ProtectedRoute isAdmin={true}>
                <UpdateUser />
              </ProtectedRoute>
            } />

          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductReviews />
              </ProtectedRoute>
            }
          />
          <Route path="/wishlist" element={<UserWishlist />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;

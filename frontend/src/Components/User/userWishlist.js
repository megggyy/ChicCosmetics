import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../utils/helpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Wish.css";

const UserWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getWishProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/wishlist`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (data.success) {
        setWishlist(data.wishlist || []);
      } else {
        console.log("Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching user wishlist:", error);
    }
  };

  useEffect(() => {
    getWishProducts();

    if (error) {
      toast.error(error, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  }, [error]);

  return (
    <div className="wishlist-list">
      <h1 className="text-center mt-4 mb-4">My Wishlist</h1>
      <div className="row">
        {wishlist.map((product) => (
          <div key={product._id} className="col-lg-3 col-md-6 col-sm-12 pb-1">
            <div className="card product-item border-0 mb-4">
              <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                <img
                  className="img-fluid w-100"
                  src={product.images[0].url}
                  alt={product.name}
                />
              </div>
              <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                <h6 className="text-truncate mb-3">{product.name}</h6>
                <div className="d-flex justify-content-center">
                  <h6>${product.price}</h6>
                </div>
              </div>
              <div className="card-footer bg-light border d-flex justify-content-center">
                <Link
                  to={`/product/${product._id}`}
                  className="btn btn-sm text-dark p-0"
                  style={{ alignSelf: "center" }}
                >
                  <i className="fas fa-eye text-primary mr-1"></i>View Detail
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlist;

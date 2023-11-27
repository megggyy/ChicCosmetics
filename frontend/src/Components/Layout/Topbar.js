import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import Product from "../Product/Product";
import Loader from "./Loader";
import MetaData from "./MetaData";
import { useParams } from "react-router-dom";
import Pagination from "react-js-pagination";
import "rc-slider/assets/index.css";
import { Link } from "react-router-dom";

function Topbar() {
  let { keyword } = useParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [productsCount, setProductsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resPerPage, setResPerPage] = useState(0);
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [price, setPrice] = useState([1, 1000]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  function setCurrentPageNo(pageNumber) {
    setCurrentPage(pageNumber);
  }

  const getCategory = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/categories`
      );
      setCategories(data.categories);
    } catch (error) {
      setError(error.message);
    }
  };

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getProducts = async (
    page = 0,
    keyword = "",
    price,
    selectedCategory = ""
  ) => {
    let link = "";

    link = `${process.env.REACT_APP_API}/api/v1/products/?page=${page}&keyword=${keyword}&price[lte]=${price[1]}&price[gte]=${price[0]}`;

    if (selectedCategory) {
      link += `&category=${selectedCategory}`;
    }

    console.log(link);
    let res = await axios.get(link);
    console.log(res);

    setProducts(res.data.products);
    setResPerPage(res.data.resPerPage);
    setProductsCount(res.data.productsCount);
    setFilteredProductsCount(res.data.filteredProductsCount);
    setLoading(false);
  };
 
  useEffect(() => {
    getProducts(currentPage, keyword, price, selectedCategory);
    getCategory();
  }, [currentPage, keyword, price, selectedCategory]);

  let count = productsCount;
  if (keyword) {
    count = filteredProductsCount;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Chic Cosmetics"} />
          <div className="row px-xl-5 pb-3">
            <div className="container-fluid">
              <div className="row border-top px-xl-5">
                <div className="col-lg-3 d-none d-lg-block">
                  <a
                    className="btn shadow-none d-flex align-items-center justify-content-between bg-primary text-white w-100"
                    data-toggle="collapse"
                    href=""
                    style={{
                      height: "65px",
                      marginTop: "-1px",
                      padding: "0 30px",
                    }}
                  >
                    <h6 className="m-0">Categories</h6>
                    <i className="fa fa-angle-down text-dark"></i>
                  </a>
                  <nav
                    className="collapse show navbar navbar-vertical navbar-light align-items-start p-0 border border-top-0 border-bottom-0"
                    id="navbar-vertical"
                  >
                    <div className="navbar-nav w-100 overflow-hidden" style={{height: '410px'}}>
                    {/* <div className="nav-item dropdown"> */}
                        {categories.map((category) => (
                          <Link
                          className="nav-item nav-link"
                            key={category._id}
                            // style={{
                            //   cursor: "pointer",
                            //   listStyleType: "none`",
                            //   textAlign: "left",
                            //   padding: "5px 0",
                            //   color:
                            //     category._id === selectedCategory
                            //       ? "#8b4656"
                            //       : "black",
                            // }}
                            onClick={() => selectCategory(category._id)} // Set category filter
                          >
                            {category.name}
                          </Link>
                        ))}
                      {/* </div> */}
                    </div>
                  </nav>
                </div>
                {selectedCategory ? (
                  <Fragment>
                    <div className="col-lg-9">
                      <nav className="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0">
                        <a
                          href=""
                          className="text-decoration-none d-block d-lg-none"
                        >
                          <h1 className="m-0 display-5 font-weight-semi-bold">
                            <span className="text-primary font-weight-bold border px-3 mr-1">
                              Chic
                            </span>
                            Shopper
                          </h1>
                        </a>
                        <button
                          type="button"
                          className="navbar-toggler"
                          data-toggle="collapse"
                          data-target="#navbarCollapse"
                        >
                          <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
                    <div className="navbar-nav mr-auto py-0">
                        <a href="index.html" className="nav-item nav-link active">Home</a>
                            <Link to="/shop" className="nav-item nav-link">
                                Shop
                            </Link>
                            <Link to="/wishlist" className="nav-item nav-link">
                                Wishlist
                            </Link>
                            <Link to="/cart" className="nav-item nav-link">
                                Cart
                            </Link>
                    </div>
                </div>
                      </nav>

                      <div id="header-carousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/maybellinebanner.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Fashionable Dress</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/nars.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Reasonable Price</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/benefit.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Reasonable Price</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <a className="carousel-control-prev" href="#header-carousel" data-slide="prev">
                    <div className="btn btn-dark" style={{width: '45px', height: '45px'}}>
                        <span className="carousel-control-prev-icon mb-n2"></span>
                    </div>
                </a>
                <a className="carousel-control-next" href="#header-carousel" data-slide="next">
                    <div className="btn btn-dark" style={{width: '45px', height: '45px'}}>
                        <span className="carousel-control-next-icon mb-n2"></span>
                    </div>
                </a>
                      </div>
                    </div>

                    <div className="col justify-content-center">
                      <div className="row mt-4 justify-content-center">
                          {products.map((product) => (
                            <Product
                              key={product._id}
                              product={product}
                              col={3}
                              style={{ alignItems: "center" }}
                            />
                          ))}
                      </div>
                      {resPerPage <= count && (
                        <div className="row mt-5 justify-content-center">
                          <div className="col-4">
                            <Pagination
                              activePage={currentPage}
                              itemsCountPerPage={resPerPage}
                              totalItemsCount={productsCount}
                              onChange={setCurrentPageNo}
                              nextPageText={"Next"}
                              prevPageText={"Prev"}
                              firstPageText={"First"}
                              lastPageText={"Last"}
                              itemClass="page-item"
                              linkClass="page-link"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </Fragment>
                ) : (
                  <div className="col-lg-9">
                    <nav className="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0">
                      <a
                        href=""
                        className="text-decoration-none d-block d-lg-none"
                      >
                        <h1 className="m-0 display-5 font-weight-semi-bold">
                          <span className="text-primary font-weight-bold border px-3 mr-1">
                            Chic
                          </span>
                          Shopper
                        </h1>
                      </a>
                      <button
                        type="button"
                        className="navbar-toggler"
                        data-toggle="collapse"
                        data-target="#navbarCollapse"
                      >
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
                    <div className="navbar-nav mr-auto py-0">
                        <a href="index.html" className="nav-item nav-link active">Home</a>
                            <Link to="/shop" className="nav-item nav-link">
                                Shop
                            </Link>
                            <Link to="/wishlist" className="nav-item nav-link">
                                Wishlist
                            </Link>
                            <Link to="/cart" className="nav-item nav-link">
                                Cart
                            </Link>
                    </div>
                </div>
                    </nav>

                    <div id="header-carousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/maybellinebanner.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Fashionable Dress</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/nars.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Reasonable Price</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="carousel-item" style={{height: '410px'}}>
                        <img className="img-fluid" src="userkit/img/benefit.jpg" alt="Image"/>
                        <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                            <div className="p-3" style={{maxWidth: '700px'}}>
                                <h4 className="text-light text-uppercase font-weight-medium mb-3">10% Off Your First Order</h4>
                                <h3 className="display-4 text-white font-weight-semi-bold mb-4">Reasonable Price</h3>
                                <Link to="/shop" className="btn btn-light py-2 px-3">
                                Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <a className="carousel-control-prev" href="#header-carousel" data-slide="prev">
                    <div className="btn btn-dark" style={{width: '45px', height: '45px'}}>
                        <span className="carousel-control-prev-icon mb-n2"></span>
                    </div>
                </a>
                <a className="carousel-control-next" href="#header-carousel" data-slide="next">
                    <div className="btn btn-dark" style={{width: '45px', height: '45px'}}>
                        <span className="carousel-control-next-icon mb-n2"></span>
                    </div>
                </a>
                    </div>
                  </div>
                  
                )}
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </>
  );
}

export default Topbar;

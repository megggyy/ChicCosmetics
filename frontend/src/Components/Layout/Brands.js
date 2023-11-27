import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Brands = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/v1/brands`);
        setBrands(response.data.brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className="container-fluid">
      <div className="container-fluid pt-5 text-center">
        <h1 id="brands_heading">Brands</h1>
        <div className="row px-xl-5 pb-3">
          {brands.map((brand) => (
            <div key={brand._id} className="col-lg-4 col-md-6 pb-1">
              <div className="cat-item d-flex flex-column border mb-4" style={{ padding: '30px' }}>
                <p className="text-right">{brand.products && brand.products.length} Products</p>
                <div className="cat-img position-relative overflow-hidden mb-3">
                  {brand.images && brand.images.length > 0 && (
                    <img
                      className="img-fluid"
                      src={brand.images[0].url}
                      alt={brand.name}
                      style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="text-decoration-none">
                  <h5 className="font-weight-semi-bold m-0">{brand.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;
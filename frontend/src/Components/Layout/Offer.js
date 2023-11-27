import React from 'react';
import { Link } from 'react-router-dom';

function Offer() {
  return (
    <div className="container-fluid">
      <div className="container-fluid offer pt-5">
        <div className="row px-xl-5">
          <div className="col-md-6 pb-4">
            <div className="position-relative bg-secondary text-center text-md-right text-white mb-2 py-5 px-5">
              <img src="userkit/img/offer-1.png" alt="" />
              <div className="position-relative" style={{ zIndex: 1 }}>
                <h5 className="text-uppercase text-primary mb-3">5% off on all orders</h5>
                <h2 className="mb-4 font-weight-semi-bold" style={{ color: 'black' }}>Spring Collection on Anna Cay</h2>
                <Link to="/shop" className="btn btn-outline-primary py-md-2 px-md-3">
                    Shop Now
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 pb-4">
            <div className="position-relative bg-secondary text-center text-md-left text-white mb-2 py-5 px-5">
              <img src="userkit/img/offer-2.png" alt="" />
              <div className="position-relative" style={{ zIndex: 1 }}>
                <h5 className="text-uppercase text-primary mb-3">10% off on all orders</h5>
                <h2 className="mb-4 font-weight-semi-bold" style={{ color: 'black' }}>Winter Collection on Anasthasia</h2>
                <Link to="/shop" className="btn btn-outline-primary py-md-2 px-md-3">
                    Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Offer;

import React from 'react';
import { Hearts } from 'react-loader-spinner'
import './Loader.css'; // Import your CSS file for styling

const Loader = () => {
  return (
    <div className="loader-container">
    <Hearts 
    height="100"
    width="100"
    color="#944f59"
    ariaLabel="hearts-loading"
    wrapperStyle={{}}
    wrapperClass=""
    visible={true}
  />
  </div>
  );
};

export default Loader;
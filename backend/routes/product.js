const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')

const { newProduct, getProducts, getSingleProduct, updateProduct, deleteProduct, getAdminProducts, createProductReview, getProductReviews, deleteReview, productSales } = require('../controllers/productController');

//const {newProduct, getProducts, getSingleProduct, updateProduct, deleteProduct, getAdminProducts, productSales} = require('../controllers/productController');

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.post('/admin/product/new', isAuthenticatedUser, upload.array('images', 10), newProduct)
router.get('/products', getProducts)
router.get('/product/:id', getSingleProduct);
router.route('/admin/product/:id', isAuthenticatedUser,).put(upload.array('images', 10), updateProduct).delete(deleteProduct);
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

//review
router.put('/review', isAuthenticatedUser, createProductReview);
router.get('/reviews', isAuthenticatedUser, getProductReviews)
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview)


//charts
router.get('/admin/product-sales', productSales);
module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');

const { newBrand, updateBrand, getAdminBrands, deleteBrand, getBrandDetails } = require('../controllers/brandController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.post('/admin/brand/new', isAuthenticatedUser, upload.array('images', 10), newBrand);
router.get('/admin/brands', isAuthenticatedUser, authorizeRoles('admin'),getAdminBrands);
router.route('/admin/brand/:id').get(isAuthenticatedUser, getBrandDetails ).put(upload.array('images', 10), updateBrand).delete(deleteBrand);
module.exports = router;
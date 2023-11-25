const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');

const { newCategory, updateCategory, getAdminCategories, deleteCategory, getCategoryDetails } = require('../controllers/categoryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.post('/admin/category/new', isAuthenticatedUser, upload, newCategory);
router.get('/admin/categories', isAuthenticatedUser, authorizeRoles('admin'),getAdminCategories);
router.route('/admin/category/:id').get(isAuthenticatedUser, getCategoryDetails ).put(upload, updateCategory).delete(deleteCategory);
module.exports = router;
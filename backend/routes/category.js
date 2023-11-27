const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const {
  newCategory,
  updateCategory,
  getAdminCategories,
  deleteCategory,
  getCategoryDetails,
  getCategories,
} = require("../controllers/categoryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post(
  "/admin/category/new",
  isAuthenticatedUser,
  upload.array("images", 10),
  newCategory
);
router.get(
  "/admin/categories",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminCategories
);
router
  .route("/admin/category/:id")
  .get(isAuthenticatedUser, getCategoryDetails)
  .put(upload.array("images", 10), updateCategory)
  .delete(deleteCategory);
router.get("/categories", getCategories);

module.exports = router;

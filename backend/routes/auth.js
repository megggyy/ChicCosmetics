const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  getUserProfile,
  updateProfile,
  allUsers,
  getUserDetails,
  deleteUser,
  updateUser,
  createWish,
  deleteWish,
  getWish,
  getUserWishlist,
  gLogin,
  facebookLogin
} = require("../controllers/authController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/me/update", isAuthenticatedUser, updateProfile);

router.get("/admin/users", isAuthenticatedUser, allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, getUserDetails)
  .delete(isAuthenticatedUser, deleteUser)
  .put(isAuthenticatedUser, updateUser);

// Wishlist
router
  .route("/wishlist")
  .post(isAuthenticatedUser, createWish)
  .get(isAuthenticatedUser, getUserWishlist);

router.get("/wishlistshow/:id", isAuthenticatedUser, getWish);
router.delete("/deletewish/:id", isAuthenticatedUser, deleteWish);

//glogin
router.post("/g-log", gLogin);
router.post('/facebook_login', facebookLogin)

module.exports = router;
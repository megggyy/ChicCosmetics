const User = require("../models/user");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { google } = require("googleapis");
const bcrypt = require("bcrypt");
const { OAuth2 } = google.auth;
const Product = require("../models/product");
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const client = new OAuth2(
  "487035883817-4qg72avlq84pfgrjjmhiigjcb832qgom.apps.googleusercontent.com"
);

exports.registerUser = async (req, res, next) => {
  const { name, email, password, role, avatar } = req.body;

  let avatarLinks = [];

  // If avatar is a string, convert it to an array
  const avatarArray = typeof avatar === 'string' ? [avatar] : avatar;

  for (let i = 0; i < avatarArray.length; i++) {
    const avatarDataUri = avatarArray[i];
    
    try {
      const result = await cloudinary.v2.uploader.upload(avatarDataUri, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      avatarLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    } catch (error) {
      console.log(error);
      // Handle the error as needed
    }
  }

  try {
    // Create the user with the provided data and avatarLinks
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarLinks,
      // role,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not created',
      });
    }

    // Send the user token
    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    // Handle the error as needed
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Checks if email and password is entered by user
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter email & password" });
  }
  // Finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid Email or Password" });
  }
  // Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({ message: "Invalid Email or Password" });
  }

  sendToken(user, 200, res);
};

exports.logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};


exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "User not found with this email" });
    // return next(new ErrorHandler('User not found with this email', 404));
  }
  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // Create reset password url
  const resetUrl = `${req.protocol}://localhost:3000/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "ShopIT Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ error: error.message });
    // return next(new ErrorHandler(error.message, 500))
  }
};

exports.resetPassword = async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Password reset token is invalid or has been expired" });
    // return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: "Password does not match" });
    // return next(new ErrorHandler('Password does not match', 400))
  }

  // Setup new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
};

exports.getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("password");
  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }
  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
};

exports.updateProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // Update avatar
  // if (req.body.avatar !== '') {
  //     const user = await User.findById(req.user.id)

  //     const image_id = user.avatar.public_id;
  //     const res = await cloudinary.v2.uploader.destroy(image_id);

  //     const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //         folder: 'avatars',
  //         width: 150,
  //         crop: "scale"
  //     })

  //     newUserData.avatar = {
  //         public_id: result.public_id,
  //         url: result.secure_url
  //     }
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
};

exports.allUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
};

exports.getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(400)
      .json({ message: `User does not found with id: ${req.params.id}` });
    // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
  }

  res.status(200).json({
    success: true,
    user,
  });
};

exports.deleteUser = async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);
	if (!user) {
		return res.status(404).json({
			success: false,
			message: 'User not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'User deleted'
	})
}

exports.updateUser = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    // useFindAndModify: false
  });

  return res.status(200).json({
    success: true,
  });
};

// Wishlist
exports.createWish = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const product = req.body.product;

    if (!product) {
      return res.status(400).json({ error: "Product is required" });
    }

    const productExistsInWishlist = user.wishlist.some(
      (item) => item.product.toString() === product
    );

    if (productExistsInWishlist) {
      return res
        .status(400)
        .json({ error: "Product already exists in wishlist" });
    }

    user.wishlist.push({ product /* : product._id, */ });
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.deleteWish = async (req, res, next) => {
  const productId = req.params.id;

  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { $pull: { wishlist: { _id: productId } } },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "The Product has been removed from the wishlist",
  });
};

exports.getWish = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const user = await User.findOne({
      _id: userId,
      "wishlist.product": productId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const productInWishlist = user.wishlist.find(
      (item) => item.product.toString() === productId
    );

    if (!productInWishlist) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    return res.status(200).json({
      success: true,
      product: productInWishlist,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Wishlist not found",
    });
  }
};

exports.getUserWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming user ID is available in the request

    const user = await User.findById(userId).populate({
      path: 'wishlist.product',
      model: 'Product', // Assuming your product model name is 'Product'
      select: 'name price images' // Specify fields you want to select from Product model
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wishlist = user.wishlist.map(item => item.product._id); // Extracting product IDs from the wishlist

    // Fetch all products based on the IDs from the wishlist
    const products = await Product.find({ _id: wishlist });

    res.status(200).json({ success: true, wishlist: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


//glogin

exports.gLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience:
        "487035883817-4qg72avlq84pfgrjjmhiigjcb832qgom.apps.googleusercontent.com",
    });

    const { email_verified, email, name, picture } = verify.payload;

    if (!email_verified)
      return res.status(400).json({ msg: "Email verification failed." });

    let user = await User.findOne({ email });

    if (!user) {
      const passwordHash = await bcrypt.hash(email, 12);

      const newUser = new User({
        name,
        email,
        password: passwordHash,
        avatar: {
          public_id: "default",
          url: picture,
        },
      });

      await newUser.save();

      user = newUser;
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
    return res.status(500).json({ msg: err.message });
  }
};

const createRefreshToken = (payload) => {
  if (!process.env.JWT_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}


exports.facebookLogin = async (req, res) => {
  try {
      const { accessToken, userID } = req.body;
      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
      const response = await fetch(URL);


      if (!response.ok) {
          throw new Error(`Failed to fetch data from Facebook: ${response.statusText}`);
      }


      const data = await response.json();
      const { email, name, picture } = data;
      let user = await User.findOne({ email });


      if (user) {
          const refresh_token = createRefreshToken({ id: user._id });
          res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/user/refresh_token',
            maxAge: 7 * 24 * 60 * 60 * 1000
          });
      } else {
          const passwordHash = await bcrypt.hash(email, 12);
          const newUser = new User({
              name,
              email,
              password: passwordHash,
              avatar: {
                  public_id: 'default',
                  url: picture.data.url
              }
          });


          await newUser.save();
          user = newUser;


          const refresh_token = createRefreshToken({ id: newUser._id });
          res.cookie('refreshtoken', refresh_token, {
              httpOnly: true,
              path: '/user/refresh_token',
              maxAge: 7 * 24 * 60 * 60 * 1000
          });
      }


      sendToken(user, 200, res);
  } catch (err) {
      return res.status(500).json({ msg: err.message });
  }
};

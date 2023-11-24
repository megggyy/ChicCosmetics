const Product = require('../models/product')
const Order = require('../models/order')
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')
const Brand = require('../models/brand')
const Category = require('../models/category') //category


exports.getProducts = async (req, res, next) => {
	// const products = await Product.find({});
	const resPerPage = 4;
	const productsCount = await Product.countDocuments();
	const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
	apiFeatures.pagination(resPerPage);
	const products = await apiFeatures.query;
	const filteredProductsCount = products.length
	if (!products) {
		return res.status(404).json({
			success: false,
			message: 'No Products'
		})
	}
	res.status(200).json({
		success: true,
		count: products.length,
		productsCount,
		products,
		resPerPage,
		filteredProductsCount,
	})
}

exports.getSingleProduct = async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	res.status(200).json({
		success: true,
		product
	})
}

// exports.updateProduct = async (req, res, next) => {
// 	let product = await Product.findById(req.params.id);
// 	console.log(req.body)
// 	if (!product) {
// 		return res.status(404).json({
// 			success: false,
// 			message: 'Product not found'
// 		})
// 	}
// 	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,
// 	})
// 	if (!product) {
// 		return res.status(404).json({
// 			success: false,
// 			message: 'Product not updated'
// 		})
// 	}
// 	res.status(200).json({
// 		success: true,
// 		product
// 	})
// }

exports.deleteProduct = async (req, res, next) => {
	const product = await Product.findByIdAndDelete(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Product deleted'
	})
}

exports.getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find()
            .populate('brand')
            .populate('category');

        if (!products) {
            return res.status(404).json({
                success: false,
                message: 'Products not found'
            });
        }

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}
exports.newProduct = async (req, res, next) => {
	let images = []
	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images
	}

	let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		let imageDataUri = images[i]
		// console.log(imageDataUri)
		try {
			const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
				folder: 'products',
				width: 150,
				crop: "scale",
			});

			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		} catch (error) {
			console.log(error)
		}

	}

	req.body.images = imagesLinks
	req.body.user = req.user.id;

	const brandId = req.body.brand; // Assuming you are sending the brand ID in the request body

	// Check if the brand ID is valid
	const brand = await Brand.findById(brandId);
	if (!brand) {
		return res.status(400).json({
			success: false,
			message: 'Invalid brand ID',
		});
	}

	// Include brand information in the product creation
	req.body.brand = brandId;
	const product = await Product.create(req.body);
	if (!product)
		return res.status(400).json({
			success: false,
			message: 'Product not created'
		})
	res.status(201).json({
		success: true,
		product
	})

	const categoryID = req.body.category;
	const category = await Category.findById(categoryID);
	if (!category) {
		return res.status(400).json({
			success: false,
			message: 'Invalid Category ID',
		});
	}

	req.body.category = categoryID;
}

exports.updateProduct = async (req, res, next) => {
	let product = await Product.findById(req.params.id);
	// console.log(req.body)
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	let images = []

	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images
	}
	if (images !== undefined) {
		// Deleting images associated with the product
		for (let i = 0; i < product.images.length; i++) {
			try {
				let imageDataUri = product.images[i]
			const result = await cloudinary.v2.uploader.destroy(`${imageDataUri.public_id}`)
			} catch (error) {
				console.log(error)
			}
		}
	}
	let imagesLinks = [];
	for (let i = 0; i < images.length; i++) {
		try {
			let imageDataUri = images[i]
		const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
			folder: 'products',
			width: 150,
			crop: "scale",
		});
		imagesLinks.push({
			public_id: result.public_id,
			url: result.secure_url
		})
		} catch (error) {
			console.log(error)
		}
		

	}
	req.body.images = imagesLinks
	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindandModify: false
	})
	if (!product)
		return res.status(400).json({
			success: false,
			message: 'Product not updated'
		})
	// console.log(product)
	return res.status(200).json({
		success: true,
		product
	})

}

exports.createProductReview = async (req, res, next) => {
	const { rating, comment, productId } = req.body;
	const review = {
		user: req.user._id,
		name: req.user.name,
		rating: Number(rating),
		comment
	}
	const product = await Product.findById(productId);
	const isReviewed = product.reviews.find(
		r => r.user.toString() === req.user._id.toString()
	)
	if (isReviewed) {
		product.reviews.forEach(review => {
			if (review.user.toString() === req.user._id.toString()) {
				review.comment = comment;
				review.rating = rating;
			}
		})
	} else {
		product.reviews.push(review);
		product.numOfReviews = product.reviews.length
	}
	product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
	await product.save({ validateBeforeSave: false });
	if (!product)
		return res.status(400).json({
			success: false,
			message: 'review not posted'
		})
	return res.status(200).json({
		success: true
	})
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }

            },

        },
    ])
    console.log(totalSales)
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: 1 } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])
	console.log(sales)

    if (!totalSales) {
		return res.status(404).json({
			message: 'error sales'
		})

    }
    if (!sales) {
		return res.status(404).json({
			message: 'error sales'
		})

    }

    let totalPercentage = {}
    totalPercentage = sales.map(item => {

        // console.log( ((item.total/totalSales[0].total) * 100).toFixed(2))
        percent = Number (((item.total/totalSales[0].total) * 100).toFixed(2))
        total =  {
            name: item._id.product,
            percent
        }
        return total
    }) 
    // return console.log(totalPercentage)
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}
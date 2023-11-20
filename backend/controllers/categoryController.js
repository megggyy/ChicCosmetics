const Category = require('../models/category');
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary');

exports.newCategory = async (req, res, next) => {
	let images = []
	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images
	}

	let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		let imageDataUri = images[i]
		try {
			const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
				folder: 'categories',
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

	const category = await Category.create(req.body);
	if (!category)
		return res.status(400).json({
			success: false,
			message: 'Category not created'
		})
	res.status(201).json({
		success: true,
		category
	})
};

exports.getAdminCategories = async (req, res, next) => {
	const categories = await Category.find();
	if (!categories) {
		return res.status(404).json({
			success: false,
			message: 'Categories not found'
		})
	}
	res.status(200).json({
		success: true,
		categories
	})

}

exports.deleteCategory = async (req, res, next) => {
	const category = await Category.findByIdAndDelete(req.params.id);
	if (!category) {
		return res.status(404).json({
			success: false,
			message: 'Category not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Category deleted'
	})
}


exports.updateCategory = async (req, res, next) => {
    let category = await Category.findById(req.params.id);
	if (!category) {
		return res.status(404).json({
			success: false,
			message: 'Category not found'
		})
	}
	let images = []

	if (typeof req.body.images === 'string') {
		images.push(req.body.images)
	} else {
		images = req.body.images
	}
	if (images !== undefined) {
		for (let i = 0; i < category.images.length; i++) {
			try {
				let imageDataUri = category.images[i]
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
			folder: 'categories',
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
	category = await Category.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindandModify: false
	})
	if (!category)
		return res.status(400).json({
			success: false,
			message: 'Category not updated'
		})
	
	return res.status(200).json({
		success: true,
		category
	})
}

exports.getCategoryDetails = async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(400).json({ message: `Category does not found with id: ${req.params.id}` })
    }

    res.status(200).json({
        success: true,
        category
    })

}
// brand crud backend
const Brand = require('../models/brand');
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary');

exports.newBrand = async (req, res, next) => {
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
				folder: 'brands',
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

	const brand = await Brand.create(req.body);
	if (!brand)
		return res.status(400).json({
			success: false,
			message: 'Brand not created'
		})
	res.status(201).json({
		success: true,
		brand
	})
};

exports.getAdminBrands = async (req, res, next) => {
	const brands = await Brand.find();
	if (!brands) {
		return res.status(404).json({
			success: false,
			message: 'Brands not found'
		})
	}
	res.status(200).json({
		success: true,
		brands
	})

}

exports.deleteBrand = async (req, res, next) => {
	const brand = await Brand.findByIdAndDelete(req.params.id);
	if (!brand) {
		return res.status(404).json({
			success: false,
			message: 'Brand not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Brand deleted'
	})
}


exports.updateBrand = async (req, res, next) => {
    let brand = await Brand.findById(req.params.id);
	// console.log(req.body)
	if (!brand) {
		return res.status(404).json({
			success: false,
			message: 'Brand not found'
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
		for (let i = 0; i < brand.images.length; i++) {
			try {
				let imageDataUri = brand.images[i]
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
			folder: 'brands',
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
	brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindandModify: false
	})
	if (!brand)
		return res.status(400).json({
			success: false,
			message: 'Brand not updated'
		})
	
	return res.status(200).json({
		success: true,
		brand
	})
}

exports.getBrandDetails = async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
        return res.status(400).json({ message: `Brand does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        brand
    })

}

exports.getBrands = async (req, res, next) => {
	const brands = await Brand.find();
	if (!brands) {
		return res.status(404).json({
			success: false,
			message: 'Brands not found'
		})
	}
	res.status(200).json({
		success: true,
		brands
	})
}
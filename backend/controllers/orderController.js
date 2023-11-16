const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

exports.newOrder = async (req, res, next) => {
    try {
        // Fetch the user details using the User model
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id
        });

        if (!order) {
            return res.status(400).json({ message: 'Order not saved' });
        }

        // Send order confirmation email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Order Confirmation',
                message: 'Thank you for your order!'  
            });
            console.log('Order confirmation email sent');
        } catch (error) {
            console.error('Error sending order confirmation email:', error.message);
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating the order',
            error: error.message
        });
    }
};

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return res.status(404).json({ message: `No Order found with this ID` })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })

    if (!orders) {
        return res.status(404).json({ message: `Order found` })
    }

    res.status(200).json({
        success: true,
        orders
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}
exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return res.status(404).json({ message: `You have already delivered this order` })
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()
    await order.save()

    res.status(200).json({
        success: true,
    })
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false })
}

exports.deleteOrder = async (req, res, next) => {
    
    const order = await Order.findById(req.params.id)

    if (!order) {
        return res.status(404).json({ message: `No Order found with this ID` })
     
    }
    await order.remove()

    res.status(200).json({
        success: true
    })
}
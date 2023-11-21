const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path'); 

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

            const receiptHtml = fs.readFileSync(path.resolve(__dirname, '..', 'receipts', 'receipt.html'), 'utf-8');
        
            const populatedHtml = receiptHtml
            .replace('{{ user.name }}', user.name)
            .replace('{{ user.email }}', user.email)
            .replace('{{ user.phone }}', user.phone)
            .replace('{{ shippingInfo.address }}', shippingInfo.address)
            .replace('{{ shippingInfo.city }}', shippingInfo.city)
            .replace('{{ shippingInfo.country }}', shippingInfo.country)
            .replace('{{ shippingInfo.postalCode }}', shippingInfo.postalCode)
            .replace('{{#each orderItems}}', orderItems.map(item => `
                <tr>
                <td class="product">${item.product}</td>
                <td class="item-name">${item.name}</td>
                <td class="item-price">${item.price}</td>
                <td class="item-quantity">${item.quantity}</td>
                <td class="item-total">${item.quantity * item.price}</td>
                </tr>
            `).join(''))
            .replace('{{ itemsPrice }}', itemsPrice)
            .replace('{{ taxPrice }}', taxPrice)
            .replace('{{ shippingPrice }}', shippingPrice)
            .replace('{{ totalPrice }}', totalPrice)
            .replace('{{ paymentInfo.status }}', paymentInfo.status)
            .replace('{{ paymentInfo.id }}', paymentInfo.id);

            // Generate a PDF receipt
            const pdfOptions = { format: 'Letter' };
            pdf.create(populatedHtml, pdfOptions).toFile('./receipt.pdf', async function (err, response) {
                if (err) {
                    console.error('Error generating PDF:', err);
                } else {
                    // Send order confirmation email with PDF attachment
                    // try {
                    //     await sendEmail({
                    //         email: user.email,
                    //         subject: 'Order Confirmation',
                    //         message: 'Thank you for placing your order in Chic Cosmetics!',
                    //         attachments: [{ path: response.filename }],
                    //     });
                    const orderConfirmationMessage = `
                    <p>Dear ${user.name},</p>
                    <p>Thank you for placing your order in Chic Cosmetics! Your order is being processed.</p>
                    <p>Order ID: ${order._id}</p>
                    <p><strong>Order Details:</strong></p>
                    <ul>
                        ${orderItems.map(item => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`).join('')}
                    </ul>
                    <p>Total Amount: $${totalPrice}</p>
                    <p>Please find your receipt in the attachments.</p>
                    <p>Thank you for choosing Chic Cosmetics!</p>
                `;
                try{
                await sendEmail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    message: orderConfirmationMessage,
                    attachments: [{ path: response.filename }],
                });
                        console.log('Order confirmation email sent with PDF attachment');
                    } catch (error) {
                        console.error('Error sending order confirmation email:', error.message);
                    }
                }
            });
        
           
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
    
    const order = await Order.findByIdAndRemove(req.params.id)
    if (!order) {
        return res.status(404).json({ message: `No Order found with this ID` })
     
    }

    res.status(200).json({
        success: true
    })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //     }
        // },

        { $unwind: "$userDetails" },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //         doc: { "$first": "$$ROOT" },

        //     }
        // },

        // {
        //     $replaceRoot: {
        //         newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
        //     },
        // },
        {
            $group: {
                _id: "$userDetails.name",
                total: { $sum: "$totalPrice" }
            }
        },
        {
            $project: {
                _id: 0,
                "userDetails.name": 1,
                total: 1,
            }
        },
        { $sort: { total: 1 } },

    ])
    console.log(customerSales)
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}
exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([

        {
            $group: {
                // _id: {month: { $month: "$paidAt" } },
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', ' Sept', 'Oct', 'Nov', 'Dec'],
                            
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: 1,
                total: 1,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        salesPerMonth
    })

}

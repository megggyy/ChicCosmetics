// brand crud backend
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter brand name'],
        trim: true,
        maxLength: [20, 'Brand name cannot exceed 20 characters']
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
});

module.exports = mongoose.model('Brand', brandSchema);

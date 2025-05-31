const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripePaymentIntentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    amount: { 
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: { 
        type: String,
        enum: [
            'pending',   
            'succeeded',  
            'failed',   
            'canceled'    
        ],
        required: true
    },
    paymentMethodType: String, 
    last4: String,
    failureCode: String,
    failureMessage: String,
    receiptUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
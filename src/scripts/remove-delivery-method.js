require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order'); // Correctly requiring your Order model


async function removeDeliveryMethod() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not set!');
        }

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for migration.');


        // Update all documents that have the 'deliveryMethod' field
        const result = await Order.updateMany(
            { deliveryMethod: { $exists: true } }, // Finds documents where deliveryMethod exists
            { $unset: { deliveryMethod: "" } }      // Removes the field
        );

        console.log(`Migration complete! Matched ${result.matchedCount} documents, modified ${result.modifiedCount}.`);

    } catch (error) {
        console.error('Migration to remove deliveryMethod failed:', error);
    } finally { // This ensures the connection is closed even if an error occurs
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

removeDeliveryMethod();
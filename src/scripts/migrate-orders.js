require('dotenv').config(); 
const mongoose = require('mongoose');
const Order = require('../models/Order'); 



async function migrateOrders() {
    try {
       const mongoURI = process.env.MONGODB_URI; 
              if (!mongoURI) {
                  throw new Error('MONGODB_URI environment variable is not set!');
              }
              
              await mongoose.connect(mongoURI);
              console.log('Connected to MongoDB for migration.');
      

        // Find orders that do NOT have 'orderCode' or 'deliveryMethod'
        const oldOrders = await Order.find({
            $or: [
                { orderCode: { $exists: false } },
                { deliveryMethod: { $exists: false } }
            ]
        });

        console.log(`Found ${oldOrders.length} old orders to migrate.`);

        for (const order of oldOrders) {
            // Generate a unique order code if missing
            if (typeof order.orderCode === 'undefined') {
              
                order.orderCode = `MIG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            }

            // Set a default delivery method if missing
            if (typeof order.deliveryMethod === 'undefined') {
                order.deliveryMethod = 'delivery'; 
            }

            await order.save(); // Save the updated document
            console.log(`Migrated order: ${order._id} - new orderCode: ${order.orderCode}, deliveryMethod: ${order.deliveryMethod}`);
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

migrateOrders();
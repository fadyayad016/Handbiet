
require('dotenv').config(); 

const mongoose = require('mongoose');
const User = require('../models/userAuth'); 

async function runMigration() {
    try {
        const mongoURI = process.env.MONGODB_URI; 
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not set!');
        }
        
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for migration.');

        console.log('Starting migration: Setting "status" to "active" for users without a status field...');

        const result = await User.updateMany(
            { status: { $exists: false } }, // Find documents where 'status' field does not exist
            { $set: { status: 'active' } } // Set their status to 'active'
        );

        console.log(`Migration complete:`);
        console.log(`  Matched: ${result.matchedCount} users`);
        console.log(`  Modified: ${result.modifiedCount} users`);

        if (result.modifiedCount > 0) {
            console.log('All matched users have been updated to status "active".');
        } else {
            console.log('No users found requiring a status update.');
        }

    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

// Execute the migration function
runMigration();
const mongoose = require('mongoose');
const dbconnect = async () => {

    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`batabase connected to ${connect.connection.host}`);


    }
    catch (error) {
        console.log(`error connecting to database ${error}`);

    }

}
module.exports = dbconnect;  
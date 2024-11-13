const mongoose = require('mongoose')

const dbUrl=`${process.env.MONGO_URI}`

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(dbUrl);
        console.log(`Database connected,${conn.connection.host}`);
        
    }catch(error){
        console.log('Error occur during db connection',error);
        process.exit(1);
    }
}

module.exports =connectDB;
import {connect,disconnect } from 'mongoose'

async function connectionTodatabase(){
    try{
        await connect(process.env.MONGODB_URL);

    }
    catch(error){
        console.log(error)
        throw new Error("Cannot Connect to Mongodb")
    }
}

async function disconnectFromdatabase(){
    try{
        await disconnect();
    }
    catch(error){
        console.log(error)
        throw new Error("Cannot Diconnect from Mongodb");
    }
}

export {connectionTodatabase,disconnectFromdatabase};
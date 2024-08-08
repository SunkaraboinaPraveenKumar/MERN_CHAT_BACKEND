import app from "./app.js";

import { connectionTodatabase } from "./db/connection.js";



//GET - get data from backend
//PUT, POST, DELETE
const PORT=process.env.PORT||3000;

connectionTodatabase().then(()=>{
  app.listen(PORT,()=>{
    console.log(`The server is running on ${PORT} and Connected to database`)
  })
})
.catch((err)=>console.log(err))


//connections and listeners



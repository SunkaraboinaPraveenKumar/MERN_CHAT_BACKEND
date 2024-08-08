import {Router} from 'express'
import { getAllUsers, userLogin, userLogout, userSignUp, verfiyUser } from '../controllers/user-controllers.js';
import { loginValidator, signupValidator, validate } from '../utils/validators.js';
import { verifyToken } from '../utils/token-manager.js';


const userRoutes=Router();

userRoutes.get("/",getAllUsers);

userRoutes.post("/signup",validate(signupValidator),userSignUp);
userRoutes.post("/login",validate(loginValidator),userLogin);
userRoutes.get("/auth-status",verifyToken,verfiyUser);
userRoutes.get("/logout",verifyToken,userLogout);

//middlewares are functions which gets executes before a request is processes
//in node and express middleware can be used to check JSON Body Validations, 
//Tokens or Cookies Validations,Params validations and more 

//Token Authentication -- JSON Web Token JWT
//HTTP only signed cookies are a type of web cookies that comes 
//with a special security attribute that restricts 
//cookies from being accessed by Javascript in the web-browser. This prevents XSS attacks




export default userRoutes;
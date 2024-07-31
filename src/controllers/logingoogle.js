import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();
const clientId = process.env.GOOGLE_APP_CLIENT_ID;
const client = new OAuth2Client(clientId);
export const logingoogle = async (req, res) => {
//   const userlogin = req.body;
//   console.log("userlogin: ", userlogin);
};

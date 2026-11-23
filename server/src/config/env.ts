import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const schema=z.object({NODE_ENV:z.enum(["development","test","production"]).default("development"),PORT:z.coerce.number().int().positive().default(5000),CLIENT_URL:z.string().url().default("http://localhost:5173"),MONGODB_URI:z.string().min(1),JWT_ACCESS_SECRET:z.string().min(32),JWT_REFRESH_SECRET:z.string().min(32),CLOUDINARY_CLOUD_NAME:z.string().min(1),CLOUDINARY_API_KEY:z.string().min(1),CLOUDINARY_API_SECRET:z.string().min(1)});
const parsed=schema.safeParse(process.env);
if(!parsed.success){console.error("Invalid server environment variables:",parsed.error.flatten().fieldErrors);throw new Error("Server environment configuration is invalid. Check server/.env.");}
export const env=parsed.data;

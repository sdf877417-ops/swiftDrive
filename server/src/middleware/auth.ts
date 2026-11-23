import type { Request,Response,NextFunction } from "express";
import { ACCESS_COOKIE,verifyAccessToken } from "../utils/tokens.js";
declare global { namespace Express { interface Request { userId: string } } }
export function requireAuth(req:Request,res:Response,next:NextFunction){const token=req.cookies?.[ACCESS_COOKIE] as string|undefined;if(!token){res.status(401).json({message:"Authentication required"});return;}try{req.userId=verifyAccessToken(token);next();}catch{res.status(401).json({message:"Session expired. Please sign in again."});}}

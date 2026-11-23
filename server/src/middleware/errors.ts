import type { Request,Response,NextFunction } from "express";
export function notFound(_req:Request,res:Response){res.status(404).json({message:"Route not found"});}
export function errorHandler(error:unknown,_req:Request,res:Response,_next:NextFunction){if(res.headersSent)return;const err=error as {status?:number;message?:string;name?:string};const status=err.status&&err.status>=400&&err.status<600?err.status:500;const message=status===500?"Something went wrong. Please try again.":(err.message||"Request failed");if(status===500)console.error(error);res.status(status).json({message});}

import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../config/env.js";
const ACCESS_COOKIE="sd_access";const REFRESH_COOKIE="sd_refresh";
const cookieBase={httpOnly:true,secure:env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};
export function hashToken(token:string){return crypto.createHash("sha256").update(token).digest("hex");}
export function createAccessToken(userId:string){return jwt.sign({sub:userId,type:"access"},env.JWT_ACCESS_SECRET,{expiresIn:"15m"});}
export function createRefreshToken(userId:string){return jwt.sign({sub:userId,type:"refresh"},env.JWT_REFRESH_SECRET,{expiresIn:"7d"});}
export function verifyAccessToken(token:string){const payload=jwt.verify(token,env.JWT_ACCESS_SECRET);if(typeof payload==="string"||payload.type!=="access"||!payload.sub)throw new Error("Invalid access token");return String(payload.sub);}
export function verifyRefreshToken(token:string){const payload=jwt.verify(token,env.JWT_REFRESH_SECRET);if(typeof payload==="string"||payload.type!=="refresh"||!payload.sub)throw new Error("Invalid refresh token");return String(payload.sub);}
export function setAuthCookies(res:Response,access:string,refresh:string){res.cookie(ACCESS_COOKIE,access,{...cookieBase,maxAge:15*60*1000});res.cookie(REFRESH_COOKIE,refresh,{...cookieBase,maxAge:7*24*60*60*1000});}
export function clearAuthCookies(res:Response){res.clearCookie(ACCESS_COOKIE,cookieBase);res.clearCookie(REFRESH_COOKIE,cookieBase);}
export {ACCESS_COOKIE,REFRESH_COOKIE};

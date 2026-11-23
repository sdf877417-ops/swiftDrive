import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
async function start(){try{await connectDatabase();app.listen(env.PORT,()=>console.log(`SwiftDrive API listening on http://localhost:${env.PORT}`));}catch(error){console.error("Server startup failed:",error);process.exit(1);}}
void start();

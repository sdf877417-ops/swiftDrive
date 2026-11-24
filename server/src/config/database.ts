// import mongoose from "mongoose";
// import { env } from "./env.js";
// export async function connectDatabase(){mongoose.set("strictQuery",true);await mongoose.connect(env.MONGODB_URI);console.log("MongoDB connected");}



import mongoose from "mongoose";
import { env } from "./env.js";

let cached = globalThis as typeof globalThis & {
  mongooseCache?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!cached.mongooseCache) {
  cached.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export async function connectDatabase() {
  const cache = cached.mongooseCache!;

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);

    cache.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).catch((error) => {
      cache.promise = null;
      throw error;
    });
  }

  cache.conn = await cache.promise;

  console.log("MongoDB connected successfully");

  return cache.conn;
}

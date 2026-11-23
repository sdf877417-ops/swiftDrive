// // import { Router } from "express";
// // import multer from "multer";
// // import { Readable } from "node:stream";
// // import { requireAuth } from "../middleware/auth.js";
// // import { StoredFile } from "../models/StoredFile.js";
// // import cloudinary from "../config/cloudinary.js";
// // import mongoose from "mongoose";
// // const router=Router();const MAX_FILE_SIZE=100*1024*1024;
// // const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:MAX_FILE_SIZE,files:1}});
// // function resourceType(mime:string):"image"|"video"|"raw"{if(mime.startsWith("image/"))return "image";if(mime.startsWith("video/"))return "video";return "raw";}
// // function safeName(name:string){return name.replace(/[\/\\]/g,"_").replace(/[\r\n]/g,"").slice(0,240)||"download";}
// // function cloudUpload(buffer:Buffer,options:any){return new Promise<{public_id:string;secure_url:string;format?:string}>((resolve,reject)=>{const stream=cloudinary.uploader.upload_stream(options,(error,result)=>{if(error||!result){reject(error||new Error("Cloud upload failed"));return;}resolve(result as {public_id:string;secure_url:string;format?:string});});Readable.from(buffer).pipe(stream);});}
// // router.use(requireAuth);
// // router.get("/",async(req,res,next)=>{try{const files=await StoredFile.find({userId:req.userId}).select("originalName mimeType size createdAt").sort({createdAt:-1}).lean();res.json({files});}catch(error){next(error);}});
// // router.post("/",(req,res,next)=>{upload.single("file")(req,res,(error:unknown)=>{if(error){const e=error as {code?:string;message?:string};if(e instanceof multer.MulterError&&e.code==="LIMIT_FILE_SIZE"){res.status(413).json({message:"Files must be 100 MB or smaller."});return;}res.status(400).json({message:e.message||"Unable to read uploaded file."});return;}next();});},async(req,res,next)=>{let uploadedPublicId="";try{if(!req.file){res.status(400).json({message:"Choose a file to upload."});return;}const file=req.file;const type=resourceType(file.mimetype);const result=await cloudUpload(file.buffer,{folder:`swiftdrive/${req.userId}`,resource_type:type,use_filename:true,unique_filename:true,overwrite:false});uploadedPublicId=String(result.public_id);const saved=await StoredFile.create({userId:new mongoose.Types.ObjectId(req.userId),originalName:safeName(file.originalname),mimeType:file.mimetype||"application/octet-stream",size:file.size,publicId:result.public_id,resourceType:type,format:result.format||"",secureUrl:result.secure_url});res.status(201).json({file:{id:String(saved._id),originalName:saved.originalName,size:saved.size,mimeType:saved.mimeType,createdAt:saved.createdAt}});}catch(error){if(uploadedPublicId){try{await cloudinary.uploader.destroy(uploadedPublicId,{resource_type:type});}catch(cleanupError){console.error("Cloudinary cleanup failed",cleanupError);}}next(error);}});
// // router.get("/:id/download",async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id)){res.status(404).json({message:"File not found"});return;}const file=await StoredFile.findOne({_id:req.params.id,userId:req.userId});if(!file){res.status(404).json({message:"File not found"});return;}const url=cloudinary.url(file.publicId,{secure:true,resource_type:file.resourceType,type:"upload",flags:"attachment", ...(file.resourceType==="image"?{quality:"auto",fetch_format:"auto"}:{})});res.json({url,filename:file.originalName});}catch(error){next(error);}});
// // router.delete("/:id",async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id)){res.status(404).json({message:"File not found"});return;}const file=await StoredFile.findOne({_id:req.params.id,userId:req.userId});if(!file){res.status(404).json({message:"File not found"});return;}await cloudinary.uploader.destroy(file.publicId,{resource_type:file.resourceType,type:"upload"});await file.deleteOne();res.json({message:"File deleted"});}catch(error){next(error);}});
// // export default router;



// // chat gpt 


// import { Router, type Request, type Response, type NextFunction } from "express";
// import multer from "multer";
// import { Readable } from "node:stream";
// import mongoose from "mongoose";

// import { requireAuth } from "../middleware/auth.js";
// import { StoredFile } from "../models/StoredFile.js";
// import cloudinary from "../config/cloudinary.js";

// const router = Router();

// const MAX_FILE_SIZE = 100 * 1024 * 1024;

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: MAX_FILE_SIZE,
//     files: 1,
//   },
// });

// type ResourceType = "image" | "video" | "raw";

// interface CloudinaryUploadResult {
//   public_id: string;
//   secure_url: string;
//   format?: string;
// }

// function resourceType(mime: string): ResourceType {
//   if (mime.startsWith("image/")) return "image";
//   if (mime.startsWith("video/")) return "video";
//   return "raw";
// }

// function safeName(name: string): string {
//   return (
//     name
//       .replace(/[\\/]/g, "_")
//       .replace(/[\r\n]/g, "")
//       .slice(0, 240) || "download"
//   );
// }

// function cloudUpload(
//   buffer: Buffer,
//   options: Record<string, unknown>
// ): Promise<CloudinaryUploadResult> {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       options,
//       (error, result) => {
//         if (error || !result) {
//           reject(error || new Error("Cloud upload failed"));
//           return;
//         }

//         resolve({
//           public_id: result.public_id,
//           secure_url: result.secure_url,
//           format: result.format,
//         });
//       }
//     );

//     Readable.from(buffer).pipe(stream);
//   });
// }

// router.use(requireAuth);

// // GET: List user's files
// router.get(
//   "/",
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const files = await StoredFile.find({
//         userId: req.userId,
//       })
//         .select("originalName mimeType size createdAt")
//         .sort({ createdAt: -1 })
//         .lean();

//       res.json({ files });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // POST: Upload file
// router.post(
//   "/",
//   (req: Request, res: Response, next: NextFunction) => {
//     upload.single("file")(req, res, (error: unknown) => {
//       if (error) {
//         if (
//           error instanceof multer.MulterError &&
//           error.code === "LIMIT_FILE_SIZE"
//         ) {
//           res.status(413).json({
//             message: "Files must be 100 MB or smaller.",
//           });
//           return;
//         }

//         res.status(400).json({
//           message:
//             error instanceof Error
//               ? error.message
//               : "Unable to read uploaded file.",
//         });
//         return;
//       }

//       next();
//     });
//   },
//   async (req: Request, res: Response, next: NextFunction) => {
//     let uploadedPublicId = "";
//     let uploadedType: ResourceType = "raw";

//     try {
//       if (!req.file) {
//         res.status(400).json({
//           message: "Choose a file to upload.",
//         });
//         return;
//       }

//       const file = req.file;
//       uploadedType = resourceType(file.mimetype);

//       const result = await cloudUpload(file.buffer, {
//         folder: `swiftdrive/${req.userId}`,
//         resource_type: uploadedType,
//         use_filename: true,
//         unique_filename: true,
//         overwrite: false,
//       });

//       uploadedPublicId = result.public_id;

//       const saved = await StoredFile.create({
//         userId: new mongoose.Types.ObjectId(req.userId),
//         originalName: safeName(file.originalname),
//         mimeType: file.mimetype || "application/octet-stream",
//         size: file.size,
//         publicId: result.public_id,
//         resourceType: uploadedType,
//         format: result.format || "",
//         secureUrl: result.secure_url,
//       });

//       res.status(201).json({
//         file: {
//           id: String(saved._id),
//           originalName: saved.originalName,
//           size: saved.size,
//           mimeType: saved.mimeType,
//           createdAt: saved.createdAt,
//         },
//       });
//     } catch (error) {
//       if (uploadedPublicId) {
//         try {
//           await cloudinary.uploader.destroy(uploadedPublicId, {
//             resource_type: uploadedType,
//           });
//         } catch (cleanupError) {
//           console.error("Cloudinary cleanup failed:", cleanupError);
//         }
//       }

//       next(error);
//     }
//   }
// );

// // GET: Download file
// router.get(
//   "/:id/download",
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!mongoose.isValidObjectId(req.params.id)) {
//         res.status(404).json({ message: "File not found" });
//         return;
//       }

//       const file = await StoredFile.findOne({
//         _id: req.params.id,
//         userId: req.userId,
//       });

//       if (!file) {
//         res.status(404).json({ message: "File not found" });
//         return;
//       }

//       const url = cloudinary.url(file.publicId, {
//         secure: true,
//         resource_type: file.resourceType,
//         type: "upload",
//         flags: "attachment",
//       });

//       res.json({
//         url,
//         filename: file.originalName,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // DELETE: Delete file
// router.delete(
//   "/:id",
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!mongoose.isValidObjectId(req.params.id)) {
//         res.status(404).json({ message: "File not found" });
//         return;
//       }

//       const file = await StoredFile.findOne({
//         _id: req.params.id,
//         userId: req.userId,
//       });

//       if (!file) {
//         res.status(404).json({ message: "File not found" });
//         return;
//       }

//       await cloudinary.uploader.destroy(file.publicId, {
//         resource_type: file.resourceType,
//         type: "upload",
//       });

//       await file.deleteOne();

//       res.json({
//         message: "File deleted",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// export default router;



import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { Readable } from "node:stream";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth.js";
import { StoredFile } from "../models/StoredFile.js";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

type ResourceType = "image" | "video" | "raw";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format?: string;
}

function resourceType(mime: string): ResourceType {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

function safeName(name: string): string {
  return (
    name
      .replace(/[\\/]/g, "_")
      .replace(/[\r\n]/g, "")
      .slice(0, 240) || "download"
  );
}

function cloudUpload(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloud upload failed"));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
        });
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

router.use(requireAuth);

// GET: List user's files
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = await StoredFile.find({
        userId: req.userId,
      })
        .select("originalName mimeType size createdAt")
        .sort({ createdAt: -1 })
        .lean();

      res.json({ files });
    } catch (error) {
      next(error);
    }
  }
);

// POST: Upload file
router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (error: unknown) => {
      if (error) {
        if (
          error instanceof multer.MulterError &&
          error.code === "LIMIT_FILE_SIZE"
        ) {
          res.status(413).json({
            message: "Files must be 100 MB or smaller.",
          });
          return;
        }

        res.status(400).json({
          message:
            error instanceof Error
              ? error.message
              : "Unable to read uploaded file.",
        });
        return;
      }

      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    let uploadedPublicId = "";
    let uploadedType: ResourceType = "raw";

    try {
      if (!req.file) {
        res.status(400).json({
          message: "Choose a file to upload.",
        });
        return;
      }

      const file = req.file;
      uploadedType = resourceType(file.mimetype);

      const result = await cloudUpload(file.buffer, {
        folder: `swiftdrive/${req.userId}`,
        resource_type: uploadedType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      uploadedPublicId = result.public_id;

      const saved = await StoredFile.create({
        userId: new mongoose.Types.ObjectId(req.userId),
        originalName: safeName(file.originalname),
        mimeType: file.mimetype || "application/octet-stream",
        size: file.size,
        publicId: result.public_id,
        resourceType: uploadedType,
        format: result.format || "",
        secureUrl: result.secure_url,
      });

      res.status(201).json({
        file: {
          id: String(saved._id),
          originalName: saved.originalName,
          size: saved.size,
          mimeType: saved.mimeType,
          createdAt: saved.createdAt,
        },
      });
    } catch (error) {
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId, {
            resource_type: uploadedType,
          });
        } catch (cleanupError) {
          console.error("Cloudinary cleanup failed:", cleanupError);
        }
      }

      next(error);
    }
  }
);

// GET: Download file
router.get(
  "/:id/download",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      const file = await StoredFile.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      const url = cloudinary.url(file.publicId, {
        secure: true,
        resource_type: file.resourceType,
        type: "upload",
        flags: "attachment",
      });

      res.json({
        url,
        filename: file.originalName,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE: Delete file
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      const file = await StoredFile.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType,
        type: "upload",
      });

      await file.deleteOne();

      res.json({
        message: "File deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

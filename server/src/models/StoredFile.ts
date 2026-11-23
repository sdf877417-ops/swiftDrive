import mongoose,{Schema} from "mongoose";
const fileSchema=new Schema({userId:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},originalName:{type:String,required:true},mimeType:{type:String,required:true},size:{type:Number,required:true,min:0},publicId:{type:String,required:true,unique:true},resourceType:{type:String,enum:["image","video","raw"],required:true},format:{type:String,default:""},secureUrl:{type:String,required:true}},{timestamps:true});
fileSchema.index({userId:1,createdAt:-1});
export const StoredFile=mongoose.model("StoredFile",fileSchema);

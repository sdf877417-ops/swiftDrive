import mongoose,{Schema, type InferSchemaType} from "mongoose";
const userSchema=new Schema({name:{type:String,required:true,trim:true,minlength:2,maxlength:60},email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},passwordHash:{type:String,required:true,select:false},refreshTokenHash:{type:String,default:null,select:false}},{timestamps:true});
export type UserDocument=InferSchemaType<typeof userSchema> & {_id:mongoose.Types.ObjectId};
export const User=mongoose.model("User",userSchema);

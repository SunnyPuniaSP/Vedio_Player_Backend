import mongoose,{Schema} from "mongoose"

const playlistSchema=new Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playlistSchema)
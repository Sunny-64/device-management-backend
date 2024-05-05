import mongoose, {Schema} from 'mongoose'; 

const BlackListTokenSchema:Schema = new mongoose.Schema({
    token : {
        type : String, 
    }
}, {timestamps : true}); 

// export default mongoose.model("BlackList_Token", BlackListTokenSchema);    // make this change later                                   
export default mongoose.model("BlackListToken", BlackListTokenSchema);    // make this change later                                   
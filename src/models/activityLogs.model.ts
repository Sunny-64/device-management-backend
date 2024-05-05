import mongoose, {Schema} from 'mongoose'; 

export const activityLogsSchema:Schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'User', 
      }, 
    token_id : {
        type : String, 
    }, 
    ip_address : {
        type : String, 
    }, 
    logged_in_at : {
        type : Date,
    }, 
    logged_out_at : {
        type : Date,
    }, 
    token_deleted : {
        type : Boolean, 
        default : false, 
    },
    device : {
        type : String, 
    }

}, {timestamps : true}); 

export default mongoose.model("Log", activityLogsSchema);                                       
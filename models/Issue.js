const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String
},

location:{
type:String,
required:true
},

category:{
type:String,
required:true
},

description:{
type:String,
required:true
},

photo:{
type:String,
default:""
},

latitude:Number,
longitude:Number,

status:{
type:String,
enum:["Pending","In Progress","Resolved"],
default:"Pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Issue",IssueSchema);

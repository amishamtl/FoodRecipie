const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    phoneNumber:{
        type:String,
        require:true,
    },
    gender:{
        type:String,
    },
    age:{
        type:Number,
    },
    password:{
        type:String,
        require:true
    },
    token:{
        type:String
    },
    role:{
        type:String,
        default:'user'
    },
    categoryId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    }],
    recipeId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Recipe'
    }],
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe'    // References Recipe collection for user's favorite recipes
    }]
},{timestamps:true})

module.exports =  mongoose.model("User",userSchema)

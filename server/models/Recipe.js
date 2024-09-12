// const mongoose = require('mongoose');

// const recipeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: 'This field is required.'
//   //   name: String,
//   // ingredients: [String],
//   // instructions: String,
//   // ratings: [
//   //   {
//   //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   //     rating: Number,
//   //   }
//   // ]
  
//   },
//   description: {
//     type: String,
//     required: 'This field is required.'
//   },
//   email: {
//     type: String,
//     required: 'This field is required.'
//   },
//   ingredients: {
//     type: Array,
//     required: 'This field is required.'
//   },
//   category: {
//     type: String,
//     enum: ['Thai', 'American', 'Chinese', 'Mexican', 'Indian'],
//     required: 'This field is required.'
//   },
//   image: {
//     type: String,
//     required: 'This field is required.'
//   },
// });

// recipeSchema.index({ name: 'text', description: 'text' });
// // WildCard Indexing
// //recipeSchema.index({ "$**" : 'text' });

// module.exports = mongoose.model('Recipe', recipeSchema);

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.'
  },
  description: {
    type: String,
    required: 'This field is required.'
  },
  email: {
    type: String,
    required: 'This field is required.'
  },
  ingredients: {
    type: [String],  // Use array of strings to specify ingredients
    required: 'This field is required.'
  },
  category: {
    type: String,
    enum: ['Thai', 'American', 'Chinese', 'Mexican', 'Indian'],
    // required: 'This field is required.'
  },
  link: {
    type: String
  },
  title: {
    type: String
  },
  image: {
    type: String,
    // required: 'This field is required.'
  },
  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: {
        type: Number,
        required: 'Rating is required.',
        min: 1,
        max: 5
      }
    }
  ]
});

// Text indexing for searching
recipeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);

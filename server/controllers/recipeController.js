require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const mongoose = require('mongoose');
const otpGenerator = require('otp-generator');
const session =require("express-session")
const { body, validationResult } = require('express-validator');
//twilio
const twilio = require('twilio');
const accountSid = process.env.accountSid ;
const authToken = process.env.authToken ;
const client = require("twilio")(accountSid, authToken);

/**
 * GET /
 * Homepage
 */

exports.userProfile = async(req,res)=>{
  try {
    const email = req.session.userEmail
    const user = await userModel.findOne({ email });
    console.log(user);
    
    res.render('users/userProfile',{user})
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
}

exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ category: "Thai" }).limit(limitNumber);
    const american = await Recipe.find({ category: "American" }).limit(
      limitNumber
    );
    const chinese = await Recipe.find({ category: "Chinese" }).limit(
      limitNumber
    );

    const food = { latest, thai, american, chinese };
    // console.log(req.query.name);
    

    res.render("users/index", { user : req.query.name , title: "FlavourFusion - Home", categories, food });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /categories
 * Categories
 */
// Inside recipeController.js
exports.exploreCategories = async (req, res) => {
  try {
    // Fetch your data here from MongoDB or wherever your data is stored
    const food = {
      thai: await Recipe.find({ category: 'Thai' }),
      american: await Recipe.find({ category: 'American' }),
      chinese: await Recipe.find({ category: 'Chinese' }),
      // add other categories here as needed
    };

    // Pass the 'food' object to your view
    res.render('users/categories', { food });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ category: categoryId }).limit(
      limitNumber
    );
    res.render("users/categories", {
      title: "FlavourFusion  - Categoreis",
      categoryById,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /recipe/:id
 * Fetches a single recipe by its ID and calculates the average rating
 */
exports.exploreRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
        // console.log(recipeId);
        // console.log(req.params.id);
        
        
    // Validate the recipeId
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).send({ message: 'Invalid recipe ID format.' });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).send({ message: 'Recipe not found.' });
    }

    // Calculate average rating
    let averageRating = 'No ratings yet';
    if (recipe.ratings && recipe.ratings.length > 0) {
      const totalRatings = recipe.ratings.length;
      const sumRatings = recipe.ratings.reduce((sum, r) => sum + r.rating, 0);
      averageRating = (sumRatings / totalRatings).toFixed(1);
      console.log(averageRating);
      
    }

    // Pass the averageRating to the view
    res.render('users/recipe', { title: 'FlavourFusion - Recipe', recipe, averageRating });
  } catch (error) {
    console.error('Error fetching recipe:', error); // Log the error for debugging
    res.status(500).send({ message: error.message || 'Internal server error.' });
  }
};

exports.contactUsgetFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user.id;  // Extract user ID from the token
    const favoriteRecipes = await Recipe.find({ favorites: userId }); // Adjust according to your schema
    
    if (!favoriteRecipes) {
      return res.status(404).json({ message: 'No favorite recipes found' });
    }
    
    res.json({ success: true, favoriteRecipes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * POST /recipe/:id/favorite
 * Save Recipe to Favorites
 */

exports.saveRecipeToFavorites = async (req, res) => {
  try {
    // console.log(req.params.id);
    
    const recipeId = req.params.id;
    const userId = req.user.id;  // Assuming you have user ID in req.user (after authentication)
const recipe = require("../models/Recipe")
    // Logic to add recipe to favorites (you may need to use a database query here)
    // Example:
    const user = await recipe.findById(recipeId);
    // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",user);
    
    userModel.favorites.push(user._id);
    await userModel.save();

    res.status(200).json({ message: 'Recipe added to favorites!' });
  } catch (error) {
    console.error('Error adding recipe to favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add this new route in your `recipeController.js`:

/**
 * POST /recipe/:id/rate
 * Submit Rating for a Recipe
 */
exports.rateRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const { rating } = req.body;
    const userId = req.user; // Assuming you have the user logged in
    console.log(req.body);
    console.log("Rating",rating);
    let recipe = await Recipe.findById(recipeId);
    
    // Initialize ratings array if undefined
    if (!recipe.ratings) {
      recipe.ratings = [];
    }

    // Check if the user has already rated the recipe
    const existingRating = recipe.ratings.find(r => r.userId === userId);

    if (existingRating) {
      // Update the existing rating
      existingRating.rating = rating;
    } else {
      // Add new rating
      recipe.ratings.push({ userId, rating });
    }

    await recipe.save();
    res.redirect(`/recipe/${recipeId}`);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
  
};



/**
 * POST /search
 * Search
 */
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render("users/search", { title: "FlavourFusion  - Search", recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /explore-latest
 * Explplore Latest
 */
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render("users/explore-latest", {
      title: "FlavourFusion  - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /explore-random
 * Explore Random as JSON
 */
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render("users/explore-random", {
      title: "FlavourFusion  - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /submit-recipe
 * Submit Recipe
 */
exports.submitRecipe = async (req, res) => {
  const infoErrorsObj = req.flash("infoErrors");
  const infoSubmitObj = req.flash("infoSubmit");
  res.render("users/submit-recipe", {
    title: "FlavourFusion  - Submit Recipe",
    infoErrorsObj,
    infoSubmitObj,
  });
};

/**
 * POST /submit-recipe
 * Submit Recipe
 */
// exports.submitRecipeOnPost = async (req, res) => {
//   try {
//     let imageUploadFile;
//     let uploadPath;
//     let newImageName;

//     if (!req.files || Object.keys(req.files).length === 0) {
//       console.log("No Files where uploaded.");
//     } else {
//       imageUploadFile = req.files.image;
//       newImageName = Date.now() + imageUploadFile.name;

//       uploadPath =
//         require("path").resolve("./") + "/public/uploads/" + newImageName;

//       imageUploadFile.mv(uploadPath, function (err) {
//         if (err) return res.satus(500).send(err);
//       });
//     }

//     const newRecipe = new Recipe({
//       name: req.body.name,
//       description: req.body.description,
//       email: req.body.email,
//       ingredients: req.body.ingredients,
//       category: req.body.category,
//       image: newImageName,
//     });

//     await newRecipe.save();

//     req.flash("infoSubmit", "Recipe has been added.");
//     res.redirect("/submit-recipe");
//   } catch (error) {
//     // res.json(error);
//     req.flash("infoErrors", error);
//     res.redirect("/submit-recipe");
//   }
// };


exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    // Handle file upload
    if (req.files && req.files.image) {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath = require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    // Check if required fields are present
    const { name, description, email, ingredients, category } = req.body;
    if (!name || !description || !email || !ingredients || !category) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Validate ingredients as an array
    if (!Array.isArray(ingredients)) {
      return res.status(400).send({ message: "Ingredients should be an array of strings" });
    }

    // Create a new recipe
    const newRecipe = new Recipe({
      name,
      description,
      email,
      ingredients,
      category,
      image: newImageName || "" // Handle case where no image is uploaded
    });

    await newRecipe.save();

    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    console.error("Error submitting recipe:", error);
    req.flash("infoErrors", error.message || "An error occurred.");
    res.redirect("/submit-recipe");
  }
};

// Assuming this is your login route handler

// Render login page with captcha
exports.renderLoginPage = (req, res) => {
  const captcha = otpGenerator.generate(6); // Generate a 6-digit CAPTCHA
  req.session.captcha = captcha; // Store CAPTCHA in session for validation
  res.render('users/login', { captcha }); // Render login page with CAPTCHA
};

// Render login page with captcha
exports.renderLoginPage = (req, res) => {
  const captcha = otpGenerator.generate(6);

  // Store the CAPTCHA in the session for validation later
  // console.log("captcha generated------------------->",captcha);
 
  req.session.captcha = captcha;

  // console.log(req.session);

  

  res.render('users/login', { captcha });
};

// User Login
// User Login with Validation
exports.userLogin = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash('error', errorMessages.join(', '));
    return res.redirect('/login');
  }

  try {
    const { email, password, captchaInput } = req.body;

    // Validate Captcha
    if (captchaInput !== req.session.captcha) {
      req.flash('error', 'Invalid Captcha!');
      return res.redirect('/login');
    }

    // Find User by email
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Clear Captcha from session after successful login
    req.session.captcha = null;

    // Store user email in session
    req.session.userEmail = user.email;

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, "AmishaAmisha", { expiresIn: '1h' });
    req.session.token = token;
    req.session.userRole = user.role;

    // Redirect based on user role
    if (user.role === "admin") {
      return res.redirect('/admin');
    }

    res.redirect(`/?name=${user.name}`);
  } catch (error) {
    console.error("Error during login:", error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
};

// OTP Generation
exports.generateOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  // console.log(phoneNumber);
  
  try {
    // Check if the user exists
    const user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
      // res.render('otp_verify');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // code given by twilio
    // client.verify.v2.services("VA2c0ea26dda32eb184f4be3de31cc70b7")
    //   .verificationChecks
    //   .create({to: '+918181000731', code: '[Code]'})
    //   .then(verification_check => console.log(verification_check.status));

    console.log(otp);
    // code given by twilio
    // client.verify.v2.services("VA2c0ea26dda32eb184f4be3de31cc70b7")
    //   .verifications
    //   .create({to: '+91'+phoneNumber, channel: 'sms'})
    //   .then(verification => console.log(verification.status));


    // Send OTP via Twilio SMS
    client.messages.create({
      body: `Amisha jaldi se otp bhej
        ${otp}`,
        to: '+91'+phoneNumber,
        from:'+19166940794',
    });

    // Store OTP in session
    req.session.otp = otp
    
    req.session.phoneNumber = phoneNumber
    
    // res.status(200).json({ message: 'OTP sent to your phone number.' });
    res.render('users/otp_verify');
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
    // res.render('otp_verify');
  }
}
// verify otp
exports.verifyOtp = async (req, res) => {
  const {  otp, newPassword } = req.body;

  const phoneNumber = req.session.phoneNumber
  try {
    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if the OTP matches
    if (req.session.otp != req.body.otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Set new password
    const newHashPassword = await bcrypt.hash(newPassword, 12)
    user.password = newHashPassword;
    await user.save();
    // Delete OTP and phoneNo from session
    req.session.phoneNumber = null;
    req.session.otp = null;
    // res.status(200).json({ message: 'Password reset successful' });
    res.redirect('/login');
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}



exports.validateSignup = [
  // Validate and sanitize fields
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phoneNumber').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender'),
  body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number'),
];

exports.userSignup = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { name, email, phoneNumber, gender, age, password } = req.body;

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = new userModel({
      name,
      email,
      phoneNumber,
      gender,
      age,
      password: hashPassword,
    });

    // Save the user to the database
    await user.save();

    // Redirect to login page after successful signup
    res.redirect("/login");
  } catch (error) {
    res.status(500).json({
      msg: "Error during user signup",
      error: error.message,
    });
  }
};

exports.contactUs = async (req, res) => {
  res.redirect("/");
};

exports.useLogout = async (req, res) => {
  req.session.destroy();
  console.log("logout successfully");
  
  res.redirect("/about");

  };

// Delete Recipe
// async function deleteRecipe(){
//   try {
//     await Recipe.deleteOne({ name: 'New Recipe From Form' });
//   } catch (error) {
//     console.log(error);
//   }
// }
// deleteRecipe();

// Update Recipe
// async function updateRecipe(){
//   try {
//     const res = await Recipe.updateOne({ name: 'New Recipe' }, { name: 'New Recipe Updated' });
//     res.n; // Number of documents matched
//     res.nModified; // Number of documents modified
//   } catch (error) {
//     console.log(error);
//   }
// }
// updateRecipe();

/**
 * Dummy Data Example
 */

// async function insertDymmyCategoryData(){
//   try {
//     await Category.insertMany([
//       {
//         "name": "Thai",
//         "image": "thai-food.jpg"
//       },
//       {
//         "name": "American",
//         "image": "american-food.jpg"
//       },
//       {
//         "name": "Chinese",
//         "image": "chinese-food.jpg"
//       },
//       {
//         "name": "Mexican",
//         "image": "mexican-food.jpg"
//       },
//       {
//         "name": "Indian",
//         "image": "indian-food.jpg"
//       },
//       {
//         "name": "Spanish",
//         "image": "spanish-food.jpg"
//       }
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertDymmyCategoryData();

// async function insertDymmyRecipeData(){
//   try {
//     await Recipe.insertMany([
//       {
//         "name": "Recipe Name Goes Here",
//         "description": `Recipe Description Goes Here`,
//         "email": "recipeemail@raddy.co.uk",
//         "ingredients": [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         "category": "American",
//         "image": "southern-friend-chicken.jpg"
//       },
//       {
//         "name": "Recipe Name Goes Here",
//         "description": `Recipe Description Goes Here`,
//         "email": "recipeemail@raddy.co.uk",
//         "ingredients": [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         "category": "American",
//         "image": "southern-friend-chicken.jpg"
//       },
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertDymmyRecipeData();
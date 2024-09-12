const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipeController');
const authenticateToken = require('../middleware/middleware')
const { userSignup, validateSignup } = require('../controllers/recipeController');


const { saveRecipeToFavorites } = require('../../server/controllers/recipeController');

//   App Routes 
const Stripe = require('stripe');
const stripe = Stripe("sk_test_51Ppo5VA6N9hDOYzTmDzoQ191n8A9r57wjSM5BzQKO0fdyQmsTIOC0hlDPq5QFFWhfJOAcnpCi2fkRTqFUDGRJub500flJBvhLB");

router.post('/process-payment', async (req, res) => {
  try {
    const { intent } = req.body;  // Ensure intent is coming from the request body
    if (!intent) {
      throw new Error('Payment intent is missing');
    }

    // Use intent for further processing
    const paymentResult = await processPayment(intent);

    res.json({ success: true, paymentResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/payment",(req,res)=>{
  res.render("users/payment")
  
  
  })

// router.get('/',authenticateToken, recipeController.homepage);
router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe );
// router.get('/recipe/:id', authenticateToken, recipeController.exploreRecipe );
router.post('/recipe/:id/rate', recipeController.rateRecipe);
router.get('/categories', recipeController.exploreCategories);
// router.get('/categories', authenticateToken, recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById); 
// router.get('/categories/:id', authenticateToken, recipeController.exploreCategoriesById); 
router.post('/search', recipeController.searchRecipe);
// router.post('/search',authenticateToken, recipeController.searchRecipe);
router.get('/explore-latest',authenticateToken, recipeController.exploreLatest);
router.get('/explore-random',authenticateToken, recipeController.exploreRandom);
router.get('/submit-recipe', authenticateToken,recipeController.submitRecipe);
router.post('/submit-recipe',authenticateToken, recipeController.submitRecipeOnPost);
router.get('/logout',authenticateToken, recipeController.useLogout);


router.get('/contact',authenticateToken,(req,res)=>{
    res.render('users/contact');
});
router.post('/contact', recipeController.contactUs);

router.get('/about',(req,res)=>{
    res.render('users/about');
});

router.get('/login', recipeController.renderLoginPage);


// router.get("/login",(req,res)=>{
//     res.render("login")
// })
router.post("/login",recipeController.userLogin)

// OTP Generation Route for forgot password
router.get("/forgot-password",(req,res)=>{
  res.render("users/forgot_password")
})

// -------------------------------------------------------------------------------
router.post('/generate-otp', recipeController.generateOtp);
// =============================-----------------------------------
router.post('/verify-otp', recipeController.verifyOtp);






router.get("/signup",(req,res)=>{
    res.render("users/signup")
})
router.post("/signup",validateSignup,recipeController.userSignup)

// POST: Save recipe to favorites
router.post('/recipes/:id/favorite', authenticateToken, recipeController.saveRecipeToFavorites);

// GET: Fetch favorite recipes
router.get('/favorites', authenticateToken, recipeController.contactUsgetFavoriteRecipes);



// profile
router.get('/profile',authenticateToken, recipeController.userProfile);



module.exports = router;
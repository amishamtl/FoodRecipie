const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe'); // Ensure path is correct
const { sendRecipeEmail } = require('../models/EmailSender'); // Ensure this is implemented

// Define the route to share a recipe
router.post('/share-recipe', async (req, res) => {
  const { recipientEmail, recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
  }

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const emailSent = await sendRecipeEmail(recipientEmail, recipe);

    if (emailSent) {
      return res.json({ success: true, message: 'Recipe shared successfully!' });
    } else {
      return res.status(500).json({ success: false, message: 'Error sending email.' });
    }
  } catch (error) {
    console.error("Error sharing recipe:", error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// Define the route to render the email form
router.get("/email", async (req, res) => {
  try {
    const recipeId = req.query.recipeId;

    if (!recipeId) {
      return res.status(400).send('Recipe ID is required');
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).send('Recipe not found');
    }

    res.render("users/email", { recipe });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

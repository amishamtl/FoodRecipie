const express = require('express');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

// middleware
const jwt= require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    
    let token=req.session.token;
    
    if (!token) return res.redirect("login");
    if(req.session.userRole !== "admin") return res.redirect("login");
    

    jwt.verify(token, "AmishaAmisha", (err, user) => {
        if (err) return res.redirect("signup");

        req.user = user; // Store user info in request
        next();
    });
};

router.get('/',authenticateToken, adminController.showDashboard);
// View all users
router.get('/users', authenticateToken ,  adminController.getAllUsers);

// Create
router.get('/create-users', authenticateToken , adminController.showCreateUserForm);
router.post('/users', authenticateToken , adminController.createUser);

// update
router.get('/users/:id/edit', authenticateToken , adminController.getUserForUpdate);
// router.put('/users/:id/edit', authenticateToken , adminController.updateUser);
router.post('/users/:id/edit', authenticateToken , adminController.updateUser);

// delete
router.get('/users/:id/delete', authenticateToken , adminController.showDeleteUserConfirmation);
// router.delete('/users/:id', authenticateToken , adminController.deleteUser);
router.post('/users/:id/delete', authenticateToken , adminController.deleteUser);

// View all recipes
router.get('/recipes', authenticateToken , adminController.getAllRecipes);

// Create, update, delete recipe
router.post('/recipes', authenticateToken , adminController.createRecipe);
router.put('/recipes/:id', authenticateToken , adminController.updateRecipe);
router.delete('/recipes/:id', authenticateToken , adminController.deleteRecipe);

//////
router.get('/recipes', authenticateToken , adminController.getAllRecipes);
router.get('/recipes/new', authenticateToken , adminController.showCreateRecipeForm);
router.post('/recipes', authenticateToken , adminController.createRecipe);

// edit recipe
router.get('/recipes/:id/edit', authenticateToken , adminController.showEditRecipeForm);
// router.put('/recipes/:id', authenticateToken , adminController.updateRecipe);
router.post('/recipes/:id/edit', authenticateToken , adminController.updateRecipe);

router.get('/recipes/:id/view', authenticateToken , adminController.viewRecipe);
router.delete('/recipes/:id', authenticateToken , adminController.deleteRecipe);

// Manage categories
router.get('/categories', authenticateToken , adminController.getAllCategories);
router.post('/categories', authenticateToken , adminController.createCategory);

router.get('/categories/:id/edit', authenticateToken , adminController.showEditCategory);
router.post('/categories/:id/edit', authenticateToken , adminController.updateCategory);

// router.delete('/categories/:id', authenticateToken , adminController.deleteCategory);
router.post('/categories/:id/delete', authenticateToken , adminController.deleteCategory);

module.exports = router;
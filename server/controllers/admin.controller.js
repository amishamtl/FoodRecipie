const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const User = require("../models/user.models");
const session =require("express-session")
const bcrypt = require('bcrypt');
const { title } = require("process");

class adminController{
    static showDashboard = async(req,res)=>{
        res.render('admin/dashboard',{  title: 'Admin Dashboard' })
    }

    static getAllUsers = async (req, res) => {
        try {
            const users = await User.find({}, 'email phone');
            res.render('admin/users', { users, title: 'Manage Users' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // create users
    static showCreateUserForm = (req, res) => {
        res.render('admin/createUser', { title: 'Create New User' });
    };
    
    static createUser = async (req, res) => {
        try {
            const { name, email,phoneNumber, gender, age, password } = req.body;
            
            const hashPassword = await bcrypt.hash(password, 12);
            const user = new User({ name, email,phoneNumber, gender, age, password: hashPassword });
            await user.save();
            res.redirect('/admin/users'); // Redirect to the user list page after creation
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // update users
    static getUserForUpdate = async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.render('admin/updateUser', { user, title: 'Update User' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };
    
    static updateUser = async (req, res) => {
        try {
            const { email, phone } = req.body;
            const user = await User.findByIdAndUpdate(req.params.id, { email, phone }, { new: true });
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.redirect('/admin/users'); // Redirect to the user list page after update
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // delete user
    static showDeleteUserConfirmation = async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.render('admin/deleteUser', { user, title: 'Confirm Deletion' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };
    
    static deleteUser = async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.redirect('/admin/users'); // Redirect to the user list page after deletion
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };
    
    // for recipes

// Show all recipes
    static getAllRecipes = async (req, res) => {
        try {
            const recipes = await Recipe.find();
            // res.render('admin/dashboard')
            res.render('admin/recipes', { recipes, title: 'Manage Recipes' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // Show create recipe form
    static showCreateRecipeForm = (req, res) => {
        res.render('admin/createRecipe', { title: 'Add New Recipe' });
    };

    // Create a new recipe
    static createRecipe = async (req, res) => {
        try {
            //saving image
            let imageUploadFile;
            let uploadPath;
            let newImageName;
            // console.log(req.files );

             // Handle file upload
            if (req.files && req.files.image) {
                imageUploadFile = req.files.image;
                newImageName = Date.now() + imageUploadFile.name;
                uploadPath = require("path").resolve("./") + "/public/uploads/" + newImageName;

                imageUploadFile.mv(uploadPath, function (err) {
                    if (err) return res.status(500).send(err);
                });
            }
            const { email,name, category, description, ingredients } = req.body;
            const newRecipe = new Recipe({ email,name, category, description, ingredients, image: newImageName || "" });
            await newRecipe.save();
            res.redirect('/admin/recipes');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // Show edit recipe form
    static showEditRecipeForm = async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);
            if (!recipe) {
                return res.status(404).send('Recipe not found');
            }
            res.render('admin/editRecipe', { recipe, title: 'Edit Recipe' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // Update a recipe
    static updateRecipe = async (req, res) => {
        try {
            const { name, category, createdBy, ingredients } = req.body;
            await Recipe.findByIdAndUpdate(req.params.id, { name, category, createdBy, ingredients });
            res.redirect('/admin/recipes');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // View a recipe
    static viewRecipe = async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);
            console.log(recipe);
            
            if (!recipe) {
                return res.status(404).send('Recipe not found');
            }
            res.render('admin/viewRecipe', { recipe, title: 'Recipe Details' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };

    // Delete a recipe
    static deleteRecipe = async (req, res) => {
        try {
            await Recipe.findByIdAndDelete(req.params.id);
            res.redirect('/admin/recipes');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };
        
    // Get all categories
    static getAllCategories = async (req, res) => {
        try {
            const categories = await Category.find({});
            res.render('admin/categories', { categories , title:"Category Details" });
        } catch (err) {
            res.status(500).send("Error retrieving categories");
        }
    };

    // Create a new category
    static createCategory = async (req, res) => {
        try {
            const newCategory = new Category({ name: req.body.categoryName });
            await newCategory.save();
            res.redirect('/admin/categories');
        } catch (err) {
            res.status(500).send("Error creating category");
        }
    };

    // show edit category
    static showEditCategory = async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).send('Recipe not found');
            }
            res.render('admin/editCategory', { category, title: 'Edit Category' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    };
    // Update category
    static updateCategory = async (req, res) => {
        try {
            await Category.findByIdAndUpdate(req.params.id, { name: req.body.categoryName });
            res.redirect('/admin/categories');
        } catch (err) {
            res.status(500).send("Error updating category");
        }
    };

    // Delete category
    static deleteCategory = async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id);
            res.redirect('/admin/categories');
        } catch (err) {
            res.status(500).send("Error deleting category");
        }
    };

}

module.exports = adminController
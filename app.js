const express = require('express');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');


const app = express();
const port = process.env.PORT || 5007;

// Middleware setup
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true,
  cookie: {secure: false } // Set to true if HTTPS is enabled
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser('CookingBlogSecure'));

app.use(flash());

app.use(fileUpload());

app.set('view engine', 'ejs');


// Route setup
const recipeRoutes = require('./server/routes/recipeRoutes.js');
const emailRoutes = require('./server/routes/Emailrecipe.js');

app.use('/', recipeRoutes);
app.use('/', emailRoutes);


// for admin
const expressLayouts = require('express-ejs-layouts');
const adminRoutes = require('./server/routes/admin.route.js');
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.use('/admin',adminRoutes)


// payment
const stripe = require('stripe')(process.env.s);
app.post('/create-payment-intent',async (req, res) => {
  const { amount, currency } = req.body;

  try {
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // amount in the smallest currency unit (e.g., cents for USD)
          currency: 'usd',
          payment_method_types: ['card'],
      });

      res.send({
          clientSecret: paymentIntent.client_secret,
      });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
})

app.listen(port, () => console.log(`Server is running  on port ${port}`));




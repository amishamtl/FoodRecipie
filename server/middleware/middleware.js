const jwt= require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    
    let token=req.session.token;
    
    if (!token) return res.redirect("login");

    jwt.verify(token, "AmishaAmisha", (err, user) => {
        if (err) return res.redirect("signup");

        req.user = user; // Store user info in request 
        next();
    });
};
module.exports = authenticateToken;
const nodemailer = require('nodemailer');

// Configure the email transporter
let transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email provider, e.g., Gmail, Mailgun, etc.
  host: "smtp.gmail.com",
  port: 587,                 // Replace with your SMTP server port
  secure: false, 
  auth: {
    user: 'amisha.mittal14121@gmail.com',
    pass: 'akpl hjif kfpq fvyh'  // Your email password or app-specific password
  }
});

exports.sendRecipeEmail = async (recipientEmail, recipe) => {
  try {
    const mailOptions = {
      from: 'amisha.mittal14121@gmail.com',
      to: ["amisha.mittal14121@gmail.com"], // Recipient's email
      subject: `Check out this recipe: ${recipe.title}`,
      html: `
        <h2>Try this recipe: ${recipe.title}</h2>
        <p>${recipe.description}</p>
        <a href="${recipe.link}">Click here to view the full recipe!</a>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
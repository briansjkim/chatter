const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // we're sending the user token within our headers, so we have to check if the authorization header is in the request and if it starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // The authorization will look something like this - Bearer sfargeljdf
      // so the token will be sfargeljdf

      //decodes token id and verifies it
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // here, we're going to find the user within our db and then return it without the password
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };

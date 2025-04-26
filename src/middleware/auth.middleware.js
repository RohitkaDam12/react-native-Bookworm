import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const protectRoute = async (req, res, next) => {
  try {
    // get the token from the header
    const token = req.header("Authorization").replace("Bearer", "");
    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }
    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find the user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Error in auth middleware:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protectRoute; 
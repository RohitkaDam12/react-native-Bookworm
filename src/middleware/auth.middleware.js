import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    const token = authHeader.split(" ")[1]; // This avoids whitespace bugs

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

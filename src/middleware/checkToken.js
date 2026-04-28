import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const checkToken = {
  verifyUser: (req, res, next) => {
    const token = req.headers.authorization || req.headers.token;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, JWT_SECRET, (err, user) => {
        if (err) {
          console.error("Token verification error:", err);
          return res.status(403).json({ message: "Token is not valid" });
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json({ message: "You're not authenticated" });
    }
  },

  verifyAdmin: (req, res, next) => {
    checkToken.verifyUser(req, res, () => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        return res.status(403).json({ message: "Access denied: Admins only" });
      }
    });
  },
};

export default checkToken;

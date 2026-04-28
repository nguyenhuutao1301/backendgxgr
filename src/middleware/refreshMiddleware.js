const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secret");

    // Kiểm tra token có tồn tại trong database không
    const session = await Session.findOne({ userId: decoded.id, token });

    if (!session) return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

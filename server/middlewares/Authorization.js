const Authorization = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Forbidden: You are not authorized" });
    }
    next();
  };
};

export default Authorization

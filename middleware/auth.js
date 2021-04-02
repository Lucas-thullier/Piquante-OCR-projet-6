const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    logger.info("Verification du token d'authentification...");
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      logger.info("Echec de l'authentification. les UserId ne correspondent pas");
      throw "Requete invalide";
    } else {
      logger.info("Succès de l'authentification");
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};

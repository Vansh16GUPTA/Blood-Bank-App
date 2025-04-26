const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1]; // Ensure token exists
        if (!token) {
            return res.status(401).send({
                success: false,
                message: "No token provided",
            });
        }

        JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                return res.status(401).send({
                    success: false,
                    message: "Auth failed: Invalid token",
                });
            }
            req.userId = decode.userId;  // Store userId in req, not req.body
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            success: false,
            message: "Auth Failed",
            error,
        });
    }
};

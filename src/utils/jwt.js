import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = "7d";

const JwtUtil = {
    sign(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
    },

    verify(token) {
        return jwt.verify(token, JWT_SECRET);
    }
};

export default JwtUtil;

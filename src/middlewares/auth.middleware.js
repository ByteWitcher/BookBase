import JwtUtil from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header)
        return res.status(401).json({ error: 'Missing Authorization header' });

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token)
        return res.status(401).json({ error: 'Invalid Authorization format' });

    try {
        const decoded = JwtUtil.verify(token);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

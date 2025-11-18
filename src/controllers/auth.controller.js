import authService from '../services/auth.service.js';

class AuthController {
    async register(req, res) {
        try {
            const user = await authService.register(req.body);
            const { password, ...safeUser } = user.toJSON();
            res.status(201).json(safeUser);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, oldPassword, newPassword } = req.body;
            const result = await authService.resetPassword(
                email,
                oldPassword,
                newPassword
            );
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

export default new AuthController();

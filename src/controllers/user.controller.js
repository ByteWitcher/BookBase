import userService from "../services/user.service.js";

class UserController {
    async getMe(req, res) {
        const user = await userService.getUserByEmail(req.user.email);
        if (!user) return res.status(404).json({ error: "Not found" });
        res.json(user);
    }

    async getUserById(req, res) {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "Not found" });
        res.json(user);
    }

    async getUserByEmail(req, res) {
        const user = await userService.getUserByEmail(req.params.email);
        if (!user) return res.status(404).json({ error: "Not found" });
        res.json(user);
    }

    async getUserByUsername(req, res) {
        const user = await userService.getUserByUsername(req.params.username);
        if (!user) return res.status(404).json({ error: "Not found" });
        res.json(user);
    }

    async getUsers(req, res) {
        const users = await userService.getUsers();
        res.json(users);
    }

    async updateMe(req, res) {
        try {
            const user = await userService.updateUser(req.user.id, req.body);
            res.json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

export default new UserController();

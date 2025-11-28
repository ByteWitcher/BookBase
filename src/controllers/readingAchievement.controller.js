import ReadingAchievementService from "../services/readingAchievement.service.js";

export default {
  /**
   * Get all achievements (admin/general)
   * Supports filtering, sorting, pagination via query params
   */
  async getAchievements(req, res) {
    try {
      const options = {
        where: req.query.where ? JSON.parse(req.query.where) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
        order: req.query.order ? JSON.parse(req.query.order) : undefined,
      };
      const achievements =
        await ReadingAchievementService.getAchievements(options);
      res.json(achievements);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get achievement by ID
   */
  async getAchievementById(req, res) {
    try {
      const { id } = req.params;
      const achievement =
        await ReadingAchievementService.getAchievementById(id);
      if (achievement) {
        res.json(achievement);
      } else {
        res.status(404).json({ error: "Achievement not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Delete achievement by ID (admin/general)
   */
  async deleteAchievement(req, res) {
    try {
      // TODO: restrict to admins (and owner ?) if needed
      const { id } = req.params;
      const success = await ReadingAchievementService.deleteAchievement(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Achievement not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get achievements for authenticated user
   */
  async getMyAchievements(req, res) {
    try {
      // TODO: expects req.user.id to be set by auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: userId missing from req.user" });
      }
      const achievements =
        await ReadingAchievementService.getAchievementsByUser(userId);
      res.json(achievements);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

import WeeklyReadingSummaryService from "../services/weeklyReadingSummary.service.js";

// Helper to get current week range (Monday to Sunday)
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  // Calculate Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  // Calculate Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}

export default {
  /**
   * Admin: Generate current week's summaries for all users
   */
  async generateCurrentWeekSummariesForAllUsers(req, res) {
    try {
      // TODO: restrict to admin or authorized users
      const { weekStart, weekEnd } = getCurrentWeekRange();
      const results =
        await WeeklyReadingSummaryService.generateCurrentWeekSummariesForAllUsers(
          weekStart,
          weekEnd,
        );
      res.json(results);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  /**
   * Get/generate current week's summary for authenticated user (on demand)
   */
  async getMyCurrentWeekSummary(req, res) {
    try {
      // TODO: expects req.user.id to be set by auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: userId missing from req.user" });
      }
      const { weekStart, weekEnd } = getCurrentWeekRange();
      let summary =
        await WeeklyReadingSummaryService.getAllSummariesByUser(userId);
      summary = summary.find(
        (s) => s.weekStart === weekStart && s.weekEnd === weekEnd,
      );
      if (summary) {
        return res.json(summary);
      }
      // Not found, generate
      const generated =
        await WeeklyReadingSummaryService.generateSummaryFromSessions(
          userId,
          weekStart,
          weekEnd,
        );
      res.json(generated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get all weekly summaries for authenticated user
   */
  async getMyWeeklySummaries(req, res) {
    try {
      // TODO: expects req.user.id to be set by auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: userId missing from req.user" });
      }
      const summaries =
        await WeeklyReadingSummaryService.getAllSummariesByUser(userId);
      res.json(summaries);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Admin: Get/generate current week's summary for any user
   */
  async getUserCurrentWeekSummary(req, res) {
    try {
      // TODO: restrict to admin or authorized users
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId required in body" });
      }
      const { weekStart, weekEnd } = getCurrentWeekRange();
      let summary =
        await WeeklyReadingSummaryService.getAllSummariesByUser(userId);
      summary = summary.find(
        (s) => s.weekStart === weekStart && s.weekEnd === weekEnd,
      );
      if (summary) {
        return res.json(summary);
      }
      // Not found, generate
      const generated =
        await WeeklyReadingSummaryService.generateSummaryFromSessions(
          userId,
          weekStart,
          weekEnd,
        );
      res.json(generated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Admin: Get all weekly summaries for any user
   */
  async getUserWeeklySummaries(req, res) {
    try {
      // TODO: restrict to admin or authorized users
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId required in body" });
      }
      const summaries =
        await WeeklyReadingSummaryService.getAllSummariesByUser(userId);
      res.json(summaries);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get all weekly summaries (admin/general) with filtering, sorting, pagination
   */
  async getAllSummaries(req, res) {
    try {
      // TODO: restrict to admin or authorized users if needed
      const options = {
        where: req.query.where ? JSON.parse(req.query.where) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
        order: req.query.order ? JSON.parse(req.query.order) : undefined,
      };
      const summaries =
        await WeeklyReadingSummaryService.getAllSummaries(options);
      res.json(summaries);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Delete a weekly summary by ID
   */
  async deleteSummary(req, res) {
    try {
      // TODO: restrict to admin or authorized users if needed
      const { id } = req.params;
      const success = await WeeklyReadingSummaryService.deleteSummary(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Summary not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

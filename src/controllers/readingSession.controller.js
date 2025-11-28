import ReadingSessionService from "../services/readingSession.service.js";
import ReadingAchievementService from "../services/readingAchievement.service.js";

// Helper to trigger achievement checks asynchronously
function triggerAchievementCheck(userId, sessionData) {
  setImmediate(() => {
    ReadingAchievementService.checkAndUnlockAchievements(
      userId,
      sessionData,
    ).catch((err) => console.error("Achievement check failed:", err));
  });
}

export default {
  /**
   * Get leaderboard of users by total pages read
   * Query param: limit (optional)
   */
  async getLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const leaderboard = await ReadingSessionService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Create a new reading session
   */
  async createSession(req, res) {
    try {
      // TODO: userId will be set by auth middleware from JWT
      // Assumes authentication middleware sets req.user.id
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: userId missing from req.user" });
      }
      const { bookId, startTime, endTime, startPage, endPage } = req.body;
      const session = await ReadingSessionService.createSession({
        userId,
        bookId,
        startTime,
        endTime,
        startPage,
        endPage,
      });
      // Trigger achievement checks asynchronously (background)
      triggerAchievementCheck(userId, session);
      res.status(201).json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Update a reading session
   */
  // TODO: ensure that only the owner/admins can update
  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await ReadingSessionService.updateSession(id, updates);
      res.json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Delete a reading session
   */
  // TODO: ensure that only the owner/admins can delete
  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      const success = await ReadingSessionService.deleteSession(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get a session by ID
   */
  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = await ReadingSessionService.getSessionById(id);
      if (session) {
        res.json(session);
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get all sessions for a user
   */
  async getAllSessionsByUser(req, res) {
    try {
      const { userId } = req.params;
      const sessions = await ReadingSessionService.getAllSessionsByUser(userId);
      res.json(sessions);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get latest session for a user and book
   */
  async getLatestSessionByUserAndBook(req, res) {
    try {
      const { userId, bookId } = req.params;
      const session = await ReadingSessionService.getLatestSessionByUserAndBook(
        userId,
        bookId,
      );
      if (session) {
        res.json(session);
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * Get user book progress
   */
  async getUserBookProgress(req, res) {
    try {
      const { userId } = req.params;
      const progress = await ReadingSessionService.getUserBookProgress(userId);
      res.json(progress);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Convenience methods for authenticated user
  // TODO:  they expect req.user.id to be set by authentication middleware
  async getMySessions(req, res) {
    const userId = req.user.id;
    const sessions = await ReadingSessionService.getAllSessionsByUser(userId);
    res.json(sessions);
  },

  async getMyBookProgress(req, res) {
    const userId = req.user.id;
    const progress = await ReadingSessionService.getUserBookProgress(userId);
    res.json(progress);
  },
};

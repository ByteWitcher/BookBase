import models from "../entities/index.js";

const { ReadingSession} = models;

class ReadingSessionRepository {

    async create(data) {
        return await ReadingSession.create(data);
    }

    async findById(id) {
        return await ReadingSession.findByPk(id);
    }

    async findAllByUser(userId) {
        return await ReadingSession.findAll({ where: { userId } });
    }

    async update(id, updates) {
        const session = await ReadingSession.findByPk(id);
        if (session) {
            return await session.update(updates);
        }
        return null;
    }

    async delete(id) {
        const session = await ReadingSession.findByPk(id);
        if (!session) return null;
        await session.destroy();
        return true;
    }

}


export default new ReadingSessionRepository();
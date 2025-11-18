import express from 'express';
import models, { sequelize } from './entities/index.js';

export class Server {

    async listen(port = 3000) {
        const app = express();

        app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        try {
            // non-destructive schema changes
            console.log('Syncing database (alter)...');
            await sequelize.sync({ alter: true });
            console.log('Database sync complete');
        } catch (err) {
            console.error('Database sync failed', err);
            throw err;
        }

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    }
}

export default Server;
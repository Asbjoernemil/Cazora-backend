import { Router } from 'express';
import connection from '../server.js';

const sizeRouter = Router();

// Get all sizes
sizeRouter.get('/', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM sizes');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af størrelser: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get specific size by ID
sizeRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT * FROM sizes WHERE id = ?', [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Størrelsen blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved læsning af specifik størrelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// ... (implementer de resterende CRUD-operationer)

export default sizeRouter;

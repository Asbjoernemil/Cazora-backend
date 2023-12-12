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

// Create a new size
sizeRouter.post('/', async (req, res) => {
    try {
        const size = req.body;

        const sql = 'INSERT INTO sizes (name) VALUES (?)';
        const values = [size.name];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Størrelsen er blevet oprettet med succes.' });
        } else {
            res.status(500).send('Fejl ved oprettelse af størrelse.');
        }
    } catch (error) {
        console.error('Fejl ved oprettelse af størrelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update size by ID
sizeRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSize = req.body;

        const sql = 'UPDATE sizes SET name = ? WHERE id = ?';
        const values = [updatedSize.name, id];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Størrelsen er blevet opdateret med succes.' });
        } else {
            res.status(500).send('Fejl ved opdatering af størrelse.');
        }
    } catch (error) {
        console.error('Fejl ved opdatering af størrelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete size by ID
sizeRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM sizes WHERE id = ?';
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Størrelsen er blevet slettet med succes.' });
        } else {
            res.status(404).send('Størrelsen blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved sletning af størrelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});

export default sizeRouter;

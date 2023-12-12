import { Router } from "express";
import connection from "../server.js";

const categoriesRouter = Router();


// Get all categories
categoriesRouter.get("/", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af kategorier: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get specific category
categoriesRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT * FROM categories WHERE id = ?', [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Kategorien blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved læsning af specifik kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Create a new category
categoriesRouter.post("/", async (req, res) => {
    try {
        const category = req.body;

        const sql = 'INSERT INTO categories (name) VALUES (?)';
        const values = [category.name];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Kategori oprettet med succes.' });
        } else {
            res.status(500).send('Fejl ved oprettelse af kategori.');
        }
    } catch (error) {
        console.error('Fejl ved oprettelse af kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update category
categoriesRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = req.body;

        const sql = 'UPDATE categories SET name = ? WHERE id = ?';
        const values = [updatedCategory.name, id];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Kategori opdateret med succes.' });
        } else {
            res.status(500).send('Fejl ved opdatering af kategori.');
        }
    } catch (error) {
        console.error('Fejl ved opdatering af kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete category by id
categoriesRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM categories WHERE id = ?';
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Kategori slettet med succes.' });
        } else {
            res.status(404).send('Kategorien blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved sletning af kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});

export default categoriesRouter;
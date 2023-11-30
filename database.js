import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;


const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Database',
    database: 'cazora_database',
    charset: 'utf8mb4',
});

app.use(cors())
app.use(express.json())

//*********GET**********/


// Hent alle kategorier
app.get("/categories", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM Categories');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af kategorier: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Hent specifik kategori
app.get("/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT * FROM Categories WHERE category_id = ?', [id]);

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

// Hent alle produkter
app.get("/products", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM Products');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af produkter: ', error);
        res.status(500).send('Internal Server Error');
    }
});


// Hent specifik produkt
app.get("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length > 0) {
            res.json(rows[0]); // Hvis produktet findes, returner det første element i arrayet
        } else {
            res.status(404).send('Produktet blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved læsning af specifikt produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Hent alle reservationer
app.get("/bookings", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM Bookings');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af reservationer: ', error);
        res.status(500).send('Internal Server Error');
    }
});

//********PUT************/
app.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;

        // Check om produktet eksisterer
        const [checkRows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (checkRows.length === 0) {
            return res.status(404).send('Produktet blev ikke fundet.');
        }

        // Generer dynamisk SQL baseret på de tilgængelige felter i req.body
        const fieldsToUpdate = Object.keys(updatedProduct)
            .map(field => `${field} = ?`)
            .join(', ');

        const sql = `
            UPDATE products 
            SET ${fieldsToUpdate}
            WHERE id = ?
        `;

        // Opret et array af værdier for SQL-forespørgslen
        const values = [...Object.values(updatedProduct), id];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Produkt opdateret med succes.' });
        } else {
            res.status(500).send('Fejl ved opdatering af produkt.');
        }
    } catch (error) {
        console.error('Fejl ved opdatering af produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});



//********POST***********/
app.post("/products", async (req, res) => {
    try {
        const product = req.body;
        console.log('New Product:', product);
        console.log('Request Body:', req.body);

        const sql = `
            INSERT INTO products 
            (categories_id, sizes_id, name, price, description, booked, img) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [product.categories_id, product.sizes_id, product.name, product.price, product.description, product.booked, product.img];

        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            res.json({ message: 'Produkt oprettet med succes.' });
        } else {
            res.status(500).send('Fejl ved oprettelse af produkt.');
        }
    } catch (error) {
        console.error('Fejl ved oprettelse af produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});



//********DELETE*********/
app.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM products WHERE id = ?'; // Ændr dette til 'DELETE FROM Products WHERE product_id = ?'
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Produkt slettet med succes.' });
        } else {
            res.status(404).send('Produktet blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved sletning af produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(port, () => console.log(`Genbrugstøjbutik-app listening on port ${port}`));


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
});

app.use(cors())

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
        const [rows] = await connection.execute('SELECT * FROM Products WHERE product_id = ?', [id]);

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


app.listen(port, () => console.log(`Genbrugstøjbutik-app listening on port ${port}`));


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

app.get("/products", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af produkter: ', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => console.log(`Genbrugstøjbutik-app listening on port ${port}`));


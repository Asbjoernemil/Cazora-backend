import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import cors from 'cors';

// Importer routes
import productsRouter from './routes/productsRouter.js';
// import categoriesRouter from './routes/categories';
// import bookingsRouter from './routes/bookings';

const app = express();
const port = process.env.PORT || 3000;


// opret forbindelse til database
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Database',
    database: 'cazora_database',
    charset: 'utf8mb4',
});

app.use(cors())
app.use(express.json())


// brug routes
app.use("/products", productsRouter);
// app.use('/categories', categoriesRouter);
// app.use('/bookings', bookingsRouter);


// Start server
app.listen(port, () => console.log(`Genbrugstøjbutik-app listening on port ${port}`));

export default connection
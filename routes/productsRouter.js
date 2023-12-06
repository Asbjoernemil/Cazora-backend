import { Router } from "express"
import connection from "../server.js";

const productsRouter = Router();

// Get list of all products
productsRouter.get("/", async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved læsning af produkter: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get specific product using id
productsRouter.get("/:id", async (req, res) => {
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

// Update product
productsRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;

        // Check if product exists
        const [checkRows] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (checkRows.length === 0) {
            return res.status(404).send('Produktet blev ikke fundet.');
        }

        // Genererer dynamisk SQL baseret på de tilgængelige felter i req.body
        const fieldsToUpdate = Object.keys(updatedProduct)
            .map(field => `${field} = ?`)
            .join(', ');

        const sql = `
            UPDATE products 
            SET ${fieldsToUpdate}
            WHERE id = ?
        `;

        // Create array of values for SQL request
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

// Create a new product
productsRouter.post("/", async (req, res) => {
    try {
        const product = req.body;
        console.log('New Product:', product);
        console.log('Request Body:', req.body);

        const sql = 'CALL InsertClothingArticle(?, ?, ?, ?, ?, ?, ?)';
        const values = [
            product.name,
            product.categories, // Assuming categories is a comma-separated string
            product.size,
            product.price,
            product.description,
            product.reserved,
            product.img
        ];

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


// Deletes product by id:
productsRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Brug proceduren til at slette produktet og kategorisammenkædninger
        const sql = 'CALL DeleteProduct(?)';
        const [result] = await connection.execute(sql, [id]);

        // Kontroller om noget blev slettet
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

export default productsRouter
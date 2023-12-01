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

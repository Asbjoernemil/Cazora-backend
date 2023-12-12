CREATE DATABASE cazora_database;

USE cazora_database;

-- clean slate
drop table product_sizes;
drop table product_categories;
drop table reservations;
drop table products;
drop table categories;
drop table sizes;
drop table fittingRooms;
drop procedure DeleteProduct;
drop PROCEDURE InsertClothingArticle;
drop procedure CreateReservation;
drop procedure CancelReservation;
drop procedure LoadSingleArticle;
drop procedure UpdateClothingArticle;


-- tabel til kategorier
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
);

-- tabel til prøverum
CREATE TABLE fittingRooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30)
);


-- Taabel til størrelser
CREATE TABLE sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) UNIQUE
);

-- tabel til produkter
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sizes_id INT,
    FOREIGN KEY (sizes_id) REFERENCES sizes(id),
    name VARCHAR(100),
    price INT,
    description VARCHAR(1024),
    reserved BOOLEAN,
    img VARCHAR (750),
    INDEX(sizes_id),
    INDEX(price)
);

-- tabel til prøverums-booking
CREATE TABLE reservations
(
    id INT AUTO_INCREMENT PRIMARY KEY,
    creationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fittingRoom INT,
    FOREIGN KEY (fittingRoom) REFERENCES fittingRooms (id),
    product INT,
    FOREIGN KEY (product) REFERENCES products(id),
    contactInfo VARCHAR(1024),
    pickUpTime DATETIME
);


-- tabel til produktkategorier
-- unique gør at ingen dobbeltforekomster
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE (product_id, category_id)
);

-- Krydstabel mellem sizes og products
CREATE TABLE product_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    size_id INT,
    FOREIGN KEY (size_id) REFERENCES sizes(id),
    UNIQUE (product_id, size_id)
);


-- Indsæt nogle prøverum
INSERT INTO fittingRooms (name) VALUES
('Prøverum 1'), ('Prøverum 2'), ('Prøverum 3'), ('Prøverum 4'), ('Prøverum 5');

-- kategorier oprettelse
INSERT INTO categories (name) VALUES
('Basics'), ('Blonder'), ('Stribet'), ('Pels'), ('Varm'), ('Vinter'),
('Trøje'), ('Jakke'), ('Kjole'), ('Sko'), ('Hat'), ('Smykke'), ('Briller'),
('Bukser'), ('Nederdel'), ('Sweater'), ('Frakke'), ('Hår'), ('Hoodie'), ('Jeans'), ('Chinos'), ('Shorts'), ('Tennis'),
('50er'), ('60er'), ('70er'), ('80er'), ('90er'), ('00er'), ('Punk'), ('Future'), ('Rock'), ('Pop'), ('K-Pop'), ('Metal'), ('Yoga'),
('Sport'), ('Undertøj'), ('Nattøj'), ('Badetøj'), ('Formelt'), ('Skjorter'), ('Batik'), ('Handsker'), ('Læder'), ('Street'), ('Sk8'), ('Hip-Hop'),
('Undergrund'), ('Berlin'), ('Disco'), ('Havearbejde'), ('Sommer'), ('Strømper'), ('Uld'), ('Nylon'), ('Bomuld'), ('Bambus'),
('Comfy'), ('Print'), ('Fobol'), ('T-shirt');


-- størrelser oprettelse
INSERT INTO sizes (name) VALUES
('xs'), ('s'), ('m'), ('l'), ('xl'), ('one size'), ('34'), ('35'), ('36'), ('37'), ('38'), ('39'), ('40'), ('41'), ('42'), ('43'),
('44'), ('45'), ('46'), ('47'), ('48'), ('49');


-- procedure oprettelse
DELIMITER @@

CREATE PROCEDURE InsertClothingArticle(
    IN article_name VARCHAR(100),
    IN category_names VARCHAR(100),
    IN size_name VARCHAR(10),
    IN article_price INT,
    IN article_description VARCHAR(1024),
    IN is_reserved BOOLEAN,
    IN article_img VARCHAR(750)
)
BEGIN
    DECLARE category_id INT;
    DECLARE product_id INT;

    -- Indsæt artikel i 'products' tabellen
    INSERT INTO products (sizes_id, name, price, description, reserved, img)
    VALUES ((SELECT id FROM sizes WHERE name = size_name), article_name, article_price, article_description, is_reserved, article_img);

    -- Hent den nyoprettede artikel id
    SET product_id = LAST_INSERT_ID();

    -- Opdel kategorinavne og indsæt i 'product_categories'
    SET @categories := category_names;
    WHILE LENGTH(@categories) > 0 DO
        SET @category_name := TRIM(SUBSTRING_INDEX(@categories, ',', 1));
        SET @categories := TRIM(BOTH ',' FROM SUBSTRING(@categories, CHAR_LENGTH(@category_name) + 2));

        -- Find kategoriens id
        SELECT id INTO category_id FROM categories WHERE name = @category_name;

        -- Indsæt i 'product_categories'
        INSERT INTO product_categories (product_id, category_id) VALUES (product_id, category_id);
    END WHILE;
END @@

@@
-- procedure til sletning af produkt og kategorisammenkædninger
CREATE PROCEDURE DeleteProduct(IN product_id VARCHAR(100))
BEGIN
    -- Slet tilknyttede rækker i product_categories
    DELETE FROM product_categories WHERE product_id = product_id;

    -- Slet produktet
    DELETE FROM products WHERE id = product_id;
END @@


CREATE PROCEDURE CreateReservation(
    IN fittingRoom VARCHAR(255),
    IN productId INT,
    IN contactInfo VARCHAR(255),
    IN pickUpTime DATETIME
)
BEGIN

    -- Start en transaktion
    START TRANSACTION;

    -- Opret reservation
    INSERT INTO reservations (fittingRoom, product, contactInfo, pickUpTime)
    VALUES (fittingRoom, productId, contactInfo, pickUpTime);

    -- Opdater produkt til at være reserveret
    UPDATE products SET reserved = true WHERE id = productId;

    -- Check for fejl og commit transaktionen
    IF (SELECT ROW_COUNT() = 1) THEN
        COMMIT;
    ELSE

        ROLLBACK;
    END IF;

END @@

CREATE PROCEDURE CancelReservation(
    IN reservationId INT
)
BEGIN
    DECLARE productId INT;

    -- Start en transaktion
    START TRANSACTION;

    -- Hent produkt-id for den slettede reservation
    SELECT product INTO productId FROM reservations WHERE id = reservationId;

    -- Slet reservation
    DELETE FROM reservations WHERE id = reservationId;

    -- Opdater produkt til ikke at være reserveret
    UPDATE products SET reserved = false WHERE id = productId;

    -- Check for fejl og commit transaktionen
    IF (SELECT ROW_COUNT() = 1) THEN
        COMMIT;
    ELSE
        ROLLBACK;
    END IF;

END @@

create procedure LoadSingleArticle(IN product_id int)
BEGIN
    DECLARE product_name VARCHAR(100);
    DECLARE product_price INT;
    DECLARE product_description VARCHAR(1024);
    DECLARE product_reserved BOOLEAN;
    DECLARE product_img VARCHAR(750);
    DECLARE product_size VARCHAR(10);
    DECLARE category_names VARCHAR(500);

    -- Hent produktinformation
    SELECT
        p.name,
        p.price,
        p.description,
        p.reserved,
        p.img,
        s.name AS size
    INTO
        product_name,
        product_price,
        product_description,
        product_reserved,
        product_img,
        product_size
    FROM
        products p
    LEFT JOIN
        sizes s ON p.sizes_id = s.id
    WHERE
        p.id = product_id;

    -- Hent kategorinavne for produktet som en streng
    SELECT
        GROUP_CONCAT(c.name) AS categories
    INTO
        category_names
    FROM
        product_categories pc
    JOIN
        categories c ON pc.category_id = c.id
    WHERE
        pc.product_id = product_id;

    -- Returnér resultatet
    SELECT
        product_name AS name,
        product_price AS price,
        product_description AS description,
        product_reserved AS reserved,
        product_img AS img,
        product_size AS size,
        category_names AS categories;
END;

create procedure UpdateClothingArticle
    (IN product_id int, IN article_name varchar(100),
                                                             IN category_names varchar(100), IN size_name varchar(10),
                                                             IN article_price int, IN article_description varchar(1024),
                                                             IN is_reserved tinyint(1), IN article_img varchar(750))

BEGIN
    DECLARE category_id INT;

    -- Start transaktion
    START TRANSACTION;

    -- Opdater produktets informationer
    UPDATE products
    SET
        sizes_id = (SELECT id FROM sizes WHERE name = size_name),
        name = article_name,
        price = article_price,
        description = article_description,
        reserved = is_reserved,
        img = article_img
    WHERE id = product_id;


    -- Hent kategorinavne og indsæt i 'product_categories' kun for det opdaterede produkt
    SET @categories := category_names;
    WHILE LENGTH(@categories) > 0 DO
        SET @category_name := TRIM(SUBSTRING_INDEX(@categories, ',', 1));
        SET @categories := TRIM(BOTH ',' FROM SUBSTRING(@categories, CHAR_LENGTH(@category_name) + 2));

        -- Find kategoriens id
        SET @category_id := (SELECT id FROM categories WHERE name = @category_name);

        -- Tjek om kombinationen af produkt og kategori allerede eksisterer
        IF NOT EXISTS (SELECT * FROM product_categories WHERE product_id = product_id AND category_id = @category_id) THEN
            -- Indsæt kun hvis kombinationen ikke findes
            INSERT INTO product_categories (product_id, category_id)
            VALUES (product_id, @category_id);
        END IF;
    END WHILE;

    -- Commit ændringer
    COMMIT;
END;

DELIMITER ;


-- indsættelse af artikler
CALL InsertClothingArticle('Pelsfrakke', 'Frakke, Varm, Pels, Vinter', 'L', 250, 'Stilfuld pelsfrakke i brun, som Macklemore havde på i en musikvideo.', true, 'https://live.staticflickr.com/711/32501711571_d124a2f449_b.jpg' );
CALL InsertClothingArticle('Stribet Skjorte', 'Stribet, Formelt, Sk8', 'M', 50, 'Klassisk stribet skjorte i hvid og grøn, som Macklemore havde på i en musikvideo.', false, 'https://cdn.wikimg.net/en/splatoonwiki/images/8/82/S_Gear_Clothing_Striped_Shirt.png');
CALL InsertClothingArticle('Røde Sneakers', 'Sko, Sk8, Hip-Hop', 'XL', 100, 'Fede røde sneakers for et modigt look, som Macklemore havde på i en musikvideo.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Sixpence Hat', 'Hat, Hip-Hop, Undertøj', 'One Size', 30, 'Vintage-stil sixpence hat i sort, som Macklemore havde på i en musikvideo.', false, 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Flat-cap.jpg');
CALL InsertClothingArticle('Guldhalskæde', 'Smykke, Hip-Hop', 'One Size', 650, 'Stilfuldt guldsmykke, som Macklemore havde på i en musikvideo.', false, 'https://www.pngall.com/wp-content/uploads/8/Gold-Jewellery-Necklace-PNG.png');

CALL InsertClothingArticle('Enkeltstrop Sort Bodystocking', 'Undertøj, Basics, Bambus', 'XS', 75, 'Bodystocking med en enkelt skulderstrop.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Dobbeltstrop Rød Bodystocking', 'Undertøj, Basics', 'S', 80, 'Bodystocking med dobbelte skulderstropper.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('LOL Broderet Bodystocking', 'Undertøj, Basics, Varm', 'M', 90, 'Bodystocking med ''LOL'' broderet over maven.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Leopardmønster og Blonde Bodystocking', 'Undertøj, Basics, Blonder, Print', 'L', 85, 'Bodystocking med leopardmønster, blonde og unikt design.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Gummi One Size Bodystocking', 'Undertøj, Læder', 'One Size', 100, 'Bodystocking lavet af ren gummi, passer til one size.', false, 'https://cdn.puploki.com/wp-content/uploads/2011/12/STR-Rubber-Suit-1570.jpg');
CALL InsertClothingArticle('Dobbeltstrop Hvid Bodystocking', 'Undertøj, Basics', 'XL', 95, 'Bodystocking med to skulderstropper for et stilfuldt look.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Sort Blonde Bodystocking', 'Undertøj, Basics, Blonder', 'M', 90, 'Elegant sort blonde bodystocking med indviklet design.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');

CALL InsertClothingArticle('Læderjakke', 'Jakke, Frakke, Læder, 60er, 80er, 90er, Rock', 'L', 300, 'Stilfuld læderjakke set på Brad Pitt til en filmpremiere i 1995.', true, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Lædernederdel', 'Nederdel, Læder, 90er, Future', 'M', 150, 'Elegant lædernederdel set på Brad Pitt til en filmpremiere i 1989.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Læderbukser', 'Bukser, Læder, 90er, Rock', 'S', 200, 'Moderne læderbukser set på Brad Pitt til en filmpremiere i 1998.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Læderfrakke', 'Jakke, Frakke, 90er, Vinter, Varm', 'XL', 350, 'Stilfuld læderfrakke set på Brad Pitt til en filmpremiere i 1992.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');
CALL InsertClothingArticle('Lædervest', 'Læder, Formelt, 90er', 'One Size', 180, 'Trendy lædervest set på Brad Pitt til en filmpremiere i 1999.', false, 'https://ssb.wiki.gallery/images/thumb/8/8d/Yoshi_SSBU.png/1600px-Yoshi_SSBU.png');



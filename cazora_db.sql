CREATE DATABASE cazora_database;

USE cazora_database;


CREATE TABLE products (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Type VARCHAR(255) NOT NULL,
  Size VARCHAR(50),
  Price DECIMAL(10, 2) NOT NULL
);

INSERT INTO products (Type, Size, Price)
VALUES ('T-shirt', 'Medium', 19.99);

INSERT INTO products (Type, Size, Price)
VALUES ('T-shirt', 'Small', 24.99);

INSERT INTO products (Type, Size, Price)
VALUES ('Jeans', 'Large', 49.99);

INSERT INTO products (Type, Size, Price)
VALUES ('Hoodie', 'Medium', 34.99);
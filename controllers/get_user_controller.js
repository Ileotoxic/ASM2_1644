const pool = require("../models/pg_connector");

async function ProductsTable(selectedShopId) {
    let table = "";
    try {
        // Truy vấn lọc theo shop id
        let query = `SELECT * FROM products ORDER BY id`;
        if (selectedShopId != 0) {
            query += ` WHERE shop_id = $1`;
        }
        const result = await pool.query(query, selectedShopId != 0 ? [selectedShopId] : []);
        const rows = result.rows;
        const fields = result.fields;

        table = `<table border=1> <tr>`;
        for (let field of fields) {
            table += `<th>${field.name}</th>`;
        }
        table += `</tr>`;
        for (let row of rows) {
            table += `<tr>`;
            for (let field of fields) {
                table += `<td>${row[field.name]}</td>`;
            }
            table += `<td>
            <button onclick="deleteProduct(${row.id}, '/users/products/delete')">Delete</button>
            <button onclick="showUpdateForm(${row.id}, '${row.product_name}', ${row.price}, ${row.shop_id}, ${row.amount})">Update</button>
          </td>`;
        table += `</tr>`;
        }
        table += `</table>`;

    } catch (err) {
        console.error(err);
        table = "Cannot connect to DB";
    }
    return table;
}
async function display_user_page(req, res) {
    if (req.session.authented && req.session.role_id > 2) {
        const selectedShopId = req.body.shops || 0;
        try {
            const [productsTable,] = await Promise.all([
                ProductsTable(selectedShopId),
            ]);
            res.render('users', {
                title: 'USER PAGE',
                products_table: productsTable,
            });
        } catch (err) {
            console.error(err);
            res.render('users', {
                title: 'USER PAGE', 
                products_table: "Error fetching data",
            });
        }
    } else {
        res.redirect('/');
    }
}
async function createProduct(req, res) {
    const { name, price, shop_id, amount } = req.body;
    try {
        const query = `INSERT INTO products (product_name, price, shop_id, amount) VALUES ($1, $2, $3, $4);`;
        await pool.query(query, [name, price, shop_id, amount]);
        console.log('create successfull ...')
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.send("Error creating product");
    }
}

async function updateProduct(req, res) {
    console.log(req.body)
    const { name, price, shop_id, amount, id } = req.body; 
    try {
        const query = `
            UPDATE products 
            SET product_name = $1, price = $2, shop_id = $3, amount = $4 
            WHERE id = $5;`;
        await pool.query(query, [name, price, shop_id, amount, id]);
               console.log('Update successful...');
        res.redirect('/users'); 
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send("Error updating product"); 
    }
}

async function deleteProduct(req, res) {
    const { id } = req.body;
    try {
        const query = `DELETE FROM products WHERE id = $1;` ;
        await pool.query(query, [id]);
        console.log(`Product with ID ${id} deleted successfully.`);
        res.status(200).send("Product deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting product");
    }
}

module.exports = {
    display_user_page,
    createProduct,
    updateProduct,
    deleteProduct,
};
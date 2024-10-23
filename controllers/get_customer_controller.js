const pool = require("../models/pg_connector");

async function ProductsTable(selectedShopId) {
    let table = "";
    try {
        // Truy vấn lọc theo shop id
        let query = `SELECT * FROM products`;
        if (selectedShopId != 0) {
            query += ` WHERE shop_id = $1`; // Nếu không chọn All Shops thì lọc theo shop_id
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
        table += `</tr>`;
        }
        
        table += `</table>`;
    } catch (err) {
        console.error(err);
        table = "Cannot connect to DB";
    }
    return table;
}
async function DropdownList(selectedShopId) {
    let dropdown_list = "";
    try {
        const query = `SELECT id, shop_name FROM shops;`;
        const result = await pool.query(query);
        const rows = result.rows;

        dropdown_list = `
            <form action="" method="post">
                <label for="shop">Choose a shop ID:</label>
                <select name="shops" id="shops">
                    <option value="0" ${selectedShopId == 0 ? 'selected' : ''}>All Shops</option>
        `;
        for (let row of rows) {
            dropdown_list += `<option value="${row.id}" ${selectedShopId == row.id ? 'selected' : ''}>${row.shop_name}</option>`;
        }
        dropdown_list += `
                </select>
                <button type="submit">Select</button>
            </form>
        `;
    } catch (err) {
        console.error(err);
        dropdown_list = "Cannot connect to DB";
    }
    return dropdown_list;
}

async function display_customer_page(req, res) {
    if (req.session.authented && req.session.role_id > 3 && req.session.role_id <= 4) {
        const selectedShopId = req.body.shops || 0;

        try {
            const [productsTable, dropdownList] = await Promise.all([
                ProductsTable(selectedShopId),
                DropdownList(selectedShopId),
            ]);
            res.render('index', {
                title: 'Customer PAGE',
                products_table: productsTable,
                droplist: dropdownList,
            });
        } catch (err) {
            console.error(err);
            res.render('index', {
                title: 'Customer PAGE',
                products_table: "Error fetching data",
                droplist: "Error fetching data",
            });
        }
    } else {
        res.redirect('/');
    }
}
module.exports = display_customer_page;

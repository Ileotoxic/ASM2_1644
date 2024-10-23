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

        table = `<table border=1><tr>`;
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

async function UsersTable() {
    let table = "";
    try {
        const query = `SELECT * FROM users`;
        const result = await pool.query(query);
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
                <button onclick="deleteUsers(${row.id}, '/admins/user/delete')">Delete</button>
                <button onclick="showUpdateRoleForm(${row.id},${row.shop_id},${row.role_id})">Update</button>
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

async function display_admin_page(req, res) {
    if (req.session.authented && req.session.role_id <= 2) {
        const selectedShopId = req.body.shops || 0;

        try {
            const [productsTable, dropdownList, usersTable] = await Promise.all([
                ProductsTable(selectedShopId),
                DropdownList(selectedShopId),
                UsersTable()  // Gọi hàm UsersTable để lấy danh sách người dùng
            ]);
            res.render('admins', {
                title: 'ADMIN PAGE',
                products_table: productsTable,
                droplist: dropdownList,
                users_table: usersTable // Thêm phần render bảng người dùng
            });
        } catch (err) {
            console.error(err);
            res.render('admins', {
                title: 'ADMIN PAGE',
                products_table: "Error fetching data",
                droplist: "Error fetching data",
                users_table: "Error fetching data" // Thêm lỗi nếu không lấy được bảng người dùng
            });
        }
    } else {
        res.redirect('/');
    }
}
async function updateUsers(req, res) {
    console.log(req.body)
    const { shop_id, role_id, id } = req.body; 
    try {
        const query = `
            UPDATE users 
            SET shop_id = $1, role_id = $2
            WHERE id = $3;`;
        await pool.query(query, [ shop_id, role_id, id]);
               console.log('Update successful...');
        res.redirect('/admins'); 
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send("Error updating product"); 
    }
}
async function deleteUsers(req, res) {
    const { id } = req.body;
    
    try {
        const query = `DELETE FROM users WHERE id = $1;` ;
        await pool.query(query, [id]);
        console.log(`Product with ID ${id} deleted successfully.`);
        res.status(200).send("Product deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting product");
    }
}

module.exports = {
    display_admin_page,
    deleteUsers,
    updateUsers
};


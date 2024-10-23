var express = require('express');
var router = express.Router();
var admninController = require('../controllers/get_admin_controller');

/* GET /admins page. */
router.get('', function(req, res, next) {
  admninController.display_admin_page(req, res);
});

/* POST /admins page. */
router.post('', function(req, res, next) {
  console.log(req.body);
  admninController.display_admin_page(req, res);
});
router.post('/user/update', admninController.updateUsers);
router.post('/user/delete', admninController.deleteUsers);
module.exports = router;

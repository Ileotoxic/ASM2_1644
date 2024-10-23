var express = require('express');
var router = express.Router();
var userController = require('../controllers/get_user_controller');

/* GET /users page. */
router.get('', function (req, res, next) {
  userController.display_user_page(req, res);
});

/* POST /users page. */
router.post('', function (req, res, next) {
  console.log(req.body);
  userController.display_user_page(req, res);
});


router.post('/products/create', userController.createProduct);
router.post('/products/update', userController.updateProduct);
router.post('/products/delete', userController.deleteProduct);

module.exports = router;

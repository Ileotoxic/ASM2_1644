var express = require('express');
var router = express.Router();
var display_customer_page = require('../controllers/get_customer_controller');

/* get customer */
router.get('', function(req, res, next) {
  display_customer_page(req, res);
});
/* post customer page. */
router.post('', function(req, res, next) {
  console.log(req.body);
  display_customer_page(req, res);
});
module.exports = router;

const { Router } = require('express');
var router = Router();
const supabase = require('../supabase.js');

/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 조회
router.get('/user',  async function(req, res, next) {
  let { data, error} = await supabase.from('user').select()

  console.log(error);
  res.send(data);
});

// 추가

module.exports = router;
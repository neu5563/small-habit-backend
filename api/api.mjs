import { Router } from 'express';
var router = Router();
import supabase  from '../supabase.mjs';

/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 조회
router.get('/user', async function(req, res, next) {
  const { data, error } = await supabase
  .from('User')
  .select('*')
  res.send(data);
});



// 추가
// router.post('./user/create/:id', async function(req, res, next) {
//   const { data, error } = await supabase
//   .from('small-habit')
//   .insert([
//     { id: '5ff96222-0fed-4c09-aefd-6e59a352dbd2', 
//       nickname: '밧사도르',
//       email: 'qkttkehfm@gamil.com', 
//     }
//   ])
// });

export default router;

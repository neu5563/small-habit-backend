const axios = require('axios');
const { Router } = require('express');
var router = Router();
const qs = require('qs');
const supabase = require('../supabase.js');
const dotenv = require('dotenv');
dotenv.config()

const { REST_API_KEY, REDIRECT_URI } = process.env;


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

// 로그인
router.get('/kakao', async function(req, res, next) {
  try {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    res.redirect(kakaoAuthURL);
  } catch(err) {
    console.log(err);
  }
})

router.get('/kakao/callback', async function(req, res, next) {
  const code = req.query.code;
  let token;
  try {
    token = await axios.post('https://kauth.kakao.com/oauth/token',{
      headers:{
        ContentType:'application/x-www-form-urlencoded'
      },
      data:qs.stringify({
        grant_type: 'authorization_code',//특정 스트링
        client_id:REST_API_KEY,
        redirect_uri:REDIRECT_URI,
        code:req.query.code,//결과값을 반환했다. 안됐다.
    })//객체를 string 으로 변환
    })
  } catch(err) {
    res.send(err);
  }

})
// router.get('/login',  async function(req, res, next) {

// });

// 추가

module.exports = router;
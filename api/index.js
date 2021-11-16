const { Router, response } = require('express');
var router = Router();
const supabase = require('../supabase.js');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
const session = require('express-session');
axios.defaults.withCredentials = true;
dotenv.config();

const { REST_API_KEY, REDIRECT_URI, SUPABASE_URL, SUPABASE_KEY } = process.env;


// 로그인 체크
router.get('/auth',  async function(req, res, next) {
  console.log('checkSession', req.session)
  try {
    const user = await supabase
    .from('user')
    .select('*')
    .eq('id', req.session.userId)
    // console.log('user', user)
    res.json(user)
  }catch(err) {
    res.send(401)
  }
});

// 카카오 로그아웃
router.delete('/auth/logout',  async function(req, res, next) { 
  req.session.destroy();
  res.send(200);
  console.log('logoutSession', req.session)
});

// 카카오 로그인
router.post('/auth/login', async function(req, res, next) {
  const AUTHORIZE_CODE = req.query.code;
  // console.log(req.session)

  // 토큰 받아오기
  let response;
  let access_token;
  if(AUTHORIZE_CODE) {
    try {
      response = await axios({
        method: 'get',
        url: `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${AUTHORIZE_CODE}`,
      })
      access_token = response.data.access_token;
    }catch(err) {
      console.log(err)
      res.send(401)
    }
  }
  // 카카오에서 유저정보 받아오기
  let kakaoUserAuth = {
    kakaoAuthId: null,
    nickname: null,
    email: null
  };
  if(access_token) {
    try {
      response = await axios({
        method: 'get',
        headers: {
          "Authorization": `Bearer ${access_token}`
        },
        url: 'https://kapi.kakao.com/v2/user/me'
      })
      kakaoUserAuth = {
        kakaoAuthId: response.data.id,
        nickname: response.data.properties.nickname,
        email: response.data.kakao_account.email
      }
      // console.log('kakaoUser', kakaoUserAuth.kakaoAuthId)
    }catch(err) {
      console.log(err)
      res.send(401)
    }
  }

  // 데이터 베이스에 유저가 있는지 탐색
  const getUser = async function() {
    try {
      response = await supabase
      .from('user')
      .select('*')
      .eq('kakaoAuthId', kakaoUserAuth.kakaoAuthId)
      return response.data
    }catch(err) {
      console.log('err', err)
      res.send(401)
    }
  }
  // 신규가입
  const newUser = async function() {
    try {
      await supabase
      .from('user')
      .insert([
        { 
          kakaoAuthId: kakaoUserAuth.kakaoAuthId, 
          nickname: kakaoUserAuth.nickname,
          email: kakaoUserAuth.email
        },
      ])
    }catch(err) {
      console.log('err', err)
    }
  }
  let user = await getUser();

  if(kakaoUserAuth && !user) {
    await newUser()
    user = await getUser();
  }
  if(kakaoUserAuth && user && user[0].kakaoAuthId == kakaoUserAuth.kakaoAuthId) {
    req.session.userId = user[0].id;
    console.log('loginSession', req.session)
    // console.log('user', user)
    res.json(user)
  }
})

////////////////
// 습관 가져오기
router.get('/objectives',  async function(req, res, next) { 
  try {
    let mainObjective  = await supabase
    .from('mainObjective')
    .select('*')
    .eq('userId', req.query.userId)
    .eq(`schedule->${req.query.schedule}`, req.query.schedule)
    .eq('activated', req.query.activated)
    console.log(mainObjective)
    res.json(mainObjective)
  } catch(err) {
    console.log('err', err)
  }
});


////////////
// 신규습관 생성
router.post('/objective', async function(req, res, next) {
  try {
    console.log(newObjective)
    await supabase
    .from('mainObjective')
    .insert([
      { userId: req.body.userid,
        kategorie: req.body.kategorie,
        objective: req.body.objective,
        schedule: req.body.schedule,
        activated: req.body.activated
      },
    ])
  }catch(err) {
    console.log('err', err)
  }
})

/////////////////
// 습관수정
router.put('/objective', async function(req, res, next) { 
  try {
    console.log(updatedObjective)
    await supabase
    .from('mainObjective')
    .update(
      req.body.edit
    )
    .eq('userId', req.body.userId)
    .eq('id', req.body.id)
    .eq('activated', true)
  }catch(err) {
    console.log('err', err)
  }
})

//////////////////
// 습관삭제
router.delete('/objective', async function(req, res, next) {
  try {
    console.log(deletedObjective)
    await supabase
    .from('mainObjective')
    .delete()
    .eq('userId', req.body.userId)
    .eq('id', req.body.id)
    .eq('activated', req.body.activated)
  }catch(err) {
    console.log('err', err)
  }
})

module.exports = router;
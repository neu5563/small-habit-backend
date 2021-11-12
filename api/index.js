const { Router, response } = require('express');
var router = Router();
const supabase = require('../supabase.js');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
axios.defaults.withCredentials = true;
dotenv.config();

const { REST_API_KEY, REDIRECT_URI, SUPABASE_URL, SUPABASE_KEY } = process.env;


// 로그인 체크
router.get('/auth',  async function(req, res, next) {
  console.log('session', req.session)
  try {
    const user = await supabase
    .from('user')
    .select('*')
    .eq('id', req.session.userId)
    res.send(user)
  }catch(err) {
    res.send(401)
  }
});

// 카카오 로그인
router.post('/auth/kakao', async function(req, res, next) {
  const AUTHORIZE_CODE = req.query.code;
  console.log(req.session)

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
      console.log('kakaoUser', kakaoUserAuth.kakaoAuthId)
    }catch(err) {
      console.log(err)
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
    res.send(user)
  }
})




////////////////
// 목표 가져오기
router.get('/objectives',  async function(req, res, next) { 

  const match = {
    userId: req.query.userId,
    schedule: req.query.schedule,
    activated: req.query.activated
  }

  try {
    let mainObjective  = await supabase
    .from('mainObjective')
    .select('*')
    .eq('userId', req.query.userId)
    .eq(`schedule->${req.query.schedule}`, req.query.schedule)
    .eq('activated', req.query.activated)
    console.log(mainObjective)
  } catch(err) {
    console.log('err', err)
  }
});


////////////

// 신규목표 생성
router.post('/objective', async function(req, res, next) {
  const newObjective = {
    userid: req.body.userId,
    field: req.body.field,
    objective: req.body.objective,
    schedule: req.body.schedule,
    activated: req.body.activated
  };
  try {
    console.log(newObjective)
    await supabase
    .from('mainObjective')
    .insert([
      { userId: newObjective.userid,
        field: newObjective.field,
        objective: newObjective.objective,
        schedule: newObjective.schedule,
        activated: newObjective.activated
      },
    ])
  }catch(err) {
    console.log('err', err)
  }
})

/////////////////

// 목표 수정
router.put('/objective', async function(req, res, next) {
  const updatedObjective = {
    userId: req.body.userId,
    id: req.body.id,
    field: req.body.field,
    objective: req.body.objective,
    schedule: req.body.schedule,
    activated: req.body.activated,
    edit: req.body.edit
  };
  try {
    console.log(updatedObjective)
    await supabase
    .from('mainObjective')
    .update(
      updatedObjective.edit
    )
    .eq('userId', updatedObjective.userId)
    .eq('id', updatedObjective.id)
    .eq('activated', true)
  }catch(err) {
    console.log('err', err)
  }
})

///////////////

// 목표 삭제
router.delete('/objective', async function(req, res, next) {
  const deletedObjective = {
    userId: req.body.userId,
    id: req.body.id,
    field: req.body.field,
    objective: req.body.objective,
    schedule: req.body.schedule,
    activated: req.body.activated
  };
  try {
    console.log(deletedObjective)
    await supabase
    .from('mainObjective')
    .delete()
    .eq('userId', deletedObjective.userId)
    .eq('id', deletedObjective.id)
    .eq('activated', deletedObjective.activated)
  }catch(err) {
    console.log('err', err)
  }
})

module.exports = router;
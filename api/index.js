const { Router, response } = require('express');
var router = Router();
const supabase = require('../supabase.js');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config()

const { REST_API_KEY, REDIRECT_URI, SUPABASE_URL, SUPABASE_KEY } = process.env;


/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 카카오 로그인
router.get('/login/kakao', async function(req, res, next) {
  const AUTHORIZE_CODE = req.query.code;
  console.log(AUTHORIZE_CODE)
  // 토큰 받아오기
  let response;
  try {
    response = await axios({
      method: 'get',
      url: `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${AUTHORIZE_CODE}`,
    })
  }catch(err) {
    console.log(err)
  }
  let access_token = response.data.access_token;

  // 카카오에서 유저정보 받아오기
  try {
    response = await axios({
      method: 'get',
      headers: {
        "Authorization": `Bearer ${access_token}`
      },
      url: 'https://kapi.kakao.com/v2/user/me'
    })
  }catch(err) {
    console.log(err)
  }

  // 받아온 유저정보 저장
  const kakaoUserAuth = {
    kakaoAuthId: response.data.id,
    nickname: response.data.properties.nickname,
    email: response.data.kakao_account.email
  }
  console.log('kakaoUser', kakaoUserAuth)
  // 데이터 베이스에 유저가 있는지 탐색
  const getUser = async function() {
    try {
      const user = await supabase
      .from('user')
      .select('*')
      .eq('kakaoAuthId', kakaoUserAuth.kakaoAuthId)
      return user
    }catch(err) {
      console.log('err', err)
    }
  }
  let userOfDatabase = await getUser(kakaoUserAuth);

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
  if(userOfDatabase.data.kakaoAuthId != kakaoUserAuth.kakaoAuthId) {
    await newUser()
    userOfDatabase = await getUser(kakaoUserAuth);
  }
  console.log('userOf', userOfDatabase)
  res.send(userOfDatabase);
})

////////////////
// 목표 가져오기

// 오늘의 목표 가져오기
router.get('/objective/today',  async function(req, res, next) { 
  const userId = req.body.userId;

  let { data: mainObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', userId)
  .eq('activated', true)
  
  let todaysObjective = mainObjective.filter(el => {
    let today = new Date();
    let everyday = el.schedule.everyday;
    let week = el.schedule.week;
    let date = el.schedule.date;

    if(everyday === true) {
      return true
    } else if(week == true && week.includes(today.getDay())) {
      return true
    } else if(date == true && date.includes(today.getDate())) {
      return true
    } else {
      return false
    }
  }) 
  console.log(todaysObjective)
  res.send('오늘의 목표');
});

// 전체목표 가져오기
router.get('/objective/all', async function(req, res, next) {
  const userId = req.body.userId;

  let { data: allObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', userId)
  .eq('activated', true)

  console.log(allObjective)
  res.send('전체 목표')
})

// 종료된목표 가져오기
router.get('/objective/end', async function(req, res, next) {
  const userId = req.body.userId;

  let { data:endedObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', userId)
  .eq('activated', false)

  console.log(endedObjective)
  res.send('종료 목표')
})

////////////

// 신규목표 생성
router.post('/objective/create', async function(req, res, next) {
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
router.put('/objective/update', async function(req, res, next) {
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
router.delete('/objective/delete', async function(req, res, next) {
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
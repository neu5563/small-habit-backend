const axios = require('axios');
const { Router } = require('express');
var router = Router();
const supabase = require('../supabase.js');
const dotenv = require('dotenv');
dotenv.config()

const { REST_API_KEY, REDIRECT_URI, SUPABASE_URL, SUPABASE_KEY } = process.env;


/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 카카오 로그인
router.get('/login/kakao', async function(req, res, next) {

  let kakaoUserAuth = {
    id: 23423452,
    nickname: 'joogle',
    email: ''
  }; //카카오 유저 정보

  // 신규유저 정보 저장
  try {
    let { data: userAuth, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', kakaoUserAuth.id)

    if(!userAuth) {
      await supabase
      .from('user')
      .insert([
        { 
          id: kakaoUserAuth.id, 
          nickname: kakaoUserAuth.nickname, 
          email: kakaoUserAuth.email 
        }
      ])
    }
  } catch(err) {
    console.log('err', err)
  }

  res.redirect('/objective/today')
})

// 오늘의 목표 가져오기
router.get('/objective/today',  async function(req, res, next) { 
  const userId = 9245245;

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
  const userId = 9245245;

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
  const userId = 9245245;

  let { data:endedObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', userId)
  .eq('activated', false)

  console.log(endedObjective)
  res.send('종료 목표')
})

// 신규목표 생성
router.get('/objective/create', async function(req, res, next) {
  const userId = 2134234234;
  
  await supabase
  .from('mainObjective')
  .insert([
    { userId: userId,
      field: '운동',
      objective: '헬스 가기',
      schedule: {"week" : [1, 3, 5]},
      activated: true
    },
  ])

  console.log(mainObjective)
  res.send('신규 생성')
})

// 목표 수정
router.get('/objective/update', async function(req, res, next) {
  const userId = 9245245;
  const objectiveId = ''
  const edit = ''

  let { data: updatedObjective, error } = await supabase
  .from('mainObjective')
  .update({
    edit
  })
  .eq('userId', userId)
  .eq('objectiveId', objectiveId)
  .eq('activated', true)

  console.log(updatedObjective)
  res.send('목표 수정')
})

// 목표 삭제
router.get('/objective/delete', async function(req, res, next) {
  const userId = 9245245;
  const objectiveId = ''
  const edit = ''

  let { data: deletedObjective, error } = await supabase
  .from('mainObjective')
  .delete()
  .eq('userId', userId)
  .eq('objectiveId', objectiveId)
  .eq('activated', true)

  console.log(deletedObjective)
  res.send('목표 수정')
})

module.exports = router;
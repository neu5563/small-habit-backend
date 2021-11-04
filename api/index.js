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

router.get('/login/kakao', async function(req, res, next) {

  let kakaoUserAuth = {
    id: 23423452,
    nickname: 'joogle',
    email: ''
  }; //카카오 유저 정보

  let { data: userAuth, error } = await supabase
  .from('user')
  .select('*')
  .eq('id', kakaoUserAuth.id)

  // 신규유저 정보 저장
  async function newUser(id, nickname, email) {
    await supabase
    .from('user')
    .insert([
      { id, 
        nickname, 
        email 
      }
    ])
  }
  if(!userAuth) {
    newUser(kakaoUserAuth.id, kakaoUserAuth.nickname, kakaoUserAuth.email)
  }

  res.redirect('/objective/today')
})

// 오늘의 목표 가져오기
router.get('/objective/today',  async function(req, res, next) { 
  let { data: mainObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', 9245245)
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

  let { data: mainObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', 9245245)
  .eq('activated', true)

  console.log(mainObjective)
  res.send('전체 목표')
})

// 종료된목표 가져오기
router.get('/objective/end', async function(req, res, next) {

  let { data: mainObjective, error } = await supabase
  .from('mainObjective')
  .select('*')
  .eq('userId', 9245245)
  .eq('activated', false)

  console.log(mainObjective)
  res.send('종료 목표')
})


module.exports = router;
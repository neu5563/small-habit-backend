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
  if(req.session.userId) {
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', req.session.userId)
      .single()
    if(user) {
      res.send(user)
    } else {
      res.send(null)
    }
  } else {
    res.send(null)
  }
});

// 카카오 로그아웃
router.delete('/auth',  async function(req, res, next) { 
  req.session.destroy();
  res.send(200);
  console.log('logoutSession', req.session)
});

// 카카오 로그인
router.post('/auth', async function(req, res, next) {
  function getKakaoAccessToken(AUTHORIZE_CODE) {
    return new Promise(async (resolve, reject) => {
      if(AUTHORIZE_CODE) {
        try {
          let { data: { access_token }} = await axios({
            method: 'get',
            url: `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${AUTHORIZE_CODE}`,
          })

          resolve(access_token)

        } catch(err) {
          console.log('getKakaoAccessToken', err)
          reject(err)
        }
      } else {
        reject(null)
      }
    })
  }

  function getKakaoUserInfo(accessToken) {
    return new Promise(async (resolve, reject) => {
      if(accessToken) {
        try {
          let { data } = await axios({
            method: 'get',
            headers: {
              "Authorization": `Bearer ${accessToken}`
            },
            url: 'https://kapi.kakao.com/v2/user/me'
          })
          
          resolve({
            kakaoAuthId: data.id,
            nickname: data.properties.nickname,
            email: data.kakao_account.email
          })
          // console.log('kakaoUser', kakaoAuthId)
        } catch(err) {
          console.log('getKakaoUserInfo', err)
          reject(err)
        }
      } else {
        reject(null)
      }
    })
  }

  const accessToken = await getKakaoAccessToken(req.query.code)
  let kakaoUser = null
  if(accessToken) {
    kakaoUser = await getKakaoUserInfo(accessToken)
  }

  if(!kakaoUser) {
    res.sendStatus(401)
    return
  }
  
  let { data: existUser, error } = await supabase
    .from('user')
    .select('*')
    .eq('kakaoAuthId', kakaoUser.kakaoAuthId)
    .single()

  if(existUser) {
    req.session.userId = existUser.id;
    console.log('loginSession', req.session)
    res.sendStatus(200)
  } else {
    let { data: newUser, error } = await supabase
      .from('user')
      .insert([kakaoUser])
    
    if(error) {
      res.status(500).send(error)
    } else {
      req.session.userId = newUser.id;
      console.log('loginSession', req.session)
      res.sendStatus(200)
    }
  }
})

////////////////
// 습관들 가져오기
router.get('/objectives',  async function(req, res, next) { 
  if(!req.session.userId) {
    res.sendStatus(401)
    return
  }
  console.log(req.query.schedule.split(',').map(e => +e))
  let { data, error } = await supabase
    .from('mainObjective')
    .select('*')
    .eq('userId', req.session.userId)
    .eq('activated', req.query.activated)
    .overlaps(`schedule`, req.query.schedule.split(',').map(e => +e)) // 일부 포함하면 됨
  // .contains(`schedule`, [0,1,2,3,4,5,6]) // 모두 포함해야 됨
  console.log(data)
  if(error) {
    console.log(error)
    res.status(500).send(error)
  } else {
    res.send(data)
  }
});

// 습관 단일 가져오기
router.get('/objectives/:id',  async function(req, res, next) { 
  if(!req.session.userId) {
    res.sendStatus(401)
    return
  }
  console.log(req.query.schedule.split(',').map(e => +e))
  let { data, error } = await supabase
    .from('mainObjective')
    .select('*')
    .eq('userId', req.session.userId)
    .eq('id', req.params.id)
    .single()
  console.log(data)
  if(error) {
    console.log(error)
    res.status(500).send(error)
  } else {
    res.send(data)
  }
});

////////////
// 신규습관 생성
router.post('/objectives', async function(req, res, next) {
  if(!req.session.userId) {
    res.sendStatus(401)
    return
  }

  let { error } = await supabase
    .from('mainObjective')
    .insert({ 
      userId: req.session.userId,
      ...req.body
    })

  if(error) {
    console.log(error)
    res.status(500).send(error)
  } else {
    res.sendStatus(200)
  }
})

/////////////////
// 습관수정
router.put('/objectives/:id', async function(req, res, next) { 
  if(!req.session.userId) {
    res.sendStatus(401)
    return
  }
  
  let { error } = await supabase
    .from('mainObjective')
    .update(req.body)
    .eq('userId', req.session.userId)
    .eq('id', req.params.id)
    .eq('activated', true)

  if(error) {
    console.log(error)
    res.status(500).send(error)
  } else {
    res.sendStatus(200)
  }
})

//////////////////
// 습관삭제
router.delete('/objectives/:id', async function(req, res, next) {
  if(!req.session.userId) {
    res.sendStatus(401)
    return
  }
  
  let { error } = await supabase
    .from('mainObjective')
    .delete()
    .eq('userId', req.session.userId)
    .eq('id', req.params.id)

  if(error) {
    console.log(error)
    res.status(500).send(error)
  } else {
    res.sendStatus(200)
  }
})

// router.delete('/objectives', async function(req, res, next) {
//   if(!req.session.userId) {
//     res.sendStatus(401)
//     return
//   }

//   // DELETE /objectives?id=1
  
//   let { error } = await supabase
//     .from('mainObjective')
//     .delete()
//     .eq('userId', req.session.userId)
//     .in('id', req.query.ids.split(',').map(e => +e))

//   if(error) {
//     console.log(error)
//     res.status(500).send(error)
//   } else {
//     res.sendStatus(200)
//   }
// })

module.exports = router;
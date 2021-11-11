const axios = require('axios');

let createdObjective = {
  userId: 1,
  field: '돈관리',
  objective: '매일 커피 1잔 덜마시기',
  schedule: {
    everyday: true
  },
  activated: true
}
const createObjective = function(req) {
  try {
    axios({
      method: 'post',
      url: 'http://localhost:3000/objective/create',
      data: { 
        userId: req.userId,
        field: req.field,
        objective: req.objective,
        schedule: req.schedule,
        activated: req.activated
      },
      headers: {
        "Content-Type": `application/json`,
      },
    });    
  }
  catch (err) {
    console.log(err);
  }
}
// createObjective(createdObjective);

let updatedObjective = {
  userId: 1,
  id: 5,
  field: '돈관리',
  objective: '하루에 10000원식 저금하기',
  schedule: {
    everyday: true
  },
  activated: true,
  edit: {
    objective: '하루에 20000원식 저금하기'
  }
}
const updateObjective = function(req) {
  try {
    axios({
      method: 'put',
      url: 'http://localhost:3000/objective/update',
      data: { 
        userId: req.userId,
        id: req.id,
        field: req.field,
        objective: req.objective,
        schedule: req.schedule,
        activated: req.activated,
        edit: req.edit
      },
      headers: {
        "Content-Type": `application/json`,
      },
    });    
  }
  catch (err) {
    console.log(err);
  }
}
// updateObjective(updatedObjective);

let deletedObjective = {
  userId: 1,
  id: 7,
  field: '돈관리',
  objective: '매일 100원 저금하기',
  schedule: {
    everyday: true
  },
  activated: false
}
const deleteObjective = function (req) {
  try {
    axios({
      method: 'delete',
      url: 'http://localhost:3000/objective/delete',
      data: { 
        userId: req.userId,
        id: req.id,
        field: req.field,
        objective: req.objective,
        schedule: req.schedule,
        activated: req.activated
      },
      headers: {
        "Content-Type": `application/json`,
      },
    });    
  }
  catch (err) {
    console.log(err);
  }
}
// deleteObjective(deletedObjective);
const user = {
  userId: 10,
  schedule: 6
}

const objectives = async function(req) {
  try {
    const response = await axios({
      method: 'get',
      url: 'http://localhost:3000/objectives',
      params: {
        userId: req.userId,
        schedule: req.schedule
      }
    }); 
    console.log('res', response)   
  }
  catch (err) {
    console.log(err);
  }
}
objectives(user)



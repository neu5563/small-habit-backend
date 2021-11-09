const supabase = require('../supabase.js');
const dotenv = require('dotenv');
dotenv.config()

const { REST_API_KEY, REDIRECT_URI, SUPABASE_URL, SUPABASE_KEY } = process.env;

async function main(query) {
  let userId = 10
  let match = {
    activated: true
  }

  if(query?.userId) {
    match.userId = userId
  }

  const { data } = await supabase
  .from('mainObjective')
  .select('*')
  .match(match)

  console.log(data)
}

// main({ userId: 10 })
main()
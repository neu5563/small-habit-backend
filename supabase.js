const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config()

// Create a single supabase client for interacting with your database 

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
module.exports = supabase;

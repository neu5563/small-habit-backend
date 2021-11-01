import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config()

// Create a single supabase client for interacting with your database 

const supabaseUrl = 'https://qoxbxveaabctgnriktyr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDc5MTIzMywiZXhwIjoxOTUwMzY3MjMzfQ.tskcqRa1VLvccLdLgeLZkbYvohboQz9xTc6-jUXsWlA'

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;










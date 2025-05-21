import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = 'https://bjzvuehxlsgffpduyypy.supabase.co';  // Your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqenZ1ZWh4bHNnZmZwZHV5eXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTU4MzAsImV4cCI6MjA2MzM3MTgzMH0.EQXk-n8TtCKud01KzXFMtxvTE_mtz_5fxeM_27VPCiQ'; // Your Supabase API key

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
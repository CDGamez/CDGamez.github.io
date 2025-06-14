    const SUPABASE_URL = "https://qvuoiokplvfjjenusagl.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dW9pb2twbHZmamplbnVzYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1MjQsImV4cCI6MjA2NTMzMjUyNH0.3rzk3w9Ju1svH9fq3i50Ehg4Q0EfX8CQVGVH8sRCxa4";

    // Load Supabase JS dynamically
    function loadSupabaseScript(callback) {
        if (window.supabase) return callback(); // already loaded
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js";
        script.onload = () => callback();
        script.onerror = () => alert("Failed to load Supabase SDK.");
        document.head.appendChild(script);
    }

    loadSupabase(() => {
        // Now safe to use supabase
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        // Example query: get data from "cards" table
        supabase.from('cards').select('*').then(({ data, error }) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Data:', data);
            }
        });
});

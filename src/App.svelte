<script>
  let userInput = '';
  let response = '';

  // @ts-ignore
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  async function sendMessage() {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userInput }],
      }),
    });

    const data = await res.json();
    response = data.choices?.[0]?.message?.content || 'No response';
  }
</script>


<main>
  <h1>ChatGPT in Svelte (no backend)</h1>
  <input bind:value={userInput} placeholder="Ask a question..." />
  <button on:click={sendMessage}>Send</button>
  <p><strong>Response:</strong> {response}</p>
</main>

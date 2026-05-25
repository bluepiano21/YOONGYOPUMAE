const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const headMatch = data.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (!headMatch) {
      console.log('No head tag found');
      return;
    }
    const headContent = headMatch[1];
    const linkMatches = headContent.match(/<link[^>]*>/g) || [];
    console.log('--- LINK TAGS IN HEAD ---');
    linkMatches.forEach((link, idx) => {
      console.log(`${idx + 1}: ${link}`);
    });
  });
}).on('error', (err) => {
  console.error('Error fetching page:', err.message);
});

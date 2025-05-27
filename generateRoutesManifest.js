const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const outputFile = path.join(__dirname, 'routes.json');

if (!fs.existsSync(routesDir)) {
  console.error(`Error: routes directory "\${routesDir}" not found.`);
  process.exit(1);
}

const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.html'))
  .map(file => file.replace('.html', ''));

fs.writeFileSync(outputFile, JSON.stringify(routeFiles, null, 2));
console.log('Generated routes.json:', routeFiles);
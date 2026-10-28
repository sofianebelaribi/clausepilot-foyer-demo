// Rebuild a single HTML artifact from versioned modular browser sources.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.src.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const order=['policy.js','inference.js','app.js'];
const strip=file=>fs.readFileSync(path.join(root,'src',file),'utf8').replace(/^import\s+.*?\s+from\s+['"].*?['"];?\s*$/gm,'').replace(/^export\s+(?=(const|function|class)\s)/gm,'').replace(/^\n+/,'');
const js=order.map(strip).join('\n\n');
if(js.includes('</script'))throw new Error('Invalid script');
const result=html.replace('<!-- STYLES -->','<style>\n'+css+'\n</style>').replace('<!-- APP -->','<script>\n'+js+'\n</script>');
if(result.includes('<!-- STYLES -->')||result.includes('<!-- APP -->'))throw new Error('Missing build marker');
fs.writeFileSync(path.join(root,'index.html'),result);
console.log('Built '+Buffer.byteLength(result)+' bytes.');
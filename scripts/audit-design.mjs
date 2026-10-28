import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8'),html=fs.readFileSync(path.join(root,'index.src.html'),'utf8'),app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
const checks=[['no gradient',!/linear-gradient|radial-gradient|gradient-text/i.test(css)],['no Inter/Geist defaults',!/(\bInter\b|\bGeist\b)/.test(css)],['focus ring',css.includes(':focus-visible')],['mobile layout',css.includes('@media(max-width:730px)')],['no template hero',!/(hero|feature-grid|kicker)/i.test(html)],['no ornamental KPI',!/(signalReferences|signalQuestions|overview-item)/.test(html)],['human review required',html.includes('Validation humaine requise')],['stale export blocked',app.includes("$('#exportButton').disabled=true")],['PDF citation links',app.includes('enc(c.href)')]];
for(const [name,pass] of checks)console.log((pass?'PASS':'FAIL')+' '+name);
if(checks.some(([,pass])=>!pass))process.exitCode=1;

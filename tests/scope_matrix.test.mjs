import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {assess} from '../src/inference.js';
const cases=[
['communal theft unknown particulars','Vol de vélo dans un local commun non fermé à clé',{lockedRoom:'no'},'review'],
['communal theft locked room no option','Vol de vélo local commun',{lockedRoom:'yes',mobilityPack:'unknown'},'review'],
['candle heat evolving','Bougie fondue sur une table de jardin',{gardenPack:'yes',eventSudden:'unknown'},'review'],
['garden option absent','Bougie fondue sur une table de jardin',{gardenPack:'no'},'negative'],
['bike station no lock','Vol de vélo devant la gare',{publicSpace:'yes',mobilityPack:'yes',approvedLock:'no'},'negative'],
['bike station with lock','Vol de vélo devant la gare',{publicSpace:'yes',mobilityPack:'yes',approvedLock:'yes'},'possible'],
['burglary cover unknown','Vol par effraction dans mon appartement',{},'review'],
['burglary cover subscribed','Vol par effraction dans mon appartement',{theftOption:'yes'},'possible'],
['out of scope car','Ma voiture a un pare-brise fissuré.',{},'review'],
['out of scope animal','Mon chien a mordu quelqu’un.',{},'review'],
['out of scope water','Mon lave-linge fuit et inonde la cuisine.',{},'review']
];
for(const [name,description,extra,status] of cases){
 test(name,()=>{
  const r=assess({description,...extra});
  assert.equal(r.status,status);
  assert.equal(r.autoDecision,false);
  assert(r.decisionRule);
  assert(r.clauses.length>0);
  assert(r.clauses.every(c=>c.href.includes('#page='+c.page)));
  assert(r.gaps.length>0,'Manual reviewer must have outstanding checks');
 });
}

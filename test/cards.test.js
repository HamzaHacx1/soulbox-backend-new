const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assets=require('../webflow/assets.json');
const results=require('../src/services/results');
const window={SOULBOX_ASSETS:assets};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webflow/src/cards.js'),'utf8'),{window});
const cards=window.SoulBoxCards;
const yearnings=['To be loved','To belong','To be seen','To feel worthy','To feel peace','To be free','To change','To discover','To leave an impact','To redeem','To preserve'];
test('all texture, motivation, style, House and SoulCharacter combinations have separate September asset mappings',()=>{
 for(const [texture,house] of Object.entries(results.HOUSE_BY_TEXTURE)){
  for(const yearning of yearnings){
   const soul=results.computeSoulCharacter(texture,yearning);
   for(const why of Object.keys(results.WHY_SLUGS)){
    for(const style of ['Devourer','Sprinter','Deep Runner','Immersed','Reader','Contemplative','Lingerer','Measured','Devoted']){
     const result={texture,house,why,style,soulCharacter:soul.name,images:{soulCharacter:'soulcharacter_'+soul.slug+'.png'}};
     const display=cards.displayCards(result),files=cards.downloads(result);
     assert.equal(display.length,6);assert.equal(files.length,6);
     files.forEach(f=>assert.match(f.url,/\.png$/));
     display.forEach(f=>assert.match(f.url,/\.jpg$/));
     assert.match(files[0].name,/^soulcharacter_/);assert.equal(files[5].name,'house_of_'+house.toLowerCase()+'.png');
    }
   }
  }
 }
});
test('all embedded scripts parse and generated pages stay below Webflow custom code limits',()=>{
 for(const file of fs.readdirSync(path.join(__dirname,'../webflow/dist'))){
  const html=fs.readFileSync(path.join(__dirname,'../webflow/dist',file),'utf8');
  assert.ok(html.length<50000,file+' exceeds Webflow limit');
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:file});
 }
});

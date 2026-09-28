const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const assets=JSON.parse(fs.readFileSync(path.join(root,'assets.json'),'utf8'));
const cards=fs.readFileSync(path.join(root,'src/cards.js'),'utf8');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const name of ['results','success','curator','home','about','sales']){
 let html=fs.readFileSync(path.join(root,'src',name+'.html'),'utf8');
 const selected=name==='success'?{download:assets.download}:assets;
 html=html.replace('<!-- CARDS_SCRIPT -->','<script>window.SOULBOX_ASSETS='+JSON.stringify(selected)+';</script>\n<script>'+cards+'</script>');
 fs.writeFileSync(path.join(root,'dist',name+'.html'),html);
 console.log(name,html.length);
}

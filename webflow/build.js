const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const assets=JSON.parse(fs.readFileSync(path.join(root,'assets.json'),'utf8'));
const giftImages=JSON.parse(fs.readFileSync(path.join(root,'gift-assets.json'),'utf8'));
const cards=fs.readFileSync(path.join(root,'src/cards.js'),'utf8');
const tracking=fs.readFileSync(path.join(root,'src/tracking.js'),'utf8');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const name of ['results','success','curator','home','about','sales','gift']){
 let html=fs.readFileSync(path.join(root,'src',name+'.html'),'utf8');
 const selected=name==='success'?{download:assets.download}:assets;
 html=html.replace('<!-- CARDS_SCRIPT -->','<script>window.SOULBOX_ASSETS='+JSON.stringify(selected)+';</script>\n<script>'+cards+'</script>');
 html=html.replace('<!-- TRACKING_SCRIPT -->','<script>'+tracking+'</script>');
 // Only files with a hosted URL are included; the rest show a labelled placeholder.
 const hosted=Object.fromEntries(Object.entries(giftImages).filter(([,url])=>url));
 html=html.replace('<!-- GIFT_IMAGES -->','<script>window.SOULBOX_GIFT_IMAGES='+JSON.stringify(hosted)+';</script>');
 fs.writeFileSync(path.join(root,'dist',name+'.html'),html);
 console.log(name,html.length);
}

import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const [outDir, spec] = process.argv.slice(2);
const root = path.resolve("web"), mime={".js":"text/javascript",".html":"text/html",".json":"application/json"};
const srv = http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]); const f=u.startsWith("/node_modules/")?path.resolve("."+u):path.join(root,u); fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{"content-type":mime[path.extname(f)]||"application/octet-stream"}); r.end(d);});}).listen(0);
const port = srv.address().port;
const frames = [];
for (const part of spec.split(",")) { if (part.includes("-")) { const [a,b]=part.split("-").map(Number); for(let i=a;i<=b;i++) frames.push(i);} else frames.push(Number(part)); }
fs.mkdirSync(outDir,{recursive:true});
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", args:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--js-flags=--max-old-space-size=4096"] });
const pg = await b.newPage({ viewport:{width:1080,height:1920} });
pg.on("console", m=>{ if(m.type()==="error"||m.type()==="warning") console.log("PAGE", m.text().slice(0,300)); }); pg.on("pageerror", e=>console.log("ERR", e.message));
await pg.goto(`http://localhost:${port}/index.html`); await pg.waitForFunction("window.ready===true",{timeout:120000});
const t0=Date.now(); let n=0;
for (const f of frames) {
  const out = path.join(outDir, `f${String(f).padStart(4,"0")}.jpg`);
  if (process.env.RESUME && fs.existsSync(out)) continue;
  const data = await pg.evaluate((f)=>{ window.renderFrame(f); return document.querySelector("canvas").toDataURL("image/jpeg",0.95); }, f);
  fs.writeFileSync(out, Buffer.from(data.split(",")[1],"base64")); n++;
  if (n%10===0) console.log(`frame ${f} done, ${((Date.now()-t0)/n/1000).toFixed(2)} s/frame`);
}
console.log("DONE", n, "frames", ((Date.now()-t0)/1000).toFixed(1),"s");
await b.close(); srv.close();

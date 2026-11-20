import { chromium } from "playwright"; import http from "http"; import fs from "fs"; import path from "path";
const [page,out,w,h]=process.argv.slice(2);
const root=path.resolve("web"),mime={".js":"text/javascript",".html":"text/html"};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const f=u.startsWith("/node_modules/")?path.resolve("."+u):path.join(root,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{"content-type":mime[path.extname(f)]||"application/octet-stream"});r.end(d);});}).listen(0);
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"});
const pg=await b.newPage({viewport:{width:+w,height:+h}}); pg.on("pageerror",e=>console.log("ERR",e.message));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction("window.done===true");
const data=await pg.evaluate(()=>document.querySelector("canvas").toDataURL("image/png"));
fs.writeFileSync(out,Buffer.from(data.split(",")[1],"base64")); await b.close(); srv.close();

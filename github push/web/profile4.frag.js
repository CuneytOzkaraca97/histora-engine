if(kind==='profile4'){
  cv.width=cv.height=800; const C=400, NAVY="#1F3A5F", GOLD="#D9A441", PAPER="#F3E6C8";
  const star=(x,y,r,col)=>{g.beginPath(); for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2, rr=i%2?r*0.38:r; g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);} g.closePath(); g.fillStyle=col; g.fill();};
  const moon=(x,y,r,col,bg)=>{g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fillStyle=col; g.fill(); g.beginPath(); g.arc(x+r*0.45,y-r*0.25,r*0.85,0,Math.PI*2); g.fillStyle=bg; g.fill();};
  const V=[
    {sky0:"#0F1E3D", sky1:"#1F3A5F", day:"#7EC8F0", dayGlow:"#FFE9A8", split:true},
    {sky0:"#0B1430", sky1:"#24325E", day:null, dayGlow:"#FFE29A", split:false},
    {sky0:"#3A1E4F", sky1:"#E2573A", day:null, dayGlow:"#FFE0A0", split:false, warm:true},
  ][idx];
  g.save(); g.beginPath(); g.arc(C,C,400,0,Math.PI*2); g.clip();
  // sky
  if(V.split){
    g.fillStyle=V.sky1; g.fillRect(0,0,800,800);
    g.save(); g.beginPath(); g.moveTo(0,0); g.lineTo(400,0); g.lineTo(400,800); g.lineTo(0,800); g.closePath(); g.clip();
    const gd=g.createLinearGradient(0,0,0,800); gd.addColorStop(0,"#5AB4E8"); gd.addColorStop(1,"#FFD27A"); g.fillStyle=gd; g.fillRect(0,0,400,800); g.restore();
    const gn=g.createLinearGradient(400,0,800,800); gn.addColorStop(0,V.sky0); gn.addColorStop(1,V.sky1); g.fillStyle=gn; g.fillRect(400,0,400,800);
  } else {
    const gr=g.createLinearGradient(0,0,0,800); gr.addColorStop(0,V.sky0); gr.addColorStop(1,V.sky1); g.fillStyle=gr; g.fillRect(0,0,800,800);
  }
  // stars + moon (night side)
  let s=11; const r=()=>{s=(s*16807)%2147483647; return s/2147483647;};
  for(let i=0;i<46;i++){ const x=r()*800, y=r()*560; if(V.split && x<400) continue; if(Math.hypot(x-C,y-300)<240) continue; star(x,y,4+r()*9,i%5?"#FFF4D0":GOLD); }
  moon(V.split?650:620,150,58,"#FFF1C4",V.split?"#13244a":(V.warm?"#45224f":"#0E1A3A"));
  if(V.split){ // clouds on the day side
    for(const [x,y,k] of [[120,170,1],[230,90,0.7]]){ g.fillStyle="#ffffff"; g.globalAlpha=0.9; g.beginPath(); g.ellipse(x,y,70*k,26*k,0,0,7); g.ellipse(x+40*k,y-18*k,44*k,26*k,0,0,7); g.fill(); g.globalAlpha=1; } }
  // radiant sun behind the head
  const sx=C, sy=320;
  const glow=g.createRadialGradient(sx,sy,60,sx,sy,330); glow.addColorStop(0,"rgba(255,245,200,0.95)"); glow.addColorStop(0.45,"rgba(255,215,120,0.55)"); glow.addColorStop(1,"rgba(255,200,100,0)");
  g.fillStyle=glow; g.beginPath(); g.arc(sx,sy,330,0,Math.PI*2); g.fill();
  for(let i=0;i<20;i++){ const a=i*Math.PI/10+0.08, r1=180, r2=i%2?250:300, w=0.07;
    g.beginPath(); g.moveTo(sx+Math.cos(a-w)*r1,sy+Math.sin(a-w)*r1); g.lineTo(sx+Math.cos(a)*r2,sy+Math.sin(a)*r2); g.lineTo(sx+Math.cos(a+w)*r1,sy+Math.sin(a+w)*r1); g.closePath();
    g.fillStyle=i%2?"#FFD36A":"#FFC23E"; g.fill(); ink(5); g.stroke(); }
  E(sx,sy,185,185,"#FFE38A",9);
  E(sx,sy,160,160,"#FFF0B8",0);
  // body: scholar robe
  g.beginPath(); g.moveTo(230,820); g.bezierCurveTo(220,560,300,470,C,470); g.bezierCurveTo(500,470,580,560,570,820); g.closePath(); g.fillStyle=NAVY; g.fill(); ink(11); g.stroke();
  g.beginPath(); g.moveTo(330,490); g.lineTo(C,600); g.lineTo(470,490); g.lineWidth=22; g.strokeStyle=GOLD; g.stroke(); g.beginPath(); g.moveTo(330,490); g.lineTo(C,600); g.lineTo(470,490); ink(5); g.stroke();
  for(const y of [640,700,760]) E(C,y,10,10,GOLD,5);
  // arms (behind hands), raised outward
  const arm=(x0,y0,x1,y1)=>{ g.beginPath(); g.moveTo(x0,y0); g.quadraticCurveTo((x0+x1)/2+(x1<C?-30:30),y0+10,x1,y1); g.lineWidth=40; g.strokeStyle=INKC; g.stroke(); g.lineWidth=26; g.strokeStyle=NAVY; g.stroke(); };
  arm(285,540,170,420); arm(515,540,630,420);
  // head
  E(C,330,118,132,"#ffe2c2",11);
  // round scholar glasses + eyes
  for(const dx of [-48,48]){ E(C+dx,318,34,34,"rgba(255,255,255,0.35)",7); E(C+dx+4,320,9,11,INKC,0); E(C+dx+7,316,3,3,"#ffffff",0); }
  g.beginPath(); g.moveTo(C-14,316); g.quadraticCurveTo(C,306,C+14,316); ink(6); g.stroke();
  g.beginPath(); g.arc(C,370,40,0.12*Math.PI,0.88*Math.PI); g.closePath(); g.fillStyle="#7a2230"; g.fill(); ink(8); g.stroke();
  g.globalAlpha=0.4; E(C-78,365,20,12,"#e8826f",0); E(C+78,365,20,12,"#e8826f",0); g.globalAlpha=1;
  // little laurel on the head
  for(let i=0;i<5;i++){ for(const sgn of [-1,1]){ const a=-Math.PI/2+sgn*(0.35+i*0.22); g.save(); g.translate(C+Math.cos(a)*120,330+Math.sin(a)*128); g.rotate(a+sgn*0.9); E(0,0,10,22,"#7DB84A",5); g.restore(); } }
  // hourglass in left hand
  const hx=150, hy=300;
  R(hx-62,hy-120,124,22,"#8a5a32",8,6); R(hx-62,hy+98,124,22,"#8a5a32",8,6);
  for(const dx of [-50,50]) R(hx+dx-6,hy-100,12,200,"#a8743f",6,4);
  g.beginPath(); g.moveTo(hx-40,hy-98); g.bezierCurveTo(hx-40,hy-30,hx-8,hy-12,hx-8,hy); g.bezierCurveTo(hx-8,hy+12,hx-40,hy+30,hx-40,hy+98); g.lineTo(hx+40,hy+98); g.bezierCurveTo(hx+40,hy+30,hx+8,hy+12,hx+8,hy); g.bezierCurveTo(hx+8,hy-12,hx+40,hy-30,hx+40,hy-98); g.closePath();
  g.fillStyle="rgba(235,248,255,0.85)"; g.fill(); ink(7); g.stroke();
  g.beginPath(); g.moveTo(hx-30,hy-55); g.quadraticCurveTo(hx,hy-40,hx+30,hy-55); g.bezierCurveTo(hx+20,hy-20,hx+5,hy-8,hx,hy); g.bezierCurveTo(hx-5,hy-8,hx-20,hy-20,hx-30,hy-55); g.fillStyle=GOLD; g.fill();
  g.fillRect(hx-2,hy,4,60); g.beginPath(); g.moveTo(hx-38,hy+96); g.quadraticCurveTo(hx,hy+40,hx+38,hy+96); g.closePath(); g.fill();
  E(170,420,30,30,"#ffe2c2",8); // left hand
  // scroll in right hand
  g.save(); g.translate(660,330); g.rotate(-0.25);
  R(-70,-110,140,220,"#F6EBCF",8,6);
  g.strokeStyle="#c9b48e"; g.lineWidth=6; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(-48,-70+k*34); g.lineTo(48-(k%2)*20,-70+k*34); g.stroke(); }
  E(0,-112,84,20,"#E8D6AE",8); E(0,112,84,20,"#E8D6AE",8);
  E(30,80,20,20,"#C8342C",6); g.restore();
  E(630,420,30,30,"#ffe2c2",8); // right hand
  g.restore();
  g.beginPath(); g.arc(C,C,394,0,Math.PI*2); g.lineWidth=12; g.strokeStyle=GOLD; g.stroke();
}


if(kind==='profile3'){
  cv.width=cv.height=800; const C=400, NAVY="#1F3A5F", GOLD="#D9A441", PAPER="#F3E6C8";
  const sky=(y0,y1,c0,c1,c2)=>{const gr=g.createLinearGradient(0,y0,0,y1); gr.addColorStop(0,c0); gr.addColorStop(0.55,c1); gr.addColorStop(1,c2); g.fillStyle=gr; g.fillRect(0,0,800,800);};
  const sun=(x,y,r)=>{const gr=g.createRadialGradient(x,y,r*0.2,x,y,r*1.9); gr.addColorStop(0,"rgba(255,240,190,1)"); gr.addColorStop(0.5,"rgba(255,220,140,0.55)"); gr.addColorStop(1,"rgba(255,200,120,0)"); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r*1.9,0,7); g.fill(); E(x,y,r,r,"#FFF1C4",0);};
  const mtn=(pts,col)=>{g.beginPath(); g.moveTo(0,800); pts.forEach(([x,y])=>g.lineTo(x,y)); g.lineTo(800,800); g.closePath(); g.fillStyle=col; g.fill();};
  const pyr=(x,base,w,h,col,shade)=>{g.beginPath(); g.moveTo(x-w/2,base); g.lineTo(x,base-h); g.lineTo(x+w/2,base); g.closePath(); g.fillStyle=col; g.fill(); if(shade){g.beginPath(); g.moveTo(x,base-h); g.lineTo(x+w/2,base); g.lineTo(x+w*0.12,base); g.closePath(); g.fillStyle=shade; g.fill();}};
  const temple=(x,base,w,h,col,dome)=>{ g.fillStyle=col; g.fillRect(x-w/2,base-h*0.12,w,h*0.12); g.fillRect(x-w/2-8,base-h,w+16,h*0.14);
    const n=6; for(let i=0;i<n;i++){g.fillRect(x-w/2+8+i*(w-16-w*0.08)/(n-1),base-h*0.86,w*0.08,h*0.74);}
    if(dome){g.beginPath(); g.arc(x,base-h,w*0.28,Math.PI,0); g.fill();} else {g.beginPath(); g.moveTo(x-w/2-12,base-h); g.lineTo(x,base-h-h*0.32); g.lineTo(x+w/2+12,base-h); g.closePath(); g.fill();}};
  const wall=(pts,col,tw)=>{ g.strokeStyle=col; g.lineWidth=tw; g.lineJoin="round"; g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.stroke();
    pts.forEach(([x,y],i)=>{ if(i%2) return; g.fillStyle=col; g.fillRect(x-tw*0.9,y-tw*2.2,tw*1.8,tw*2.4); for(let k=0;k<3;k++) g.fillRect(x-tw*0.9+k*tw*0.7,y-tw*2.6,tw*0.4,tw*0.5);});};
  g.save(); g.beginPath(); g.arc(C,C,400,0,7); g.clip();
  if(idx===0){ // sunset silhouettes
    sky(0,800,"#E85D3A","#F7A23B","#FFD27A"); sun(C,360,150);
    mtn([[0,520],[120,470],[230,520],[360,450],[470,510],[600,440],[720,500],[800,470]],"rgba(110,90,140,0.55)");
    pyr(220,640,330,250,NAVY); pyr(345,640,210,150,NAVY);
    wall([[470,640],[540,560],[610,590],[680,500],[760,520],[820,470]],NAVY,22);
    temple(C,700,230,170,NAVY,false);
    mtn([[0,660],[200,640],[400,690],[600,650],[800,680]],NAVY);
  }
  if(idx===1){ // colourful flat landscape like the reference
    sky(0,600,"#F07A3A","#F9B54C","#FFE3A0"); sun(C,280,120);
    mtn([[0,430],[90,360],[180,420],[290,350],[400,420],[520,340],[640,410],[740,350],[800,380]],"#8C9BC4");
    mtn([[0,520],[150,470],[330,520],[520,460],[700,510],[800,480]],"#7DB84A");
    pyr(230,560,260,210,"#E6C27A","#C9A25E"); pyr(110,560,160,120,"#E6C27A","#C9A25E");
    g.fillStyle="#5DA1C9"; g.beginPath(); g.moveTo(330,800); g.bezierCurveTo(420,700,330,620,450,560); g.lineTo(480,560); g.bezierCurveTo(380,640,470,710,400,800); g.fill();
    wall([[500,580],[560,520],[620,545],[680,470],[740,490],[800,430]],"#B87A4B",18);
    mtn([[0,640],[120,600],[300,660],[520,610],[800,650]],"#5F9E3B");
    temple(250,700,200,150,"#D9824A",true);
  }
  if(idx===2){ // bold single pyramid
    sky(0,800,"#E2573A","#F49B3C","#FFD57E"); sun(C,330,190);
    mtn([[0,600],[200,560],[400,600],[600,550],[800,590]],"#E6B266");
    pyr(C,640,520,330,NAVY,"#163050");
    g.strokeStyle="#2c4c74"; g.lineWidth=6; for(let k=1;k<6;k++){const y=640-k*55, hw=260*(1-k*55/330); g.beginPath(); g.moveTo(C-hw,y); g.lineTo(C+hw,y); g.stroke();}
    mtn([[0,680],[260,640],[540,690],[800,650]],"#C98B45");
  }
  if(idx===3){ // badge ring + scene
    sky(0,800,"#E85D3A","#F7A23B","#FFD27A"); sun(C,370,110);
    pyr(290,560,230,170,NAVY); pyr(380,560,140,100,NAVY);
    wall([[460,560],[520,500],[580,520],[640,450]],NAVY,18);
    temple(C,600,170,120,NAVY,false); mtn([[0,590],[300,580],[500,600],[800,580]],NAVY);
    g.beginPath(); g.arc(C,C,400,0,7); g.arc(C,C,290,0,7,true); g.fillStyle=NAVY; g.fill("evenodd");
    g.beginPath(); g.arc(C,C,290,0,7); g.lineWidth=10; g.strokeStyle=GOLD; g.stroke();
    const ring=(t,r,size,top)=>{g.font=`${size}px LG`; g.fillStyle=PAPER; g.textAlign="center"; g.textBaseline="middle"; const tot=[...t].reduce((a,c)=>a+g.measureText(c).width,0)*1.08;
      let a=top? -Math.PI/2-tot/r/2 : Math.PI/2+tot/r/2; for(const ch of t){const w=g.measureText(ch).width*1.08; a+=(top?1:-1)*w/2/r; g.save(); g.translate(C+Math.cos(a)*r,C+Math.sin(a)*r); g.rotate(top?a+Math.PI/2:a-Math.PI/2); g.fillText(ch,0,0); g.restore(); a+=(top?1:-1)*w/2/r;}};
    ring("HISTORA",345,74,true); ring("ORIGINALS",345,62,false); for(const a of [Math.PI,0]) E(C+Math.cos(a)*345,C,10,10,GOLD,0);
  }
  if(idx===4){ // roman arch window
    g.fillStyle=PAPER; g.fillRect(0,0,800,800);
    g.save(); g.beginPath(); g.moveTo(230,720); g.lineTo(230,330); g.arc(C,330,170,Math.PI,0); g.lineTo(570,720); g.closePath(); g.clip();
    sky(160,720,"#E85D3A","#F7A23B","#FFD27A"); sun(C,380,90);
    pyr(330,610,200,150,NAVY); pyr(420,610,120,85,NAVY); wall([[450,610],[500,560],[560,575],[600,520]],NAVY,15);
    mtn([[0,640],[400,620],[800,640]],NAVY); g.restore();
    g.beginPath(); g.moveTo(230,720); g.lineTo(230,330); g.arc(C,330,170,Math.PI,0); g.lineTo(570,720); g.lineWidth=26; g.strokeStyle=NAVY; g.stroke();
    for(let i=0;i<9;i++){const a=Math.PI+i*Math.PI/8; g.save(); g.translate(C+Math.cos(a)*190,330+Math.sin(a)*190); g.rotate(a+Math.PI/2); R(-22,-14,44,28,GOLD,6,4); g.restore();}
    R(190,710,420,40,NAVY,0,6);
  }
  g.restore(); g.beginPath(); g.arc(C,C,394,0,7); g.lineWidth=12; g.strokeStyle=NAVY; g.stroke();
}


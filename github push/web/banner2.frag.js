if(kind==='banner2'){
  // YouTube: whole image 2560x1440 shows on TV; desktop shows the full-width strip y 508-931; all devices show the centred 1546x423 box.
  cv.width=2560; cv.height=1440; const W=2560, NAVY="#1F3A5F", GOLD="#D9A441", PAPER="#F3E6C8", CY=720;
  const EXS=["grin","smile","grin","shock","grin","smile","grin","smile"];
  const logoStrip=(c1,c2)=>{ text(NAME1,1280,CY-62,fit(NAME1,640,140),c1,20); text(NAME2,1280,CY+70,fit(NAME2,640,112),c2,18); };
  if(idx===0){ // timeline
    g.fillStyle=PAPER; g.fillRect(0,0,W,1440); speck(2200,["#d8c08f","#fff6e0"]);
    g.fillStyle="#EADBB8"; g.fillRect(0,508,W,423);
    g.fillStyle=NAVY; g.fillRect(0,872,W,10);
    const keys=["pharaoh","roman","viking","knight","napoleon","explorer","ww1"];
    const xs=[230,440,650,860,1700,1910,2120];
    const years={pharaoh:"1300 BC",roman:"50 BC",viking:"900",knight:"1350",napoleon:"1805",explorer:"1890",ww1:"1916"};
    keys.forEach((k,i)=>{ char(k,xs[i],862,0.36,{expr:EXS[i],wave:i%2?0.8:undefined,seed:i+3}); E(xs[i],877,13,13,GOLD,6);
      g.font="30px LG"; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=NAVY; g.fillText(years[k],xs[i],910); });
    g.save(); g.translate(2330-0.36*400,862-0.36*975); g.scale(0.36,0.36); emu(new Pen(g),{mode:"stand",expr:"smug",chest:1,seed:3}); g.restore();
    E(2330,877,13,13,GOLD,6); g.font="30px LG"; g.fillStyle=NAVY; g.fillText("1932",2330,910);
    logoStrip("#FFFFFF",GOLD);
  }
  if(idx===1){ // museum wall
    g.fillStyle="#DCE8D2"; g.fillRect(0,0,W,1440); g.fillStyle="#C6D9B9"; for(let x=0;x<W;x+=80) g.fillRect(x,0,40,1440);
    g.fillStyle="#C8643C"; g.fillRect(0,960,W,480); g.fillStyle=INKC; g.fillRect(0,955,W,10); g.fillStyle="#a54f2c"; for(let x=0;x<W;x+=320) g.fillRect(x+20,1010,280,300);
    const frames=[["pharaoh",420],["roman",700],["viking",980],["knight",1580],["napoleon",1860],["explorer",2140]];
    frames.forEach(([k,x],i)=>{ const w=230,h=300,y=568; R(x-w/2-20,y-20,w+40,h+40,GOLD,9,6); R(x-w/2,y,w,h,"#F4EAD2",7,2);
      g.save(); g.beginPath(); g.rect(x-w/2,y,w,h); g.clip(); bust(k,x,y+140,0.74,{expr:EXS[i]}); g.restore(); });
    R(1280-250,560,500,320,GOLD,11,16); R(1280-226,584,452,272,"#7a5a32",7,10);
    text(NAME1,1280,CY-48,fit(NAME1,400,110),"#FFFFFF",16); text(NAME2,1280,CY+56,fit(NAME2,400,86),"#F2C14E",14);
  }
}


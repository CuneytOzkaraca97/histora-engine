import sys, numpy as np, subprocess, wave
SR=48000
def load(p):
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).astype(np.float64)
def grms(x,blk=0.1,gate_db=-30):
    B=int(blk*SR); k=len(x)//B; r=np.sqrt((x[:k*B].reshape(k,B)**2).mean(1)+1e-12); keep=r>r.max()*10**(gate_db/20)
    return np.sqrt((r[keep]**2).mean())
db=lambda a:20*np.log10(a+1e-12)
v,m,s=[load(p) for p in sys.argv[1:4]]
L=len(v); m=np.pad(m,(0,max(0,L-len(m))))[:L]; s=np.pad(s,(0,max(0,L-len(s))))[:L]
gv=grms(v); m*=0.5*gv/grms(m); s*=0.5*gv/grms(s)
cap=0.7*np.abs(v).max()
if np.abs(s).max()>cap: s*=cap/np.abs(s).max()
print(f"voice gRMS {db(gv):.1f} dBFS | music vs voice {db(grms(m))-db(gv):+.1f} dB | sfx vs voice {db(grms(s))-db(gv):+.1f} dB | sfx peak/voice peak {np.abs(s).max()/np.abs(v).max():.2f}")
mix=v+m+s
w=wave.open("work/mix.wav","wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix/ max(1,np.abs(mix).max()) ,-1,1)*32767).astype(np.int16).tobytes()); w.close()
print("peak", np.abs(mix).max())

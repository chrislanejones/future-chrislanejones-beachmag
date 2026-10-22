import math, random, wave, struct
from pathlib import Path
random.seed(18)
rate=22050
beat=60/96
duration=beat*32
data=[0.0]*int(rate*duration)
def add(start,length,fn):
    offset=int(start*rate)
    for j in range(min(int(length*rate),len(data)-offset)):
        data[offset+j]+=fn(j/rate)
for step in range(64):
    t=step*beat/2
    add(t,.065,lambda x:(random.random()*2-1)*math.exp(-x*85)*.075)
    if step%8 in (0,3,4):
        add(t,.28,lambda x:math.sin(2*math.pi*(48*x+9*(1-math.exp(-x*22))))*math.exp(-x*15)*.42)
    if step%8 in (2,6):
        add(t,.15,lambda x:((random.random()*2-1)*.19+math.sin(2*math.pi*180*x)*.07)*math.exp(-x*26))
    if step%2==0:
        notes=[110,110,130.8128,98]
        freq=notes[(step//16)%4]
        add(t,.24,lambda x,f=freq:math.sin(2*math.pi*f*x)*math.sin(min(1,x/.01)*math.pi/2)*math.exp(-x*9)*.19)
for bar,root in enumerate([220,220,261.6256,196]*2):
    for k in (0,3,7):
        f=root*2**(k/12)
        add(bar*4*beat,1.8,lambda x,f=f:(math.sin(2*math.pi*f*x)+.3*math.sin(2*math.pi*2*f*x))*min(1,x/.02)*math.exp(-x*2.6)*.045)
out=Path('outputs/coastal-demo.wav')
with wave.open(str(out),'wb') as w:
    w.setparams((1,2,rate,0,'NONE','not compressed'))
    w.writeframes(b''.join(struct.pack('<h',int(max(-.95,min(.95,v)) *32767)) for v in data))
print(f'Original instrumental demo: {duration:.0f} seconds')

#!/bin/bash
set -e
cd "$(dirname "$0")"
I=$(ffmpeg -hide_banner -nostats -i work/mix.wav -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep "I:" | awk '{print $2}')
G=$(python3 -c "print(-12.7-($I))")
echo "mix integrated $I LUFS, gain $G dB"
ffmpeg -v error -y -i work/mix.wav -af "volume=${G}dB,alimiter=limit=0.891:level=false:attack=5:release=50" -ar 48000 -ac 2 work/master.wav
ffmpeg -v error -y -framerate 30 -i ${FRAMES:-frames}/f%04d.jpg -i work/master.wav -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart -metadata title="$1" "out/$2"
ffmpeg -hide_banner -nostats -i "out/$2" -vf "freezedetect=n=0.001:d=0.4,blackdetect=d=0.1" -af ebur128=peak=true -f null - 2>&1 | grep -E "freeze_|black_|I:|Peak:" | tail -8
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$2"

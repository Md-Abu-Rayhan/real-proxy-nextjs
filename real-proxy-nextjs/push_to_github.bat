@echo off
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/Md-Abu-Rayhan/real-proxy-nextjs.git
git push -u origin main

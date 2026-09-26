@echo off
title Portfolio Local Server
echo ========================================================
echo  Building Knowledge Graph & Starting Hugo Dev Server...
echo  Site URL: http://localhost:1313
echo  Graph URL: http://localhost:1313/graph/
echo ========================================================
call npm.cmd run build:graph
hugo server -D
pause

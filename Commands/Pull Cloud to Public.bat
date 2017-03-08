@echo off
echo.
echo This downloads files from cloud and doesn't delete anything here (friendly).
echo.
echo Are you sure?
echo.
pause
echo rclone copy amazon:Public ../../Public
rclone copy amazon:Public ../../Public
pause

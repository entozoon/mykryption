@echo off
echo.
echo This copies files to the cloud and doesn't delete anything there (friendly).
echo.
echo Are you sure?
echo.
pause
echo rclone copy ../../Public amazon:Public
rclone copy ../../Public amazon:Public
pause

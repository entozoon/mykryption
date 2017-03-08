@echo off
echo.
echo This copies files to the cloud and doesn't delete anything there (friendly).
echo.
echo Are you sure?
echo.
pause
cd ../..
echo rclone copy Commands amazon:Commands
rclone copy Commands amazon:Commands
cd Commands
pause

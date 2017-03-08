@echo off
echo.
echo This is called 'sync' but is brutal - it only modifies the cloud, copying files from local to the cloud AND deleting files there when they don't exist locally.
echo.
echo It DOESN'T download files.
echo.
echo Are you sure?
echo.
pause
echo.
echo Are you REALLY sure? I mean, you probably never need this.
echo.
pause
echo rclone sync ../../Public amazon:Public
rclone sync ../../Public amazon:Public
pause

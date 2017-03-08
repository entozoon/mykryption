@echo off
echo.
echo This is called 'sync' but is brutal - it actually only modifies the cloud, copying files from local to the cloud AND deleting files when they don't exist locally.
echo.
echo It DOESN'T download files.
echo.
echo Are you sure?
echo.
pause
echo rclone sync ../../Public amazon:Public
rclone sync ../../Public amazon:Public
pause

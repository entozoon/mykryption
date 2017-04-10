@echo off
echo.
echo This downloads the log from cloud. Should be done before pushing on another computer.
echo (single file, not all the backup versions)
echo.
echo Are you sure?
echo.
pause
echo rclone copy amazon:Public/mykryption_log/mykryption.log.json ../../Public/mykryption_log
rclone copy amazon:Public/mykryption_log/mykryption.log.json ../../Public/mykryption_log
pause

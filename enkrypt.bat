@echo off

echo.
echo  Enkryption
echo.

if [%1]==[] (
	echo  Drag and drop a file onto this .bat,set it as the 'open with' application, or pass as parameter
	echo.
	goto :done
)

echo  %1
echo.

set /p pass="Password: "

set befuddled=%random%%random%%random%%random%%random%

REM 	a            Add File
REM 	-mx0         No compression
REM 	-mhe=on      Filename enkryption
REM 	-mmt=on      Enable multithreading
REM 	-v2000m      Split into file chunks (e.g. 2000mb) (AD has 50gb max)
REM 	-sdel        Delete after compression!
REM 	-p[password]
REM 	output
REM 	input
echo 7z a -mx0 -mhe=on -mmt=on -v2000m -p%pass% %befuddled%.mdata %1
7z a -mx0 -mhe=on -mmt=on -v2000m -p%pass% %befuddled%.mdata %1

:done
timeout 9

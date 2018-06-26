@echo off

echo.
echo  Dekryption
echo.

if [%1]==[] (
	echo Drag and drop a file onto this .bat or set it as the 'open with' application.
	echo.
	goto :done
)

echo  %1
echo.

set /p pass="Password: "

REM x    Extract, with full paths (x not e) so /Public contains just flat files
REM      which actually extract out to their original folder paths from
REM      the POV of say m:\Cloud in this example
REM -y   Assume yes to all queries (i.e. replace existing files)
REM -bb1 Increase log level to show output filenames

echo 7z x -y -bb1 -p%pass% %1
7z x -y -bb1 -p%pass% %1

:done
timeout 9

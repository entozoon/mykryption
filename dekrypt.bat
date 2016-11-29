@echo off

REM set path=%~d0%~p0

if "%1"=="" (
	echo.
	echo Dekryption
	echo.
	echo Drag and drop a file onto this .bat or set it as the 'open with' application.
	echo.
	goto :done
)


REM x    Extract, with full paths (x not e) so /Public contains just flat files
REM      which actually extract out to their original folder paths from
REM      the POV of say m:\Cloud in this example
REM -y   Assume yes to all queries (i.e. replace existing files)
REM -bb1 Increase log level to show output filenames
cd /d m:
cd m:\Cloud
set /p pass="Password: "
7z x -y -bb1 -p%pass% %1


:done
timeout 9

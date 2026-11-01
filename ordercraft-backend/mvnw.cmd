@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for OrderCraft Backend
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "DIR=%~dp0"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

echo [OrderCraft] Downloading Apache Maven 3.9.6 for first-time setup...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $zip = Join-Path $env:TEMP 'apache-maven-3.9.6-bin.zip'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile $zip; New-Item -ItemType Directory -Force -Path '%USERPROFILE%\.m2\wrapper\dists' | Out-Null; Expand-Archive -Path $zip -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force; Remove-Item $zip -Force }"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [OrderCraft] Maven configured successfully.
    "%MAVEN_HOME%\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

echo [OrderCraft] Failed to initialize Maven wrapper. Please install Maven or check internet access.
exit /b 1

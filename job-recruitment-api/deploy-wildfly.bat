@echo off
REM ================================================
REM WildFly Quick Setup Script for Job Recruitment API
REM ================================================

echo.
echo ========================================
echo  Job Recruitment API - Deployment Setup
echo ========================================
echo.

REM Check if WILDFLY_HOME is set
if "%WILDFLY_HOME%"=="" (
    echo ERROR: WILDFLY_HOME environment variable is not set!
    echo.
    echo Please set WILDFLY_HOME to your WildFly installation directory:
    echo   set WILDFLY_HOME=C:\path\to\wildfly-30.0.0.Final
    echo.
    pause
    exit /b 1
)

echo Using WildFly at: %WILDFLY_HOME%
echo.

REM Create MySQL module directory
set MYSQL_MODULE_DIR=%WILDFLY_HOME%\modules\system\layers\base\com\mysql\main
if not exist "%MYSQL_MODULE_DIR%" (
    echo Creating MySQL module directory...
    mkdir "%MYSQL_MODULE_DIR%"
)

REM Check for MySQL connector JAR
if not exist "%MYSQL_MODULE_DIR%\mysql-connector-j-*.jar" (
    echo.
    echo WARNING: MySQL Connector JAR not found!
    echo Please download mysql-connector-j-8.x.x.jar and place it in:
    echo   %MYSQL_MODULE_DIR%
    echo.
    echo Download from: https://dev.mysql.com/downloads/connector/j/
    echo.
)

REM Create module.xml for MySQL
echo Creating MySQL module.xml...
(
echo ^<?xml version="1.0" encoding="UTF-8"?^>
echo ^<module xmlns="urn:jboss:module:1.9" name="com.mysql"^>
echo     ^<resources^>
echo         ^<resource-root path="mysql-connector-j-8.2.0.jar"/^>
echo     ^</resources^>
echo     ^<dependencies^>
echo         ^<module name="javax.api"/^>
echo         ^<module name="javax.transaction.api"/^>
echo     ^</dependencies^>
echo ^</module^>
) > "%MYSQL_MODULE_DIR%\module.xml"

echo Module.xml created successfully!
echo.

REM Copy WAR file
echo Copying WAR file to deployments...
copy /Y "target\job-recruitment-api.war" "%WILDFLY_HOME%\standalone\deployments\"
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Download MySQL Connector JAR if not done
echo 2. Run the database setup script in MySQL
echo 3. Configure datasource in WildFly (see README)
echo 4. Start WildFly: %WILDFLY_HOME%\bin\standalone.bat
echo.
echo API will be available at:
echo   http://localhost:8080/job-recruitment-api/api/
echo.

pause

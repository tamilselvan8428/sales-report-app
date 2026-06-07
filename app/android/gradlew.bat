@rem Gradle startup script for Windows
@if "%DEBUG%"=="" @echo off
set APP_HOME=%~dp0
set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar
if "%JAVA_HOME%"=="" (
    java -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
) else (
    "%JAVA_HOME%\bin\java.exe" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
)

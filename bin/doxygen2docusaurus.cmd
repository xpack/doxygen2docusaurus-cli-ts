:: Node.js CLI starter for Windows CMD.EXE.

@ECHO OFF

SETLOCAL

SET "NODE_EXE=%~dp0\node.exe"
IF NOT EXIST "%NODE_EXE%" (
  SET "NODE_EXE=node"
)

SET "CLI_JS=%~dp0\doxygen2docusaurus.js"

"%NODE_EXE%" "%CLI_JS%" %*

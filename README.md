# WebTerm
HTML terminal for Windows and Unix

## Requirements: 

nodejs and npm are required to run the application.

## Installation
```
git clone https://github.com/VincentDrevet/WebTerm.git
mv WebTerm /usr/local/WebTerm/
cd /usr/local/WebTerm/
npm install
chown -R restricted:restricted /usr/local/WebTerm
```

if you don't use /usr/local/WebTerm location, you should change variables **viewspath** and **publicpath** in **server.js**.

## Create Systemd services:

A very simple example of systemd service :

```
[Unit]
Description=Web terminal running on the port 9000

[Service]
Type=simple
RemainAfterExit=no
User=restricted
ExecStart=node /usr/local/WebTerm/server.js

[Install]
WantedBy=multi-user.target
```

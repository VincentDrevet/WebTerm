const terminal = new Terminal({
    rows: 40,
    cols: 160
});
var ws = new WebSocket("ws://localhost:9001")
const attachAddon = new AttachAddon.AttachAddon(ws);

terminal.open(document.getElementById("terminal"))
terminal.loadAddon(attachAddon);
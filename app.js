var menubar = require('menubar');
var path = require('path');

var mb = menubar({
  width : 400,
  height: 340,
  index : 'file://' + path.join(__dirname, 'app', 'app.html'),
  icon  : 'file://' + path.join(__dirname, 'Icon.png'),
  frame : false,
  resizable: false
})

mb.on('ready', function ready () { console.log("app ready"); });


// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')

var config = require('./config.json');

var vk_token = config.vk

const { VK } = require('vk-io');

const vk = new VK();

vk.setOptions({
	token: vk_token,
	apiMode: 'parallel_selected',
	webhookPath: '/webhook/secret-path'
});

const { updates } = vk;
var vk_app = updates;

vk_app.use(async (context, next) => {
	if (context.is('message') && context.isOutbox) {
		return;
	}

	try {
		await next();
	} catch (error) {
		console.error('Error:', error);
	}
});

vk_app.on('message',(message) => {
    console.log('Новое сообщение:',message.text);
});

async function run() {
	if (process.env.UPDATES === 'webhook') {
		await vk.updates.startWebhook();

		console.log('Webhook server started');
	} else {
		await vk.updates.startPolling();

		console.log('VK longpoll started');
	}
}

run().catch(console.error);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
       height: 600,
       width: 800,
       minHeight: 610,
       minWidth: 561
     })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

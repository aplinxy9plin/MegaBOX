// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut} = require('electron')

const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')


var config = require('./config.json');

const tg = new Telegraf(config.tg)

var vk_token = config.vk
var myvk = config.myvk

const { VK, Request } = require('vk-io');

const vk = new VK();
const a = new VK();

a.setOptions({
	token: myvk
});

tg.on('text', (ctx) => {
  var message = ctx.update.message.text,
      first_name = ctx.from.first_name,
      last_name = ctx.from.last_name,
      username = ctx.from.username;
  console.log(ctx.from);
  console.log(message);
})

tg.startPolling()

vk.setOptions({
	token: vk_token,
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
    console.log(message);
    var user_id = message.peerId
    a.api.users.get({
      user_ids: user_id,
      fields: 'photo_100,followers_count,sex'
    }).then((res) => {
      var first_name = res[0].first_name,
          last_name = res[0].last_name,
          photo = res[0].photo_100,
          sex = res[0].sex,
          followers_count = res[0].followers_count;
      if(sex = 1){
        sex = "женский"
      }else{
        sex = "мужской"
      }
      console.log(first_name + " " + last_name + " " + photo + " " + sex + " " + followers_count);
    })
    a.api.wall.get({
      owner_id: user_id
    }).then((items) => {
        console.log('Записей на стене:',items.count);
    }).catch((error) => {
        console.error(error);
    });
    a.api.friends.get({
      user_id: user_id
    }).then((res) => {
      console.log('Количество друзей: ' + res.count);
    })
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
  mainWindow.loadFile('login_page.html')
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

// const { app, globalShortcut } = require('electron')

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+1', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.webContents.executeJavaScript(`document.getElementsByTagName('input')[4].value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+2', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.webContents.executeJavaScript(`document.getElementsByTagName('input')[4].value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+3', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.webContents.executeJavaScript(`document.getElementsByTagName('input')[4].value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+4', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.webContents.executeJavaScript(`document.getElementsByTagName('input')[4].value = 'Привет, мой дорогой друг'`)
  })
})

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

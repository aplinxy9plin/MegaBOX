// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut} = require('electron')

const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')

var moment = require('moment');
var now_time = moment("00:00:00", "hh:mm:ss")

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
      username = ctx.from.username,
      chat_id = ctx.from.id,
      score;
  // получить аналитику текста
  // var anal = text_anal ({'documents': [{'id':'1','text': message}]});
  // var z = JSON.parse(anal)
  let body = JSON.stringify ({'documents': [{'id':'1','text': message}]});

  let request_params = {
      method : 'POST',
      hostname : uri,
      path : path + 'sentiment',
      headers : {
          'Ocp-Apim-Subscription-Key' : accessKey,
      }
  };
  var req = https.request(request_params, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // console.log('BODY: ' + chunk);
      score = JSON.parse(chunk)
      score = score.documents[0].score
      console.log(score);
    });
  });
  req.write (body);
  req.end();
  // let req = https.request (request_params, response_handler);
  // req.write (body);
  // var fuck = req.end()
  // console.log(fuck.documents);
  // z = z.documents
  // console.log(z);
  // console.log(ctx.chat_id);
  console.log(message);
  mainWindow.webContents.executeJavaScript('createChat('+score+',"tg", "'+first_name+'","'+last_name+'","no","'+message+'", "'+chat_id+'");', true)
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
    var score;
    let body = JSON.stringify ({'documents': [{'id':'1','text': message.text}]});

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path + 'sentiment',
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };
    var req = https.request(request_params, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        // console.log('BODY: ' + chunk);
        score = JSON.parse(chunk)
        score = score.documents[0].score
        console.log(score);
      });
    });
    req.write (body);
    req.end();

    mainWindow.webContents.executeJavaScript('users.push("'+message.text+'"); console.log(users);', true)
    // получить аналитику текста
    var first_name = '',
        last_name = '',
        photo = '',
        sex = '',
        followers_count = '',
        post_count = '',
        friends_count = '';
    text_anal ({'documents': [{'id':'1','text': message.text}]});
    var user_id = message.peerId
    a.api.users.get({
      user_ids: user_id,
      fields: 'photo_100,followers_count,sex'
    }).then((res) => {
      first_name = res[0].first_name;
      last_name = res[0].last_name;
      photo = res[0].photo_100;
      sex = res[0].sex;
      followers_count = res[0].followers_count;
      if(sex = 1){
        sex = "женский"
      }else{
        sex = "мужской"
      }
      mainWindow.webContents.executeJavaScript('users.push("'+first_name+'" , "'+last_name+'", "'+photo+'", "'+sex+'", "'+followers_count+'"); console.log(users);', true)
      // console.log(first_name + " " + last_name + " " + photo + " " + sex + " " + followers_count);
    })
    a.api.wall.get({
      owner_id: user_id
    }).then((items) => {
        post_count = items.count
        mainWindow.webContents.executeJavaScript('users.push("'+post_count+'"); console.log(users);', true)
        console.log('Записей на стене:',items.count);
    }).catch((error) => {
        console.error(error);
    });
    a.api.friends.get({
      user_id: user_id
    }).then((res) => {
      friends_count = res.count
      mainWindow.webContents.executeJavaScript('users.push("'+friends_count+'", "'+user_id+'"); console.log(users); createChat('+score+',"vk", users[1],users[2],users[3],users[0], users[8]);', true)
      console.log('Количество друзей: ' + res.count);
    })
    // var json = {
    //   "type": "vk",
    //   "profile":{
    //     "user_id": user_id,
    //     "first_name": first_name,
    //     "last_name": last_name,
    //     "sex": sex,
    //     "photo": photo,
    //     "followers_count": followers_count,
    //     "post_count": post_count,
    //     "friends_count": friends_count
    //   },
    //   "message":{
    //     "text": message.text
    //   }
    // }
    // mainWindow.webContents.executeJavaScript('var json = '+json)
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

let https = require ('https');

let accessKey = 'b0be0f5ba26c4062b7158f07cad16e7e';

let uri = 'southcentralus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/';

let response_handler = function (response) {
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);
        let body__ = JSON.stringify (body_, null, '  ');
        console.log (body__);
    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
    });
};

let text_anal = function (documents) {
    let body = JSON.stringify (documents);

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path + 'sentiment',
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };

    let req = https.request (request_params, response_handler);
    req.write (body);
    req.end ();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
       height: 600,
       width: 800,
       minHeight: 610,
       minWidth: 900
     })
  // and load the index.html of the app.
  mainWindow.loadFile('login_page.html')
  // let contents = mainWindow.webContents
  // console.log(contents)

  mainWindow.webContents.on('dom-ready', function(e) {
    nowURL = mainWindow.webContents.getURL()
    if(nowURL.indexOf('chat_page.html') !== -1){
      var timerId = setInterval(function() {
        timer()
      }, 1000);
    }
  })

  // mainWindow.executeJavaScript(`document.getElementById('timer')`)
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
// function timer(){
//   setTimeout("time", 1000);
//   console.log(now_time);
// }
// function time(){
//   now_time = moment(now_time).add(1, 'second');
//   timer()
// }
// timer()

function timer(){
  now_time = moment(now_time).add(1, 'second');
  mainWindow.webContents.executeJavaScript(`document.getElementById('timer').innerHTML = ` + moment(now_time).format("HH:MM:SS"))
  console.log(now_time);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// const { app, globalShortcut } = require('electron')

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+1', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.executeJavaScript(`document.getElementById('write_message').value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+2', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.executeJavaScript(`document.getElementById('write_message').value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+3', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.executeJavaScript(`document.getElementById('write_message').value = 'Привет, мой дорогой друг'`)
  })
  globalShortcut.register('CommandOrControl+4', () => {
    console.log('CommandOrControl+1 is pressed')
    mainWindow.webContents.executeJavaScript(`document.getElementById('write_message').value = 'Привет, мой дорогой друг'`)
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

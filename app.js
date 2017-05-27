const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const ipc = electron.ipcMain
const Menu = electron.Menu
const platform = require('os').platform()
const Tray = electron.Tray

const Config = require('electron-config')
const getID = require('shortid').generate
const path = require('path')
const url = require('url')
const win = require('electron-window')

const shouldQuit = app.makeSingleInstance((argv, wd) => {})
if (shouldQuit) {
  let msg
  if (platform === 'win32') {
    msg = 'Mmemo已运行在Windows任务栏通知区域，\n请不要打开多个Mmemo实例。'
  } else if (platform === 'darwin'){
    msg = 'Mmemo已运行在MacOS菜单栏，\n请不要打开多个Mmemo实例。'
  } else {
    msg = 'Mmemo已运行，\n请不要打开多个Mmemo实例。'
  }
  dialog.showErrorBox('Mmemo 已运行', msg)
  app.quit()
}

const memoLib  = new Config({name:'memoLib'})
const conf = new Config({name:'conf'})
if (!conf.has('advancedMode')) conf.set('advancedMode', false)
const memoPagePath = path.resolve(__dirname,  'src', 'memo.html')
const aboutPagePath = path.resolve(__dirname, 'src', 'about.html')

let debug = true
let tray = null
let aboutWindow
let memoWindows = {}

app.on('ready', () => {
  // Setup tray icon
  let iconPath
  if (platform === 'darwin') {
    iconPath = path.join(__dirname, 'asset', 'trayTemplate.png')
  }
  if (platform === 'win32') {
    iconPath = path.join(__dirname, 'asset', 'tray.ico')
  }
  tray = new Tray(iconPath)
  let contextMenu = Menu.buildFromTemplate(
    [{
      label: '新便签...',
      click: () => newMemo()
    },{
      label: '全部解锁',
      click: () => {broadCast('unlock')
                    for (let id in memoWindows)
                      memoWindows[id].setIgnoreMouseEvents(false)
                    }
    },{
      label: '全部锁定',
      click: () => {broadCast('lock')
                    for (let id in memoWindows)
                      memoWindows[id].setIgnoreMouseEvents(true)
                    }
    },{
      label: '高级模式',
      type: 'checkbox',
      checked: conf.get('advancedMode'),
      click: (e) =>{let checked = e.checked
                    conf.set('advancedMode', checked)
                    if (checked)
                      broadCast('advancedModeOn')
                    else
                      broadCast('advancedModeOff')
                  }
    },{
      type: 'separator'
    },{
      label: '关于...',
      click: () => showAbout()
    },{
      label: '退出',
      click: () => app.quit()
    },{
      label: '清空(debug)',
      click: () => memoLib.clear()
    }]
  )
  tray.setToolTip('Mmemo')
  tray.setContextMenu(contextMenu)
  if (platform === 'win32') {
    tray.on('click', () => {
      for (let id in memoWindows) {
        memoWindows[id].focus()
      }
    })
  }

  if (memoLib.size == 0)
    newMemo()
  else {
    // show exsiting memos
    for (let id in memoLib.store) {
      showMemo(id)
    }
  }
})

app.on('window-all-closed', function () {
})

app.on('activate', function () {
})

ipc.on('set-memo', (e, d) => {
  memoLib.set(d.id, d)
})

ipc.on('del-memo', (e, id) => {
  let tmp = memoWindows[id]
  memoLib.delete(id)
  delete memoWindows[id]
  tmp.close()
})

ipc.on('pin-memo', (e, id) => {
  memoWindows[id].setAlwaysOnTop(true)
})

ipc.on('unpin-memo', (e, id) => {
  memoWindows[id].setAlwaysOnTop(false)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function showMemo(id) {
  let memo = memoLib.get(id)
  let x,y,w,h
  if (!memo.bounds) {
    w = 400
    h = 400
  } else {
    x = memo.bounds.x
    y = memo.bounds.y
    w = memo.bounds.width
    h = memo.bounds.height
  }
  memoWindows[id] = win.createWindow({
    x: x,
    y: y,
    width: w,
    height: h,
    alwaysOnTop: memo.pinned,
    transparent: debug ? false : true,
    resizable: debug ? true : false,
    fullscreenable: false,
    frame: debug ? true : false,
    skipTaskbar: true,
    acceptFirstMouse: true
  })
  if (memo.mode === 'lock')
    memoWindows[id].setIgnoreMouseEvents(true)
  memoWindows[id].on('close', (e) => {
    bounds = e.sender.getBounds()
    let tmp = memoLib.get(id)
    tmp.bounds = bounds
    memoLib.set(id, tmp)
  })
  memo.advancedMode = conf.get('advancedMode')
  memoWindows[id].showUrl(memoPagePath, memo)
}

function showAbout(){
  aboutWindow = win.createWindow({
    width: 310,
    height: 400,
    transparent: true,
    frame: false,
    resizable: false
  })
  aboutWindow.showUrl(aboutPagePath)
}

function newMemo() {
  let id =getID()
  while (memoLib.has(id)) {
    id = getID()
  }
  let memo = {}
  memo.id = id
  memo.title = '新便签'
  memo.content = ''
  memo.mode = 'edit'
  memo.pinned = false
  memoLib.set(id,memo)
  showMemo(id)
}

function broadCast(c) {
  for (let id in memoWindows) {
    if (memoWindows[id]) {
      memoWindows[id].webContents.send(c)
    }
  }
}

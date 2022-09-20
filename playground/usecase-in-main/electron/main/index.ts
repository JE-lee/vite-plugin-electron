import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import './samples'
import { Worker } from 'node:worker_threads'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: path.join(__dirname, '../..'),
  // /dist or /public
  public: path.join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = path.join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = path.join(ROOT_PATH.dist, 'index.html')

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
  }
}

app.whenReady().then(() => {
  ipcMain.handle('sigma', (e, factor: number) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, '../worker/task1.js'))
      worker.on('message', result => {
        resolve(result)
      })
      worker.on('error', error => {
        reject(error)
      })
      worker.postMessage(factor)
    })
  })

  createWindow()
})

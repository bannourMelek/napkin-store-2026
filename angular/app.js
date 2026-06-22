const { app, session, BrowserWindow } = require('electron')
const url = require("url");
const path = require("path");

// Speed up renderer process startup
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-background-timer-throttling');

let mainWindow

function createWindow() {

    session.defaultSession.setCertificateVerifyProc((request, callback) => {
        // Always trust certificates
        callback(0); // 0 = OK
    });

    mainWindow = new BrowserWindow({
        fullscreen: true,
        show: false,
        backgroundColor: '#fafafa',
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false,
        },
    })

    // mainWindow.webContents.openDevTools()

    mainWindow.loadFile(path.join(__dirname, `/dist/angular/browser/index.html`));

    // Show the window as soon as HTML+CSS+JS have loaded (~1s),
    // before Angular finishes bootstrapping. The spinner in index.html
    // is visible until Angular renders app-root.
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    })

}

app.on('ready', createWindow)


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})
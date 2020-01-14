'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var apogeeAppLib_js = require('./apogeeAppLib.cjs.js');
var apogeeutil = _interopDefault(require('./apogeeUtilLib.cjs.js'));

//some global definitions for the node environment
global.__globals__ = global;
global.__APOGEE_ENVIRONMENT__ = "NODE";

/* 
 * This class provides file open and save in electron.
 */
class ElectronFileAccess extends apogeeAppLib_js.BaseFileAccess {
    
    //========================================
    // Public
    //========================================
    
    constructor() {
        super();
    }
    
    /**
     * This method returns fileMetadata appropriate for a new workspace.
     */
    getNewFileMetadata() {
        return {};
    }
    
    /**
     * This method returns true if the workspace has an existing file to which 
     * is can be saved without opening a save dialog. 
     */
    directSaveOk(fileMetadata) {
        return ((fileMetadata)&&(fileMetadata.path));
    }

    /**
     * This method opens a file, including dispalying a dialog
     * to select the file.
     */
    openFile(app,onOpen) {
        //show file open dialog
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        var fileList = dialog.showOpenDialog({properties: ['openFile']});
        if((fileList)&&(fileList.length > 0)) {
            var fileMetadata = ElectronFileAccess.createFileMetaData(fileList[0]);
            var onFileOpen = function(err,data) {
                onOpen(err,app,data,fileMetadata);
            };

            var fs = require('fs');
            fs.readFile(fileMetadata.path,onFileOpen);
        }
    }

    /** This  method shows a save dialog and saves the file. */
    showSaveDialog(fileMetadata,data,onSaveSuccess) {
        var electron = require('electron').remote;
        var dialog = electron.dialog;

        //show file save dialog
        var options = {};
        if((fileMetadata)&&(fileMetadata.path)) options.defaultPath = fileMetadata.path;
        var newPath = dialog.showSaveDialog(options);

        //save file
        var updatedFileMetadata = ElectronFileAccess.createFileMetaData(newPath);
        if(updatedFileMetadata) {
            this.saveFile(updatedFileMetadata,data,onSaveSuccess);
        }
        else {
            return false;
        }
    }

    /** 
     * This method saves a file to the give location. 
     */
    saveFile(fileMetadata,data,onSaveSuccess) {
        var onComplete = function(err,data) {
            if(err) {
                alert("Error: " + err.message);
            }
            else {
                if(onSaveSuccess) {
                    onSaveSuccess(fileMetadata);
                }
                alert("Saved!");
            }
        };

        var fs = require('fs');
        fs.writeFile(fileMetadata.path,data,onComplete);
    }

    //================
    //static methods
    //================

    /** This creates the file metadata for a given path. */
    static createFileMetaData(path) {
        return {"path":path};
    } 
}

/** 
 * This is the format of the AppConfigManager. This class does not need
 * to be extended. It has not internal functionality.
 */
class ElectronAppConfigManager {
    
    constructor() {
    }
    
    /** This method should return a Promise object the loades the
     * app configuration.
     */
    getConfigPromise(app) {
        var fs = require('fs');
        
        //load file if it exists
        if(fs.existsSync(ElectronAppConfigManager.CONFIG_FILE_PATH)) {
            var promiseFunction = (resolve,reject) => {
                var onFileOpen = function(err,data) {
                    if(err) reject(err);
                    else resolve(JSON.parse(data));                    
                };              
                fs.readFile(ElectronAppConfigManager.CONFIG_FILE_PATH,onFileOpen);
            };

            var configFilePromise = new Promise(promiseFunction);
            
            //chain the file download promise to the init settings promise
            return configFilePromise.then(appSettings => app.getConfigurationPromise(appSettings));
        }
        else { 
            //if there is no config file, just return an "empty" promise
            return Promise.resolve({});
        }
    };
    
    /** This method should return a default FileAccessObject. It will be loaded
     * if an alternate is not loaded in configuration.
     */
    getDefaultFileAccessObject(app) {
        return new ElectronFileAccess();
    }
    
    /** This method should return a promise for the initial workspace
     * that should be loaded.
     */
    getInitialWorkspaceFilePromise(app) {
        //no initial workspace set up in electron
        return null;
    }
    
    /** This method should return the file metadata for the intial workspace.
     * This will be used in saving the initail workspace. (For example, if the
     * initial workspace is a locally loaded file in the electron version, this
     * file metadata will allow the user to select "save" to update the file 
     * without having to select a file to save to.
     */
    getInitialWorkspaceFileMetadata(app) {
        return null;
    }
}

ElectronAppConfigManager.CONFIG_FILE_PATH = "./config.json";

//expose these apogee libraries
__globals__.apogeeutil = apogeeutil;

function appInit() {

    //initialize include path
    apogeeAppLib_js.initIncludePath("./");
    
    //use electron file access
    var appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    apogeeAppLib_js.Apogee.createApp("appContainer",appConfigManager);
}

function getWorkspaceIsDirty() {
    return apogeeAppLib_js.Apogee.getInstance().getWorkspaceIsDirty();
}

exports.appInit = appInit;
exports.getWorkspaceIsDirty = getWorkspaceIsDirty;

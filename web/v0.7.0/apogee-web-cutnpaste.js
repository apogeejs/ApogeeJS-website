/* Apogee Web Customization Version 0.7.0 - Cut-n-Paste file open/close */

/** This method shows a save folder dialog. I simply displays the text of
 * the workspace json for the user to copy and save elsewhere. */
apogeeapp.app.dialog.showSaveWorkspaceDialog = function(data) {

    var dialog = apogeeapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");
    
    var line;
    
    //no scroll container - we will fit the dialog window to the content
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
    dialog.setContent(content);
    
    var line;
  
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Save Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"innerHTML":"Copy the data below and save it in a file to open later."}));
    content.appendChild(line);
    
    //input
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = apogeeapp.ui.createElement("textarea",{"value":data,"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onOk = function() {
        apogeeapp.ui.closeDialog(dialog);
    }
    
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onOk}));
    content.appendChild(line);

    dialog.setContent(content);
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}

;

/** This method shows a open workspace dialog. The argument onOpenFunction
 * takes single argment, the workspace text. It does not need a return value. */
apogeeapp.app.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialog = apogeeapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");
    
    var line;
    
    //no scroll container - we will fit the dialog to the content
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
    dialog.setContent(content);
  
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = apogeeapp.ui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        apogeeapp.ui.closeDialog(dialog);
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        onOpenFunction(jsonText);
        
        apogeeapp.ui.closeDialog(dialog);
	}
    
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}

;


//PASTE IMPLEMENTATION
apogeeapp.app.openworkspace.openFile = function(onOpen) {
    var onFileOpen = function(data) {
        onOpen(null,data);
    }
    apogeeapp.app.dialog.showOpenWorkspaceDialog(onFileOpen);
}

apogeeapp.app.saveworkspace.showSaveDialog = function(data,onSaveSuccess) {
    apogeeapp.app.dialog.showSaveWorkspaceDialog(data);
    
    //assume it was saved...
    if(onSaveSuccess) onSaveSuccess();
}

apogeeapp.app.saveworkspace.saveFile = function(filename,data,onSaveSuccess) {
    apogeeapp.app.saveworkspace.showSaveDialog(data);
}
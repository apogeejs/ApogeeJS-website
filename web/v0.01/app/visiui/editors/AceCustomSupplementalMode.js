
hax.app.visiui.AceCustomSupplementalMode = function(component) {
	//base constructor
	hax.app.visiui.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

hax.app.visiui.AceCustomSupplementalMode.prototype = Object.create(hax.app.visiui.AceCodeModeBase.prototype);
hax.app.visiui.AceCustomSupplementalMode.prototype.constructor = hax.app.visiui.AceCustomSupplementalMode;

hax.app.visiui.AceCustomSupplementalMode.prototype.showData = function(editOk) {
		
	var control = this.component.getObject();
	var resource = control.getResource();
	var codeText = resource.getSupplementalCode();
	
	this.editor.showData(codeText,editOk);
}

hax.app.visiui.AceCustomSupplementalMode.prototype.onSave = function(text) {	
	var control = this.component.getObject();
	var resource = control.getResource();
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = resource.getCustomizeScript();
	var supplementalCode = text;
	
	var component = this.getComponent();
	var actionResponse = component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}

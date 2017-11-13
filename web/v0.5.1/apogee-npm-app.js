/* Apogee NPM App Version 0.5.1 */
//main apogeeapp file
var apogeeapp = {};

;
/** This is the main apogeeapp ui file */
apogeeapp.ui = {};

/** This should be called to initializethe resource path. */
apogeeapp.ui.initResourcePath = function(resourceDirectory) {
    apogeeapp.ui.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
apogeeapp.ui.getResourcePath = function(relativePath) {
    return apogeeapp.ui.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
apogeeapp.ui.MENU_ZINDEX = 100;
apogeeapp.ui.WINDOW_FRAME_ZINIDEX = 10;
apogeeapp.ui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

apogeeapp.ui.idIndex = 0;
apogeeapp.ui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
apogeeapp.ui.createId = function() {
    return apogeeapp.ui.idBase + apogeeapp.ui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
apogeeapp.ui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// resources
//=========================================

apogeeapp.ui.MINIMIZE_CMD_IMAGE = "/minimize.png";
apogeeapp.ui.RESTORE_CMD_IMAGE = "/restore.png";
apogeeapp.ui.MAXIMIZE_CMD_IMAGE = "/maximize.png";
apogeeapp.ui.CLOSE_CMD_IMAGE = "/close.png";
apogeeapp.ui.MENU_IMAGE = "/hamburger.png";

//=========================================
// dom methods
//=========================================


/** This method removes all the content from a DOM element. */
apogeeapp.ui.removeAllChildren = function(element) {
	while(element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

/** This method applies the style json to the dom element. All arguments
 * besides type are optional.
 * 
 * type is the element type
 * properties are javascript properties, 
 * styleProperties are the style properties
 * */
apogeeapp.ui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        apogeeapp.ui.applyStyle(element,styleProperties);
    }
    return element;
}

/** This method creates a DOM element of the given type, sets the class name
 * and, if present, adds it to the given parent. */
apogeeapp.ui.createElementWithClass = function(elementType,className,parent) {
    var element = document.createElement(elementType);
    element.className = className;
    if(parent) parent.appendChild(element);
    return element;
}

//=========================================
// window and dialog methods
//=========================================

apogeeapp.ui.dialogLayer = null;

apogeeapp.ui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

apogeeapp.ui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

apogeeapp.ui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
apogeeapp.ui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw apogee.base.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = apogeeapp.ui.createElement("div",null,apogeeapp.ui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = apogeeapp.ui.createElement("div",null,apogeeapp.ui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    apogeeapp.ui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the apogeeapp.ui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
apogeeapp.ui.createDialog = function(options) {
    var dialog = new apogeeapp.ui.WindowFrame(options);
    return dialog;
}

apogeeapp.ui.showDialog = function(dialog) {
    var shieldElement = apogeeapp.ui.createElement("div",null,apogeeapp.ui.DIALOG_SHIELD_STYLE);
    var dialogParent = new apogeeapp.ui.WindowParent(shieldElement);
    apogeeapp.ui.dialogLayer.appendChild(shieldElement);

    dialogParent.addWindow(dialog);
}

/** This method closes a dialog created with apogeeapp.ui.createDialog. It
 *hides the window and removes the modal shiled. */
apogeeapp.ui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.close();
    apogeeapp.ui.dialogLayer.removeChild(parent.getOuterElement());
}

apogeeapp.ui.WINDOW_STATE_MINIMIZED = -1;
apogeeapp.ui.WINDOW_STATE_NORMAL = 0;
apogeeapp.ui.WINDOW_STATE_MAXIMIZED = 1;

//refers to minimized, restored or maximized
apogeeapp.ui.WINDOW_STATE_CHANGED = "window state change";

apogeeapp.ui.MINIMIZABLE = 0x01;
apogeeapp.ui.MAXIMIZABLE = 0x02;
apogeeapp.ui.CLOSEABLE = 0x04;

/** This is a handler name used to request closing the window, tab or other UI element. */
apogeeapp.ui.REQUEST_CLOSE = "request_close";
apogeeapp.ui.DENY_CLOSE = -1;

apogeeapp.ui.CLOSE_EVENT = "closed";
apogeeapp.ui.RESIZED_EVENT = "resized";
apogeeapp.ui.SHOWN_EVENT = "shown";
apogeeapp.ui.HIDDEN_EVENT = "hidden";

/** This function adds CSS data for a given member id. */
apogeeapp.ui.setMemberCssData = function(objectId,cssText) {
    var cssElementId = "css_" + objectId;
    
    var cssElement = document.getElementById(cssElementId);
    if(cssText != "") {
        if(!cssElement) {
            cssElement = document.createElement("style");
            cssElement.id = cssElementId;
            document.head.appendChild(cssElement);
        }
        cssElement.innerHTML = cssText;
    }
    else {
        if(cssElement) {
            document.head.removeChild(cssElement);
        }
    }
}





;
/** This object is a container for window frames. The argument of the constructor should
 * be an element that will hold the window frames.  */
apogeeapp.ui.WindowParent = function(containerElement) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    this.containerElement = containerElement;
    
    this.windowFrameStack = [];
    
    this.showing = false;
    
    //child auto positioning variables
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.WindowParent,apogee.EventManager);

apogeeapp.ui.WindowParent.BASE_ZINDEX = 0;

//constants for window placement
apogeeapp.ui.WindowParent.DELTA_CHILD_X = 25;
apogeeapp.ui.WindowParent.DELTA_CHILD_Y = 25;
apogeeapp.ui.WindowParent.MAX_WRAP_WIDTH = 400; 
apogeeapp.ui.WindowParent.MAX_WRAP_HEIGHT = 400;

//==============================
// Public Instance Methods
//==============================

/** This should be called when the window parent element is shown, if the
 * "shown" event is to be supported.  */
apogeeapp.ui.WindowParent.prototype.elementIsShown = function() {
    this.showing = true;
    this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
}

/** This should be called when the window parent element is shown, if the
 * "shown" event is to be supported.  */
apogeeapp.ui.WindowParent.prototype.elementIsHidden = function() {
    this.showing = false;
    this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
}

/** This method returns true if this window parent is showing. */
apogeeapp.ui.WindowParent.prototype.getIsShowing = function() {
    return this.showing;
}

apogeeapp.ui.WindowParent.prototype.getOuterElement = function() {
    return this.containerElement;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
apogeeapp.ui.WindowParent.prototype.addWindow = function(windowFrame) {
    this.containerElement.appendChild(windowFrame.getElement());
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
    
    windowFrame.onAddedToParent(this);
}

/** This method removes the window from the parent container. */
apogeeapp.ui.WindowParent.prototype.removeWindow = function(windowFrame) {
    this.containerElement.removeChild(windowFrame.getElement());
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

/** This brings the given window to the front inside this container. */
apogeeapp.ui.WindowParent.prototype.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
apogeeapp.ui.WindowParent.prototype.getCenterOnPagePosition = function(child) {
    var element = child.getElement();
    var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
    var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
    return [x,y];
}


/** This method returns the position of the next window for auto/cascade positioning. */
apogeeapp.ui.WindowParent.prototype.getNextWindowPosition = function() {
    var x = this.prevNewChildX + apogeeapp.ui.WindowParent.DELTA_CHILD_X;
    var y = this.prevNewChildY + apogeeapp.ui.WindowParent.DELTA_CHILD_Y;
    
    if( ((x > apogeeapp.ui.WindowParent.MAX_WRAP_WIDTH) || 
        (y > apogeeapp.ui.WindowParent.MAX_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = apogeeapp.ui.WindowParent.DELTA_CHILD_X * (this.wrapCount + 1);
        y = apogeeapp.ui.WindowParent.DELTA_CHILD_Y;
    }
    
    this.prevNewChildX = x;
    this.prevNewChildY = y;
    
    var pos = {};
    pos.x = x;
    pos.y = y;
    return pos;
}

//=========================
// Private Methods
//=========================

/** This updates the order for the windows.
 * @private */
apogeeapp.ui.WindowParent.prototype.updateOrder = function() {
    var zIndex = apogeeapp.ui.WindowParent.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
};
/** This is a window frame component. IT is used the table window and the dialog.
 *
 * It can be minimized an maximized and dragged and resized with the mouse.  
 * 
 * options:
 * minimizable - allow content to be minimized. defaylt value: false
 * maximizable - allow content to be maximized. default value: false
 * closable - display a close button. defalt value: false
 * resizable- allow resizing window with mouse. default vlue: false
 * movable - allow moving window with mouse. default value : false
 *
 * @class 
 */
apogeeapp.ui.WindowFrame = function(options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    //base init
    apogee.EventManager.init.call(this);
	
    //variables
    this.windowParent = null;
    this.parentElement = null;
    this.options = options;

    this.windowState = (options.initialState !== undefined) ? options.initialState : apogeeapp.ui.WINDOW_STATE_NORMAL; //minimize, normal, maximize
    
	//set default size values
	this.posInfo = {};
	this.posInfo.x = 0;
	this.posInfo.y = 0;
    this.sizeInfo = {};
	this.sizeInfo.width = apogeeapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH;
	this.sizeInfo.height = apogeeapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT;
	
    this.frame = null;
    this.titleCell = null;
    this.headerCell = null;
    this.bodyCell = null;
    
    this.headerContent = null;
    this.content = null;
    
    this.windowDragActive = false;
    this.moveOffsetX = null;
    this.moveOffsetX = null;
    //handlers we place on the parent during a move
    this.moveOnMouseMove = null;
    this.moveOnMouseLeave = null;
    this.moveOnMouseUp = null;
	
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeNorthActive = false;
	this.resizeSouthActive = false;
	this.resizeOffsetWidth = null;
	this.resizeOffsetHeight = null;
    //hanlders we place on the parent during a resize
	this.resizeOnMouseUp = null;
	this.resizeOnMouseMove = null;
	this.resizeOnMouseLeave = null;
	
	//these should be set to soemthing more meeaningful, like the minimum sensible width of the title bar
	this.minWidth = 0;
	this.minHeight = 0;
	
    //initialize
    this.initUI();
	
    //add the handler to move the active window to the front
    var instance = this;
	var frontHandler = function(e) {
        instance.windowParent.bringToFront(instance);
    };
    var element = this.getElement();
	element.addEventListener("mousedown",frontHandler);
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.WindowFrame,apogee.EventManager);

apogeeapp.ui.WindowFrame.RESIZE_LOCATION_SIZE = 10;

//constants for resizing
apogeeapp.ui.WindowFrame.RESIZE_TOLERANCE = 5;
apogeeapp.ui.WindowFrame.RESIZE_EAST = 1;
apogeeapp.ui.WindowFrame.RESIZE_WEST = 2;
apogeeapp.ui.WindowFrame.RESIZE_SOUTH = 4;
apogeeapp.ui.WindowFrame.RESIZE_NORTH = 8;
apogeeapp.ui.WindowFrame.RESIZE_NE = apogeeapp.ui.WindowFrame.RESIZE_NORTH + apogeeapp.ui.WindowFrame.RESIZE_EAST;
apogeeapp.ui.WindowFrame.RESIZE_NW = apogeeapp.ui.WindowFrame.RESIZE_NORTH + apogeeapp.ui.WindowFrame.RESIZE_WEST;
apogeeapp.ui.WindowFrame.RESIZE_SE = apogeeapp.ui.WindowFrame.RESIZE_SOUTH + apogeeapp.ui.WindowFrame.RESIZE_EAST;
apogeeapp.ui.WindowFrame.RESIZE_SW = apogeeapp.ui.WindowFrame.RESIZE_SOUTH + apogeeapp.ui.WindowFrame.RESIZE_WEST;

/** size must be speicifed for the window. If not these values are used. */
apogeeapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT = 300;
apogeeapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH = 300;

//====================================
// Public Methods
//====================================

//---------------------------
// WINDOW CONTAINER
//---------------------------

/** This method shows the window. */
apogeeapp.ui.WindowFrame.prototype.getTitle = function() {
    return this.title;
}

/** This method shows the window. */
apogeeapp.ui.WindowFrame.prototype.setTitle = function(title) {
    this.title = title;
    this.titleBarTitleElement.innerHTML = title;
}

/** This method shows the window. */
apogeeapp.ui.WindowFrame.prototype.createMenu = function(iconUrl) {
    if(!iconUrl) iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.ui.MENU_IMAGE);
    this.menu = apogeeapp.ui.Menu.createMenuFromImage(iconUrl);
    this.titleBarMenuElement.appendChild(this.menu.getElement());
    //create the icon (menu) overlay
    this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_win_icon_overlay_style",this.titleBarMenuElement);
    
    return this.menu;
}

/** This method shows the window. */
apogeeapp.ui.WindowFrame.prototype.getMenu = function() {
    return this.menu;
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.ui.WindowFrame.prototype.setIconOverlay = function(element) {
    if(this.iconOverlayElement) {
        this.clearIconOverlay();
        if(element) {
            this.iconOverlayElement.appendChild(element);
        }
    }
}

apogeeapp.ui.WindowFrame.prototype.clearIconOverlay = function() {
    if(this.iconOverlayElement) {
        apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
    }
}

/** This sets the content for the window */
apogeeapp.ui.WindowFrame.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerCell);
    this.headerCell.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This sets the content for the window */
apogeeapp.ui.WindowFrame.prototype.setContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.bodyCell);
    this.bodyCell.appendChild(contentElement);
    this.content = contentElement;
}

/** This method removes the given element from the content display. If the element
 * is not in the content display, no action is taken. */
apogeeapp.ui.WindowFrame.prototype.safeRemoveContent = function(contentElement) {
    for(var i = 0; i < this.bodyCell.childNodes.length; i++) {
		var node = this.bodyCell.childNodes[i];
        if(node === contentElement) {
        	this.bodyCell.removeChild(contentElement);
            this.content = null;
        }
    }
}

apogeeapp.ui.WindowFrame.prototype.addTitleToolElement = function(element) {
    this.titleBarToolElement.appendChild(element);
}

apogeeapp.ui.WindowFrame.prototype.removeTitleToolElement = function(element) {
    this.titleBarToolElement.removeChild(element);
}




//---------------------------
// WINDOW CHILD
//---------------------------

/** This method returns the parent container for the window.*/
apogeeapp.ui.WindowFrame.prototype.getParent = function() {
    return this.windowParent;
}

/** This method returns true if the window is showing. */
apogeeapp.ui.WindowFrame.prototype.getIsShowing = function() {
    if(this.windowParent) {
        return this.windowParent.getIsShowing();
    }
    else {
        return false;
    }
}

/** This method closes the window. If the argument forceClose is not
 * set to true the "request_close" handler is called to check if
 * it is ok to close the window. */
apogeeapp.ui.WindowFrame.prototype.close = function(forceClose) {
    if(!this.windowParent) return;
    
    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }

    this.windowParent.removeListener(apogeeapp.ui.SHOWN_EVENT, this.windowShownListener);
    this.windowParent.removeListener(apogeeapp.ui.HIDDEN_EVENT, this.windowHiddenListener);
    this.windowParent.removeWindow(this);
    this.windowParent = null;

    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
}

/** This method sets the position of the window frame in the parent. */
apogeeapp.ui.WindowFrame.prototype.setPosition = function(x,y) {
	//don't let window be placed at a negative coord. We can lose it.
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	this.posInfo.x = x;
	this.posInfo.y = y;
	
    this.updateCoordinates();
}

/** This method sets the size of the window frame, including the title bar. */
apogeeapp.ui.WindowFrame.prototype.setSize = function(width,height) {
    this.sizeInfo.width = width;
	this.sizeInfo.height = height;
    
    this.updateCoordinates();
}

/** This method gets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.getPosInfo = function() {
    return this.posInfo;
}

/** This method gets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.setPosInfo = function(posInfo) {
    this.posInfo = posInfo;
    this.updateCoordinates();
}

/** This method gets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.getSizeInfo = function() {
    return this.sizeInfo;
}

/** This method gets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.setSizeInfo = function(sizeInfo) {
    this.sizeInfo = sizeInfo;
    this.updateCoordinates();
}

/** This method sets the location and size info for the window at the same time. */
apogeeapp.ui.WindowFrame.prototype.setCoordinateInfo= function(posInfo,sizeInfo) {
    this.posInfo = posInfo;
    this.sizeInfo = sizeInfo;
    this.updateCoordinates();
}


/** This method sets the size of the window, including the title bar and other decorations. */
apogeeapp.ui.WindowFrame.prototype.setZIndex = function(zIndex) {
    this.frame.style.zIndex = String(zIndex);
}


//---------------------------
// GUI ELEMENT
//---------------------------

/** This method returns the main dom element for the window frame. */
apogeeapp.ui.WindowFrame.prototype.getElement = function() {
    return this.frame;
}



//----------------------------------------------------------------
//object specific

/** This method sets the size of the window to fit the content. */
apogeeapp.ui.WindowFrame.prototype.fitToContent = function() {
    this.sizeInfo.width = undefined;
	this.sizeInfo.height = undefined;
}

/** This method centers the window in its parent. it should only be called
 *after the window is shown. */
apogeeapp.ui.WindowFrame.prototype.centerInParent = function() {
    var coords = this.windowParent.getCenterOnPagePosition(this);
    this.setPosition(coords[0],coords[1]);
}


/** This method gets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.getWindowState = function() {
    return this.windowState;
}

/** This method sets the location and size info for the window. */
apogeeapp.ui.WindowFrame.prototype.setWindowState = function(windowState) {
    switch(windowState) {
        case apogeeapp.ui.WINDOW_STATE_NORMAL:
            this.restoreContent();
            break;
            
        case apogeeapp.ui.WINDOW_STATE_MINIMIZED:
            this.minimizeContent();
            break;
            
        case apogeeapp.ui.WINDOW_STATE_MAXIMIZED:
            this.maximizeContent();
            break;
            
        default:
            alert("Unknown window state: " + windowState);
            break;
    }
}

//================================
// Internal
//================================

/** This method shows the window. This automatically called internally when the window is
 * added to the parent. */
apogeeapp.ui.WindowFrame.prototype.onAddedToParent = function(newWindowParent) {
    this.windowParent = newWindowParent;
    this.parentElement = newWindowParent.getOuterElement();
    
    var instance = this;
    //attach to listeners to forward show and hide events
    this.windowShownListener = function(windowParent) {
        instance.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,instance);
    };
    this.windowParent.addListener(apogeeapp.ui.SHOWN_EVENT, this.windowShownListener);
    this.windowHiddenListener = function(windowParent) {
        instance.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,instance);
    };
    this.windowParent.addListener(apogeeapp.ui.HIDDEN_EVENT, this.windowHiddenListener);
    
    //do the show event if the parent is currently wshowing
    if(this.windowParent.getIsShowing()) {
        this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
    }
    
    //we will redo this since the size of elements used in calculation may have been wrong
    if(this.sizeInfo.height !== undefined) {
        this.updateCoordinates();
    }
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================

/** Mouse down handler for moving the window. */
apogeeapp.ui.WindowFrame.prototype.moveMouseDown = function(e) {
    //do not do move in maximized state
    if(this.windowState === apogeeapp.ui.WINDOW_STATE_MAXIMIZED) return;
    
    if(this.parentElement) {
        this.windowDragActive = true;
        this.moveOffsetX = e.clientX - this.frame.offsetLeft;
        this.moveOffsetY = e.clientY - this.frame.offsetTop;
		
        //add move events to the parent, since the mouse can leave this element during a move
        this.parentElement.addEventListener("mousemove",this.moveOnMouseMove);
        this.parentElement.addEventListener("mouseleave",this.moveOnMouseLeave);
        this.parentElement.addEventListener("mouseup",this.moveOnMouseUp);
        
        //move start event would go here
    }
}

/** Mouse m,ove handler for moving the window. */
apogeeapp.ui.WindowFrame.prototype.moveMouseMoveImpl = function(e) {
    if(!this.windowDragActive) return;
	var newX = e.clientX - this.moveOffsetX;
	if(newX < 0) newX = 0;
	var newY = e.clientY - this.moveOffsetY;
	if(newY < 0) newY = 0;
    this.posInfo.x = newX;
    this.posInfo.y = newY;
    this.updateCoordinates();
}

/** Mouse up handler for moving the window. */
apogeeapp.ui.WindowFrame.prototype.moveMouseUpImpl = function(e) {
    this.endMove();
}

/** Mouse leave handler for moving the window. */
apogeeapp.ui.WindowFrame.prototype.moveMouseLeaveImpl = function(e) {
    this.endMove();
}

/** Mouse down handler for resizing the window. */
apogeeapp.ui.WindowFrame.prototype.resizeMouseDownImpl = function(e,resizeFlags) {
    //do not do resize in maximized state
    if(this.windowState === apogeeapp.ui.WINDOW_STATE_MAXIMIZED) return;

	if(resizeFlags) {
		if(resizeFlags & apogeeapp.ui.WindowFrame.RESIZE_EAST) {
			this.resizeEastActive = true;
			this.resizeOffsetWidth = e.clientX - this.bodyCell.clientWidth;
		}
		else if(resizeFlags & apogeeapp.ui.WindowFrame.RESIZE_WEST) {
			this.resizeWestActive = true;
			this.resizeOffsetWidth = e.clientX + this.bodyCell.clientWidth;
			this.moveOffsetX = e.clientX - this.frame.offsetLeft;
		}
		if(resizeFlags & apogeeapp.ui.WindowFrame.RESIZE_SOUTH) {
			this.resizeSouthActive = true;
			this.resizeOffsetHeight = e.clientY - this.bodyCell.clientHeight;
		}
		else if(resizeFlags & apogeeapp.ui.WindowFrame.RESIZE_NORTH) {
			this.resizeNorthActive = true;
			this.resizeOffsetHeight = e.clientY + this.bodyCell.clientHeight;
			this.moveOffsetY = e.clientY - this.frame.offsetTop;
		}

        //add resize events to the parent, since the mouse can leave this element during a move
		this.parentElement.addEventListener("mouseup",this.resizeOnMouseUp);
		this.parentElement.addEventListener("mousemove",this.resizeOnMouseMove);
        this.parentElement.addEventListener("mouseleave",this.resizeOnMouseLeave);
	}
}

/** Mouse move handler for resizing the window. */
apogeeapp.ui.WindowFrame.prototype.resizeMouseMoveImpl = function(e) {
    var newHeight;
    var newWidth;
    var newX;
    var newY;
    var changeMade = false;
    
	if(this.resizeEastActive) {
		newWidth = e.clientX - this.resizeOffsetWidth;
		//if(newWidth < this.minWidth) return;
        this.sizeInfo.width = newWidth;
        changeMade = true;
	}
	else if(this.resizeWestActive) {
		newWidth = this.resizeOffsetWidth - e.clientX;
		//if(newWidth < this.minWidth) return;
		newX = e.clientX - this.moveOffsetX;
		if(newX < 0) newX = 0;
        this.sizeInfo.width = newWidth;
        this.posInfo.x = newX;
        changeMade = true;
	}
	if(this.resizeSouthActive) {
		newHeight = e.clientY - this.resizeOffsetHeight;
		//if(newHeight < this.minHeight) return;
		this.sizeInfo.height = newHeight;
        changeMade = true;
	}
	else if(this.resizeNorthActive) {
		newHeight = this.resizeOffsetHeight - e.clientY;
		//if(newHeight < this.minHeight) return;
		newY = e.clientY - this.moveOffsetY;
		if(newY < 0) newY = 0;
		this.sizeInfo.height = newHeight;
		this.posInfo.y = newY;
        changeMade = true;
	}
        
    if(changeMade) {
        //update coordinates
        this.updateCoordinates();
    }
}

/** Mouse up handler for resizing the window. */
apogeeapp.ui.WindowFrame.prototype.resizeMouseUpImpl = function(e) {
    this.endResize();
}

/** Mouse up handler for resizing the window. */
apogeeapp.ui.WindowFrame.prototype.resizeMouseLeaveImpl = function(e) {
    this.endResize();
}


/** This method ends a move action. 
 * @private */
apogeeapp.ui.WindowFrame.prototype.endMove = function(e) {
    this.windowDragActive = false;
    this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
    this.parentElement.removeEventListener("mouseleave",this.moveOnMouseLeave);
}

/** this method ends a resize action.
 * @private */
apogeeapp.ui.WindowFrame.prototype.endResize = function() {
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeSouthActive = false;
	this.resizeNorthActive = false;
	this.parentElement.removeEventListener("mouseup",this.resizeOnMouseUp);
	this.parentElement.removeEventListener("mousemove",this.resizeOnMouseMove);
    this.parentElement.removeEventListener("mouseleave",this.resizeOnMouseLeave);
}

//====================================
//  Min/max Methods
//====================================

/** This is the minimize function for the window.*/
apogeeapp.ui.WindowFrame.prototype.minimizeContent = function() {
    
    //set body as hidden
    this.headerCell.style.display = "none";
    this.bodyCell.style.display = "none";
    
    var wasMinimized = (this.windowState === apogeeapp.ui.WINDOW_STATE_MINIMIZED);
 
    //set the window state
    this.windowState = apogeeapp.ui.WINDOW_STATE_MINIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    //dispatch resize event
    if(!wasMinimized) { 
        this.dispatchEvent(apogeeapp.ui.WINDOW_STATE_CHANGED,this);
    }
}

/** This is the restore function for the window.*/
apogeeapp.ui.WindowFrame.prototype.restoreContent = function() {
    
    //set body as not hidden
    this.headerCell.style.display = "";
    this.bodyCell.style.display = "";
    
    var wasMinimized = (this.windowState === apogeeapp.ui.WINDOW_STATE_MINIMIZED);
    var wasMaximized = (this.windowState === apogeeapp.ui.WINDOW_STATE_MAXIMIZED);
    
    //set the window state
    this.windowState = apogeeapp.ui.WINDOW_STATE_NORMAL;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if((wasMinimized)||(wasMaximized)) {
        this.dispatchEvent(apogeeapp.ui.WINDOW_STATE_CHANGED,this);
    }
}

/** This is the minimize function for the window.*/
apogeeapp.ui.WindowFrame.prototype.maximizeContent = function() {
    
    //set body as not hidden
    this.headerCell.style.display = "";
    this.bodyCell.style.display = "";
    
    var wasMaximized = (this.windowState === apogeeapp.ui.WINDOW_STATE_MAXIMIZED);
    
    //set the window state
    this.windowState = apogeeapp.ui.WINDOW_STATE_MAXIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(!wasMaximized) {
        this.dispatchEvent(apogeeapp.ui.WINDOW_STATE_CHANGED,this);
    }
}

/** @private */
apogeeapp.ui.WindowFrame.prototype.updateCoordinates = function() {
    
    var initialBodyHeight = this.bodyCell.style.height;
    var initialBodyWidth = this.bodyCell.style.width;
	
    if(this.windowState === apogeeapp.ui.WINDOW_STATE_MAXIMIZED) {
        //apply the maximized coordinates size
        this.frame.style.left = "0px";
		this.frame.style.top = "0px";
		this.frame.style.height = "100%";
		this.frame.style.width = "100%";
        
        this.bodyCell.style.height = "100%";
        this.bodyCell.style.width = "100%";
    }
    else if(this.windowState === apogeeapp.ui.WINDOW_STATE_NORMAL) {
        //apply the normal size to the window
		this.frame.style.left = this.posInfo.x + "px";
        this.frame.style.top = this.posInfo.y + "px";
        this.frame.style.height = "";
		this.frame.style.width = "";
        
		if(this.sizeInfo.height !== undefined) {
			this.bodyCell.style.height = this.sizeInfo.height + "px";
		}
        else {
            this.bodyCell.style.height = "";
        }
		if(this.sizeInfo.width !== undefined) {
			this.bodyCell.style.width = this.sizeInfo.width + "px";
		}
        else {
            this.bodyCell.style.width = "";
        }
    }
    else if(this.windowState === apogeeapp.ui.WINDOW_STATE_MINIMIZED) {
        //apply the minimized size to the window
		this.frame.style.left = this.posInfo.x + "px";
        this.frame.style.top = this.posInfo.y + "px";
		this.frame.style.height = "";
		this.frame.style.width = "";
        
		this.bodyCell.style.height = "0px";
		this.bodyCell.style.width = "0px";
    }
    
    if((initialBodyHeight != this.bodyCell.style.height)||(initialBodyWidth != this.bodyCell.style.width)) {
        this.dispatchEvent(apogeeapp.ui.RESIZED_EVENT,this);
    }
}

//====================================
// Initialization Methods
//====================================

/** @private */
apogeeapp.ui.WindowFrame.prototype.initUI = function() {
    
    var table;
    var row;
    var cell;
    
    table = document.createElement("table");
    table.className = "visiui_win_main";
    this.frame = table; 
    
    //top border
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_topLeft";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_WEST | apogeeapp.ui.WindowFrame.RESIZE_NORTH);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_top";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_topRight";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_EAST | apogeeapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    
    //title bar
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_left";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_WEST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass";
    this.titleBarCell = cell;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_right";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_EAST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    
    //header
    row = document.createElement("tr");
    row.className = "visiui_win_headerRow";
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_headerCell";
    this.headerCell = cell;
    row.appendChild(cell);
    
    //body
    row = document.createElement("tr");
    row.className = "visiui_win_bodyRow";
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_bodyCell";
    this.bodyCell = cell;
    row.appendChild(cell);
    
    //bottom border
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_bottomLeft";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_WEST | apogeeapp.ui.WindowFrame.RESIZE_SOUTH); 
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_bottom";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_SOUTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "visiui_win_windowColorClass visiui_win_bottomRight";
    this.addResizeHandlers(cell,apogeeapp.ui.WindowFrame.RESIZE_EAST | apogeeapp.ui.WindowFrame.RESIZE_SOUTH);
    row.appendChild(cell);
 
    //create the title bar
    this.createTitleBar();
}

/** @private */
apogeeapp.ui.WindowFrame.prototype.addResizeHandlers = function(cell,flags) {
    //add handlers if the window is resizable
    if(this.options.resizable) {
        var instance = this;
        cell.onmousedown = function(event) {
            instance.resizeMouseDownImpl(event,flags);
        }
        
        //these are not cel specific. they are used on all cells and on the parent container
        //during a move.
        if(!this.resizeOnMouseMove) {
            this.resizeOnMouseMove = function(event) {
                instance.resizeMouseMoveImpl(event);
            };
            this.resizeOnMouseUp = function(event) {
                instance.resizeMouseUpImpl(event);
            };
            this.resizeOnMouseLeave = function(event) {
                instance.resizeMouseLeaveImpl(event);
            };
        }
    }
}

/** @private */
apogeeapp.ui.WindowFrame.prototype.createTitleBar = function() {
    
    this.titleBarElement = apogeeapp.ui.createElementWithClass("div","visiui_win_titleBarClass",this.titleBarCell);

    //add elements
    this.titleBarLeftElements = apogeeapp.ui.createElementWithClass("div","visiui_win_left_style",this.titleBarElement);
    this.titleBarMenuElement = apogeeapp.ui.createElementWithClass("div","visiui_win_menu_style",this.titleBarLeftElements);
    this.titleBarTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_win_title",this.titleBarLeftElements);
    
    this.titleBarRightElements = apogeeapp.ui.createElementWithClass("div","visiui_win_right_style",this.titleBarElement);
    this.titleBarToolElement = apogeeapp.ui.createElementWithClass("div","visiui_win_tool_style",this.titleBarRightElements);

    //for handlers below
    var instance = this;
    
    //add window commands ( we will hide the bottons that are not needed)
    //minimize button
    if(this.options.minimizable) {
        this.minimizeButton = apogeeapp.ui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
        this.minimizeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.MINIMIZE_CMD_IMAGE);
        this.minimizeButton.onclick = function() {
            instance.minimizeContent();
        }
    }
	
    //restore button - only if we cn minimize or maximize
    if(this.options.minimizable || this.options.maximizable) {	
        this.restoreButton = apogeeapp.ui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
        this.restoreButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.RESTORE_CMD_IMAGE);
        this.restoreButton.onclick = function() {
            instance.restoreContent();
        }
    }
    
    //maximize button and logic
//DISABLE MAXIMIZE - just don't show button for now
//    if(this.options.maximizable) {
//        this.maximizeButton = apogeeapp.ui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
//        this.maximizeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.MAXIMIZE_CMD_IMAGE);
//        this.maximizeButton.onclick = function() {
//            instance.maximizeContent();
//        }
//    }
    
    //layout the window buttons
    this.windowState = apogeeapp.ui.WINDOW_STATE_NORMAL;
    this.setMinMaxButtons();
    
    //close button
    if(this.options.closable) {
        this.closeButton = apogeeapp.ui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
        this.closeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.CLOSE_CMD_IMAGE);
        this.closeButton.onclick = function() {
            instance.close();
        }
    }
	
	//add am empty title
	this.setTitle("");
    
    //mouse move and resize
    if(this.options.movable) {
        //add mouse handlers for moving the window 
        this.titleBarElement.onmousedown = function(event) {
            instance.moveMouseDown(event);
        }

        //mouse window drag events we will place on the parent container - since the mouse drag 
        //may leave the window frame during the move
        this.moveOnMouseMove = function(event) {
            instance.moveMouseMoveImpl(event);
        };
        this.moveOnMouseUp = function(event) {
            instance.moveMouseUpImpl(event);
        }
        this.moveOnMouseLeave = function(event) {
            instance.moveMouseLeaveImpl(event);
        }
    }
}


/** This method shows the min/max/restore buttons properly 
 * @private */
apogeeapp.ui.WindowFrame.prototype.setMinMaxButtons = function() {
    if(this.minimizeButton) {
        if(this.windowState == apogeeapp.ui.WINDOW_STATE_MINIMIZED) {
            this.minimizeButton.style.display = "none";
        }
        else {
            this.minimizeButton.style.display = "";
        }
    }
    if(this.restoreButton) {
        if(this.windowState == apogeeapp.ui.WINDOW_STATE_NORMAL) {
            this.restoreButton.style.display = "none";
        }
        else {
            this.restoreButton.style.display = "";
        }
    }
    if(this.maximizeButton) {
        if(this.windowState == apogeeapp.ui.WINDOW_STATE_MAXIMIZED) {
            this.maximizeButton.style.display = "none";
        }
        else {
            this.maximizeButton.style.display = "";
        }
    }
}
;
/** This is a tab frame.
 * 
 * @class 
 */
apogeeapp.ui.TabFrame = function() {
    
    //base init
    apogee.EventManager.init.call(this);
	
    //variables
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = apogeeapp.ui.createElementWithClass("div","visiui-tf-frame");
    this.tabBar = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-bar",this.tabFrameControl);
    this.tabFrame = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-container",this.tabFrameControl);   	
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.TabFrame,apogee.EventManager);

apogeeapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

/** This method returns the dom element for the control. */
apogeeapp.ui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
apogeeapp.ui.TabFrame.prototype.getTab = function(id) {
    return this.tabTable[id];
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.addTab = function(tab,makeActive) {
    var id = tab.getId();
    
    //make sure there is no tab with this name
    if(this.tabTable[id]) {
        alert("There is already a tab with this id!");
        return null;
    }
    
    tab.setTabFrame(this);
    this.tabFrame.appendChild(tab.getMainElement());
    
    var tabLabelElement = tab.getLabelElement();
    this.tabBar.appendChild(tabLabelElement);
	
    //add the click handler
    var instance = this;
    tabLabelElement.onclick = function() {
        instance.setActiveTab(id);
    }
    tabLabelElement.onmousedown = function(e) {
        //this prevents text selection
        e.preventDefault();
    }
	
    //add to tabs
    this.tabTable[id] = tab;
    
    if((makeActive)||(this.activeTab == null)) {
        this.setActiveTab(id);
    }
    else {
        this.updateTabDisplay();
    }
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.closeTab = function(id) {
    var tab = this.tabTable[id];
    if(tab) {
        this.tabFrame.removeChild(tab.getMainElement());
        
        var tabLabelElement = tab.getLabelElement();
        this.tabBar.removeChild(tabLabelElement);
        delete tabLabelElement.onclick;
        delete tabLabelElement.onmousedown;
        
        delete this.tabTable[id];
		
        if(this.activeTab == id) {
            this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,tab);
            this.activeTab = null;
            //choose a random tab
            for(var newId in this.tabTable) {
                this.setActiveTab(newId);
                break;
            }
        }
        
        this.updateTabDisplay();
    }
}

/** This mesets the active tab, by tab title. */
apogeeapp.ui.TabFrame.prototype.setActiveTab = function(id) {
    var tab = this.tabTable[id];
	if(tab) {
        var oldTab;
        if(this.activeTab) {
            oldTab = this.tabTable[this.activeTab];
        }
		this.activeTab = id;
		this.tabFrame.appendChild(tab.getMainElement());
		this.updateTabDisplay();
		this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,tab);
        if(oldTab) {
            this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,oldTab);
        }
	}
}

/** This updates the tabs. */
apogeeapp.ui.TabFrame.prototype.updateTabDisplay = function() {
    var id;
    for(id in this.tabTable) {
        var tab = this.tabTable[id];
        if(id == this.activeTab) {
            tab.getMainElement().style.display = "";
            tab.getLabelElement().className = "visiui-tf-tab-base visiui-tf-tab-active";
        }
        else {
            tab.getMainElement().style.display = "none";
            tab.getLabelElement().className = "visiui-tf-tab-base visiui-tf-tab-inactive";
        }
    }
}
;

apogeeapp.ui.Tab = function(id) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    this.tabFrame = null;
    this.id = id;
    this.tabLabelElement = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-base visiui-tf-tab-inactive");
    
    this.menuContainer = apogeeapp.ui.createElementWithClass("div","visiui-tf_tab-menuDiv",this.tabLabelElement);
    this.titleElement = apogeeapp.ui.createElementWithClass("div","visiui_tf_tab_title",this.tabLabelElement);
    
    this.closeButton = apogeeapp.ui.createElementWithClass("img","visiui_tf_tab_cmd_button",this.tabLabelElement);
    this.closeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.CLOSE_CMD_IMAGE);
    
    var instance = this;
    this.closeButton.onclick = function() {
        instance.close();
    };
    
    //create the tab element
    this.displayFrame = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-window");
    this.tabInsideContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    this.displayFrame.appendChild(this.tabInsideContainer.getOuterElement());
    
    this.headerContainer = this.tabInsideContainer.getHeaderContainer();
    this.bodyContainer = this.tabInsideContainer.getBodyContainer();
    
    this.isShowing = false;
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.Tab,apogee.EventManager);

//---------------------------
// WINDOW CONTAINER
//---------------------------

/** This is called by the tab frame. */
apogeeapp.ui.Tab.prototype.setTabFrame = function(tabFrame) {
    this.tabFrame = tabFrame;
    var instance = this;
    //attach to listeners to forward show and hide events
    this.tabShownListener = function(tab) {
        if(tab == instance) {
            instance.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,instance);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.SHOWN_EVENT, this.tabShownListener);
    this.tabHiddenListener = function(tab) {
        if(tab == instance) {
            instance.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,instance);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.HIDDEN_EVENT, this.tabHiddenListener);
}

/** This sets the tab as the active tab. It returns true if it can do this. In the case
 * it does not have an active frame, it returns false. */
apogeeapp.ui.Tab.prototype.makeActive = function() {
    if(this.tabFrame) {
        this.tabFrame.setActiveTab(this.id);
        return true;
    }
    else {
        return false;
    }
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getId = function() {
    return this.id;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setTitle = function(title) {
    this.titleElement.innerHTML = title;
    this.title = title;
}

/** This sets the content for the window */
apogeeapp.ui.Tab.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    this.headerContainer.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.bodyContainer);
    this.bodyContainer.appendChild(contentElement);
    this.content = contentElement;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getTitle = function() {
    return this.title;
}

/** This method shows the window. */
apogeeapp.ui.Tab.prototype.createMenu = function(iconUrl) {
    if(!iconUrl) iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.ui.MENU_IMAGE);
    this.menu = apogeeapp.ui.Menu.createMenuFromImage(iconUrl);
    this.menuContainer.appendChild(this.menu.domElement);
    //add the icon overlay element
    this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_tf_icon_overlay",this.menuContainer);
    return this.menu;
}

/** This method shows the window. */
apogeeapp.ui.Tab.prototype.getMenu = function() {
    return this.menu;
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.ui.Tab.prototype.setIconOverlay = function(element) {
    if(this.iconOverlayElement) {
        this.clearIconOverlay();
        if(element) {
            this.iconOverlayElement.appendChild(element);
        }
    }
}

apogeeapp.ui.Tab.prototype.clearIconOverlay = function() {
    if(this.iconOverlayElement) {
        apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
    }
}

/** This method closes the window. */
apogeeapp.ui.Tab.prototype.close = function(forceClose) {
    if(!this.tabFrame) return;
    
    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }
    
    this.tabFrame.closeTab(this.id);
    this.tabFrame.removeListener(apogeeapp.ui.SHOWN_EVENT, this.tabShownListener);
    this.tabFrame.removeListener(apogeeapp.ui.HIDDEN_EVENT, this.tabHiddenListener);
    this.tabFrame = null;
    
    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
    
    
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getMainElement = function() {
    return this.displayFrame;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getLabelElement = function() {
    return this.tabLabelElement;
}

;
/** Thiis is a namespace with functions to control menu operation
 *
 * NOTE - the name apogeeapp.ui.Menu should be apogeeapp.ui.menu because this
 * is just a namespace and not a class. 
 *
 * @class 
 */
apogeeapp.ui.Menu = {};

apogeeapp.ui.Menu.initialized = false;
apogeeapp.ui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
apogeeapp.ui.Menu.createMenu = function(text) {
    var element = apogeeapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-text");
    element.innerHTML = text;
    return new apogeeapp.ui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
apogeeapp.ui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = apogeeapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-image");
    element.appendChild(imageElement);
    return new apogeeapp.ui.MenuHeader(element);
}

apogeeapp.ui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    apogeeapp.ui.Menu.show(menuBody);
}

apogeeapp.ui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing that header closes the active menu otherwise show the menu
	if(apogeeapp.ui.Menu.activeMenu === menuHeader) {
		//active menu - close the menu
		apogeeapp.ui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		apogeeapp.ui.Menu.show(menuHeader.getMenuBody());
	}
}

apogeeapp.ui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(apogeeapp.ui.Menu.activeMenu) {
		apogeeapp.ui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

apogeeapp.ui.Menu.show = function(menuBody) {
	if(apogeeapp.ui.Menu.activeMenu) {
		apogeeapp.ui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    menuBody.prepareShow();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        apogeeapp.ui.Menu.activeMenu = menuBody;
        //set the header to active
        var menuHeader = menuBody.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading visiui-menu-heading-active";
        }
    }
}

apogeeapp.ui.Menu.hideActiveMenu = function() {
	if(apogeeapp.ui.Menu.activeMenu) {
        var activeMenu = apogeeapp.ui.Menu.activeMenu;
        //set the header to normal (not active)
        var menuHeader = activeMenu.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading";
        }
        
        var parentElement = activeMenu.getParentElement();
        var menuElement = activeMenu.getMenuElement();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            apogeeapp.ui.Menu.activeMenu = null;
        }
        activeMenu.menuHidden();
	}
}

apogeeapp.ui.Menu.nonMenuMouseHandler = null;

apogeeapp.ui.Menu.initialize = function() {
	window.addEventListener("mousedown",apogeeapp.ui.Menu.nonMenuPressed);
	apogeeapp.ui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
apogeeapp.ui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",apogeeapp.ui.Menu.nonMenuPressed);
	apogeeapp.ui.Menu.initialized = false;
}
	;
/** This is a menu component, attached to the given dom element
 *
 * @class 
 */
apogeeapp.ui.MenuHeader = function(domElement) {
	
	//initialize menus, if needed
	if(!apogeeapp.ui.Menu.initialized) {
		apogeeapp.ui.Menu.initialize();
	}
	
    //variables
    this.domElement = domElement;
    this.menuBody = new apogeeapp.ui.MenuBody();
	
    //construct the menu
	this.initHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHeader(this);
}

/** this returns the dom element for the menu heading. */
apogeeapp.ui.MenuHeader.prototype.getElement = function() {
    return this.domElement;
}

/** this returns the dom element for the menu heading. */
apogeeapp.ui.MenuHeader.prototype.setChildLocation = function(childLocation) {
    this.childLocation = childLocation;
}

/** this returns the dom element for the menu heading. */
apogeeapp.ui.MenuHeader.prototype.getChildLocation = function() {
    return this.childLocation;
}

/** this returns the dom element for the menu object. */
apogeeapp.ui.MenuHeader.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.removeMenuItem = function(title) {
	this.menuBody.removeMenuItem(title);
}

/** This sets a callback to create the menu when the menu is opened. This is
 * for static menus where we do not want to populate it ahead of time. */
apogeeapp.ui.MenuHeader.prototype.setAsOnTheFlyMenu = function(getMenuItemsCallback) {
	this.menuBody.setAsOnTheFlyMenu(getMenuItemsCallback);
}
//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuHeader.prototype.initHeadingElement = function() {	
    var instance = this;
    this.domElement.onmousedown = function(e) {
        apogeeapp.ui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }	
}

;
/** This is a menu component
 *
 * @class 
 */
apogeeapp.ui.MenuBody = function() {
	
	//initialize menus, if needed
	if(!apogeeapp.ui.Menu.initialized) {
		apogeeapp.ui.Menu.initialize();
	}
	
    //variables
    this.menuDiv = null;
    this.parentElement = null;
	
    this.menuItems = {};
	
    //construct the menu
    this.createMenuElement();
    
    //this will be set if it is a static menu
    this.menuHeader = null;
}

/** this returns the dom element for the menu object. */
apogeeapp.ui.MenuBody.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getParentElement = function() {
    return this.parentElement;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getMenuHeader = function() {
    return this.menuHeader;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getIsContext = function() {
    return (this.menuHeader == null);
}

/** This is called before the menu body is shown */
apogeeapp.ui.MenuBody.prototype.prepareShow = function() {
    if(this.isOnTheFlyMenu) {
        this.constructItemsForShow();
    }
}

/** This is called after the menu body is hidden. */
apogeeapp.ui.MenuBody.prototype.menuHidden = function() {
    if(this.isOnTheFlyMenu) {
        this.destroyItemsForHides();
    }
}

/** This method is used to attach the menu to the menu head, in a static menu. */
apogeeapp.ui.MenuBody.prototype.attachToMenuHeader = function(menuHeader) {
    //attach menu to heading
    this.parentElement = menuHeader.getElement();
    this.menuDiv.style.left = "0%";
    this.menuDiv.style.top = "100%";
    this.menuHeader = menuHeader;
}

/** This method is used to set the position for a context menu. The x and y coordinates
 * should be the coordinates in the parent element. It is recommended to use the 
 * document body. */
apogeeapp.ui.MenuBody.prototype.setPosition = function(x, y, parentElement) {
    this.parentElement = parentElement;
   
//we need to calculate the size, so I add and remove it - there is probably another way
parentElement.appendChild(this.menuDiv);
    var parentWidth = parentElement.offsetWidth;
    var parentHeight = parentElement.offsetHeight;
    var menuWidth = this.menuDiv.clientWidth;
    var menuHeight = this.menuDiv.clientHeight;
parentElement.appendChild(this.menuDiv);

    //position
    if((x + menuWidth > parentWidth)&&(x > parentWidth/2)) {
        this.menuDiv.style.left = (x - menuWidth) + "px";
    }
    else {
        this.menuDiv.style.left = x + "px";
    }
    if((y + menuHeight > parentHeight)&&(y > parentHeight/2)) {
        this.menuDiv.style.top = (y - menuHeight) + "px";
    }
    else {
        this.menuDiv.style.top = y + "px";
    }
}

/** This sets a callback to create the menu when the menu is opened. This is
 * for static menus where we do not want to populate it ahead of time. */
apogeeapp.ui.MenuBody.prototype.setAsOnTheFlyMenu = function(menuItemsCallback) {
	this.isOnTheFlyMenu = true;
    this.menuItemsCallback = menuItemsCallback;
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.eventData = eventData;
    itemInfo.eventManager = eventManager;
    this.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addCallbackMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
    this.addMenuItem(itemInfo);
}
    
/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addMenuItem = function(itemInfo) {
    itemInfo.element = apogeeapp.ui.createElementWithClass("div","visiui-menu-item");
    itemInfo.element.innerHTML = itemInfo.title;
    
    if(itemInfo.childMenuItems) {
        //create a parent menu item
        var childMenuBody = this.createChildMenuBody(itemInfo.childMenuItems);
        var childMenuDiv = childMenuBody.getMenuElement();
        childMenuDiv.style.left = "100%";
        childMenuDiv.style.top = "0%";
        itemInfo.element.appendChild(childMenuDiv);
        
        //prevent normal action on a click
        itemInfo.element.onmousedown = function(event) {
            event.stopPropagation();
        }
        itemInfo.element.onclick = function(event) {
            event.stopPropagation();
        }
    }
    else {
        //create a norman (clickable) menu item
        itemInfo.element.onmousedown = function(event) {
            event.stopPropagation();
        }
        itemInfo.element.onclick = function(event) {
            //close menu
            apogeeapp.ui.Menu.hideActiveMenu();

            //do menu action
            if(itemInfo.eventName) {
                //dispatch event
                itemInfo.eventManager.dispatchEvent(itemInfo.eventName,itemInfo.eventData);
            }
            else if(itemInfo.callback) {
                //use the callback
                itemInfo.callback();
            }
            event.stopPropagation();
        }
    }
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[itemInfo.title] = itemInfo;
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.setMenuItems = function(itemInfos) {
    for(var i = 0; i < itemInfos.length; i++) {
        this.addMenuItem(itemInfos[i]);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.removeMenuItem = function(title) {
    var itemInfo = this.menuItems[title];
    if(itemInfo) {
        this.menuDiv.removeChild(itemInfo.element);
        delete this.menuItems[title];
    }
}

//================================
// Internal
//================================

/** This method creates the menu body that is shown below the header. */
apogeeapp.ui.MenuBody.prototype.createMenuElement = function() {
    this.menuDiv = apogeeapp.ui.createElementWithClass("div","visiui-menu-body");
}

apogeeapp.ui.MenuBody.prototype.constructItemsForShow = function () {
    if(this.menuItemsCallback) {
        var menuItems = this.menuItemsCallback();
        this.setMenuItems(menuItems);
    }
}

/** This is called after the menu body is hidden. */
apogeeapp.ui.MenuBody.prototype.destroyItemsForHides = function() {
    if(this.menuDiv) {
        apogeeapp.ui.removeAllChildren(this.menuDiv);
    }
    this.menuItems = {};
}

apogeeapp.ui.MenuBody.prototype.createChildMenuBody = function(menuItems) {
    var childMenuBody = new apogeeapp.ui.MenuBody();
    childMenuBody.setMenuItems(menuItems);
    return childMenuBody;
};
apogeeapp.jsonedit = {};

var OBJECT_CONSTRUCTOR = {}.constructor;
var ARRAY_CONSTRUCTOR = [].constructor;
var STRING_CONSTRUCTOR = "".constructor;
var NUMBER_CONSTRUCTOR = (0).constructor;
var BOOLEAN_CONSTRUCTOR = (true).constructor;

//inputs to this should be "object", "array" or "value". Other type objects will not be processed properly
apogeeapp.jsonedit.getObjectType = function(data) {
	if(data == null) return "value";
	
	if(data.constructor == OBJECT_CONSTRUCTOR) {
		return "object";
	}
	else if(data.constructor == ARRAY_CONSTRUCTOR) {
		return "array";
	}
	else {
		return "value";
	}
}

//this tells a type value: "string", "number", "boolean", "other", "null"
apogeeapp.jsonedit.getValueType = function(value) {
	if(value == null) return "null";
	
	if(value.constructor == STRING_CONSTRUCTOR) {
		return "string";
	}
	else if(value.constructor == NUMBER_CONSTRUCTOR) {
		return "number";
	}
	else if(value.constructor == BOOLEAN_CONSTRUCTOR) {
		return "boolean";
	}
	else {
		return "other";
	}
}

apogeeapp.jsonedit.isBoolString = function(stringValue) {
    return (stringValue === "false" || stringValue === "true");
}

apogeeapp.jsonedit.isNullString = function(stringValue) {
    return (stringValue === "null");
}

//This method retuns true if the stringToNonString method will successfully convet the object.
apogeeapp.jsonedit.canBeConvertedToNonString = function(stringValue) {
	return(isFinite(stringValue) || apogeeapp.jsonedit.isBoolString(stringValue) || apogeeapp.jsonedit.isNullString(stringValue) );
}

//This method coverts a string value to non-string value (currently a number or boolean). 
//If the conversion fails, it returns the string value.
//before the method is called it should be checked that it is a valid
//number or boolean.
apogeeapp.jsonedit.stringToNonString = function(stringValue) {
	var stringToValueCode = "value = " + stringValue;
	var value;
	try {
	  eval(stringToValueCode);
	  return value;
	}
	catch(error) {
	  return stringValue;
	}
}

var PIXELS_PER_INDENT = 10;
apogeeapp.jsonedit.createIndentElement = function(indentLevel) {
	var cell = document.createElement("div");
	cell.className = "indentCell";
	cell.style.width = (PIXELS_PER_INDENT * indentLevel) + "px";
	return cell;
}

apogeeapp.jsonedit.createObjectDelimiter = function(delimiter) {
	var cell = document.createElement("div");
	cell.className = "objectDelimCell";
	cell.innerHTML = delimiter;
	return cell;
}
apogeeapp.jsonedit.createExpandButton = function(valueEntry) {
	var cell = document.createElement("div");
	cell.className = "buttonCell";
	cell.innerHTML = "+";
	cell.onclick = function() {
		valueEntry.setExpanded(true);
	}
	return cell;
}
apogeeapp.jsonedit.createContractButton = function(valueEntry) {
	var cell = document.createElement("div");
	cell.className = "buttonCell";
	cell.innerHTML = "-";
	cell.onclick = function() {
		valueEntry.setExpanded(false);
	}
	return cell;
}


;
/** Constructor */
apogeeapp.jsonedit.KeyEntry = function(editArea,parentValue,key,keyType,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.key = key;
	this.type = keyType; //apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY ro apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX
	this.data = data;
	this.isEditable = isEditable;
	this.indentLevel = parentValue.getIndentLevel() + 1;
    this.parentValue = parentValue;
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
	this.body = null;
    
    //this is the edit control for the key
    this.keyEditObject = null;
    
    this.valueEntry = null;
	
	this.createBody(this.data);
}

//=======================
// Accessors
//=======================

apogeeapp.jsonedit.KeyEntry.prototype.setKey = function(key) {
	this.key = key;
    this.keyEditObject.setValue(key);
}

apogeeapp.jsonedit.KeyEntry.prototype.getInitialKey = function() {
	return this.key;
}

apogeeapp.jsonedit.KeyEntry.prototype.getCurrentKey = function() {
	return this.keyEditObject.getValue();
}

apogeeapp.jsonedit.KeyEntry.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

apogeeapp.jsonedit.KeyEntry.prototype.getElement = function() {
	return this.body;
}

apogeeapp.jsonedit.KeyEntry.prototype.getParentValueObject = function() {
	return this.parentValue;
}

apogeeapp.jsonedit.KeyEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

apogeeapp.jsonedit.KeyEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;
	this.keyEditObject.setIsVirtual(isVirtual);

    this.valueEntry.setIsVirtual(isVirtual);
}

apogeeapp.jsonedit.KeyEntry.prototype.updateValueElements = function() {
    //remove all from element
	apogeeapp.ui.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

//=================================
// Others Methods
//=================================

/** This method created the key entry, clearing the old one if applicable.
 * @private */
apogeeapp.jsonedit.KeyEntry.prototype.createBody = function(entryData) {
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
    
    //create the key
    this.createKeyElement();
    
    //create value entry
	this.valueEntry = new apogeeapp.jsonedit.ValueEntry(this.editArea,this,entryData,this.isEditable,this.isVirtual);
	
    this.formatBody();
}

/** @private */
apogeeapp.jsonedit.KeyEntry.prototype.formatBody = function() {
	//add indent
	this.body.appendChild(apogeeapp.jsonedit.createIndentElement(this.indentLevel));
	
	//add key
	this.body.appendChild(this.keyEditObject.getElement());
	
    //add the value elements
	var valueElementList = this.valueEntry.getElementList();
    for(var i = 0; i < valueElementList.length; i++) {
        this.body.appendChild(valueElementList[i]);
    }
}

/** This wraps the list elements into the proper format. 
* @private */
apogeeapp.jsonedit.KeyEntry.prototype.createKeyElement = function() {
    
	var isEditable = (this.type === apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY) ? this.isEditable : false;
	
    this.keyEditObject = new apogeeapp.jsonedit.EditField(this.key,this.type,isEditable,this.isVirtual);
    
    //make the edit field editable if it is a key
    if(isEditable) {
        var instance = this;
        var onEdit = function(editValue) {
            if(instance.isVirtual) {
                instance.parentValue.makeVirtualEntryReal();
            }
            
            //notify of edit
            instance.editArea.valueEdited();
        }
        this.keyEditObject.setOnEditCallback(onEdit);
        
        //set the navgation callback
        var navCallback = function(direction) {
            instance.navigateCells(direction);
        }
        this.keyEditObject.setNavCallback(navCallback);
    }
}

//navigation rules
apogeeapp.jsonedit.KeyEntry.prototype.navigateCells = function(direction) {
    if(this.parentValue) {
        this.parentValue.navigateChildren(this,true,direction);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
apogeeapp.jsonedit.KeyEntry.prototype.loadContextMenu = function(parentKeyCount,keyIndex) {

    var instance = this;
    var parentValue = this.parentValue; 
    var element = this.keyEditObject.getElement();
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    var isVirtual = this.isVirtual;
    
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
		
		//for now no context menu if nto editable
		if(!instance.isEditable) return;
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        
        if(!isVirtual) {
            //insert elements
            contextMenu.addCallbackMenuItem("Insert Above",function() {parentValue.insertElement("","",keyIndex);});
            contextMenu.addCallbackMenuItem("Insert Below",function() {parentValue.insertElement("","",keyIndex+1);});

            if(keyIndex > 0) {
                contextMenu.addCallbackMenuItem("Move Up",function() {parentValue.moveChildKeyToNextIndex(keyIndex-1);});
            }
            if(keyIndex < parentKeyCount - 1) {
                contextMenu.addCallbackMenuItem("Move Down",function() {parentValue.moveChildKeyToNextIndex(keyIndex);});
            }

            //delete elements
            if(!instance.isVirtual) {
                contextMenu.addCallbackMenuItem("Delete Entry",function() {parentValue.deleteChildElement(instance);});
            }

            //conversions
            if(valueType == "value") {
                contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.valueToObject()});
                contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.valueToArray()});

                if(valueEntry.convertibleToNumber()) {
                    contextMenu.addCallbackMenuItem("Convert To Number",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToBool()) {
                    contextMenu.addCallbackMenuItem("Convert To Boolean",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToNull()) {
                    contextMenu.addCallbackMenuItem("Convert To Null",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToString()) {
                    contextMenu.addCallbackMenuItem("Convert To String",function() {valueEntry.valueToString()});
                }
            }
            else if(valueType == "object") {
                contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
                contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.objectToArray()});
            }
            else if(valueType == "array") {
                contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
                contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.arrayToObject()});
            }
        }
        
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
    
    //if this is a value entry, set the same context menu on the value element
    if(valueType == "value") {
        var valueEditObject = this.valueEntry.getValueEditObject();
        valueEditObject.getElement().oncontextmenu = element.oncontextmenu;
    }
  
}

//======================================
// Actions
//======================================

apogeeapp.jsonedit.KeyEntry.prototype.convertToKeyType = function(key) {
    if(this.type == apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY) return;
    
    this.type = apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY;
    this.key = String(key);
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
	apogeeapp.ui.removeAllChildren(this.body);
    this.formatBody();
}

apogeeapp.jsonedit.KeyEntry.prototype.convertToIndexType = function(index) {
    if(this.type == apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX) return;
    
    this.type = apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX;
    this.key = index;
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
    apogeeapp.ui.removeAllChildren(this.body);
    this.formatBody();
}


;
/**  This a value entry
 * 
 * notes:
 * - parent is the object that holds the dom elements for this value. it will be
 * either the key for this value or the top level entry. It should have a method
 * "updateValueElements" that will refresh the elements if they have been updated.
 */
apogeeapp.jsonedit.ValueEntry = function(editArea,parent,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.parent = parent;
    this.data = data;
	this.isEditable = isEditable;
	this.type = apogeeapp.jsonedit.getObjectType(data); //"value", "object", "array"

	this.indentLevel = parent.getIndentLevel() + 1;
    
    //these are all the display elements
    this.elementList = [];
    
    //thse are for virtual key entries
    this.isVirtual = isVirtual;
    
    //for value types ---
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //---------------------
    
    //for list types ----
	
	//these are the child keys
    this.childKeyEntries = [];
    
    //this is the virtual child key
    this.virtualChildKey = null;
	
    //this is the singel element for the list entries (if applicable)
	this.listDiv = null;
    
    //this is used to control expanding and collapsing
    this.isExpanded = true;
	this.expandedList = [];
	this.contractedList = [];
    
    //-------------------
    
    if(this.type == "value") {
        //-----------------------------
        //update the data for a simple value entry
        //-----------------------------
        this.createValueEntry(this.data);
    }
    else {
        //-----------------------------
        //update the child key entries
        //-----------------------------
        this.createChildKeyEntries(this.data);

        //------------------------
        //update keys as needed
        //------------------------
        this.updateChildKeys();

        //----------------------------
        //update the dom element list
        //----------------------------
        this.createElementList();
    }
}

//============================
// Accessors
//============================

apogeeapp.jsonedit.ValueEntry.prototype.getInitialValue = function() {
    return this.data;
}

apogeeapp.jsonedit.ValueEntry.prototype.getCurrentValue = function() {
	var value;
    var i;
    var keyEntry;
    if(this.type == "value") {
        //create a simple element
        value = this.valueEditObject.getValue();
    }
    else if(this.type == "object") {
        value = {};
        for(i = 0; i < this.childKeyEntries.length; i++) {
            keyEntry = this.childKeyEntries[i];
            value[keyEntry.getCurrentKey()] = keyEntry.getCurrentValue();
        }
    }
    else if(this.type == "array") {
        value = [];
        for(i = 0; i < this.childKeyEntries.length; i++) {
            keyEntry = this.childKeyEntries[i];
            value[i] = keyEntry.getCurrentValue();
        }
    }
    return value;
}

apogeeapp.jsonedit.ValueEntry.prototype.getType = function() {
	return this.type;
}

apogeeapp.jsonedit.ValueEntry.prototype.setExpanded = function(isExpanded) {
	this.isExpanded = isExpanded;
    this.doExpandContract();
}

apogeeapp.jsonedit.ValueEntry.prototype.getElementList = function() {
	return this.elementList;
}

apogeeapp.jsonedit.ValueEntry.prototype.getValueEditObject = function() {
	return this.valueEditObject;
}

apogeeapp.jsonedit.ValueEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

apogeeapp.jsonedit.ValueEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;  
    
	this.valueEditObject.setIsVirtual(isVirtual);
}



//----------------------------
// Navigation between cells
//----------------------------

/** This navigates to a next cell on completion of editing. 
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.navigateCells = function(direction) {
    var parentValue = this.parent.getParentValueObject();
    if(parentValue) {
        parentValue.navigateChildren(this.parent,false,direction);
    }
}

/** This method determines the place to navigation to, and starts editing there
 * if the re is a valid location. 
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.navigateChildren = function(keyEntry,originIsKey,direction) {
    
    //gerate the nav fruls
    var destIsKey = false;
    var deltaIndex = 0;
    var doMove;
    
    if(this.type == "array") {
        if((direction == apogeeapp.jsonedit.EditField.DIRECTION_NEXT)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_DOWN)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 1;
            }
        }
        else if((direction == apogeeapp.jsonedit.EditField.DIRECTION_PREV)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_UP)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = -1;
            }
        }
        else if((direction == apogeeapp.jsonedit.EditField.DIRECTION_RIGHT)||(direction == apogeeapp.jsonedit.EditField.DIRECTION_LEFT)) {
            doMove = false;
        }
    }
    else if(this.type == "object") {
        if(direction == apogeeapp.jsonedit.EditField.DIRECTION_NEXT) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? 0 : 1;  
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_PREV) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? -1 : 0; 
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_RIGHT) {
            doMove = originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 0; 
            }
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_LEFT) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = true;
                deltaIndex = 0; 
            }
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_UP) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = -1; 
        }
        else if(direction == apogeeapp.jsonedit.EditField.DIRECTION_DOWN) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = 1; 
        }
    }
    
    if(doMove) {
    	var oldIndex;
        var newIndex = -1;
        var newKeyEntry = null;
        var editObject;

		//get the old index
		if(keyEntry == this.virtualChildKey) {
        	oldIndex = this.childKeyEntries.length;
        }
        else {
        	oldIndex = this.childKeyEntries.indexOf(keyEntry);
        }

        //get the new key
        if(oldIndex >= 0) {
            newIndex = oldIndex + deltaIndex;
            if((newIndex >= 0)&&(newIndex < this.childKeyEntries.length)) {
                //get key entry - the normal ones
                newKeyEntry = this.childKeyEntries[newIndex];
            }
            else if(newIndex == this.childKeyEntries.length) {
                //this is the index of the virtual key
                newKeyEntry = this.virtualChildKey;
            }
        }
            
        //get the edit field
		if(newKeyEntry) {
			
			if(destIsKey) {
				//get key entry - presumably this is not an array
				editObject = newKeyEntry.keyEditObject;
			}
			else {
				var valueEntry = newKeyEntry.valueEntry;
				//only navigation if the dest cell is a value. 
				//if it is an array or object do not navigate
				if(valueEntry.getType() == "value") {
					editObject = valueEntry.valueEditObject;
				}
			}
		}

		//if we found a valid edit object, start editing
		if(editObject) {
			editObject.startEdit();
		}
    }
}

//--------------------------
// Edit Operations
//--------------------------

/** This method inserts an element at the given index. If the index is left blank
 * the entry is inserted at the end of the list. The value of key is ignored if
 * the entry is an array. */
apogeeapp.jsonedit.ValueEntry.prototype.insertElement = function(key,value,index) {

    var childKeyEntry;
    
    //get the insert index
    if(index === undefined) {
        index = this.childKeyEntries.length;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    var insertBefore;
    if(index >= this.childKeyEntries.length) {
        insertBefore = this.virtualChildKey.getElement();
    }
    else {
        insertBefore = this.childKeyEntries[index].getElement();
    }
    
    if(this.type == "object") {
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,key,"key",value,this.isEditable,false);     
    }
    else if(this.type == "array") {
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,index,"index",value,this.isEditable,false);
        
        //we also need to update all the keys larger than this one
        for(var newIndex = index+1; newIndex < this.childKeyEntries.length; newIndex++) {
            this.childKeyEntries[newIndex].setKey(newIndex);
        }
        this.virtualChildKey.setKey(this.childKeyEntries.length + 1);
    }
    
    this.childKeyEntries.splice(index,0,childKeyEntry);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.insertBefore(childKeyEntry.getElement(),insertBefore);
}

/** this method swaps the given key with the next key in the list. */
apogeeapp.jsonedit.ValueEntry.prototype.moveChildKeyToNextIndex = function(index) {
    if((index < 0)||(index >= this.childKeyEntries.length -1)) {
        //illegal index
        alert("Can not make the specified key move");
        return;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    var oldFirstKey = this.childKeyEntries[index];
    var oldSecondKey = this.childKeyEntries[index+1];
    
    this.childKeyEntries[index] = oldSecondKey;
    this.childKeyEntries[index+1] = oldFirstKey;
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.insertBefore(oldSecondKey.getElement(),oldFirstKey.getElement());
    
}

/** This method inserts an element at the given index. If the index is left blank
 * the entry is inserted at the end of the list. The value of key is ignored if
 * the entry is an array. */
apogeeapp.jsonedit.ValueEntry.prototype.deleteChildElement = function(keyEntry) {
    
    var index = this.childKeyEntries.indexOf(keyEntry);
    if(index == -1) {
        alert("Element not found!");
        return;
    }
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    this.childKeyEntries.splice(index,1);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.listDiv.removeChild(keyEntry.getElement());
}


///////////////////////////////////////////////////////////////////////////////

//------------------------------
// Conversions
//------------------------------


apogeeapp.jsonedit.ValueEntry.prototype.convertibleToNumber = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return isFinite(currentValue);
        }
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToBool = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return apogeeapp.jsonedit.isBoolString(currentValue);
        }
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToNull = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return apogeeapp.jsonedit.isNullString(currentValue);
        }
    }
    return false;
}

//this converts a string to a number or boolean
apogeeapp.jsonedit.ValueEntry.prototype.valueToNonString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = apogeeapp.jsonedit.stringToNonString(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.convertibleToString = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = apogeeapp.jsonedit.getValueType(currentValue);
        return (valueType !== "string");
    }
    return false;
}

apogeeapp.jsonedit.ValueEntry.prototype.valueToString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = String(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}


apogeeapp.jsonedit.ValueEntry.prototype.valueToArray = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "array";
    
    //these are the edit elements
    var newValue = [this.valueEditObject.getValue()];
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
	this.createChildKeyEntries(newValue);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.valueToObject = function() {
    if(!this.type == "value") {
        throw "Type value expected. Found " + this.type;
    }
    this.type = "object";
    
    //these are the edit elements
    var newValue = {"a":this.valueEditObject.getValue()};
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
	this.createChildKeyEntries(newValue);
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
   
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.objectToArray = function() {
    if(!this.type == "object") {
        throw "Type object expected. Found " + this.type;
    }
    this.type = "array";
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    //reconfigure the existing list (rather than remaking all the objects)
    var i = 0;
    if(this.childKeyEntries) {
        for(i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToIndexType(i);
        }
    }
	if(this.virtualChildKey) {
		this.virtualChildKey.convertToIndexType(i);
	}
    
    //these are the edit elements
    this.valueEditObject = null;
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();
    
    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.arrayToObject = function() {
    if(!this.type == "array") {
        throw "Type array expected. Found " + this.type;
    }
    this.type = "object";
    
    //-----------------------------
    //update the child key entries
    //-----------------------------
    //reconfigure the existing list (rather than remaking all the objects)
	var i = 0;
    if(this.childKeyEntries) {
        for(i = 0; i < this.childKeyEntries.length; i++) {
            var childKeyEntry = this.childKeyEntries[i];
            childKeyEntry.convertToKeyType(String(i));
        }
    }
	if(this.virtualChildKey) {
		this.virtualChildKey.convertToKeyType("");
	}
    
    //------------------------
    //update keys as needed
    //------------------------
    this.updateChildKeys();

    //----------------------------
    //update the dom element list
    //----------------------------
    this.createElementList();
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
    
    //notify of edit
    this.editArea.valueEdited();
}

apogeeapp.jsonedit.ValueEntry.prototype.convertToValue = function() {
    if(this.type == "value") {
        return;
    }
   
    //update type
    this.type = "value";
    
    var value;
    if((this.childKeyEntries)&&(this.childKeyEntries.length > 0)) {
        var firstChildKey = this.childKeyEntries[0];
        value = firstChildKey.getCurrentValue();
    }
    else {
        value = "";
    }
    
    //-----------------------------
    //update the data for a simple value entry
    //-----------------------------
    this.createValueEntry(value);
    
    //refresh the parent key
    if(this.parent) {
        var parentValueObject = this.parent.getParentValueObject();
        if(parentValueObject) {
            parentValueObject.updateChildKeys();
        }
        
        this.parent.updateValueElements();
    }
    
    //notify of edit
    this.editArea.valueEdited();
}

//==============================
// Construction Methods
//==============================

/** This method constructs the contents for a value entry
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.createValueEntry = function(elementsData) {
    if(this.type != "value") return;
    
    this.valueEditObject = null;
    this.childKeyEntries = [];
	this.virtualChildKey = null;
	this.elementList = [];
	
    //create the value element
    this.createValueElement(elementsData);

    //clear the list elements
    this.listDiv = null;
    this.contractedList = null;
    this.expandedList = null;
}

/** This method constructs the contents for an array or object
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.createChildKeyEntries = function(elementsData) {
    if(this.type == "value") return;
    
	//initialize data elements
    this.valueEditObject = null;
    this.childKeyEntries = [];
	this.virtualChildKey = null;
	this.elementList = [];

    //create the child keys for the object or array
    var childKeyEntry;
    if(this.type == "object") { 
        for(var key in elementsData) {
            childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,key,"key",elementsData[key],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

        //add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }
    else if(this.type == "array") {
        for(var keyIndex = 0; keyIndex < elementsData.length; keyIndex++) {
            childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index",elementsData[keyIndex],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

		//add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }

}

/** This create the dom element list for the child key entries 
* @private */
apogeeapp.jsonedit.ValueEntry.prototype.createElementList = function() {

    //initialize elements
	this.listDiv = document.createElement("div");
    this.elementList = [];
    this.contractedList = [];
    this.expandedList = [];
    
    var startDelimiter;
    var endDelimiter1;
    var endDelimiter2;
    var endIndent = apogeeapp.jsonedit.createIndentElement(this.indentLevel);

	//list element
	var childKeyEntry;
	for(var i = 0; i < this.childKeyEntries.length; i++) {
		childKeyEntry = this.childKeyEntries[i];
		this.listDiv.appendChild(childKeyEntry.getElement());
	}
	if(this.virtualChildKey) {
		this.listDiv.appendChild(this.virtualChildKey.getElement());
	}

    //buttons
    var expandButton = apogeeapp.jsonedit.createExpandButton(this);
    var contractButton = apogeeapp.jsonedit.createContractButton(this);

    if(this.type == "object") { 
        startDelimiter = apogeeapp.jsonedit.createObjectDelimiter("{");
        endDelimiter1 = apogeeapp.jsonedit.createObjectDelimiter("}");
        endDelimiter2 = apogeeapp.jsonedit.createObjectDelimiter("}");
    }
    else if(this.type == "array") {
        startDelimiter = apogeeapp.jsonedit.createObjectDelimiter("[");
        endDelimiter1 = apogeeapp.jsonedit.createObjectDelimiter("]");
        endDelimiter2 = apogeeapp.jsonedit.createObjectDelimiter("]");
    }

    //save the elements
    //shared
    this.elementList.push(startDelimiter);

    //contracted elements
    this.elementList.push(expandButton);
    this.contractedList.push(expandButton);

    this.elementList.push(endDelimiter1);
    this.contractedList.push(endDelimiter1);

    //expanded elements
    this.elementList.push(contractButton);
    this.expandedList.push(contractButton);

    if((this.childKeyEntries.length > 0)||(this.virtualChildKey)) {
        this.elementList.push(this.listDiv);
        this.expandedList.push(this.listDiv);

        //indent before the closing brace
        this.elementList.push(endIndent);
        this.expandedList.push(endIndent);
    }
    this.elementList.push(endDelimiter2);
    this.expandedList.push(endDelimiter2);

    //set the expand.contract visibility
    this.doExpandContract();
}


/** This method updates the keys with the context menu and makes
 * sure the keys are corect for array entries. 
 * @private */
apogeeapp.jsonedit.ValueEntry.prototype.updateChildKeys = function() {
    var numberKeys;
    var keyIndex;
    
    if(this.type == "object") {
        var key;
        
        //count keys
        numberKeys = 0;
        for(key in this.childKeyEntries) {
            numberKeys++;
        }

        keyIndex = 0;
        for(key in this.childKeyEntries) {
            var childKeyEntry = this.childKeyEntries[key];
            
            //set the context menu
            childKeyEntry.loadContextMenu(numberKeys,keyIndex);
            keyIndex++;
        }
        
        //context menu
		if(this.virtualChildKey) {
			this.virtualChildKey.loadContextMenu(numberKeys,numberKeys);
		}
    }
    else if(this.type == "array") {
        numberKeys = this.childKeyEntries.length;
        
        //set context menu and make sure index is correct
        for(keyIndex = 0; keyIndex < numberKeys; keyIndex++) {
            childKeyEntry = this.childKeyEntries[keyIndex];
            
            //make sure the index is correct
            if(childKeyEntry.getCurrentKey() != keyIndex) {
                childKeyEntry.setKey(keyIndex);
            }
            
            //set the context menu
            childKeyEntry.loadContextMenu(numberKeys,keyIndex);
        }
        
        if(this.virtualChildKey) {
            if(this.virtualChildKey.getCurrentKey() != numberKeys) {
                this.virtualChildKey.setKey(numberKeys);
            }
            
            //context menu
            this.virtualChildKey.loadContextMenu(numberKeys,numberKeys);
        }
    }
}


apogeeapp.jsonedit.ValueEntry.prototype.doExpandContract = function() {
	if((!this.expandedList)||(!this.contractedList)) return;
	
	var onList = this.isExpanded ? this.expandedList : this.contractedList;
	var offList = !this.isExpanded ? this.expandedList : this.contractedList;
	
	var i;
	var element;
	for(i = 0; i < onList.length; i++) {
		element = onList[i];
		element.style.display = "";
	}
	for(i = 0; i < offList.length; i++) {
		element = offList[i];
		element.style.display = "none";
	}
}


/** This creates the edit element for the entry. Only needed on type "value" 
* @private */
apogeeapp.jsonedit.ValueEntry.prototype.createValueElement = function(data) {

    //create a simple element
    this.valueEditObject = new apogeeapp.jsonedit.EditField(data,apogeeapp.jsonedit.EditField.FIELD_TYPE_VALUE,this.isEditable,this.isVirtual);
    var instance = this;
    
    //make the edit field editable if it is a key
    var onEdit = function(editValue) {
        if(instance.isVirtual) {
            var parentValueObject = instance.parent.getParentValueObject();
            if(parentValueObject) {
                parentValueObject.makeVirtualEntryReal();
            }
        }
        
        //notify of edit
        instance.editArea.valueEdited();
    }
    this.valueEditObject.setOnEditCallback(onEdit);

    
    //set the navgation callback
    var navCallback = function(direction) {
        instance.navigateCells(direction);
    }
    this.valueEditObject.setNavCallback(navCallback);
    
    var element = this.valueEditObject.getElement();
    this.elementList.push(element);
}



/** This wraps the list elements into the proper format. */
apogeeapp.jsonedit.ValueEntry.prototype.makeVirtualEntryReal = function(data) {
    var newRealEntry = this.virtualChildKey
    newRealEntry.setIsVirtual(false);
    this.childKeyEntries.push(newRealEntry);
    
    var childKeyEntry;
    if(this.type == "object") { 
        //add a dummy entry
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
        this.virtualChildKey = childKeyEntry;
    }
    else if(this.type == "array") {
        //add a dummy entry
        childKeyEntry = new apogeeapp.jsonedit.KeyEntry(this.editArea,this,this.childKeyEntries.length,"index","",this.isEditable,true);
        this.virtualChildKey = childKeyEntry;
    }
    
    this.updateChildKeys();
    
    this.createElementList();
    
    this.parent.updateValueElements();
    
}



;
/** This is an edit field. If an overide change callback is added
 * it will be called after an edit and the value of this field will
 * be returned to the previous value. Otherwise, the value of the field
 * fill be updated to match the edit.
 */
apogeeapp.jsonedit.EditField = function (value,fieldType,isEditable,isVirtual) {
	this.fieldType = fieldType;
	this.isEditable = isEditable;
	this.isVirtual = isVirtual;
	
    this.element = document.createElement("div");
       
    this.onEdit = null;
    this.onNavigate = null;
    
    //this will be set while the element is being edited
    this.editField = null;
    
    //start editing on a click
    var instance = this;
    this.element.onclick = function() {
		instance.onClick();
	};
   
    this.setValue(value);
}

apogeeapp.jsonedit.EditField.FIELD_TYPE_VALUE = "value";
apogeeapp.jsonedit.EditField.FIELD_TYPE_KEY = "key";
apogeeapp.jsonedit.EditField.FIELD_TYPE_INDEX = "index";

apogeeapp.jsonedit.EditField.prototype.setOnEditCallback= function(onEdit) {
    return this.onEdit = onEdit;
}

apogeeapp.jsonedit.EditField.prototype.setNavCallback = function(onNavigate) {
    this.onNavigate = onNavigate;
}

apogeeapp.jsonedit.EditField.prototype.setIsVirtual = function(isVirtual) {
    this.isVirtual = isVirtual;
	this.setCssClass();
}

apogeeapp.jsonedit.EditField.prototype.getValue= function() {
    return this.value;
}

apogeeapp.jsonedit.EditField.prototype.setValue = function(value) {
	
	if(value === undefined) {
		value = null;
		console.log("The value undefined is not valid for a JSON. It has been converted to null.");
	}
	
    this.value = value;
    this.isString = (apogeeapp.jsonedit.getValueType(value) === "string");
	this.setCssClass();

	//display value (with some exceptions)
	if(value === null) {
		//show null for null value
		this.element.innerHTML = "null"
	}
	else if(value === "") {
		//this keeps the height from shrinking
		this.element.innerHTML = "&nbsp;"
	}
	else {
		this.element.innerHTML = value;
	}
}

/** @private */
apogeeapp.jsonedit.EditField.prototype.setCssClass = function() {
	var cssName = "cell_base cell_" + this.fieldType;
	if(this.isVirtual) {
		cssName += "_virtual";
	}
	else if(this.fieldType === "value") {
		if(this.isString) {
			cssName += "_string";
		}
		else {
			cssName += "_nonstring";
		}
	}
	
	this.element.className = cssName;
}

apogeeapp.jsonedit.EditField.prototype.getElement = function() {
    return this.element;
}

apogeeapp.jsonedit.EditField.prototype.onClick = function() {
    if((this.isEditable)&&(!this.editField)) {
        this.startEdit();
    }
 
}

apogeeapp.jsonedit.EditField.prototype.startEdit = function() {
    if(!this.editField) {
    
        //get the selection
        var selection = getSelection();
        var selectInfo;
        if(selection.anchorNode.parentNode == this.element) {
            selectInfo = {};
            if(selection.anchorOffset <= selection.focusOffset) {
                selectInfo.start = selection.anchorOffset;
                selectInfo.end = selection.focusOffset;
            }
            else {
                selectInfo.start = selection.focusOffset;
                selectInfo.end = selection.anchorOffset;
            }
        }
        else {
            selectInfo = null;
        }    
        
        //create the edit field
        this.editField = document.createElement("input");
		this.editField.type = "text";
		if(this.value !== undefined) {
			this.editField.value = this.value;
		}
		
		apogeeapp.ui.removeAllChildren(this.element);
        this.element.appendChild(this.editField);
        
        //select the entry
        if(selectInfo) {
            this.editField.setSelectionRange(selectInfo.start,selectInfo.end);
        }
        else {
            this.editField.select();
        }
        this.editField.focus();
        
        //event handlers to end edit
        var instance = this;
        this.editField.onblur = function() {
            instance.endEdit();
        };
        this.editField.onkeydown = function(event) {
            instance.onKeyDown(event);
        };
    }
}

//value output conversion rules
// - if the initial value was a non-string or an empty string, try to convert the contents of the edit cell to a non-string
// - otherwise keep the value as a string when it is loaded from the edit field

apogeeapp.jsonedit.EditField.prototype.endEdit = function() {
    if(this.editField) {
        var newValue = this.editField.value;
        if(newValue != this.value) {
            //read the value, in the appropriate format
            var editStringValue = this.editField.value;
            var editValue;
            if((!this.isString)||(this.value === "")) {
				//try to convert to a number if the original value was a number if it was an empty string
                if(apogeeapp.jsonedit.canBeConvertedToNonString(editStringValue)) {
                    editValue = apogeeapp.jsonedit.stringToNonString(editStringValue);
                }
                else {
                    editValue = editStringValue;
                }
            }
            else {
                editValue = editStringValue;
            }
            
            this.editField = null;
            this.setValue(editValue);
            
            if(this.onEdit) {
                this.onEdit(this.value);
            }
        }
        else {
            this.editField = null;
            this.element.innerHTML = this.value;
        }
    }
}

apogeeapp.jsonedit.EditField.DIRECTION_NONE = 0;
apogeeapp.jsonedit.EditField.DIRECTION_UP = 1;
apogeeapp.jsonedit.EditField.DIRECTION_DOWN = 2;
apogeeapp.jsonedit.EditField.DIRECTION_RIGHT = 3;
apogeeapp.jsonedit.EditField.DIRECTION_LEFT = 4;
apogeeapp.jsonedit.EditField.DIRECTION_NEXT = 5;
apogeeapp.jsonedit.EditField.DIRECTION_PREV = 6;

apogeeapp.jsonedit.EditField.ENTER_KEY = 13;
apogeeapp.jsonedit.EditField.TAB_KEY = 9;
apogeeapp.jsonedit.EditField.UP_KEY = 38;
apogeeapp.jsonedit.EditField.DOWN_KEY = 40;
apogeeapp.jsonedit.EditField.RIGHT_KEY = 39;
apogeeapp.jsonedit.EditField.LEFT_KEY = 37;

//navigation rules:
//- tab/enter and shift tab/enter go to the next and previous active field
//This visits only values on array and both keys and values on object
//- right goes from key to value (object only) if it is in the last selection spot
//- left goes from value to key (object only) if it is in the first selection spot
//- up goes to the same element (key or value) in the previous entry
//- down goes to the same element (key or value) in the next entry
//- navigation only happens when the field is a editable key or a simple value. If
//the entry is an array or object, we do not go there.
//- any time we don not go to the given field, we go nowhere, ending navigation
//- when we enter a field through navigation or click, it should select the entire field.


apogeeapp.jsonedit.EditField.prototype.onKeyDown = function(event) {
    var doExit = false;
    var direction = apogeeapp.jsonedit.EditField.DIRECTION_NONE;
    var cancelDefault = false;
    if(event.keyCode == apogeeapp.jsonedit.EditField.ENTER_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? apogeeapp.jsonedit.EditField.DIRECTION_PREV : apogeeapp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
	}
    else if(event.keyCode == apogeeapp.jsonedit.EditField.TAB_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? apogeeapp.jsonedit.EditField.DIRECTION_PREV : apogeeapp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
    }
    else if(event.keyCode == apogeeapp.jsonedit.EditField.UP_KEY) {
        doExit = true;
        direction = apogeeapp.jsonedit.EditField.DIRECTION_UP;
        cancelDefault = true;
    }
    else if(event.keyCode == apogeeapp.jsonedit.EditField.DOWN_KEY) {
        doExit = true;
        direction = apogeeapp.jsonedit.EditField.DIRECTION_DOWN;
        cancelDefault = true;
    }
    else if(event.keyCode == apogeeapp.jsonedit.EditField.RIGHT_KEY) {
        if(this.cursorAtEndOfEditField()) {
            doExit = true;
            direction = apogeeapp.jsonedit.EditField.DIRECTION_RIGHT;
            cancelDefault = true;
        }
    }
    else if(event.keyCode == apogeeapp.jsonedit.EditField.LEFT_KEY) {
        if(this.cursorAtStartOfEditField()) {
            doExit = true;
            direction = apogeeapp.jsonedit.EditField.DIRECTION_LEFT;
            cancelDefault = true;
        }
    }
    
    if(cancelDefault) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if(doExit) {
        this.endEdit();
        if((direction != apogeeapp.jsonedit.EditField.DIRECTION_NONE)&&(this.onNavigate)) {
            this.onNavigate(direction);
        }
    }
}

apogeeapp.jsonedit.EditField.prototype.cursorAtStartOfEditField = function() {
    return ((this.editField.selectionStart == 0)&&(this.editField.selectionEnd == 0));
}

apogeeapp.jsonedit.EditField.prototype.cursorAtEndOfEditField = function() {
    var length = String(this.editField.value).length;
    return ((this.editField.selectionStart == length)&&(this.editField.selectionEnd == length));
};

apogeeapp.jsonedit.JsonEditArea = function(divElement,initialValue,isEditable) {
    this.body = divElement;
	this.isEditable = isEditable;
	
	//undefined is not a valid json value and will screw things up
	if(initialValue === undefined) {
		initialValue = "";
	}
    
	this.valueEntry = new apogeeapp.jsonedit.ValueEntry(this,this,initialValue,this.isEditable);
    this.valueEntry.setExpanded(true);
 
	this.formatBody();
}

apogeeapp.jsonedit.JsonEditArea.prototype.setEditCallback = function(editCallback) {
	this.editCallback = editCallback;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

apogeeapp.jsonedit.JsonEditArea.prototype.getElement = function() {
	return this.body;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getParentValueObject = function() {
	return undefined;
}

apogeeapp.jsonedit.JsonEditArea.prototype.getIndentLevel = function() {
	return 0;
}

apogeeapp.jsonedit.JsonEditArea.prototype.formatBody = function() {
    var elementList = this.valueEntry.getElementList();
    for(var i = 0; i < elementList.length; i++) {
        this.body.appendChild(elementList[i]);
    }
    
    this.loadContextMenu();
}


apogeeapp.jsonedit.JsonEditArea.prototype.loadContextMenu = function() {

    var instance = this;
    var element = this.body;
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        
        contextMenu.addCallbackMenuItem("Get Value",function() {alert(JSON.stringify(valueEntry.getCurrentValue()));});
        
		if(instance.isEditable) {
			if(valueType == "value") {
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.valueToObject()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.valueToArray()});
				
				  if(valueEntry.convertibleToNumber()) {
                    contextMenu.addCallbackMenuItem("Convert To Number",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToBool()) {
                    contextMenu.addCallbackMenuItem("Convert To Boolean",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToNull()) {
                    contextMenu.addCallbackMenuItem("Convert To Null",function() {valueEntry.valueToNonString()});
                }

                if(valueEntry.convertibleToString()) {
                    contextMenu.addCallbackMenuItem("Convert To String",function() {valueEntry.valueToString()});
                }
			}
			else if(valueType == "object") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Array",function() {valueEntry.objectToArray()});
			}
			else if(valueType == "array") {
				contextMenu.addCallbackMenuItem("Convert To Value",function() {valueEntry.convertToValue()});
				contextMenu.addCallbackMenuItem("Convert To Object",function() {valueEntry.arrayToObject()});
			}
		}
        
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
  
}

apogeeapp.jsonedit.JsonEditArea.prototype.updateValueElements = function() {
    //remove all from element
	apogeeapp.ui.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

/** This methd is called internally when an edit takes place in the edit are. 
 * @private */
apogeeapp.jsonedit.JsonEditArea.prototype.valueEdited = function() {
    if(this.editCallback) {
        this.editCallback();
    }
}




;
/** This file provides a load listener. The element must be a positioned element
 * (position must be set to something besides static. It can only be done once per element(!)
 * 
 * It places an iframe inside the element to be tested and uses the onresize of the 
 * iframe document body. It calls load (and resize) on initial loading of the iframe.
 */

apogeeapp.ui.setLoadListener = function(element, loadCallback, resizeCallback){

    var styleJson = {
        "position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
        "overflow":"hidden",
        "zIndex":-1
    };

    //create and attach element
    var dummyFrameElement = apogeeapp.ui.createElement("iframe",null,styleJson);
    dummyFrameElement.onload = function() {
        var dummyFrameBody = dummyFrameElement.contentDocument.body; 
        
        if(loadCallback) {
            loadCallback();
        }

        //do an initial callback for each
        if(resizeCallback) {
            resizeCallback();
            dummyFrameBody.onresize = resizeCallback;
        }
    }
    element.appendChild(dummyFrameElement);
}

apogeeapp.ui.removeResizeListener = function(element, resizeCallback){
    alert("implement this!");
}


;
/** This is is a layout element to fill a parent element with a header element and
 * a display element which takes all the remaning vertical space.
 * 
 * The header and display types may be the following:
 * apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE
 * apogeeapp.ui.DisplayAndHeader.FIXED_PANE
 * 
 * Additionally a CSS class may be specified for each fo give information such as
 * coloring and, for the sake of the header, height.
 */ 
apogeeapp.ui.DisplayAndHeader = function(headerType,headerStyleClass,bodyType,bodyStyleClass) {
    this.container = apogeeapp.ui.createElementWithClass("div","visiui-dnh-container");
    
    this.header = apogeeapp.ui.createElementWithClass("div","visiui-dnh-header",this.container);
    this.body = apogeeapp.ui.createElementWithClass("div","visiui-dnh-body",this.container);
    
    this.headerStyleClass = headerStyleClass;
    this.bodyStyleClass = bodyStyleClass;
    
    this.headerContent = document.createElement("div");
    this.header.appendChild(this.headerContent);
    this.bodyContent = document.createElement("div");
    this.body.appendChild(this.bodyContent);
    
    this.setHeaderType(headerType);
    this.setBodyType(bodyType);
}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
apogeeapp.ui.DisplayAndHeader.FIXED_PANE = "visiui-dnh-fixed";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE = "visiui-dnh-scrolling";

/** this method sets the header type. */
apogeeapp.ui.DisplayAndHeader.prototype.setHeaderType = function(headerType) {
	var headerClass = headerType;
    if(this.headerStyleClass) headerClass += " " + this.headerStyleClass;
    this.headerContent.className = headerClass;
}

/** this method sets the body type. */
apogeeapp.ui.DisplayAndHeader.prototype.setBodyType = function(bodyType) {
	var bodyClass = bodyType;
    if(this.bodyStyleClass) bodyClass += " " + this.bodyStyleClass;
    this.bodyContent.className = bodyClass;
}

/** this method returns the DOM element for ths combined layout. */
apogeeapp.ui.DisplayAndHeader.prototype.getOuterElement = function() {
	return this.container;
}

/** this method returns the content element for the header. */
apogeeapp.ui.DisplayAndHeader.prototype.getHeaderContainer = function() {
	return this.header;
}

/** this method returns the content element for the display pane. */
apogeeapp.ui.DisplayAndHeader.prototype.getBodyContainer = function() {
	return this.body;
}

/** this method returns the content element for the header. */
apogeeapp.ui.DisplayAndHeader.prototype.getHeader = function() {
	return this.headerContent;
}

/** this method returns the content element for the display pane. */
apogeeapp.ui.DisplayAndHeader.prototype.getBody = function() {
	return this.bodyContent;
};
/** This is a split pane, with a right and left pane. The types of pane are 
 * given by the constants defined below:
 * apogeeapp.ui.SplitPane.SCROLLING_PANE
 * apogeeapp.ui.SplitPane.FIXED_PANE
 */ 
apogeeapp.ui.SplitPane = function(leftPaneType,rightPaneType) {
    
    //-----------------
    // Create the DOM elements
    //-----------------
    
    this.container1 = apogeeapp.ui.createElementWithClass("div","visiui-sp-parent");
    var container2 = apogeeapp.ui.createElementWithClass("div","visiui-sp-parent2",this.container1);
    var table = apogeeapp.ui.createElementWithClass("table","visiui-sp-table",container2);
    
    var row = apogeeapp.ui.createElementWithClass("tr","visiui-sp-row",table);
    
    var leftCell = apogeeapp.ui.createElementWithClass("td","visiui-sp-left",row);
    var divider = apogeeapp.ui.createElementWithClass("td","visiui-sp-divider",row);
    var rightCell = apogeeapp.ui.createElementWithClass("td","visiui-sp-right",row);

    var leftInnerPane = apogeeapp.ui.createElementWithClass("div","visiui-sp-inner",leftCell);
    this.leftOuterPane = apogeeapp.ui.createElementWithClass("div",leftPaneType,leftInnerPane);
    
    var rightInnerPane = apogeeapp.ui.createElementWithClass("div","visiui-sp-inner",rightCell);
    this.rightOuterPane = apogeeapp.ui.createElementWithClass("div",rightPaneType,rightInnerPane);

    //-----------------
    // Create the mouse handler logic for resizing
    //-----------------
    var resizeActive = false;
    var resizeBasePixels = 0;
    var resizeBasePosition = 0;
    
    //mouse down handler
    var mouseDown = function(e) {

            resizeActive = true;
            resizeBasePixels = e.clientX;
            resizeBasePosition = leftCell.offsetWidth;

            //add resize events to the parent, since the mouse can leave this element during a move
            table.addEventListener("mouseup",mouseUp);
            table.addEventListener("mousemove",mouseMove);
            table.addEventListener("mouseleave",mouseLeave);
    }

    //mouse move handler
    var mouseMove = function(e) {
        if(resizeActive) {
            var delta = e.clientX - resizeBasePixels;
            leftCell.style.width = (resizeBasePosition + delta) + "px";
        }
    }

    //mouse up handler
    var mouseUp = function(e) {
       endResize();
    }

    //mouse leave handler
    var mouseLeave = function(e) {
        endResize();
    }
    
    //end resize function
    var endResize = function() {
        resizeActive = false;
        table.removeEventListener("mouseup",mouseUp);
        table.removeEventListener("mousemove",mouseMove);
        table.removeEventListener("mouseleave",mouseLeave);
    }
    
    divider.addEventListener("mousedown",mouseDown);

}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
apogeeapp.ui.SplitPane.SCROLLING_PANE = "visiui-sp-scrolling";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
apogeeapp.ui.SplitPane.FIXED_PANE = "visiui-sp-fixed";

/** this method returns the DOM element for ths split pane. */
apogeeapp.ui.SplitPane.prototype.getOuterElement = function() {
	return this.container1;
}

/** this method returns the content element for the left pane. */
apogeeapp.ui.SplitPane.prototype.getLeftPaneContainer = function() {
	return this.leftOuterPane;
}

/** this method returns the content element for the left pane. */
apogeeapp.ui.SplitPane.prototype.getRightPaneContainer = function() {
	return this.rightOuterPane;
}



;

if(!apogeeapp.ui.treecontrol) apogeeapp.ui.treecontrol = {};

apogeeapp.ui.treecontrol.TreeControl = function() {
    this.list = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
}

/** The outer DOM element */
apogeeapp.ui.treecontrol.TreeControl.prototype.getElement = function() {
    return this.list;
}

apogeeapp.ui.treecontrol.TreeControl.prototype.setRootEntry = function(treeEntry) {
    this.clearRootEntry();
    this.list.appendChild(treeEntry.getElement());
}

apogeeapp.ui.treecontrol.TreeControl.prototype.clearRootEntry = function() {
    apogeeapp.ui.removeAllChildren(this.list);
}




;

if(!apogeeapp.ui.treecontrol) apogeeapp.ui.treecontrol = {};

apogeeapp.ui.treecontrol.TreeEntry = function(labelText,iconSrc,dblClickCallback,menuItemCallback,isRoot) {
    
    this.contractUrl = apogeeapp.ui.getResourcePath("/contractPlus2.png");
    this.expandUrl = apogeeapp.ui.getResourcePath("/expandPlus2.png");
    this.noControlUrl = apogeeapp.ui.getResourcePath("/nothingPlus2.png");
    this.emptyControlUrl = apogeeapp.ui.getResourcePath("/emptyPlus2.png");
    
    this.isRoot = isRoot;
    
    var baseCssClass;
    if(isRoot) {
        baseCssClass = "visiui-tc-root";
    }
    else {
        baseCssClass = "visiui-tc-child";
    }
    
    this.element = apogeeapp.ui.createElementWithClass("li", baseCssClass);
    this.control = apogeeapp.ui.createElementWithClass("img", "visiui-tc-control",this.element);
    

    //icon/menu
    if(iconSrc) {
        this.iconContainerElement = apogeeapp.ui.createElementWithClass("div", "visiui-tc-icon-container",this.element);
        if(menuItemCallback) {
            //icon as menu
            this.menu = apogeeapp.ui.Menu.createMenuFromImage(iconSrc);
            this.menu.setAsOnTheFlyMenu(menuItemCallback);
            this.iconContainerElement.appendChild(this.menu.getElement());
        }
        else {
            //plain icon
            this.icon = apogeeapp.ui.createElementWithClass("img", "visiui-tc-icon",this.iconContainerElement);
            this.icon.src = iconSrc; 
        }
        this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_tc_icon_overlay",this.iconContainerElement);
    }
    
    
    
    //label
    this.label = apogeeapp.ui.createElementWithClass("div", "visiui-tc-label",this.element);
    if(labelText) {
        this.setLabel(labelText);
    }
    
    this.childList = null;
    this.childMap = {};
    
    this.setState(apogeeapp.ui.treecontrol.NO_CONTROL);
    
    //context menu and double click
    var contextMenuCallback = function(event) {
        var contextMenu = new apogeeapp.ui.MenuBody();
        var menuItems = menuItemCallback();
        contextMenu.setMenuItems(menuItems);
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
    this.label.oncontextmenu = contextMenuCallback;
    
    //double click action
    if(dblClickCallback) {
        this.label.ondblclick = dblClickCallback;
    }
}

apogeeapp.ui.treecontrol.NO_CONTROL = 0;
apogeeapp.ui.treecontrol.EXPANDED = 1;
apogeeapp.ui.treecontrol.COLLAPSED = -1;

apogeeapp.ui.treecontrol.DEFAULT_STATE = apogeeapp.ui.treecontrol.COLLAPSED;

/** The outer DOM element */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getElement = function() {
    return this.element;
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setLabel = function(labelText) {
    this.label.innerHTML = labelText;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.addChild = function(identifier,childTreeEntry) {
    if(!this.childList) {
        //add the child list if it does not exist
        this.childList = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
        this.setState(apogeeapp.ui.treecontrol.DEFAULT_STATE);
    }
    this.childMap[identifier] = childTreeEntry;
    this.childList.appendChild(childTreeEntry.getElement());
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(identifier) {
    if(this.childList) {
        var listEntry = this.childMap[identifier];
        if(listEntry) {
            delete this.childMap[identifier];
            this.childList.removeChild(listEntry.getElement()); 
            //remove the child list if there are no children
            if(this.childList.childElementCount === 0) {
                this.element.removeChild(this.childList);
                this.childList = null;
                this.setState(apogeeapp.ui.treecontrol.NO_CONTROL); 
            }
        }
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.setState = function(state) {
    this.state = state;
    if(this.state == apogeeapp.ui.treecontrol.NO_CONTROL) {
        if(this.isRoot) {
            this.control.src = this.emptyControlUrl;
        }
        else {
            this.control.src = this.noControlUrl;
        }
    }
    else if(this.state == apogeeapp.ui.treecontrol.EXPANDED) {
        this.control.src = this.contractUrl;
        
        if(!this.collapse) {
            var instance = this;
            this.collapse = function() {
                instance.setState(apogeeapp.ui.treecontrol.COLLAPSED);
            }
        }
        
        this.control.onclick = this.collapse
        this.childList.style.display = "";
    }
    else if(this.state == apogeeapp.ui.treecontrol.COLLAPSED) {
        this.control.src = this.expandUrl;
        
        if(!this.expand) {
            var instance = this;
            this.expand = function() {
                instance.setState(apogeeapp.ui.treecontrol.EXPANDED);
            }
        }
        
        this.control.onclick = this.expand;
        this.childList.style.display = "none";
    }
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setIconOverlay = function(element) {
    this.clearIconOverlay();
    if(element) {
        this.iconOverlayElement.appendChild(element);
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.clearIconOverlay = function() {
    apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
}







;
apogeeapp.app = {};
apogeeapp.app.dialog = {};

/** This is the main class of the apogee application. */
apogeeapp.app.Apogee = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    apogee.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUI = null;
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new apogeeapp.app.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI
	this.createUI(containerId);
    
    //open a workspace if there is a url present
    var workspaceUrl = apogee.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        apogeeapp.app.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
}
	
//add components to this class
apogee.base.mixin(apogeeapp.app.Apogee,apogee.EventManager);

apogeeapp.app.Apogee.DEFAULT_WORKSPACE_NAME = "workspace";

apogeeapp.app.Apogee.prototype.getWorkspaceUI = function() {
	return this.workspaceUI;
}

apogeeapp.app.Apogee.prototype.getWorkspace = function() {
	if(this.workspaceUI) {
		return this.workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

//==================================
// Workspace Management
//==================================

/** This method makes an empty workspace ui object. This throws an exception if
 * the workspace can not be opened.
 */
apogeeapp.app.Apogee.prototype.setWorkspaceUI = function(workspaceUI) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUI) {
        throw apogee.base.createError("There is already an open workspace",false);
    }
    
    workspaceUI.setApp(this,this.tabFrame,this.treePane);
    this.workspaceUI = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
apogeeapp.app.Apogee.prototype.clearWorkspaceUI = function() {
    //remove the workspace from the app
    this.workspaceUI = null;
    
    return true;
}

//==================================
// Link Management
//==================================

/** This method adds links as registered by a given workspace. Links can be added and
 * removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * workspase. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page.
 */
apogeeapp.app.Apogee.prototype.updateWorkspaceLinks = function(ownerName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(ownerName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
apogeeapp.app.Apogee.prototype.registerComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered component with this name. Either the component has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    this.additionalComponents.push(name);
}

/** This method registers a component. */
apogeeapp.app.Apogee.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
apogeeapp.app.Apogee.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(apogeeapp.app.JsonTableComponent.generator);
    this.registerStandardComponent(apogeeapp.app.GridTableComponent.generator);
    this.registerStandardComponent(apogeeapp.app.TextComponent.generator);
	this.registerStandardComponent(apogeeapp.app.FolderComponent.generator);
	this.registerStandardComponent(apogeeapp.app.FunctionComponent.generator);
    this.registerStandardComponent(apogeeapp.app.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(apogeeapp.app.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
apogeeapp.app.Apogee.prototype.registerStandardComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered component with this name. Either the component has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    this.standardComponents.push(name);
}

/** This method creates the app ui. 
 * @private */
apogeeapp.app.Apogee.prototype.createUI = function(containerId) {
    
    var windowElements = apogeeapp.ui.initWindows(containerId);
    var topContainer = windowElements.baseElement;
    
    var mainContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    topContainer.appendChild(mainContainer.getOuterElement());
    
    //-------------------
    //create menus
    //-------------------
    var menuBar = this.createMenuBar();
    mainContainer.getHeader().appendChild(menuBar);
    
    //----------------------
    //create the split pane
    //----------------------
    var splitPane = new apogeeapp.ui.SplitPane(
            apogeeapp.ui.SplitPane.SCROLLING_PANE,
            apogeeapp.ui.SplitPane.FIXED_PANE
        );
    mainContainer.getBody().appendChild(splitPane.getOuterElement());

    //---------------------
    //load the tree pane
    //---------------------
    this.treePane = splitPane.getLeftPaneContainer();
    
    //----------------------
    //create the tab frame
    //----------------------
    this.tabFrame = new apogeeapp.ui.TabFrame();
    splitPane.getRightPaneContainer().appendChild(this.tabFrame.getElement());
    
    //add listener for displaying the active tab
    var instance = this;
    this.tabFrame.addListener(apogeeapp.ui.SHOWN_EVENT,function(tab){instance.onTabShown(tab);});
    this.tabFrame.addListener(apogeeapp.ui.HIDDEN_EVENT,function(tab){instance.onTabHidden(tab);});

}

/** This method creates the app ui. 
 * @private */
apogeeapp.app.Apogee.prototype.onTabHidden = function(tab) {
    this.activeTabIconDisplay.style.display = "none";
    this.activeTabTitleDisplay.style.display = "none";
}

apogeeapp.app.Apogee.prototype.onTabShown = function(tab) {
    if(!this.workspaceUI) return;
    
    var id = tab.getId();
    var component = this.workspaceUI.getComponentById(id);
    if(component) {
        this.activeTabIconDisplay.src = component.getIconUrl();
        this.activeTabTitleDisplay.innerHTML = component.getMember().getDisplayName(true);
        this.activeTabIconDisplay.style.display = "";
        this.activeTabTitleDisplay.style.display = "";
    }
}

//=================================
// Menu Functions
//=================================

/** This method creates the creates the menu bar, with the attached functionality. 
 * @private */
apogeeapp.app.Apogee.prototype.createMenuBar = function() {
    
    //-------------------
    //create menus
    //-----------------------
    
    //create the menus
    var menu;
    var name;
    var menus = {};
    
    //creat menu  bar with left elements (menus) and right elements (active tab display)
    var menuBar = apogeeapp.ui.createElementWithClass("div","menu_bar");
    var menuBarLeft = apogeeapp.ui.createElementWithClass("div","menu_bar_left",menuBar);
    var menuBarRight = apogeeapp.ui.createElementWithClass("div","menu_bar_right",menuBar);

    //Workspace menu
    name = "Workspace";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    var newCallback = apogeeapp.app.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = apogeeapp.app.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = apogeeapp.app.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = apogeeapp.app.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    name = "Components";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    //add create child elements
    menu.setMenuItems(this.getAddChildMenuItems());
    
    //libraries menu
    name = "Libraries";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    var linksCallback = apogeeapp.app.updatelinks.getUpdateLinksCallback(this);
    menu.addCallbackMenuItem("Update Links",linksCallback);
    
    var importCallback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderComponent.generator);
    menu.addCallbackMenuItem("Import as Folder",importCallback);
    
    var import2Callback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderFunctionComponent.generator);
    menu.addCallbackMenuItem("Import as Folder Function",import2Callback);
    
    var exportCallback = apogeeapp.app.exportworkspace.getExportCallback(this);
    menu.addCallbackMenuItem("Export as Workspace",exportCallback);
    
    //allow the implementation to add more menus or menu items
    if(this.addToMenuBar) {
        this.addToMenuBar(menuBar,menus);
    }
    
    //add the active tab display
    this.activeTabIconDisplay = apogeeapp.ui.createElementWithClass("img","tab-icon-display",menuBarRight);
    this.activeTabIconDisplay.style.display = "none";
    this.activeTabTitleDisplay = apogeeapp.ui.createElementWithClass("div","tab-title-display",menuBarRight);
    this.activeTabTitleDisplay.style.display = "none";
    return menuBar;
    
}

///** This method should be implemented if custom menus or menu items are desired. */
//apogeeapp.app.Apogee.prototype.addToMenuBar(menuBar,menus);

apogeeapp.app.Apogee.prototype.getAddChildMenuItems = function(optionalInitialValues,optionalComponentOptions) {
    
    var menuItemList = [];
    var menuItem;
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        
        menuItem = {};
        menuItem.title = "Add " + generator.displayName;
        menuItem.callback = apogeeapp.app.addcomponent.getAddComponentCallback(this,generator,optionalInitialValues,optionalComponentOptions);
        menuItemList.push(menuItem);
    }

    //add the additional component item
    menuItem = {};
    menuItem.title = "Other Components...";
    menuItem.callback = apogeeapp.app.addcomponent.getAddAdditionalComponentCallback(this,optionalInitialValues,optionalComponentOptions);
    menuItemList.push(menuItem);

    return menuItemList;
}

;

/** This class manages links for CSS and JS for the page. When links are added
 * they should be associated with an owner identified with a name. A given link
 * will be removed when all owners of that link on longer use it.
 * (This implementation was used when we had multiple workspaces allowed in the
 * application.
 * . */
apogeeapp.app.LinkManager = function() {
	//external links infrastructure
	this.linkMap = {};
}

/** This method adds links as registered by a given owner, as identified by name.
 * Links can be added and removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * owner. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page.
 * The arguments "addList" and"removeList" are arrays with the entries {"link":(url),"type":("js" or "css")}
 */
apogeeapp.app.LinkManager.prototype.updateWorkspaceLinks = function(ownerName,addList,removeList,linksLoadedCallback) {
	
	var i;
	var cnt;
	var index;
	var linkObject;
	var link;
	var type;
	var linkWorkspaces;
	
	//remove the workspace for this link
	cnt = removeList.length;
	for(i = 0; i < cnt; i++) {
		linkObject = removeList[i];
		link = linkObject.link;
		type = linkObject.type;
		linkWorkspaces = this.linkMap[link];
		if(linkWorkspaces) {
			index = linkWorkspaces.indexOf(link);
			if(index !== -1) {
				//remove the workspace from this link
				linkWorkspaces.splice(i,1);
				if(linkWorkspaces.length === 0) {
					//nobody references this link
					//try to remove it (it might not be removeable
					var linkRemoved = this.removeLinkFromPage(link,type);
					if(linkRemoved) {
						delete this.linkMap[link];
					}
				}
			}
			else {
				//workspace already removed - no action
			}
		}
		else {
			//link does not exist - no action
		}
	}
	
	//this object will call the cllback when all links are loaded
	var responseProcessor;
	if(linksLoadedCallback) {
		responseProcessor = this.getResponseProcessor(addList,linksLoadedCallback);
	}
	
	//add links
	cnt = addList.length;
	for(i = 0; i < cnt; i++) {
		linkObject = addList[i];
		link = linkObject.link;
		type = linkObject.type;
		linkWorkspaces = this.linkMap[link];
		if(linkWorkspaces) {
			//link already present on page
			index = linkWorkspaces.indexOf(link);
			if(index != -1) {
				//workspace already has link - no action
			}
			else {
				//add workspace to link
				linkWorkspaces.push(ownerName);
			}
	
//SLOPPY!
			//not pending
			if(responseProcessor) {
				responseProcessor.getOnLoad(link)();
			}
		}
		else {
			//link must be added, and workspace added to link
			linkWorkspaces = [];
			linkWorkspaces.push(ownerName);
			this.linkMap[link] = linkWorkspaces;
			this.addLinkToPage(link,type,responseProcessor);
		}
	}
}

apogeeapp.app.LinkManager.prototype.addLinkToPage = function(link,type,responseProcessor) {
	
	if(type === "js") {
		apogeeapp.app.LinkManager.addJsLink(link,responseProcessor)
	}
	else if(type === "css") {
		apogeeapp.app.LinkManager.addCssLink(link,responseProcessor);
	}
}

apogeeapp.app.LinkManager.prototype.removeLinkFromPage = function(link,type) {
	//for now do not remove js link, only css
	//we can not unexectue the js script
	//css does get removed
	if(type === "css") {
		apogeeapp.app.LinkManager.removeLink(link);
		return true;
	}
	else {
		return false;
	}
}

/** @private */
apogeeapp.app.LinkManager.addJsLink = function(link,responseProcessor) {

    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
		//create link properties
		var linkProps = {};
		linkProps.id = link;
		linkProps.src = link;
		if(responseProcessor) {
			linkProps.onload = responseProcessor.getOnLoad(link);
			linkProps.onerror = responseProcessor.getOnError(link);
		}
        element = apogeeapp.ui.createElement("script",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
apogeeapp.app.LinkManager.addCssLink = function(link,onResponseProcessor) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
		//create link properties
		var linkProps = {};
		linkProps.id = link;
		linkProps.rel = "stylesheet";
		linkProps.type = "text/css";
		linkProps.href = link;
		if(onResponseProcessor) {
			linkProps.onload = onResponseProcessor.getOnLoad(link);
			linkProps.onerror = onResponseProcessor.getOnError(link);
		}
        element = apogeeapp.ui.createElement("link",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
apogeeapp.app.LinkManager.removeLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(element) {
        document.head.removeChild(element);
    }
}

/** This returns an object that manages calling the given callback when all requested links
 * are loaded.
 * @private */
apogeeapp.app.LinkManager.prototype.getResponseProcessor = function(addList,linksLoadedCallback) {
	var links = [];
	for(var i = 0; i < addList.length; i++) {
		links[i] = addList[i].link;
	}

	var checkList = function(link) {
		var index = links.indexOf(link);
		if(index >= 0) {
			links.splice(index,1);
		}
		if(links.length === 0) {
			linksLoadedCallback();
		}
	}

	var responseProcessor = {};
	responseProcessor.getOnLoad = function(link) {
		return function() {
			console.log("link loaded: " + link);
			checkList(link);
		}
	}
	responseProcessor.getOnError = function(link) {
		return function() {
			console.log("link not loaded: " + link);
			checkList(link);
			alert("Error loading link: " + link);
		}
	}

	return responseProcessor;
}



;
/** This class manages the user interface for a workspace object. */
apogeeapp.app.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tabFrame = null;
    this.tree = null;
    this.componentMap = {};
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}

apogeeapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME = "main workspace";

//====================================
// Workspace Management
//====================================

/** This sets the application. It must be done before the workspace is set. */
apogeeapp.app.WorkspaceUI.prototype.setApp = function(app,tabFrame,treePane) {
    this.app = app;
    this.tabFrame = tabFrame;
    this.tree = new apogeeapp.ui.treecontrol.TreeControl();
    apogeeapp.ui.removeAllChildren(treePane);
    treePane.appendChild(this.tree.getElement());
}

/** This gets the application instance. */
apogeeapp.app.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
apogeeapp.app.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRoot();
    var rootFolderComponent = new apogeeapp.app.FolderComponent(this,rootFolder);
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
    this.tree.setRootEntry(rootFolderComponent.getTreeEntry());
    
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(member) {
        instance.memberUpdated(member);
    }
    this.workspace.addListener(apogee.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(member) {
        instance.childDeleted(member);
    }
    this.workspace.addListener(apogee.deletemember.MEMBER_DELETED_EVENT, childDeletedListener);
}

/** This method gets the workspace object. */
apogeeapp.app.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

apogeeapp.app.WorkspaceUI.prototype.getTabFrame = function() {
    return this.tabFrame;
}


/** This method gets the workspace object. */
apogeeapp.app.WorkspaceUI.prototype.close = function() {
    //delete all the components - to make sure the are cleaned up
    for(var key in this.componentMap) {
        var componentInfo = this.componentMap[key];
        if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
            componentInfo.component.onDelete();
        }
    }
    
    //TREE_ENTRY - remove tree entry
    this.tree.clearRootEntry();
    
    //remove links
    this.setLinks([],[]);
}


//====================================
// Component Management
//====================================

/** This method gets the component associated with a member object. */
apogeeapp.app.WorkspaceUI.prototype.getComponent = function(member) {
	var componentInfo = this.componentMap[member.getId()];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This method gets the component associated with a member object. */
apogeeapp.app.WorkspaceUI.prototype.getComponentById = function(memberId) {
	var componentInfo = this.componentMap[memberId];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This returns the map of folder objects. */
apogeeapp.app.WorkspaceUI.prototype.getFolders = function() {
    var folders = {}
    for(var key in this.componentMap) {
		var componentInfo = this.componentMap[key];
        var member = componentInfo.member;
        if(member.isParent) { 
            folders[member.getFullName()] = member;
        }
    }
    return folders;
}

/** This method registers a member data object and its associated component object.
 * If the member is not the main member assoicated with component but instead an included
 * member, the main componentMember should be passed in also. Otherwise it should be left 
 * undefined. */
apogeeapp.app.WorkspaceUI.prototype.registerMember = function(member,component,mainComponentMember) {
    
    //make sure this is for us
    if(member.getWorkspace() !== this.workspace) {
        throw apogee.base.createError("Component registered in wrong workspace: " + member.getFullName());
    }
    
    //store the ui object
	var memberId = member.getId();
	
	if(this.componentMap[memberId]) {
		//already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
        throw apogee.base.createError("There is already a member with the given ID.",true);
	}
	
    var componentInfo = {};
    componentInfo.member = member;
	componentInfo.component = component;
    if(mainComponentMember) componentInfo.componentMember = mainComponentMember;
	
    this.componentMap[memberId] = componentInfo;
    
}
	

/** This method responds to a member updated. */
apogeeapp.app.WorkspaceUI.prototype.memberUpdated = function(member) {
    //store the ui object
	var key = member.getId();
    
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
apogeeapp.app.WorkspaceUI.prototype.childDeleted = function(member) {
	
	//store the ui object
	var memberId = member.getId();
	
	var componentInfo = this.componentMap[memberId];
	delete this.componentMap[memberId];

	if((componentInfo)&&(componentInfo.component)) {
        //do any needed cleanup
        componentInfo.component.onDelete();
	}
}

//====================================
// open and save methods
//====================================

/** This saves the workspace. It the optionalSavedRootFolder is passed in,
 * it will save a workspace with that as the root folder. */
apogeeapp.app.WorkspaceUI.prototype.toJson = function(optionalSavedRootFolder) {
    var json = {};
    json.fileType = "apogee workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson(optionalSavedRootFolder);
    
    var rootFolder;
    if(optionalSavedRootFolder) {
        rootFolder = optionalSavedRootFolder;
    }
    else {
        rootFolder = this.workspace.getRoot();
    }
    
    json.components = this.getFolderComponentContentJson(rootFolder);
    
    return json;
}

apogeeapp.app.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
    var json = {};
    var childMap = folder.getChildMap();
	for(var key in childMap) {
		var child = childMap[key];
        
		//get the object map for the workspace
		var childComponent = this.getComponent(child);
		
		//get the component for this child
		var name = child.getName();
		json[name] = childComponent.toJson();
	}
    return json;
}

apogeeapp.app.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

apogeeapp.app.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
    var componentType = json.type;
    var generator = this.app.getComponentGenerator(componentType);
	if(generator) {
        generator.createComponentFromJson(this,member,json);
    }
    else {
        throw apogee.base.createError("Component type not found: " + componentType);
    }
}


//========================================
// Links
//========================================

apogeeapp.app.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

apogeeapp.app.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(apogeeapp.app.WorkspaceUI.MAIN_WORKSPACE_NAME,addList,removeList,onLinksLoaded);
}

apogeeapp.app.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
apogeeapp.app.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
    var newLinks = {};
    var i;
    var link;
    
    //add the new links
    for(i = 0; i < linkArray.length; i++) {
        link = linkArray[i];
        newLinks[link] = true;
    }
    
    //fiure out which are new and which are outdated
    for(i = 0; i < oldLinkArray.length; i++) {
        link = oldLinkArray[i];
        if(!newLinks[link]) {
			//this link has been removed
            removeList.push({"link":link,"type":type});
        }
		else {
			//flag that this does not need to be added
			newLinks[link] = false;
		}
    }
	
	//put the new links to the add list
	for(link in newLinks) {
		if(newLinks[link]) {
			addList.push({"link":link,"type":type});
		}
	}
}
    ;
/** This is a class that manages banner messages for display classes. */
apogeeapp.app.WindowHeaderManager = function() {
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    this.headerContainer = document.createElement("div");
}

//=======================
// Headers
//=======================

//constants for the window banner bar
apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR = "error";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR = "red";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR = "white";
apogeeapp.app.WindowHeaderManager.ERROR_ICON_IMAGE = "/error.png";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING = "pending";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING = "black";
apogeeapp.app.WindowHeaderManager.PENDING_ICON_IMAGE = "/pending.png";

apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN = "black";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE = "none";

apogeeapp.app.WindowHeaderManager.PENDING_MESSAGE = "Calculation pending...";

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.showBannerBar = function(text,type) {
    
    if(!this.bannerDiv) {
        this.bannerDiv = apogeeapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":bgColor,
                "color":fgColor
            });
    }
    
    //get banner color
    var bgColor;
    var fgColor;
    if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR;
    }
    else if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN;
   }
   var colorStyle = {};
   colorStyle.backgroundColor = bgColor;
   colorStyle.color = fgColor;
   apogeeapp.ui.applyStyle(this.bannerDiv,colorStyle);
       
    //set message
    this.bannerDiv.innerHTML = text;
    this.bannerBarActive = true;
    
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideBannerBar = function() {
	this.bannerBarActive = false;
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
    this.updateHeaderElement();
}

/** This method shows the active headers. 
 * @private */
apogeeapp.app.WindowHeaderManager.prototype.updateHeaderElement = function() {
	var headerElements = [];
    if((this.toolbarActive)&&(this.toolbarDiv)) {
		headerElements.push(this.toolbarDiv);
	}
    if((this.saveBarActive)&&(this.saveDiv)) {
		headerElements.push(this.saveDiv);
	}
	if((this.bannerBarActive)&&(this.bannerDiv)) {
		headerElements.push(this.bannerDiv);
	}
    
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			this.headerContainer.appendChild(headerElements[i]);
		}
    }
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the content element for the windowframe for this component. */
apogeeapp.app.WindowHeaderManager.prototype.getHeaderElement = function() {
     return this.headerContainer;
}

//===========================
// Static Methods
//===========================

apogeeapp.app.WindowHeaderManager.getIconOverlay = function(bannerState) {
    var resource;
    if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
        resource = apogeeapp.app.WindowHeaderManager.ERROR_ICON_IMAGE;
    }
    else if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
        resource = apogeeapp.app.WindowHeaderManager.PENDING_ICON_IMAGE;
    }
    
    if(!resource) return null;
    var url = apogeeapp.ui.getResourcePath(resource);
    var element = document.createElement("img");
    element.src = url;
    return element;
};
/** This is the base functionality for a component. */
apogeeapp.app.Component = function(workspaceUI,member,generator,options) {
    
    if(!options) {
        options = {};
    }
    this.options = options;
    
    this.workspaceUI = workspaceUI;
    this.member = member;
    this.uiActiveParent = null;
    this.generator = generator;
   
    this.workspaceUI.registerMember(this.member,this);
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.saveActions = [];
    this.cleanupActions = [];
    
    //notifications
    this.bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
    this.bannerMessage = "";
    
    //ui elements
    this.windowDisplay = null;
    this.windowDisplayStateJson = this.options.windowState;
    
    this.tabDisplay = null;
    
    this.treeDisplay = new apogeeapp.app.TreeComponentDisplay(this);
}

/** If an extending object has any save actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
apogeeapp.app.Component.prototype.addSaveAction = function(saveFunction) {
    this.saveActions.push(saveFunction);
}

/** If an extending object has any cleanup actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
apogeeapp.app.Component.prototype.addCleanupAction = function(cleanupFunction) {
    this.cleanupActions.push(cleanupFunction);
}

apogeeapp.app.Component.DEFAULT_ICON_RES_PATH = "/genericIcon.png";

apogeeapp.app.Component.MENU_ITEM_OPEN = 0x01;


//==============================
// Public Instance Methods
//==============================

/** This method returns the base member for this component. */
apogeeapp.app.Component.prototype.getMember = function() {
    return this.member;
}

/** This method returns the icon url for the component. */
apogeeapp.app.Component.prototype.getIconUrl = function() {
    if(this.generator.ICON_URL) {
        return this.generator.ICON_URL;
    }
    else {
        var resPath = this.generator.ICON_RES_PATH;
        if(!resPath) resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
        return apogeeapp.ui.getResourcePath(resPath);
    }
}

/** This method returns the workspace for this component. */
apogeeapp.app.Component.prototype.getWorkspace = function() {
    return this.member.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
apogeeapp.app.Component.prototype.getWorkspaceUI = function() {
    return this.workspaceUI;
}

apogeeapp.app.Component.prototype.getTreeEntry = function() {
    return this.treeDisplay.getTreeEntry();
}

//implement
///** This creates an instance of the window display. */
//apogeeapp.app.Component.prototype.instantiateWindowDisplay = function();

apogeeapp.app.Component.prototype.createWindowDisplay = function() {
    var windowDisplay = this.instantiateWindowDisplay();
    windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
    this.windowDisplay = windowDisplay;
    return windowDisplay;
}

apogeeapp.app.Component.prototype.getWindowDisplay = function() {
    return this.windowDisplay;
}

apogeeapp.app.Component.prototype.closeWindowDisplay = function() {
    if(this.windowDisplay) {
        //first store the window state
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
        
        //delete the window
        this.windowDisplay.deleteDisplay();
    }
}

apogeeapp.app.Component.prototype.getMenuItems = function(optionalMenuItemList) {
    //menu items
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = apogeeapp.app.updatecomponent.getUpdateComponentCallback(this);
    menuItemList.push(itemInfo);

    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

apogeeapp.app.Component.prototype.getOpenMenuItem = function() {
    var openCallback = this.createOpenCallback();
    if(openCallback) {
        var itemInfo = {};
        itemInfo.title = "Open";
        itemInfo.callback = openCallback;
        return itemInfo;
    }
    else {
        return null;
    }
}

//Implement in extending class:
///** This indicates if the component has a tab display. */
//apogeeapp.app.Component.prototype.usesTabDisplay = function();

//Implement in extending class:
///** This creates the tab display for the component. */
//apogeeapp.app.Component.prototype.instantiateTabDisplay = function();

apogeeapp.app.Component.prototype.createTabDisplay = function() {
    //we shouldn't call if there is a tab!
    if(this.tabDisplay) {
        this.tabDisplay.closeTab();
    }
    
    if(this.usesTabDisplay()) {
        this.tabDisplay = this.instantiateTabDisplay();
        this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
    return this.tabDisplay;
}

apogeeapp.app.Component.prototype.getTabDisplay = function() {
    return this.tabDisplay;
}

/** This closes the tab display for the component. */
apogeeapp.app.Component.prototype.closeTabDisplay = function() {
    if(this.tabDisplay) {
        this.tabDisplay.closeTab();
        this.tabDisplay = null;
    }
}

/** This serializes the component. */
apogeeapp.app.Component.prototype.toJson = function() {
    var json = {};
    json.type = this.generator.uniqueName;
    
    if(this.windowDisplay != null) {
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
    }
    
    if(this.windowDisplayStateJson) {
        json.windowState = this.windowDisplayStateJson;
    }
    
    for(var i = 0; i < this.saveActions.length; i++) {
        this.saveActions[i].call(this,json);
    }
    
    return json;
}

//==============================
// Protected Instance Methods
//==============================


//This method should be populated by an extending object.
//** This serializes the table component. */
//apogeeapp.app.Component.prototype.writeToJson = function(json);

/** This method cleans up after a delete. Any extending object that has delete
 * actions should pass a callback function to the method "addClenaupAction" */
apogeeapp.app.Component.prototype.onDelete = function() {
    
    //remove from parent
    if(this.uiActiveParent) {
        var parentComponent = this.workspaceUI.getComponent(this.uiActiveParent);
        if(parentComponent) {
            //remove the tree from the parent
            parentComponent.removeChildComponent(this);
        }
    }
    
    if(this.tabDisplay) {
        this.closeTabDisplay();
    }
    
    //execute cleanup actions
    for(var i = 0; i < this.cleanupActions.length; i++) {
        this.cleanupActions[i].call(this);
    }
}

/** This method extends the member udpated function from the base.
 * @protected */    
apogeeapp.app.Component.prototype.memberUpdated = function() {
    //check for change of parent
    if(this.member.getParent() !== this.uiActiveParent) {
        var oldParent = this.uiActiveParent;
        var newParent = this.member.getParent();
       
        this.uiActiveParent = newParent;
        
        //remove from old parent component
        if(oldParent) {
            var oldParentComponent = this.workspaceUI.getComponent(oldParent);
            oldParentComponent.removeChildComponent(this);
            //delete all the window display
            if(this.windowDisplay) {
                this.windowDisplay.deleteDisplay();
                this.windowDisplay = null;
            }
        }
        
        //add to the new parent component
        if(newParent) {
            var newParentComponent = this.workspaceUI.getComponent(newParent);
            newParentComponent.addChildComponent(this);
        }
    }
    
    //get the banner info
    var member = this.getMember();
    if(member.hasError()) {
        var errorMsg = "";
        var actionErrors = member.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
        this.bannerMessage = errorMsg;
    }
    else if(member.getResultPending()) {
        this.bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
        this.bannerMessage = apogeeapp.app.WindowHeaderManager.PENDING_MESSAGE;
        
    }
    else {   
        this.bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
        this.bannerMessage = null;
    }
    
    //update for new data
    this.treeDisplay.updateData();
    this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);
    if(this.windowDisplay != null) {
        this.windowDisplay.updateData();
        this.windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
    if(this.tabDisplay != null) {
        this.tabDisplay.updateData();
        this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
}

/** This method is used for setting initial values in the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to give the values of those properties too. */
apogeeapp.app.Component.prototype.getPropertyValues = function() {
    
    var member = this.member;
//    var generator = member.generator;
    
    var values = {};
    values.name = member.getName();
    var parent = member.getParent();
    if(parent) {
        values.parentName = parent.getFullName();
    }

    if(member.generator.addPropFunction) {
        member.generator.addPropFunction(member,values);
    }
    if(this.generator.addPropFunction) {
        this.generator.addPropFunction(this,values);
    }
    return values;
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for deleting the component. 
 *  @private */
apogeeapp.app.Component.prototype.createOpenCallback = function() {
    var instance = this;
    var openCallback;
    var workspaceUI = this.workspaceUI;
    
    var makeTabActive = function(tabComponent) {
        var tabDisplay = tabComponent.getTabDisplay();
        if(tabDisplay) {
            var tab = tabDisplay.getTab();
            tab.makeActive();
        }
        else {
            var tabDisplay = tabComponent.createTabDisplay();
            var tab = tabDisplay.getTab();
            var tabFrame = workspaceUI.getTabFrame();
            tabFrame.addTab(tab,true);
        }
    }
    
    if(this.usesTabDisplay()) {
        openCallback = function() {
            makeTabActive(instance);
        }
    }
    else {
        var parent = this.member.getParent();
        if(parent) {
            
            var parentComponent = workspaceUI.getComponent(parent);
            if((parentComponent)&&(parentComponent.usesTabDisplay())) {
                //remove the tree from the parent
                openCallback = function() {
                    //open the parent and bring this child to the front
                    makeTabActive(parentComponent);
                    parentComponent.showChildComponent(instance);
                }
            }
        }
    }
    
    return openCallback;
}

/** This method creates a callback for deleting the component. 
 *  @private */
apogeeapp.app.Component.prototype.createDeleteCallback = function() {
    var member = this.getMember();
    return function() {
        var doDelete = confirm("Are you sure you want to delete this object?");
        if(!doDelete) {
            return;
        }
        
        //delete the object - the component we be deleted after the delete event received
        var json = {};
        json.action = "deleteMember";
        json.member = member;
        var actionResponse = apogee.action.doAction(json);

        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
}

//======================================
// All components should have a generator to creste the component
// from a json. See existing components for examples.
//======================================
;
/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
apogeeapp.app.ParentComponent = function(workspaceUI,member,generator,options) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,generator,options);
    
    this.tabDisplay = null;
}

apogeeapp.app.ParentComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.ParentComponent.prototype.constructor = apogeeapp.app.ParentComponent;

apogeeapp.app.ParentComponent.prototype.instantiateWindowDisplay = function() {
    return new apogeeapp.app.ParentWindowComponentDisplay(this,this.windowDisplayStateJson);
}

//----------------------
// WindowParent Methods
//----------------------
    
apogeeapp.app.ParentComponent.prototype.usesTabDisplay = function() {    
    return true;
}

/** This brings the child component to the front and takes any other actions
 * to show the child in the open parent. */
apogeeapp.app.ParentComponent.prototype.showChildComponent = function(childComponent) {
    if(childComponent.getMember().getParent() != this.getMember()) return;
    
    if(this.tabDisplay) {
        this.tabDisplay.showChildComponent(childComponent);
    }
}

apogeeapp.app.ParentComponent.prototype.getMenuItems = function(optionalMenuItemList) {
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];
    
    //initialize the "add components" menu
    var itemInfo = {};
    
    var app = this.getWorkspaceUI().getApp();
    var initialValues = {};
    initialValues.parentName = this.member.getFullName();
    
    itemInfo.title = "Add Component...";
    itemInfo.childMenuItems = app.getAddChildMenuItems(initialValues);
    menuItemList.push(itemInfo);

    //call base class
    var menuItemList = apogeeapp.app.Component.prototype.getMenuItems.call(this,menuItemList);
			
    return menuItemList;
}

////in memberUPdated
//    if(this.tabDisplay) {
//        this.tabDisplay.updateData();
//        this.tabDisplay.setBannerState(bannerState,bannerMessage);
//    }
//
////in member deleted
//    if(this.tabDisplay) {
//        this.tabDisplay.updateData();
//        this.tabDisplay.setBannerState(bannerState,bannerMessage);
//    }

//////////////////////////////////////////



/** This flags indicates the component is a parent component. */
apogeeapp.app.ParentComponent.prototype.isParentComponent = true;

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    var childId = childComponent.getMember().getId();
    treeEntry.removeChild(childId);
    
    //remove child windows - just hide them. They will be deleted in the component
    var childWindowDisplay = childComponent.getWindowDisplay();
    if(childWindowDisplay) {
        childWindowDisplay.deleteDisplay();
    }
}

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.addChildComponent = function(childComponent) {
    //add the child to the tree entry
    var treeEntry = this.getTreeEntry();
    var childTreeEntry = childComponent.getTreeEntry();
    var childId = childComponent.getMember().getId();
    treeEntry.addChild(childId,childTreeEntry);
    
    //add child entry for tab
    if(this.tabDisplay) {
        this.tabDisplay.addChildComponent(childComponent); 
    }
}


;
/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
apogeeapp.app.EditComponent = function(workspaceUI,member,generator,options) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,generator,options);
}

apogeeapp.app.EditComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.EditComponent.prototype.constructor = apogeeapp.app.EditComponent;

apogeeapp.app.EditComponent.prototype.instantiateWindowDisplay = function() {
    return new apogeeapp.app.EditWindowComponentDisplay(this,this.windowDisplayStateJson);
}

/** This is used when an alternate UI is used for the workspace. This replaces the window display 
 *  used in the standard UI. */
apogeeapp.app.EditComponent.prototype.setAlternateWindowDisplay = function(windowDisplay) {
    this.alternateWindowDisplay = windowDisplay;
    this.windowDisplay = windowDisplay;
    windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
}

//===============================
// Protected Functions
//===============================

//Implement this in extending class
///**  This method retrieves the table edit settings for this component instance
// * @protected */
//apogeeapp.app.EditComponent.prototype.getTableEditSettings = function();

apogeeapp.app.EditComponent.prototype.usesTabDisplay = function() {    
    return false;
}

apogeeapp.app.EditComponent.prototype.instantiateTabDisplay = function() {
    return null;
}

apogeeapp.app.EditComponent.prototype.getMenuItems = function(optionalMenuItemList) {
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];    
    
    //call base class
    var menuItemList = apogeeapp.app.Component.prototype.getMenuItems.call(this,menuItemList);
    
    //initialize the "clear function" menu entry, used only when there is code
     if((this.member.isCodeable)&&(this.member.hasCode())) {
         var settings = this.getTableEditSettings();
        if(settings.clearFunctionMenuText !== undefined) {
            var itemInfo = {};
            itemInfo.title = settings.clearFunctionMenuText;
            itemInfo.callback = this.getClearFunctionCallback(settings.emptyDataValue);
            menuItemList.push(itemInfo);
        }   
    }
			
    return menuItemList;
}

apogeeapp.app.EditComponent.prototype.getClearFunctionCallback = function(emptyDataValue) {
    var actionData = {};
    actionData.member = this.member;
    actionData.data = emptyDataValue;
    actionData.action = apogee.updatemember.UPDATE_DATA_ACTION_NAME
    return function() {
        var actionResponse = apogee.action.doAction(actionData); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}


;
/** This component represents a json table object. */
apogeeapp.app.TreeComponentDisplay = function(component) {
    this.component = component;
    this.member = component.getMember();
    
    this.treeEntry = this.createTreeEntry();
};

apogeeapp.app.TreeComponentDisplay.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.TreeComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    oldParentTreeEntry.removeChild(this.member.getId());
    
    var newParentTreeEntry = newParentComponent.getTreeEntry();
    newParentTreeEntry.addChild(this.member.getId(),this.treeEntry);
}

apogeeapp.app.TreeComponentDisplay.prototype.deleteDisplay = function() {
    alert("Delete tree component display not implemneted");
}

apogeeapp.app.TreeComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
    if(iconOverlay) {
        this.treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        this.treeEntry.clearIconOverlay();
    }
}

apogeeapp.app.TreeComponentDisplay.prototype.updateData = function() {
    this.treeEntry.setLabel(this.member.getName());
}
//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.TreeComponentDisplay.prototype.createTreeEntry = function() {
    //TREE_ENTRY
    //FIX THIS CODE!!!
    //open doesn't work and the context menu is duplicated code (that shouldn't be)
    
    var instance = this;
    
    //menu item callback
    var menuItemCallback = function() {
        var menuItemList = [];
        var openMenuItem = instance.component.getOpenMenuItem();
        if(openMenuItem) {
            menuItemList.push(openMenuItem);
        }
        return instance.component.getMenuItems(menuItemList);
    }
    
    //double click callback
    var openCallback = this.component.createOpenCallback();
    
    var labelText = this.member.getName();
    var iconUrl = this.component.getIconUrl();
    var isRoot = ((this.member.isParent)&&(this.member.isRoot()));
    return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, openCallback, menuItemCallback,isRoot);
}
;
/** This component represents a json table object. */
apogeeapp.app.TabComponentDisplay = function(component,member,folder) {
    this.component = component;
    this.member = member;
    this.folder = folder;
    
    this.loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditDisplayContent.destroy);
};

apogeeapp.app.TabComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

apogeeapp.app.TabComponentDisplay.prototype.closeTab = function() {
    if(this.tab) {
        this.tab.close();
        this.tab = null;
    }
}

apogeeapp.app.TabComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
        this.windowHeaderManager.hideBannerBar();
    }
    else {
        this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
    }
    
    if(this.tab) {
        var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.tab.setIconOverlay(iconOverlay);
        }
        else {
            this.tab.clearIconOverlay();
        }
    }
}

apogeeapp.app.TabComponentDisplay.prototype.updateData = function() {
    this.tab.setTitle(this.member.getName());
}

/** This creates and adds a display for the child component to the parent container. */
apogeeapp.app.TabComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
    var windowComponentDisplay = childComponent.createWindowDisplay();
    var childWindow = windowComponentDisplay.getWindowFrame();

    
    
    //set position
    var pos = windowComponentDisplay.getPreferredPosition();
    if(!pos) {
        pos = this.parentContainer.getNextWindowPosition();
    }
    childWindow.setPosition(pos.x,pos.y);
    
    this.parentContainer.addWindow(childWindow);
    
    //set state 
    var state = windowComponentDisplay.getPreferredState();
    childWindow.setWindowState(state);
}

/** This method is used to bring the child component to the front. */
apogeeapp.app.TabComponentDisplay.prototype.showChildComponent = function(childComponent) {
    var windowComponentDisplay = childComponent.getWindowDisplay();
    if(windowComponentDisplay) {
        var childWindow = windowComponentDisplay.getWindowFrame();
        if(childWindow) {
            this.parentContainer.bringToFront(childWindow);
        }
    }
}
//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.TabComponentDisplay.prototype.loadTabEntry = function() {
    this.tab = new apogeeapp.ui.Tab(this.member.getId());    
    
    //-----------------------
    //add headers for display
    //-----------------------
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    this.tab.setHeaderContent(this.windowHeaderManager.getHeaderElement());
    

    //-----------------------
    //set the content
    //-----------------------
    this.createDisplayContent();
    this.tab.setContent(this.contentElement);
    
    var tabShown = function() {
        instance.parentContainer.elementIsShown();
    }
    this.tab.addListener(apogeeapp.ui.SHOWN_EVENT,tabShown);
    var tabHidden = function() {
        instance.parentContainer.elementIsHidden();
    }
    this.tab.addListener(apogeeapp.ui.HIDDEN_EVENT,tabHidden);
    
    //------------------
    // set menu
    //------------------
    var menu = this.tab.createMenu(this.component.getIconUrl());
    var instance = this;
    var createMenuItemsCallback = function() {
        return instance.component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
    
    //-----------------
    //set the tab title
    //-----------------
    this.tab.setTitle(this.member.getName());
    
    //-----------------------------
    //add the handlers for the tab
    //-----------------------------
    var instance = this;
    var onClose = function() {
        instance.component.closeTabDisplay();
        instance.destroy();
    }
    this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,onClose);
}

apogeeapp.app.TabComponentDisplay.PARENT_CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px"
}

 /** @private */
apogeeapp.app.TabComponentDisplay.prototype.createDisplayContent = function() {
   
    this.contentElement = apogeeapp.ui.createElement("div",null,apogeeapp.app.TabComponentDisplay.PARENT_CONTAINER_STYLE);
    this.parentContainer = new apogeeapp.ui.WindowParent(this.contentElement);

    //we ony use this context menu and child map for parents
    //modify if we use this elsewhere
    if(!this.folder.isParent) return;
    
    //add content menu
    this.setAddChildrenContextMenu();

    //show all children
    var workspaceUI = this.component.getWorkspaceUI();
    var children = this.folder.getChildMap();
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        this.addChildComponent(childComponent);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
apogeeapp.app.TabComponentDisplay.prototype.setAddChildrenContextMenu = function() {
    
    var workspaceUI = this.component.getWorkspaceUI();
    var app = workspaceUI.getApp();

    var initialValues = {};
    initialValues.parentName = this.member.getFullName();
    
    this.contentElement.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        //position the window if we can
        if(event.offsetX) {
            var componentOptions = {};
            var posInfo = {};
            posInfo.x = event.offsetX;
            posInfo.y = event.offsetY;
            componentOptions.windowState = {};
            componentOptions.windowState.posInfo = posInfo;
        }
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        contextMenu.setMenuItems(app.getAddChildMenuItems(initialValues,componentOptions));
        
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** @protected */
apogeeapp.app.TabComponentDisplay.prototype.destroy = function() {
    var children = this.folder.getChildMap();
    var workspaceUI = this.component.getWorkspaceUI();
    
    //TODO THIS LOGIC IS NOT GOOD! FIX IT!
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        childComponent.closeWindowDisplay();
    }
    
    this.closeTab();
}



;
/** This component represents a json table object. */
apogeeapp.app.ParentWindowComponentDisplay = function(component, options) {
    this.component = component;
    this.member = component.getMember();
    
    this.options = options;
   
    this.loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.ParentWindowComponentDisplay.destroy);
};


apogeeapp.app.ParentWindowComponentDisplay.prototype.getWindowFrame = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
apogeeapp.app.ParentWindowComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
apogeeapp.app.ParentWindowComponentDisplay.prototype.getPreferredState = function() {
    return apogeeapp.ui.WINDOW_STATE_MINIMIZED;
}



apogeeapp.app.ParentWindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.app.ParentWindowComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

apogeeapp.app.ParentWindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowFrame) {
        var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.windowFrame.setIconOverlay(iconOverlay);
        }
        else {
            this.windowFrame.clearIconOverlay();
        }
    }
}

apogeeapp.app.ParentWindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.member.getDisplayName());
    }
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.ParentWindowComponentDisplay.prototype.getStateJson = function() {
    
    if(this.windowFrame) {
        var json = {};
        json.posInfo = this.windowFrame.getPosInfo();
        return json;
    }
    else return undefined;
}

//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.ParentWindowComponentDisplay.prototype.loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = false;
    memberWindowOptions.maximizable = false;
    memberWindowOptions.resizable = false;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new apogeeapp.ui.WindowFrame(memberWindowOptions);
    this.windowFrame.setWindowState(apogeeapp.ui.WINDOW_STATE_MINIMIZED);

    //add zero size content
    var dummyDiv = apogeeapp.ui.createElement("div");
    this.windowFrame.setContent(dummyDiv);
    
    //set title
    this.windowFrame.setTitle(this.member.getDisplayName());
    
    // set menu
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());
    
    var instance = this;
    var createMenuItemsCallback = function() {
        var menuItemList = [];
        var openMenuItem = instance.component.getOpenMenuItem();
        if(openMenuItem) {
            menuItemList.push(openMenuItem);
        }
        return instance.component.getMenuItems(menuItemList);
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
apogeeapp.app.ParentWindowComponentDisplay.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}
;
/** This component represents a json table object. */
apogeeapp.app.EditWindowComponentDisplay = function(component, options) {
    this.component = component;
    this.member = component.getMember();
    
    this.options = options;
    
    //content management
    this.viewType = null;
    this.select = null;
    this.viewModeElements = {};
    this.viewModeElement = null;
   
    this.loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditWindowComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

apogeeapp.app.EditWindowComponentDisplay.prototype.getWindowFrame = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
apogeeapp.app.EditWindowComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
apogeeapp.app.EditWindowComponentDisplay.prototype.getPreferredState = function() {
    if((this.options)&&(this.options.state !== undefined)) {
        return this.options.state;
    }
    else {
        return apogeeapp.ui.WINDOW_STATE_NORMAL;
    }
}



apogeeapp.app.EditWindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.app.EditWindowComponentDisplay.prototype.getMember = function() {
    return this.member;
}

apogeeapp.app.EditWindowComponentDisplay.prototype.deleteDisplay = function() {
    //dispose any view elements
    for(var viewType in this.viewModeElements) {
        var viewModeElement = this.viewModeElements[viewType];
        if(viewModeElement) {
            viewModeElement.destroy();
        }
    }
    
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
    if(this.windowFrame) {
        var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.windowFrame.setIconOverlay(iconOverlay);
        }
        else {
            this.windowFrame.clearIconOverlay();
        }
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.member.getDisplayName());
        
        //update the content in instantiated view mode elements
        for(var elementTag in this.viewModeElements) {
            this.viewModeElements[elementTag].memberUpdated();
        }
    }
}

/** This method should be called is a data element should be discarded, and possilby re-requested. */
apogeeapp.app.EditWindowComponentDisplay.prototype.updateViewModeElement = function(viewType) {
    //get rid of the cached view type
    delete this.viewModeElements[viewType];
    
    //reset it if it is currently in use
    if(this.viewType == viewType) {
        this.viewType = null;
        this.setViewType(viewType);
    }
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.EditWindowComponentDisplay.prototype.getStateJson = function() {
    var json = {};
    var dataPresent = false;
    
    if(this.windowFrame) {
        json.sizeInfo = this.windowFrame.getSizeInfo();
        json.posInfo = this.windowFrame.getPosInfo();
        json.state = this.windowFrame.getWindowState();
        dataPresent = true;
        
    }
    
    if(this.viewType) {
        json.viewType = this.viewType;
        dataPresent = true;
    }
    
    if(dataPresent) return json;
    else return undefined;
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.EditWindowComponentDisplay.prototype.setStateJson = function(json) {
    
    if(this.windowFrame) {
        if(json.sizeInfo) {
            this.windowFrame.setSizeInfo(json.sizeInfo);
        }
        if(json.posInfo) {
            this.windowFrame.setPosInfo(json.posInfo);
        }
        if(json.state) {
            this.windowFrame.setWindowState(json.state);
        }
    }
    
    if(json.viewType) {
        this.viewType = json.viewType;
    }
}

//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.EditWindowComponentDisplay.prototype.loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = true;
    memberWindowOptions.maximizable = true;
    memberWindowOptions.resizable = true;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new apogeeapp.ui.WindowFrame(memberWindowOptions);
    
    if((this.options)&&(this.options.sizeInfo)) {
        this.windowFrame.setSize(this.options.sizeInfo.width,this.options.sizeInfo.height);
    }
    else {
        this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);
    }

    //header manager - for banner and toolbars
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    this.windowFrame.setHeaderContent(this.windowHeaderManager.getHeaderElement());
    
    //set title
    this.windowFrame.setTitle(this.member.getDisplayName());
    
    // set menu
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());
    var component = this.component;
    var menuItemCallback = function() {
        return component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(menuItemCallback);
    
    //create the view selection ui
    this.createSelectTool();
    
    //set the content
    this.initContentUI();
}

//------------------------------------
// Window Content Management - switch between edit modes
//------------------------------------

apogeeapp.app.EditWindowComponentDisplay.prototype.createSelectTool = function() {
    
	this.select = apogeeapp.ui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    var instance = this;
    var onViewSet = function(event) {
        instance.setViewType(instance.select.value);
    }
    this.select.onchange = onViewSet;
    
    this.windowFrame.addTitleToolElement(this.select);
}

/** This method populates the frame for this component. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.initContentUI = function() {
    
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        this.select.add(apogeeapp.ui.createElement("option",{"text":viewType}));
    }
    
    var initialViewType = this.getInitialViewType(viewTypes,settings.defaultView);
    this.setViewType(initialViewType);
}

apogeeapp.app.EditWindowComponentDisplay.prototype.getInitialViewType = function(viewTypes,defaultViewType) {
    if( (this.options) &&
        (this.options.viewType) &&
        (viewTypes.indexOf(this.options.viewType) >= 0) ) {

       return this.options.viewType;
    }
    else if(defaultViewType) {
        return defaultViewType;
    }    
    else {
        //just return the first one
        return viewTypes[0];
    }
    
}


/** This method populates the frame for this component. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return;
    
    //check if we can change views
    if(this.viewModeElement) {
        var hideRequestResponse = this.viewModeElement.isCloseOk();
        
        if(hideRequestResponse !== apogeeapp.app.ViewMode.CLOSE_OK) {
            if(hideRequestResponse === apogeeapp.app.ViewMode.UNSAVED_DATA) {
                alert("You must save or cancel the edit session to change the view mode.");
            }
            else {
                //we shouldn't get here
                alert("close request rejected...");
            }
            
            //make sure view type display is correct
            this.updateViewTypeSelect();

            return;
        }
        
        this.viewModeElement.setInactive();
    }
    
    //set the view type
    this.viewType = viewType;
    this.updateViewTypeSelect();
    
    this.viewModeElement = this.viewModeElements[viewType];
    if(!this.viewModeElement) {
        this.viewModeElement = this.component.getViewModeElement(this,viewType);
        this.viewModeElements[viewType] = this.viewModeElement;
    }
    if(this.viewModeElement) {
        this.viewModeElement.setActive();
    }
    else {
        alert("Error: View mode element not found!");
    }
}

apogeeapp.app.EditWindowComponentDisplay.prototype.updateViewTypeSelect = function() {
    if(this.select.value != this.viewType) {
        this.select.value = this.viewType;
    }
}

/** This method should be called to put the display element in the window. */
apogeeapp.app.EditWindowComponentDisplay.prototype.showDisplayElement = function(displayElement) {
    this.windowFrame.setContent(displayElement);
}

/** This method should be called to remove the given element from the window. 
 * If this method is called when this is not the current element, no action is taken. */
apogeeapp.app.EditWindowComponentDisplay.prototype.removeDisplayElement = function(displayElement) {
    this.windowFrame.safeRemoveContent(displayElement);
}

//----------------------------
// Edit UI - save and cancel buttons for edit mode
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}

/** This method returns the base member for this component. */
apogeeapp.app.EditWindowComponentDisplay.prototype.showSaveBar = function(onSave,onCancel) {
    if(!this.saveDiv) {
        this.saveDiv = apogeeapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":"white",
				"border":"solid 1px gray",
				"padding":"3px"
            });
			
		this.saveDiv.appendChild(document.createTextNode("Edit: "));
		
		this.saveBarSaveButton = document.createElement("button");
		this.saveBarSaveButton.innerHTML = "Save";
		this.saveDiv.appendChild(this.saveBarSaveButton);
		
		this.saveDiv.appendChild(document.createTextNode(" "));

		this.saveBarCancelButton = document.createElement("button");
		this.saveBarCancelButton.innerHTML = "Cancel";
		this.saveDiv.appendChild(this.saveBarCancelButton);
    }
	
	this.saveBarSaveButton.onclick = onSave;
	this.saveBarCancelButton.onclick = onCancel;
	this.saveBarActive = true;
    
    //show the save toolbar
    this.windowHeaderManager.showToolbar(this.saveDiv);
}

/** This method returns the base member for this component. */
apogeeapp.app.EditWindowComponentDisplay.prototype.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.windowHeaderManager.showToolbar(this.normalToolbarDiv);
}

;
/** This component represents a table object. */
apogeeapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent.generator,componentJson);
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.FolderComponent.writeToJson);
    
    this.memberUpdated();
};

apogeeapp.app.FolderComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderComponent.prototype.constructor = apogeeapp.app.FolderComponent;

apogeeapp.app.FolderComponent.prototype.instantiateTabDisplay = function() {
    var folder = this.getMember();
    this.tabDisplay = new apogeeapp.app.TabComponentDisplay(this,folder,folder);   
    return this.tabDisplay;
}


//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
apogeeapp.app.FolderComponent.writeToJson = function(json) {
    var folder = this.getMember();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}



//======================================
// Static methods
//======================================

//add table listener
apogeeapp.app.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    if(data.children) {
        json.children = data.children;
    }
    json.type = apogee.Folder.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var folder = json.member;

    if(folder) {       
        var folderComponent = apogeeapp.app.FolderComponent.createComponentFromJson(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

apogeeapp.app.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new apogeeapp.app.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.generator = {};
apogeeapp.app.FolderComponent.generator.displayName = "Folder";
apogeeapp.app.FolderComponent.generator.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.generator.createComponent = apogeeapp.app.FolderComponent.createComponent;
apogeeapp.app.FolderComponent.generator.createComponentFromJson = apogeeapp.app.FolderComponent.createComponentFromJson;
apogeeapp.app.FolderComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderComponent.generator.ICON_RES_PATH = "/folderIcon.png";

apogeeapp.app.FolderComponent.generator.propertyDialogLines = [
    {
        "type":"invisible",
        "resultKey":"children"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
};
/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent.generator,componentJson);

    //to do:
    //need to ave this and read if from component json, during create or read
    //need to refresh a display if we change it when data view active
    //need to refresh the view from the cache (whereit is happening...)
    this.dataView = (componentJson.dataView !== undefined ) ? componentJson.dataView : apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW;
   
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = "Plain";
    return this.dataView;
}

apogeeapp.app.JsonTableComponent.prototype.setDataView = function(dataView) {
    this.dataView = dataView;
    //update the window display if needed
    var windowDisplay = this.getWindowDisplay();
    if(windowDisplay) {
        windowDisplay.updateViewModeElement(apogeeapp.app.JsonTableComponent.VIEW_DATA);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JsonTableComponent.VIEW_DATA = "Data";
apogeeapp.app.JsonTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JsonTableComponent.VIEW_MODES = [
    apogeeapp.app.JsonTableComponent.VIEW_DATA,
    apogeeapp.app.JsonTableComponent.VIEW_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JsonTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JsonTableComponent.VIEW_DATA,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW = "Plain";
apogeeapp.app.JsonTableComponent.JSON_DATA_VEW = "JSON";
apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW = "Form";


/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.JSON_DATA_VEW:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,true);

                case apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW:
                    return new apogeeapp.app.FormDataMode(editComponentDisplay);
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    return new apogeeapp.app.AceDataMode(editComponentDisplay,false);
            }
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


apogeeapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var table = json.member;
    if(table) {
        
        //need to add data view to component options
        var componentJson;
        if(componentOptions) {
            componentJson = apogee.util.jsonCopy(componentOptions);
        }
        else {
            componentJson = {};
        }
        
        if(data.dataView) {
            componentJson.dataView = data.dataView;
        }
        
        var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,table,componentJson);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new apogeeapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

apogeeapp.app.JsonTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}
    

apogeeapp.app.JsonTableComponent.addPropFunction = function(component,values) {
    values.dataView = component.getDataView();
}

apogeeapp.app.JsonTableComponent.updateProperties = function(component,oldValues,newValues,actionResponse) {
    component.setDataView(newValues.dataView);
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JsonTableComponent.generator = {};
apogeeapp.app.JsonTableComponent.generator.displayName = "Data Table";
apogeeapp.app.JsonTableComponent.generator.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.generator.createComponent = apogeeapp.app.JsonTableComponent.createComponent;
apogeeapp.app.JsonTableComponent.generator.createComponentFromJson = apogeeapp.app.JsonTableComponent.createComponentFromJson;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.generator.ICON_RES_PATH = "/dataIcon.png";

apogeeapp.app.JsonTableComponent.generator.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "Plain",
            "JSON",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

apogeeapp.app.JsonTableComponent.generator.addPropFunction = apogeeapp.app.JsonTableComponent.addPropFunction;
apogeeapp.app.JsonTableComponent.generator.updateProperties = apogeeapp.app.JsonTableComponent.updateProperties;

;

/** This component represents a json table object. */
apogeeapp.app.GridTableComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.GridTableComponent.generator,componentJson);
    
    this.memberUpdated();
};

apogeeapp.app.GridTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.GridTableComponent.prototype.constructor = apogeeapp.app.GridTableComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.GridTableComponent.VIEW_GRID = "Grid";
apogeeapp.app.GridTableComponent.VIEW_CODE = "Formula";
apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.GridTableComponent.VIEW_MODES = [
	apogeeapp.app.GridTableComponent.VIEW_GRID,
    apogeeapp.app.GridTableComponent.VIEW_CODE,
    apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION
];

apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.GridTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.GridTableComponent.VIEW_GRID,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": [[null]]
}

apogeeapp.app.GridTableComponent.DEFAULT_VIEW = apogeeapp.app.GridTableComponent.VIEW_GRID;

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.GridTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.GridTableComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.GridTableComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
			
		case apogeeapp.app.GridTableComponent.VIEW_GRID:
			return new apogeeapp.app.HandsonGridMode(editComponentDisplay);
            
        case apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


apogeeapp.app.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = apogee.action.doAction(json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new apogeeapp.app.GridTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new apogeeapp.app.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.GridTableComponent.generator = {};
apogeeapp.app.GridTableComponent.generator.displayName = "Grid Table";
apogeeapp.app.GridTableComponent.generator.uniqueName = "apogeeapp.app.GridTableComponent";
apogeeapp.app.GridTableComponent.generator.createComponent = apogeeapp.app.GridTableComponent.createComponent;
apogeeapp.app.GridTableComponent.generator.createComponentFromJson = apogeeapp.app.GridTableComponent.createComponentFromJson;
apogeeapp.app.GridTableComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.GridTableComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.GridTableComponent.generator.ICON_RES_PATH = "/gridIcon.png";

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


;

/** This component represents a json table object. */
apogeeapp.app.TextComponent = function(workspaceUI,table,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.TextComponent.generator,componentJson);
    
    this.memberUpdated();
};

apogeeapp.app.TextComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.TextComponent.prototype.constructor = apogeeapp.app.TextComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.TextComponent.VIEW_TEXT = "Text";
apogeeapp.app.TextComponent.VIEW_CODE = "Formula";
apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.TextComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.TextComponent.VIEW_MODES = [
	apogeeapp.app.TextComponent.VIEW_TEXT,
    apogeeapp.app.TextComponent.VIEW_CODE,
    apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.TextComponent.VIEW_DESCRIPTION
];

apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.TextComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.TextComponent.VIEW_TEXT,
    "clearFunctionMenuText": "Clear Formula",
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.TextComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.TextComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.TextComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
			
		case apogeeapp.app.TextComponent.VIEW_TEXT:
			return new apogeeapp.app.AceTextMode(editComponentDisplay);
            
        case apogeeapp.app.TextComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


apogeeapp.app.TextComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = "";
    var actionResponse = apogee.action.doAction(json);
    
    var table = json.member;
    if(table) {
        var tableComponent = new apogeeapp.app.TextComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


apogeeapp.app.TextComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new apogeeapp.app.TextComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.TextComponent.generator = {};
apogeeapp.app.TextComponent.generator.displayName = "Text Table";
apogeeapp.app.TextComponent.generator.uniqueName = "apogeeapp.app.TextComponent";
apogeeapp.app.TextComponent.generator.createComponent = apogeeapp.app.TextComponent.createComponent;
apogeeapp.app.TextComponent.generator.createComponentFromJson = apogeeapp.app.TextComponent.createComponentFromJson;
apogeeapp.app.TextComponent.generator.DEFAULT_WIDTH = 300;
apogeeapp.app.TextComponent.generator.DEFAULT_HEIGHT = 300;
apogeeapp.app.TextComponent.generator.ICON_RES_PATH = "/textIcon.png";




;
/** This component represents a table object. */
apogeeapp.app.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,functionObject,apogeeapp.app.FunctionComponent.generator,componentJson);
    
    this.memberUpdated();
};

apogeeapp.app.FunctionComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FunctionComponent.prototype.constructor = apogeeapp.app.FunctionComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FunctionComponent.VIEW_CODE = "Code";
apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FunctionComponent.VIEW_MODES = [
    apogeeapp.app.FunctionComponent.VIEW_CODE,
    apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FunctionComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FunctionComponent.VIEW_CODE
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FunctionComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FunctionComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.FunctionComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.FunctionComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

//create component call. data includes name and potentially other info
apogeeapp.app.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    
    var argList;
    if(data.argListString) {
        argList = apogee.FunctionTable.parseStringArray(data.argListString);  
    }
    else {
        argList = [];
    }
    json.updateData = {};
    json.updateData.argList = argList;
    
    json.type = apogee.FunctionTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var functionObject = json.member;
    if(functionObject) {
        var functionComponent = new apogeeapp.app.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

apogeeapp.app.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new apogeeapp.app.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FunctionComponent.generator = {};
apogeeapp.app.FunctionComponent.generator.displayName = "Function";
apogeeapp.app.FunctionComponent.generator.uniqueName = "apogeeapp.app.FunctionComponent";
apogeeapp.app.FunctionComponent.generator.createComponent = apogeeapp.app.FunctionComponent.createComponent;
apogeeapp.app.FunctionComponent.generator.createComponentFromJson = apogeeapp.app.FunctionComponent.createComponentFromJson;
apogeeapp.app.FunctionComponent.generator.DEFAULT_WIDTH = 400;
apogeeapp.app.FunctionComponent.generator.DEFAULT_HEIGHT = 400;
apogeeapp.app.FunctionComponent.generator.ICON_RES_PATH = "/functionIcon.png";

apogeeapp.app.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];

 ;
/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
apogeeapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folderFunction,apogeeapp.app.FolderFunctionComponent.generator,componentJson);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.FolderFunctionComponent.writeToJson);
};

apogeeapp.app.FolderFunctionComponent.prototype = Object.create(apogeeapp.app.ParentComponent.prototype);
apogeeapp.app.FolderFunctionComponent.prototype.constructor = apogeeapp.app.FolderFunctionComponent;

apogeeapp.app.FolderFunctionComponent.prototype.instantiateTabDisplay = function() {
    var member = this.getMember();
    var folder = member.getInternalFolder();
    this.tabDisplay = new apogeeapp.app.TabComponentDisplay(this,member,folder);   
    return this.tabDisplay;
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the folderFunction component. */
apogeeapp.app.FolderFunctionComponent.writeToJson = function(json) {
    var folderFunction = this.getMember();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
apogeeapp.app.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    if(data.argListString) {
        var argList = apogee.FunctionTable.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    if(data.internalFolder) {
        json.internalFolder = data.internalFolder;
    }
    json.type = apogee.FolderFunction.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var folderFunction = json.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = apogeeapp.app.FolderFunctionComponent.createComponentFromJson(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

apogeeapp.app.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new apogeeapp.app.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderFunctionComponent.generator = {};
apogeeapp.app.FolderFunctionComponent.generator.displayName = "Folder Function";
apogeeapp.app.FolderFunctionComponent.generator.uniqueName = "apogeeapp.app.FolderFunctionComponent";
apogeeapp.app.FolderFunctionComponent.generator.createComponent = apogeeapp.app.FolderFunctionComponent.createComponent;
apogeeapp.app.FolderFunctionComponent.generator.createComponentFromJson = apogeeapp.app.FolderFunctionComponent.createComponentFromJson;
apogeeapp.app.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderFunctionComponent.generator.ICON_RES_PATH = "/functionFolderIcon.png";

apogeeapp.app.FolderFunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    },
    {
        "type":"inputElement",
        "heading":"Return Val: ",
        "resultKey":"returnValueString"
    },
    {
        "type":"invisible",
        "resultKey":"internalFolder"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderFunctionComponent.generator.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    var internalFolderJson = {};
    internalFolderJson.name = optionsJson.name;
    internalFolderJson.type = apogee.Folder.generator.type;
    apogeeapp.app.FolderComponent.generator.appendWorkspaceChildren(internalFolderJson,childrenJson);
    optionsJson.internalFolder = internalFolderJson;
}
;
/** This is the base class for a  basic control component. To create a
 * new control component, extend this class implementing the needed methods
 * and create a generator. */
apogeeapp.app.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,generator,componentJson);
    
    //default to keep alive
    this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;

    this.memberUpdated();
};

apogeeapp.app.BasicControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.BasicControlComponent.prototype.constructor = apogeeapp.app.BasicControlComponent;

//==============================
// Methods to Implement
//==============================

//This method must be implemented
///** This method returns the outout data display/editor for the control */
//apogeeapp.app.BasicControlComponent.prototype.getDataDisplay = function(viewMode);

//==============================
// Protected and Private Instance Methods
//==============================

/** Set this value to true if the resource should not be destroyed each time
 * the display is hidden.
 */
apogeeapp.app.BasicControlComponent.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    this.displayDestroyFlags = displayDestroyFlags;
    
    if(this.outputMode) {
        this.outputMode.setDisplayDestroyFlags(displayDestroyFlags);
    }
}

apogeeapp.app.BasicControlComponent.VIEW_OUTPUT = "Output";
apogeeapp.app.BasicControlComponent.VIEW_CODE = "Code";
apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.BasicControlComponent.VIEW_MODES = [
	apogeeapp.app.BasicControlComponent.VIEW_OUTPUT,
	apogeeapp.app.BasicControlComponent.VIEW_CODE,
    apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.BasicControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.BasicControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.BasicControlComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.BasicControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new apogeeapp.app.ControlOutputMode(editComponentDisplay,this.displayDestroyFlags);
			}
			return this.outputMode;
			
		case apogeeapp.app.BasicControlComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        case apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

/** This method creates a basic generator for the extending object. */
apogeeapp.app.BasicControlComponent.createGenerator = function(displayName,uniqueName,constructorFunction) {
    
    var generator = {};
    
    //function to create a new component
    var createComponent = function(workspaceUI,data,componentOptions) {
    
        var workspace = workspaceUI.getWorkspace();
        //should throw an exception if parent is invalid!

        var json = {};
        json.action = "createMember";
        json.owner = data.parent;
        json.workspace = data.parent.getWorkspace();
        json.name = data.name;
        json.type = apogee.JsonTable.generator.type;
        var actionResponse = apogee.action.doAction(json);

        var control = json.member;

        if(control) {
            //create the component
            var controlComponent = new constructorFunction(workspaceUI,control,generator,componentOptions);
            actionResponse.component = controlComponent;
        }
        return actionResponse;
    }

    //function to deserialize the component
    var createComponentFromJson = function(workspaceUI,member,componentJson) {
        var controlComponent = new constructorFunction(workspaceUI,member,generator,componentJson);
        return controlComponent;
    }

    //generator
    generator.displayName = displayName;
    generator.uniqueName = uniqueName;
    generator.createComponent = createComponent;
    generator.createComponentFromJson = createComponentFromJson;
    generator.DEFAULT_WIDTH = 500;
    generator.DEFAULT_HEIGHT = 500;
    generator.ICON_RES_PATH = "/controlIcon.png";
    
    return generator;
}



;
/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,apogeeapp.app.CustomControlComponent.generator,componentJson);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    this.loadResourceFromJson(componentJson);
    
    //create a resource based on the json (or lack of a json)
    var destroyOnInactive;
    if((componentJson)&&(componentJson.destroyOnInactive !== undefined)) {
        destroyOnInactive = componentJson.destroyOnInactive;
    }
    else {
        //just keep it alive, unless user specifies something else
        destroyOnInactive = false;
    }
    this.setDestroyOnInactive(destroyOnInactive);
	
	this.memberUpdated();
    
    //add a cleanup and save actions
    this.addSaveAction(apogeeapp.app.CustomControlComponent.writeToJson);
};

apogeeapp.app.CustomControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomControlComponent.prototype.constructor = apogeeapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

apogeeapp.app.CustomControlComponent.prototype.getDataDisplay = function(viewMode) {
    var html = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
    var resource = this.createResource();
    var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(html,resource,viewMode);
    return dataDisplay;
}

apogeeapp.app.CustomControlComponent.prototype.getUiCodeFields = function() {
    return this.uiCodeFields;
}

apogeeapp.app.CustomControlComponent.prototype.getUiCodeField = function(codeField) {
    var text = this.uiCodeFields[codeField];
    if((text === null)||(text === undefined)) text = "";
    return text;
}

apogeeapp.app.CustomControlComponent.prototype.getDestroyOnInactive = function() {
    return this.destroyOnInactive;
}

apogeeapp.app.CustomControlComponent.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputMode) {
        var displayDestroyFlags = destroyOnInactive ? apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
        this.activeOutputMode.setDisplayDestroyFlags(displayDestroyFlags);
    }
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML = "html";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS = "css";
apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT = "init";
apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA = "setData";
apogeeapp.app.CustomControlComponent.CODE_FIELD_IS_CLOSE_OK = "isCloseOk";
apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY = "destroy";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD = "onLoad";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_UNLOAD = "onUnload";
apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE = "onResize";
apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR = "constructorAddition";

apogeeapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
apogeeapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.CustomControlComponent.VIEW_HTML = "HTML";
apogeeapp.app.CustomControlComponent.VIEW_CSS = "CSS";
apogeeapp.app.CustomControlComponent.VIEW_INIT = "init(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_SET_DATA = "setData(data,element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK = "isCloseOk(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESTROY = "destroy(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD = "onLoad(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD = "onUnload(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE = "onResize(element,mode)";
apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR = "constructor(mode)";
apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.CustomControlComponent.VIEW_MODES = [
	apogeeapp.app.CustomControlComponent.VIEW_OUTPUT,
	apogeeapp.app.CustomControlComponent.VIEW_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.CustomControlComponent.VIEW_HTML,
    apogeeapp.app.CustomControlComponent.VIEW_CSS,
    apogeeapp.app.CustomControlComponent.VIEW_INIT,
    apogeeapp.app.CustomControlComponent.VIEW_SET_DATA,
    apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK,
    apogeeapp.app.CustomControlComponent.VIEW_DESTROY,
    apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD,
    apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD,
    apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE,
    apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR,
    apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION
];

apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.CustomControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.CustomControlComponent.VIEW_OUTPUT
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.CustomControlComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.CustomControlComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.CustomControlComponent.prototype.getViewModeElement = function(editComponentDisplay,viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomControlComponent.VIEW_OUTPUT:
			this.activeOutputMode = new apogeeapp.app.ControlOutputMode(editComponentDisplay,this.displayDestroyFlags);
			return this.activeOutputMode;
			
		case apogeeapp.app.CustomControlComponent.VIEW_CODE:
			return new apogeeapp.app.AceCodeMode(editComponentDisplay);
			
		case apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new apogeeapp.app.AceSupplementalMode(editComponentDisplay);
            
        
        case apogeeapp.app.CustomControlComponent.VIEW_HTML:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
    
        case apogeeapp.app.CustomControlComponent.VIEW_CSS:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
            
        case apogeeapp.app.CustomControlComponent.VIEW_INIT:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT);
    
        case apogeeapp.app.CustomControlComponent.VIEW_SET_DATA:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA);
     
        case apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_IS_CLOSE_OK);    
            
        case apogeeapp.app.CustomControlComponent.VIEW_DESTROY:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY);    
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD);
		
        case apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_UNLOAD);
        
        case apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE);
			
        case apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR:
            return new apogeeapp.app.AceCustomControlMode(editComponentDisplay,apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR); 


        case apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION:
			return new apogeeapp.app.AceDescriptionMode(editComponentDisplay);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This method deseriliazes data for the custom resource component. */
apogeeapp.app.CustomControlComponent.prototype.updateFromJson = function(json) {  
    this.loadResourceFromJson(json);
}

/** This method deseriliazes data for the custom resource component. This will
 * work is no json is passed in. */
apogeeapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	var uiCodeFields;
    if((!json)||(!json.resource)) {
		uiCodeFields = {};
	} 
	else {
		uiCodeFields = json.resource;
	}  
    this.update(uiCodeFields);
}


apogeeapp.app.CustomControlComponent.prototype.createResource = function() {
    try {
        var resourceMethodsCode = "";
        var uiCodeFields = this.getUiCodeFields();
        
        for(var fieldName in apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS) {
            var fieldCode = uiCodeFields[fieldName];
            if((fieldCode)&&(fieldCode != "")) {
                
                var format = apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS[fieldName];
                var codeSnippet = apogee.util.formatString(format,fieldCode);
                
                resourceMethodsCode += codeSnippet + "\n";
            }
        }
        
        //create the resource generator wrapped with its closure
        var generatorFunctionBody = apogee.util.formatString(
            apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
            resourceMethodsCode
        );

        //create the function generator, with the aliased variables in the closure
        var generatorFunction = new Function(generatorFunctionBody);
        var resourceFunction = generatorFunction();

        var resource = resourceFunction();

        return resource;
    }
    catch(error) {
        alert("Error creating custom control: " + error.message);
    }
}

//=============================
// Action
//=============================

apogeeapp.app.CustomControlComponent.prototype.update = function(uiCodeFields) { 
    
    //make sure we get rid of the old display
    if(this.activeOutputMode) {
        this.activeOutputMode.forceClearDisplay();
    }
    
    this.uiCodeFields = uiCodeFields;
    
    var newCss = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
    
    //update the css right away
    
    if(newCss !== this.currentCss) {
        if(!((newCss == "")&&(this.currentCss == ""))) {
            apogeeapp.ui.setMemberCssData(this.getMember().getId(),newCss);
            this.currentCss = newCss;
        }
    }
    
	var actionResponse = new apogee.ActionResponse();
    return actionResponse; 
}

//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** This serializes the table component. */
apogeeapp.app.CustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: resouce methods code
 * 1: uiPrivate
 * @private
 */
apogeeapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//member functions",
"var resourceFunction = function(component) {",
"var resource = {};",
"{0}",
"return resource;",
"}",
"//end member functions",
"return resourceFunction;",
""
   ].join("\n");
   
   
   
/** This is the format string to create the resource method code
 * @private
 */
apogeeapp.app.CustomControlComponent.GENERATOR_INTERNAL_FORMATS = {
    "constructorAddition":"resource.constructorAddition = function(mode) {\n__customControlDebugHook();\n{0}\n};",
    "init":"resource.init = function(element,mode) {\n{0}\n};",
    "setData":"resource.setData = function(data,element,mode) {\n{0}\n};",
    "isCloseOk":"resource.isCloseOk = function(element,mode) {\n{0}\n};",
    "destroy":"resource.destroy = function(element,mode) {\n{0}\n};",
    "onLoad":"resource.onLoad = function(element,mode) {\n{0}\n};",
    "onUnload":"resource.onUnload = function(element,mode) {\n{0}\n};",
    "onResize":"resource.onResize = function(element,mode) {\n{0}\n};"
}


//======================================
// Static methods
//======================================


/** This method creates the control. */
apogeeapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var json = {};
    json.action = "createMember";
    json.owner = data.parent;
    json.workspace = data.parent.getWorkspace();
    json.name = data.name;
    json.type = apogee.JsonTable.generator.type;
    var actionResponse = apogee.action.doAction(json);
    
    var control = json.member;
    
    if(control) {
         
        //update the component options, but don't modify the options structure passed in.
        var activeComponentOptions;
        if(componentOptions) {
            activeComponentOptions = apogee.util.jsonCopy(componentOptions);
        }
        else {
            activeComponentOptions = {};
        }

        //added settings info
        if(data.destroyOnHide !== undefined) {
            activeComponentOptions.destroyOnInactive = data.destroyOnHide;
        }
        
        //create the component
        var customControlComponent = new apogeeapp.app.CustomControlComponent.createComponentFromJson(workspaceUI,control,activeComponentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

apogeeapp.app.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new apogeeapp.app.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}

apogeeapp.app.CustomControlComponent.addPropFunction = function(component,values) {
    values.destroyOnHide = component.getDestroyOnInactive();
}

apogeeapp.app.CustomControlComponent.updateProperties = function(component,oldValues,newValues,actionResponse) {
    component.setDestroyOnInactive(newValues.destroyOnHide);
}


//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomControlComponent.generator = {};
apogeeapp.app.CustomControlComponent.generator.displayName = "Custom Control";
apogeeapp.app.CustomControlComponent.generator.uniqueName = "apogeeapp.app.CustomControlComponent";
apogeeapp.app.CustomControlComponent.generator.createComponent = apogeeapp.app.CustomControlComponent.createComponent;
apogeeapp.app.CustomControlComponent.generator.createComponentFromJson = apogeeapp.app.CustomControlComponent.createComponentFromJson;
apogeeapp.app.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomControlComponent.generator.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomControlComponent.generator.ICON_RES_PATH = "/controlIcon.png";

apogeeapp.app.CustomControlComponent.generator.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];

apogeeapp.app.CustomControlComponent.generator.addPropFunction = apogeeapp.app.CustomControlComponent.addPropFunction;
apogeeapp.app.CustomControlComponent.generator.updateProperties = apogeeapp.app.CustomControlComponent.updateProperties;

;

apogeeapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


apogeeapp.app.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            alert("There is already an open workspace. You must close the workspace first.");
        }      

        var actionResponse = apogeeapp.app.createworkspace.createWorkspace(app);
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
apogeeapp.app.createworkspace.createWorkspace = function(app) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            throw new Error("There is already an open workspace");
        }
        
        //make the workspace ui
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
        
        //create and edd an empty workspace
        var workspace = new apogee.Workspace();
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
;

apogeeapp.app.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.openworkspace.getOpenCallback = function(app) {
    return function() {
    
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            alert("There is already an open workspace. You must close the workspace first.");
            return;
        }
    
        var onOpen = function(err,workspaceData,workspaceHandle) {
            
            if(err) {
                alert("Error: " + err.message);
            }
            else {
                var actionCompletedCallback = function(actionResponse) {
                    if(!actionResponse.getSuccess()) {
                        alert(actionResponse.getErrorMsg());
                    }
                };

                //open workspace
                apogeeapp.app.openworkspace.openWorkspace(app,workspaceData,workspaceHandle,actionCompletedCallback);
            }
        }    
        
        apogeeapp.app.openworkspace.openFile(onOpen);
    }
}

//THIS FUNCTION MUST BE IMPLEMENTED!
//apogeeapp.app.openworkspace.openFile(onOpen);

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.openworkspace.openWorkspace = function(app,workspaceText,workspaceHandle,actionCompletedCallback) {
    var actionResponse = new apogee.ActionResponse();
    var name;
    var workspaceUIAdded;
    
    try {
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            throw new Error("There is already an open workspace");
        }
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    
        
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
    
        //add links, if applicable
		var jsLinks;
		var cssLinks;
        var linksAdded = false;
        if((workspaceJson.jsLinks)&&(workspaceJson.jsLinks.length > 0)) {
            jsLinks = workspaceJson.jsLinks;
            linksAdded = true;
        }
		else {
			jsLinks = [];
		}
        if((workspaceJson.cssLinks)&&(workspaceJson.cssLinks.length > 0)) {
			cssLinks = workspaceJson.cssLinks;
            linksAdded = true;
        }
		else {
			cssLinks = [];
		}
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            apogeeapp.app.openworkspace.loadWorkspace(workspaceUI,workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        if(linksAdded) {
			workspaceUI.setLinks(jsLinks,cssLinks,doWorkspaceLoad);
		}
		else {
			//immediately load the workspace - no links to wait for
            doWorkspaceLoad();
		}
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

/** This method loads an existing workspace into an empty workspace UI. */
apogeeapp.app.openworkspace.loadWorkspace = function(workspaceUI,workspaceJson,actionResponse) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceComponentsJson = workspaceJson.components;

    var workspace = new apogee.Workspace(workspaceDataJson,actionResponse);
    
    workspaceUI.setWorkspace(workspace,workspaceComponentsJson);
}


//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    };
    
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,url,actionCompletedCallback);
}

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl = function(app,url,actionCompletedCallback) {
    var onDownload = function(workspaceText) {
        apogeeapp.app.openworkspace.openWorkspace(app,workspaceText,url,actionCompletedCallback);
    }
    
    var onFailure = function(msg) {
        var actionError = new apogee.ActionError(msg,"AppException",null);
        var actionResponse = new apogee.ActionResponse();
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }   
    apogeeapp.app.openworkspace.doRequest(url,onDownload,onFailure);   
}

/**
 * This is an http request for the worksheet data
 */
apogeeapp.app.openworkspace.doRequest= function(url,onDownload,onFailure) {
	var xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
        var msg;
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            onDownload(xmlhttp.responseText);
        }
        else if(xmlhttp.readyState==4  && xmlhttp.status >= 400)  {
            msg = "Error in http request. Status: " + xmlhttp.status;
            onFailure(msg);
        }
    }
	
	xmlhttp.open("GET",url,true);
    xmlhttp.send();
};


apogeeapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.saveworkspace.getSaveCallback = function(app,filename) {
    return function() {
        
        var workspaceText = apogeeapp.app.saveworkspace.getWorkspaceText();
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        if(filename === undefined) {
            apogeeapp.app.saveworkspace.showSaveDialog(workspaceText);
        }
        else {
            apogeeapp.app.saveworkspace.saveFile(filename,workspaceText);
        }
    }
}

apogeeapp.app.saveworkspace.getWorkspaceText = function() {
    var activeWorkspaceUI = app.getWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson();
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}
  
//THIS METHOD MUST BE IMPLEMTED!  
//apogeeapp.app.saveworkspace.showSaveDialog = function(data);

//=====================================
// Action
//=====================================

//THIS METHOD MUST BE IMPLEMTED!
//apogeeapp.app.saveworkspace.saveFile = function(filename,data);
;

apogeeapp.app.importworkspace = {};

//=====================================
// UI Entry Point
//=====================================

/** Call this withthe appropriate generator - folder or folder function, for the given import type. */
apogeeapp.app.importworkspace.getImportCallback = function(app,parentGenerator) {
    return function() {
    
        //make sure there is not an open workspace
        if(!app.getWorkspaceUI()) {
            alert("There must be an open workspace to import a workspace.");
            return;
        }
    
        var onOpen = function(err,workspaceData,workspaceHandle) {
            
            if(err) {
                alert("Error: " + err.message);
            }
            else {
                var actionCompletedCallback = function(actionResponse) {
                    if(!actionResponse.getSuccess()) {
                        alert(actionResponse.getErrorMsg());
                    }
                };

                //open workspace
                apogeeapp.app.importworkspace.openWorkspace(app,parentGenerator,workspaceData,workspaceHandle,actionCompletedCallback);
            }
        }    
        
        //use open file from open workspace
        apogeeapp.app.openworkspace.openFile(onOpen);
    }
}

//THIS FUNCTION MUST BE IMPLEMENTED!
//apogeeapp.app.openworkspace.openFile(onOpen);

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
apogeeapp.app.importworkspace.openWorkspace = function(app,parentGenerator,workspaceText,workspaceHandle,actionCompletedCallback) {
    var actionResponse = new apogee.ActionResponse();
    var name;
    
    try {
        //make sure there is not an open workspace
        var workspaceUI = app.getWorkspaceUI();
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    
    
        //add links, if applicable
		var jsLinks;
		var cssLinks;
        var linksAdded = false;
        if((workspaceJson.jsLinks)&&(workspaceJson.jsLinks.length > 0)) {
            jsLinks = workspaceJson.jsLinks;
            linksAdded = true;
        }
		else {
			jsLinks = [];
		}
        if((workspaceJson.cssLinks)&&(workspaceJson.cssLinks.length > 0)) {
			cssLinks = workspaceJson.cssLinks;
            linksAdded = true;
        }
		else {
			cssLinks = [];
		}
        
    	
		//if we have to load links wait for them to load
        var newParentOptionsJson = {};
        newParentOptionsJson.name = workspaceJson.workspace.data.name;
        parentGenerator.appendWorkspaceChildren(newParentOptionsJson,workspaceJson.workspace.data.children);
        var newChildComponentsJson = {};
        newChildComponentsJson.children = workspaceJson.components;
		var workspaceImportDialogFunction = apogeeapp.app.addcomponent.getAddComponentCallback(app,parentGenerator,newParentOptionsJson,newChildComponentsJson);
        
        if(linksAdded) {
			workspaceUI.setLinks(jsLinks,cssLinks,workspaceImportDialogFunction);
		}
		else {
			//immediately load the workspace - no links to wait for
            workspaceImportDialogFunction();
		}
    }
    catch(error) {
        //figure out what to do here???
        
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}
//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.importworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    };
    
    apogeeapp.app.importworkspace.openWorkspaceFromUrlImpl(app,url,actionCompletedCallback);
}

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.importworkspace.openWorkspaceFromUrlImpl = function(app,url,actionCompletedCallback) {
    var onDownload = function(workspaceText) {
        apogeeapp.app.importworkspace.openWorkspace(app,workspaceText,url,actionCompletedCallback);
    }
    
    var onFailure = function(msg) {
        var actionError = new apogee.ActionError(msg,"AppException",null);
        var actionResponse = new apogee.ActionResponse();
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }   
    apogeeapp.app.importworkspace.doRequest(url,onDownload,onFailure);   
}

/**
 * This is an http request for the worksheet data
 */
apogeeapp.app.importworkspace.doRequest= function(url,onDownload,onFailure) {
	var xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
        var msg;
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            onDownload(xmlhttp.responseText);
        }
        else if(xmlhttp.readyState==4  && xmlhttp.status >= 400)  {
            msg = "Error in http request. Status: " + xmlhttp.status;
            onFailure(msg);
        }
    }
	
	xmlhttp.open("GET",url,true);
    xmlhttp.send();
}
;


apogeeapp.app.exportworkspace = {};

//=====================================
// UI Entry Point
//=====================================


/** This gets a callback to add a component. */
apogeeapp.app.exportworkspace.getExportCallback = function(app) {
    
    var exportCallback = function() {
        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }   
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderNames = [];
        for(var folderName in folderMap) {
            folderNames.push(folderName);
        }
               
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.exportworkspace.getExportDialogLayout(folderNames);
        
        //create on submit callback
        var onSubmitFunction = function(result) {         
            var folder = folderMap[result.parentName];
        
            var workspaceText = apogeeapp.app.exportworkspace.getWorkspaceText(folder);
            if(!workspaceText) {
                alert("There is no workspace open.");
                return;
            }

            apogeeapp.app.saveworkspace.showSaveDialog(workspaceText);
            
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return exportCallback;
    
}

apogeeapp.app.exportworkspace.getWorkspaceText = function(folder) {
    var activeWorkspaceUI = app.getWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson(folder);
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}

//---------------------------------
// private functions
//---------------------------------

/** @private */
apogeeapp.app.exportworkspace.getExportDialogLayout = function(folderNames) {
        
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    titleLine.title = "Export Folder as Workspace"
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.heading = "Folder: ";
        parentLine.entries = folderNames;
        parentLine.resultKey = "parentName"; 
        lines.push(parentLine);
    }
    
    //submit
    var submitLine = {};
    submitLine.type = "submit";
    submitLine.submit = "OK";
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    return dialogLayout;
}
;


apogeeapp.app.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.closeworkspace.getCloseCallback = function(app) {
    return function() {

        var actionResponse = apogeeapp.app.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

apogeeapp.app.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
    
        var activeWorkspaceUI = app.getWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new apogee.ActionError(errorMsg,"User",null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        var doRemove = confirm("Are you sure you want to close the workspace?");
        if(!doRemove) {
            return actionResponse;
        }
        
        workspaceUIRemoved = app.clearWorkspaceUI();
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = apogee.ActionError.processException(error,"AppException",isFatal);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




;


apogeeapp.app.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This gets a callback to add a component. */
apogeeapp.app.addcomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        var displayName = generator.displayName
        var additionalLines = apogee.util.jsonCopy(generator.propertyDialogLines); 
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.propdialog.getDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(result.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            result.parent = folderMap[result.parentName];

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
apogeeapp.app.addcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentOptions) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = apogeeapp.app.addcomponent.getAddComponentCallback(app,generator,optionalInitialValues,optionalComponentOptions);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        apogeeapp.app.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


;


apogeeapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
apogeeapp.app.updatecomponent.getUpdateComponentCallback = function(component) {
    
    var generator = component.generator;
    
    var createCallback = function() {
        
        var displayName = generator.displayName
        var additionalLines = apogee.util.jsonCopy(generator.propertyDialogLines); 
        
        var workspaceUI = component.getWorkspaceUI(); 
        var initialValues = component.getPropertyValues(); 
        
        //add folder list, only if we can set the parent (if there is a parent)
        var folderMap = null;
        var folderList = null;
        if(component.getMember().getParent()) {
            //get the folder list
             folderMap = workspaceUI.getFolders();
            folderList = [];
            for(var folderName in folderMap) {
                folderList.push(folderName);
            }
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.propdialog.getDialogLayout(displayName,folderList,additionalLines,false,initialValues);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {
            
            //see if there were no changes
            var change = false;
            for(var key in newValues) {
                if(newValues[key] !== initialValues[key]) change = true;
            }
            if(!change) {
                return true;
            }
            
            //validate the name, if it changed
            if(newValues.name !== initialValues.name) {
                //validate name
                var nameResult = apogee.codeCompiler.validateTableName(newValues.name);
                if(!nameResult.valid) {
                    alert(nameResult.errorMessage);
                    return false;
                }
            }
            
            if(folderMap) {
                //get the parent value
                newValues.owner = folderMap[newValues.parentName];
            }
            else {
                //no parent - use the owner
                newValues.owner = component.getMember().getOwner();
            }
        
            //need to test if fields are valid!

            //update
            var actionResponse = apogeeapp.app.updatecomponent.updatePropertyValues(component,initialValues,newValues);
              
            //print an error message if there was an error
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

//=====================================
// Action
//=====================================


/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.updatecomponent.updatePropertyValues = function(component,oldValues,newValues) {

    var actionResponse = new apogee.ActionResponse();

    var member = component.getMember();
    var workspace = component.getWorkspace();
    var actionList = [];
    var actionData;

    //check if a move action is needed
    if((oldValues.name !== newValues.name)||(oldValues.parentName !== newValues.parentName)) {
        actionData = {};
        actionData.action = "moveMember";
        actionData.member = member;
        actionData.name = newValues.name;
        actionData.owner = newValues.owner;
        actionList.push(actionData);
    }

    //create an action to update an member additional properties
    var memberGenerator = member.generator;
    if(memberGenerator.getPropertyUpdateAction) {
        actionData = memberGenerator.getPropertyUpdateAction(member,oldValues,newValues);
        if(actionData) {
           actionList.push(actionData); 
        }
    }

    if(actionList.length > 0) {
        actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;
        actionData.workspace = workspace;

        actionResponse = apogee.action.doAction(actionData,actionResponse);
    }
    
    //update an component additional properties
    if(component.generator.updateProperties) {
        component.generator.updateProperties(component,oldValues,newValues,actionResponse);
    }
        
    return actionResponse;
}









;


apogeeapp.app.updatelinks = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.updatelinks.getUpdateLinksCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getWorkspaceUI();
        if(!activeWorkspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        apogeeapp.app.dialog.showUpdateLinksDialog(activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================
;
/* This is a base class for a view mode. 
 * displayDestroy flags determine the cases under which the data display
 * will be destroyed (or kept alive). The options are when the display mode
 * is not active, when the window is minimized, and when the parent display
 * is hidden (such as the tab parent for a window). Before the display is destroyed,
 * a check is done to make sure it is ok, such as it is not in edit mode. */
apogeeapp.app.ViewMode = function(componentDisplay, displayDestroyFlags) {
    this.componentDisplay = componentDisplay;
    this.member = componentDisplay.getMember();
    
    //for destroying display to save resources
    this.setDisplayDestroyFlags(displayDestroyFlags);
    
    //data display
    this.dataDisplay = null;
    this.modeActive = false;
    this.displayInWindow = false;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false; 
    
    //window state, and listener for changes to window state (minimize/restore)
    var window = componentDisplay.getWindowFrame();
    this.windowMinimized = (window.getWindowState() == apogeeapp.ui.WINDOW_STATE_MINIMIZED);
    window.addListener(apogeeapp.ui.WINDOW_STATE_CHANGED,(window) => (this.onWindowStateChange(window)) );
    
    //add a listener for window showing/hidden
    this.windowLoaded = window.getIsShowing();
    window.addListener(apogeeapp.ui.SHOWN_EVENT, () => (this.onWindowLoaded()) );
    window.addListener(apogeeapp.ui.HIDDEN_EVENT, () => (this.onWindowUnloaded()) );
    
    //add resize event
    window.addListener(apogeeapp.ui.RESIZED_EVENT, () => (this.onWindowResized()) );
}

//these are responses to hide request and close request
apogeeapp.app.ViewMode.UNSAVED_DATA = -1;
apogeeapp.app.ViewMode.CLOSE_OK = 0;

apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE = 1;
apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED = 2;

//some common cases - made of the view state flags
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER = 0;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE = 1;
apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED = 3;


//------------------------------
// accessors
//------------------------------

apogeeapp.app.ViewMode.prototype.getMember = function() {
    return this.member;
}

/** This returns the UiObject, such as the window frame for this data display. */
apogeeapp.app.ViewMode.prototype.getDisplayWindow = function() {
    return this.componentDisplay.getWindowFrame();
}

apogeeapp.app.ViewMode.prototype.getElement = function() {
    if(this.dataDisplay) {
        return this.dataDisplay.getElement();
    }
    else {
        return null;
    }
}

/** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
 * refering to times it is not visible to the user. See further notes in the constructor
 * description. */
apogeeapp.app.ViewMode.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    this.destroyOnInactive = ((displayDestroyFlags & apogeeapp.app.ViewMode.VIEW_STATE_INACTIVE) != 0);
    this.destroyOnMinimize = ((displayDestroyFlags & apogeeapp.app.ViewMode.VIEW_STATE_MINIMIZED) != 0);
}

/** This method cleasr the data display. It should only be called when the data display is not showing. */
apogeeapp.app.ViewMode.prototype.forceClearDisplay = function() {
    this.destroyDataDisplay();
}

//------------------------------
// life cycle - show hide update
//------------------------------

/** This is called immediately before the display element is shown. */
apogeeapp.app.ViewMode.prototype.setActive = function() {
    this.modeActive = true;
    this.setDisplayState();
}

/** This method is caleld when the view mode is hidden. */
apogeeapp.app.ViewMode.prototype.setInactive = function() {
    this.modeActive = false;
    this.setDisplayState();
}

apogeeapp.app.ViewMode.prototype.destroy = function() {
    this.destroyDataDisplay();
}

/** This method is called before the view mode is hidden. It should
 * return true or false. */
apogeeapp.app.ViewMode.prototype.isCloseOk = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.isCloseOk) {
            return this.dataDisplay.isCloseOk();
        }
        
        if(this.inEditMode) {
            return apogeeapp.app.ViewMode.UNSAVED_DATA;
        }
    }
    
    return apogeeapp.app.ViewMode.CLOSE_OK;
}

/** This method is called when the member is updated. */
apogeeapp.app.ViewMode.prototype.memberUpdated = function() {
    if((this.dataDisplay)&&(!this.inEditMode)) {
        this.setData();
    }
}

//------------------------------
// Accessed by the Editor, if applicable
//------------------------------

//implement this in extending class if needed by an editor
//apogeeapp.app.ViewMode.prototype.onSave = function(ARGUMENT TYPE DEPENDS ON EDITOR) {
//    
//}

apogeeapp.app.ViewMode.prototype.onCancel = function() {
	//reload old data
	this.setData();
	
	return true;
}

apogeeapp.app.ViewMode.prototype.startEditMode = function(onSave,onCancel) {
    this.inEditMode = true;
    this.componentDisplay.startEditUI(onSave,onCancel);
}

apogeeapp.app.ViewMode.prototype.endEditMode = function() {
    this.inEditMode = false;
    this.componentDisplay.endEditUI();
}

//------------------------------
// Protected
//------------------------------

///** This method creates the data display object. */
//apogeeapp.app.ViewMode.prototype.createDisplay = function();

///** This method gets the data to display in the data display object. */
//apogeeapp.app.ViewMode.prototype.getDisplayData = function();

/** This method returns true if the data should be editable. */
//apogeeapp.app.ViewMode.prototype.getIsDataEditable = function();

//-----------------------------------
// Private
//-----------------------------------

/** Handles minimize/restore/maximize event on window - checks if we need to create or destroy the display. */
apogeeapp.app.ViewMode.prototype.onWindowStateChange = function(window) {
    this.windowMinimized = (window.getWindowState() == apogeeapp.ui.WINDOW_STATE_MINIMIZED);
    this.setDisplayState();
}

apogeeapp.app.ViewMode.prototype.onWindowLoaded = function() {
    this.windowLoaded = true;
    if((this.dataDisplay)&&(this.dataDisplay.onLoad)) {
        this.dataDisplay.onLoad();
    }
}

apogeeapp.app.ViewMode.prototype.onWindowUnloaded = function() {
    this.windowLoaded = false;
    if((this.dataDisplay)&&(this.dataDisplay.onUnload)) {
        this.dataDisplay.onUnload();
    }
}

apogeeapp.app.ViewMode.prototype.onWindowResized = function() {
    if((this.dataDisplay)&&(this.displayInWindow)&&(this.dataDisplay.onResize)) {
        this.dataDisplay.onResize();
    }
}

apogeeapp.app.ViewMode.prototype.setData = function() {
    this.dataDisplay.showData(this.getDisplayData(),this.getIsDataEditable());
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.setDisplayState = function() {
    var showWindow = this.modeActive;
    var destroyWindow = (((!this.modeActive) && this.destroyOnInactive)||(this.windowMinimized && this.destroyOnMinimize));
 
    if(showWindow) {
        //show window, maybe create
        if(!this.dataDisplay) {
            this.dataDisplay = this.createDisplay();
            this.placeDisplayInWindow();
            this.setData();
        }
        else if(!this.displayInWindow) {
            this.placeDisplayInWindow();
        }
    }
    else {
        //hide window, maybe destroy
        if(this.dataDisplay) {
            if(this.displayInWindow) {
                this.removeDisplayfromWindow();
            }
            
            if(destroyWindow) {
                //destroy display, but only is hidine is ok
                if(this.isCloseOk() === apogeeapp.app.ViewMode.CLOSE_OK) {
                    this.destroyDataDisplay();
                }
            }
        }
    }
}

apogeeapp.app.ViewMode.prototype.placeDisplayInWindow = function() {
    if(this.dataDisplay) {
        this.componentDisplay.showDisplayElement(this.dataDisplay.getElement());
        if((this.windowLoaded)&&(this.dataDisplay.onLoad)) this.dataDisplay.onLoad();
        this.displayInWindow = true;
    }
}

apogeeapp.app.ViewMode.prototype.removeDisplayfromWindow = function() {
    if(this.dataDisplay) {
        this.componentDisplay.removeDisplayElement(this.dataDisplay.getElement());
        if((this.windowLoaded)&&(this.dataDisplay.onUnload)) this.dataDisplay.onUnload();
        this.displayInWindow = false;
    }
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.destroyDataDisplay = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.destroy) this.dataDisplay.destroy();
        this.dataDisplay = null;
    }
};
/** Editor that uses the basic text editor */
apogeeapp.app.TextAreaEditor = function(viewMode) {
    
    this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	var textArea = apogeeapp.ui.createElement("TEXTAREA",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
		"overflow":"auto"
	});
    this.textArea = textArea;
    this.textArea.readOnly = true;
    this.outsideDiv.appendChild(this.textArea);  
	
	this.viewMode = viewMode;
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

apogeeapp.app.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

apogeeapp.app.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

apogeeapp.app.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
apogeeapp.app.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.viewMode.endEditMode();
}

/** @private */
apogeeapp.app.TextAreaEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.viewMode.startEditMode(onSave,onCancel);
		
		this.textArea.readOnly = false;
		this.editMode = true;
	}
}


;

apogeeapp.app.TextAreaMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);	
}

apogeeapp.app.TextAreaMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.TextAreaMode.prototype.constructor = apogeeapp.app.TextAreaMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
apogeeapp.app.TextAreaMode.formatString = "\t";

apogeeapp.app.TextAreaMode.prototype.createDisplay = function() {
    return new apogeeapp.app.TextAreaEditor(this);
}

apogeeapp.app.TextAreaMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,apogeeapp.app.TextAreaMode.formatString);
	}
    
    return textData;
}

apogeeapp.app.TextAreaMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.TextAreaMode.prototype.onSave = function(text) {
	
	var data;
	if(text.length > 0) {
		try {
			data = JSON.parse(text);
		}
		catch(error) {
			//parsing error
			alert("There was an error parsing the JSON input: " +  error.message);
			return false;
		}
	}
	else {
		data = "";
	}
	
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
apogeeapp.app.AceTextEditor = function(viewMode,aceMode) {
    
    this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.editorDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.outsideDiv.appendChild(this.editorDiv);
	
	this.viewMode = viewMode;
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	
	var editor = ace.edit(this.editorDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode(aceMode); 
	editor.$blockScrolling = Infinity;
    this.editor = editor;
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.editorDiv.addEventListener("click",onMouseClick);
}

apogeeapp.app.AceTextEditor.prototype.save = function() {
	
	var text = this.editor.getSession().getValue();
	
	var saveComplete = this.viewMode.onSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

apogeeapp.app.AceTextEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.viewMode.onCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.AceTextEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.AceTextEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
	this.editor.getSession().setValue(text);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}
    
apogeeapp.app.AceTextEditor.prototype.onLoad = function() {
    if(this.editor) this.editor.resize();
}

apogeeapp.app.AceTextEditor.prototype.onResize = function() {
    if(this.editor) this.editor.resize();
}

apogeeapp.app.AceTextEditor.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//==============================
// Private Methods
//==============================

/** @private */
apogeeapp.app.AceTextEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.editor.setReadOnly(true);
	this.viewMode.endEditMode();
}

/** @private */
apogeeapp.app.AceTextEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.viewMode.startEditMode(onSave,onCancel);
		
		this.editor.setReadOnly(false);
		this.editMode = true;
	}
}
;
/** This is a code editor. It expects the body of the object function. Optionally
 * a code wrapper can be passed in to wrap and unwrap the code text before and
 * after editing. There is also an option to pass in an instruction for setting data
 * when the code is the empty string. This can be used to set the data value rather than the
 * code, such as on a data object. The data will be set asn optionalOnBlankData.value if the
 * code is set to the empty string. If no action is desired, false or any value that evaluates to
 * false can be sent in.
 */
apogeeapp.app.AceCodeMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceCodeMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceCodeMode.prototype.constructor = apogeeapp.app.AceCodeMode;

apogeeapp.app.AceCodeMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/javascript");
}

apogeeapp.app.AceCodeMode.prototype.getDisplayData = function() {
    return this.member.getFunctionBody();
}

apogeeapp.app.AceCodeMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceCodeMode.prototype.onSave = function(text) {	
	
    var actionData = {};
	
	if((this.onBlankData)&&(text === "")) {
		//special case - clear code
        actionData.action = "updateData";
        actionData.member = this.member;
        actionData.data = this.onBlankData.dataValue;
		
	}
	else {
		//standard case - edit code
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
		actionData.functionBody = text;

        actionData.supplementalCode = this.member.getSupplementalCode();  
	}
    
    var actionResponse =  apogee.action.doAction(actionData);
        
	return true;  
}
;

apogeeapp.app.AceDataMode = function(componentDisplay,doJsonFormatting) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
    
    this.doJsonFormatting = doJsonFormatting;
}

apogeeapp.app.AceDataMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceDataMode.prototype.constructor = apogeeapp.app.AceDataMode;

/** This is the format character use to display tabs in the display editor. 
 * @private*/
apogeeapp.app.AceDataMode.formatString = "\t";

apogeeapp.app.AceDataMode.prototype.createDisplay = function() {
    var mode = this.doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
    return new apogeeapp.app.AceTextEditor(this,mode);
}

apogeeapp.app.AceDataMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,apogeeapp.app.AceDataMode.formatString);
	}
    
    return textData;
}

apogeeapp.app.AceDataMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.AceDataMode.prototype.onSave = function(text) {
	
	
	var data;
	if(text.length > 0) {
		try {
			data = JSON.parse(text);
		}
		catch(error) {
			//parsing error
			alert("There was an error parsing the JSON input: " +  error.message);
			return false;
		}
	}
	else {
		data = "";
	}
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
;

apogeeapp.app.AceDescriptionMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceDescriptionMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceDescriptionMode.prototype.constructor = apogeeapp.app.AceDescriptionMode;

apogeeapp.app.AceDescriptionMode.prototype.createDisplay = function() {
    return new apogeeapp.app.TextAreaEditor(this);
    //return new apogeeapp.app.AceTextEditor(this,"ace/mode/text");
}

apogeeapp.app.AceDescriptionMode.prototype.getDisplayData = function() {
    return this.member.getDescription();
}

apogeeapp.app.AceDescriptionMode.prototype.getIsDataEditable = function() {
    return true;
}

//==============================
// internal
//==============================

apogeeapp.app.AceDescriptionMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = this.member;
    actionData.description = text;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
;

apogeeapp.app.AceTextMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceTextMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceTextMode.prototype.constructor = apogeeapp.app.AceTextMode;

apogeeapp.app.AceTextMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/text");
}

apogeeapp.app.AceTextMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
    
    return textData;
}

apogeeapp.app.AceTextMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.AceTextMode.prototype.onSave = function(text) {
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = text;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
;

apogeeapp.app.AceSupplementalMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceSupplementalMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceSupplementalMode.prototype.constructor = apogeeapp.app.AceSupplementalMode;

apogeeapp.app.AceSupplementalMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/javascript");
}

apogeeapp.app.AceSupplementalMode.prototype.getDisplayData = function() {
    return this.member.getSupplementalCode();;
}

apogeeapp.app.AceSupplementalMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceSupplementalMode.prototype.onSave = function(text) {	

	var actionData = {};
        actionData.action = "updateCode";
        actionData.member = this.member;
        actionData.argList = this.member.getArgList();
        actionData.functionBody = this.member.getFunctionBody();
        actionData.supplementalCode = text;  
        
		var actionResponse =  apogee.action.doAction(actionData);
        
	if(!actionResponse.getSuccess()) {
		//show an error message
//no alert here - error display is adequate
//			var msg = actionResponse.getErrorMsg();
//			alert(msg);
	}
        
	return true;  
}
;


apogeeapp.app.AceCustomControlMode = function(componentDisplay,codeField) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
    this.component = componentDisplay.getComponent();
    this.codeField = codeField;
}

apogeeapp.app.AceCustomControlMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceCustomControlMode.prototype.constructor = apogeeapp.app.AceCustomControlMode;

apogeeapp.app.AceCustomControlMode.prototype.createDisplay = function() {
    var format;
    if(this.codeField === apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML) {
        format = "ace/mode/html";
    }
    else if(this.codeField === apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS) {
        format = "ace/mode/css";
    }
    else {
        format = "ace/mode/javascript";
    }
    return new apogeeapp.app.AceTextEditor(this,format);
}

apogeeapp.app.AceCustomControlMode.prototype.getDisplayData = function() {
    var uiCodeFields = this.component.getUiCodeFields();
    var data = uiCodeFields[this.codeField];
    if((data === undefined)||(data === null)) data = "";
    return data;
}

apogeeapp.app.AceCustomControlMode.prototype.getIsDataEditable = function() {
    return true;
}

apogeeapp.app.AceCustomControlMode.prototype.onSave = function(text) {
    
    var uiCodeFields = this.component.getUiCodeFields();
    
    //overwrite the edit field
    uiCodeFields[this.codeField] = text;
	
	var actionResponse = this.component.update(uiCodeFields);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
;
/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(outputMode);
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * isCloseOk(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 * onLoad(outputElement,outputMode);
 * onUnload(outputElement,outputMode);
 * onResize(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.HtmlJsDataDisplay = function(html,resource,outputMode) {
    this.resource = resource;
    this.outputMode = outputMode;
    this.containerElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
    this.outputElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.containerElement.appendChild(this.outputElement);
    
    //content
    if(html) {
        this.outputElement.innerHTML = html;
    }
    
    //-------------------
    //constructor code
    //-------------------
    
    if(resource.constructorAddition) {
        try {
            //custom code
            resource.constructorAddition.call(resource,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
    
    //------------------------
    //add resize/load listener if needed
    //------------------------
    
    var instance = this;
    
    if(this.resource.onLoad) {
        this.onLoad = function() {
            try {
                resource.onLoad.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onLoad function: " + error.message);
            }
        };
    }
    
    if(this.resource.onUnload) {   
        this.onUnload = function() {
            try {
                if(instance.resource.onHide) {
                    resource.onUnload.call(resource,instance.outputElement,instance.outputMode);
                }
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " onUnload function: " + error.message);
            }
        }
    }
    
    if(this.resource.onResize) {
        this.onResize = function() {
            try {
                resource.onResize.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                console.log("Error in " + instance.outputMode.getFullName() + " onResize function: " + error.message);
            }
        };
    }
    
    if(this.resource.setData) {
        this.showData = function(data) {
            try {
                if(this.resource.setData) {
                    resource.setData.call(resource,data,instance.outputElement,instance.outputMode);
                }
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " setData function: " + error.message);
            }
        }
    }
    else {
        //we must include a function here
        this.showData = function(data){};
    }
    
    if(this.resource.isCloseOk) {     
        this.isCloseOk = function() {
            try {
                resource.isCloseOk.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " isCloseOk function: " + error.message);
            }
        }
    }

    if(this.resource.destroy) {
        this.destroy = function() {
            try {
                resource.destroy.call(resource,instance.outputElement,instance.outputMode);
            }
            catch(error) {
                alert("Error in " + instance.outputMode.getFullName() + " destroy function: " + error.message);
            }
        }
    }
    
    //-------------------
    //initialization
    //-------------------
    
    if(resource.init) {
        try {
            resource.init.call(resource,this.outputElement,outputMode);
        }
        catch(error) {
            alert("Error in " + this.outputMode.getFullName() + " init function: " + error.message);
        }
    }
}

apogeeapp.app.HtmlJsDataDisplay.prototype.getElement = function() {
    return this.containerElement;
}




;
/** JsDataDisplay
 * This is the data display for a custom control where the control is generated
 * from javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * init(outputElement,outputMode);
 * setData(data,outputElement,outputMode);
 * requestInactive(outputElement,outputMode);
 * onHide(outputElement,outputMode);
 * destroy(outputElement,outputMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.JsDataDisplay = function(outputMode) {
    this.outputMode = outputMode;
    this.outputElement = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

apogeeapp.app.JsDataDisplay.prototype.getElement = function() {
    return this.outputElement;
}

apogeeapp.app.JsDataDisplay.prototype.getOutputMode = function() {
    return this.outputMode;
}

//-------------------------
//Implementation Methods (all optional)
//-------------------------
   
/** This method is called to set data for the data display. */
//apogeeapp.app.JsDataDisplay.prototype.showData = function(data)

/** This method is called before the data display is hidden. 
 * Possible return values:
 * apogeeapp.app.ViewMode.UNSAVED_DATA: do not hide the data display. Show an unsaved data message.
 * apogeeapp.app.ViewMode.CLOSE_OK: ok to hide the data display
 */
//apogeeapp.app.JsDataDisplay.prototype.isCloseOk = function()

/** This method is called when the element is added to the DOM. */
//apogeeapp.app.JsDataDisplay.prototype.onLoad = function()

/** This method is called when the element is removed from the DOM. */
//apogeeapp.app.JsDataDisplay.prototype.onUnload = function()

/** This method is called when the display is resized. */
//apogeeapp.app.JsDataDisplay.prototype.onResize = function()

/** This method is called when the data display is being destroyed. */
//apogeeapp.app.JsDataDisplay.prototype.destroy = function()


    
;
/** Editor that uses json edit area
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
apogeeapp.app.JsonFormEditor = function(viewMode) {
	
	this.editorDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    
    this.workingData = {"d":"c"}; //we need to set it to someting that ntohing can ===
	this.editOk = false;
	
	this.editor = null;

	var instance = this;
	this.editCallback = function() {
        var currentData = instance.editor.getCurrentValue();
        instance.workingData = currentData;
        viewMode.onSave(currentData);
    }
}

apogeeapp.app.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

apogeeapp.app.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
	
	//the value undefined will break things. It is not a valid json value.
	//I should verify I handle this consistently through app.
	if(data === undefined) data = null;
    
    this.workingData = apogee.util.jsonCopy(data);
    this.editOk = editOk;
    
	apogeeapp.ui.removeAllChildren(this.editorDiv);
	this.editor = new apogeeapp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}

apogeeapp.app.JsonFormEditor.prototype.destroy = function() {
	//no action
}

;

apogeeapp.app.FormDataMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);	
}

apogeeapp.app.FormDataMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.FormDataMode.prototype.constructor = apogeeapp.app.FormDataMode;

apogeeapp.app.FormDataMode.prototype.createDisplay = function() {
    return new apogeeapp.app.JsonFormEditor(this);
}

apogeeapp.app.FormDataMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

apogeeapp.app.FormDataMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

//==============================
// internal
//==============================

apogeeapp.app.FormDataMode.prototype.onSave = function(data) {
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}

;
/** This is a grid editor using hands on table*/
apogeeapp.app.HandsonGridEditor = function(viewMode) {
   
	this.outsideDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
	
//TBR initial sizing. now I just set it to a dummy number	
	
	this.gridDiv = apogeeapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"50px",
        "height":"50px",
		"overflow":"hidden",
        "zIndex":0
	});
	this.outsideDiv.appendChild(this.gridDiv);
	
	this.viewMode = viewMode;
	this.inputData = null;
	this.editOk = false;
    this.activeEditOk = undefined;
    this.dataCached = false;
	
	//resize the editor on window size change
    var instance = this;
    
   this.callbackAttached = false;
   
   //we have to make sure the element is loaded before initailizing for handsontable to work properly
   this.loaded = false;
   
	//grid edited function
	this.gridEdited = function(args) {
		instance.save(arguments);
	}
    
    //on a paste, the event is fired for each row created. We delay it here to haev fewer updates of the rest of the sheet
    this.timerInProcess = false;
    var REFRESH_DELAY = 50;
    
    this.delayGridEdited = function(args) {
        //if there is no timer waiting, start a timer
        if(!instance.timerInProcess) {
            instance.timerInProcess = true;
            var callEditEvent = function(args) {
                instance.timerInProcess = false;
                instance.gridEdited(arguments);
            }
            setTimeout(callEditEvent,REFRESH_DELAY);
        }
    }
    
}

apogeeapp.app.HandsonGridEditor.prototype.save = function(argArray) {
	//no action for this case
	if(argArray[1] == "loadData") return;

	//update "input" data before calling update
	this.inputData = apogee.util.jsonCopy(this.gridControl.getData());

	this.viewMode.onSave(this.inputData);
}

apogeeapp.app.HandsonGridEditor.prototype.cancel = function() {
	//reset the original data
	this.viewMode.onCancel();
}

//=============================
// "Package" Methods
//=============================

apogeeapp.app.HandsonGridEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
apogeeapp.app.HandsonGridEditor.prototype.showData = function(json,editOk) {
    
	if((this.inputData === json)&&(editOk)) return;
	
	this.editOk = editOk;
	this.inputData = json;
    this.dataCached = true;
	
    if(this.loaded) {
        this.displayData();
    }
}
    

//we must be loaded before creating objects
apogeeapp.app.HandsonGridEditor.prototype.displayData = function() {
    
    //clear the cached data flag, if it is present
    this.dataCached = false;
    
    var editData = apogee.util.jsonCopy(this.inputData);
    if(!editData) {
        editData = [[]];
    }

    if((!this.gridControl)||(this.activeEditOk !== this.editOk)) {
        this.createNewGrid(editData);
        this.activeEditOk = this.editOk;
    }
    else {
        this.gridControl.loadData(editData);
    }
    
    //set the background color
    if(this.editOk) {
        this.gridDiv.style.backgroundColor = "";
    }
    else {
        this.gridDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
    }
}

apogeeapp.app.HandsonGridEditor.prototype.onLoad = function() {
    this.loaded = true;
    if(this.dataCached) {
        this.displayData();
    }
}

apogeeapp.app.HandsonGridEditor.prototype.onUnload = function() {
    this.loaded = false;
}

apogeeapp.app.HandsonGridEditor.prototype.onResize = function() {
    this.setSize();
}
    
apogeeapp.app.HandsonGridEditor.prototype.setSize = function() {  
    if(this.gridDiv) {
        this.gridDiv.style.width = this.outsideDiv.clientWidth + "px";
        this.gridDiv.style.height = this.outsideDiv.clientHeight + "px";
        if(this.gridControl) {
            this.gridControl.render();
        }
    }
}

apogeeapp.app.HandsonGridEditor.prototype.destroy = function() {
	if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
}

//==============================
// Private Methods
//==============================

/** This method creates a new grid. 
 * @private */
apogeeapp.app.HandsonGridEditor.prototype.createNewGrid = function(initialData) {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
    
    var gridOptions; 
    if(this.editOk) {
        gridOptions = {
            data: initialData,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true,
            //edit callbacks
            afterChange:this.gridEdited,
            afterCreateCol:this.delayGridEdited,
            afterCreateRow:this.delayGridEdited,
            afterRemoveCol:this.gridEdited,
            afterRemoveRow:this.gridEdited
        }
        this.gridEditable = true;
    }
    else {
        gridOptions = {
            data: initialData,
            readOnly: true,
            rowHeaders: true,
            colHeaders: true,
        }
        this.gridEditable = false;
    }
        
    this.gridControl = new Handsontable(this.gridDiv,gridOptions); 
    
    this.setSize();
}

;

apogeeapp.app.HandsonGridMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.HandsonGridMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.HandsonGridMode.prototype.constructor = apogeeapp.app.HandsonGridMode;

apogeeapp.app.HandsonGridMode.prototype.createDisplay = function() {
    return new apogeeapp.app.HandsonGridEditor(this);
}

apogeeapp.app.HandsonGridMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

apogeeapp.app.HandsonGridMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.HandsonGridMode.prototype.onSave = function(data) {
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}


;

apogeeapp.app.ControlOutputMode = function(componentDisplay,displayDestroyFlags) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,displayDestroyFlags);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getMember();
    
    //no editor - override methods below as needed
}

apogeeapp.app.ControlOutputMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.ControlOutputMode.prototype.constructor = apogeeapp.app.ControlOutputMode;

apogeeapp.app.ControlOutputMode.prototype.createDisplay = function() {
    return this.component.getDataDisplay(this);
}

apogeeapp.app.ControlOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();
}

apogeeapp.app.ControlOutputMode.prototype.getFullName = function() {
	return this.member.getFullName();
}

/** This method returns an action messenger object for doing data updates in other tables. */ 
apogeeapp.app.ControlOutputMode.prototype.getMessenger = function() {
    return new apogee.action.Messenger(this.member);
}

//this is not applicable, for now at least
apogeeapp.app.ControlOutputMode.prototype.getIsDataEditable = function() {
    return false;
};
/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
apogeeapp.app.dialog.showConfigurableDialog = function(layout,onSubmitFunction) {

    var dialog = apogeeapp.ui.createDialog({"movable":true});
    var lineObjects = [];
    
    //this is the action for the form
    var formActions = {};
    //close form, in case actions needed
    formActions.onClose = function() {
        for(var i = 0; i < lineObjects.length; i++) {
            lineObject = lineObjects[i];
            if(lineObject.onClose) {
                lineObject.onClose();
            }
        }
        apogeeapp.ui.closeDialog(dialog);
    }
    //cancel
    formActions.onCancel = function() {
        formActions.onClose();
    }
    //submit
    formActions.onSubmit = function() {
        //load the form data
        var formData = {};
        var lineObject;
        for(var i = 0; i < lineObjects.length; i++) {
            lineObject = lineObjects[i];
            if(lineObject.addToResult) {
                lineObject.addToResult(formData);
            }
        }
        //submit data
        var closeDialog = onSubmitFunction(formData);
        if(closeDialog) {
            formActions.onClose();
        }
    }
    
    var content = apogeeapp.ui.createElement("div",{"className":"dialogBody"});
    for(var i = 0; i < layout.lines.length; i++) {
        var lineDef = layout.lines[i];
        
        //create line
        var lineObject = apogeeapp.app.dialog.showConfigurableDialog.createLine(lineDef,formActions);
        lineObjects.push(lineObject);
        if(lineObject.element) { //no element for "invisible" entry, which is used to pass values along
            content.appendChild(lineObject.element);
        }
    }
    
    //show dialog
    dialog.setContent(content);
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}
    
    
    
apogeeapp.app.dialog.showConfigurableDialog.createLine = function(lineDef,formActions) {
    var lineFunction = apogeeapp.app.dialog.showConfigurableDialog.lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        alert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

apogeeapp.app.dialog.showConfigurableDialog.lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":lineDef.title}));
        lineObject.element = line;
        
        //no addToResult or onClose
        
        return lineObject;
    },
    
    //lineDef.type = "dropdown"
    //lineDef.heading = dropdown heading (optional)
    //lineDef.entries = list of strings (or values) in dropdown
    //lineDef.initial = index of initial selection (optional)
    //lineDef.resultKey = name of result in result data
    "dropdown": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = apogeeapp.ui.createElement("select");
        for(var i = 0; i < lineDef.entries.length; i++) {
            var entry = lineDef.entries[i];
            select.add(apogeeapp.ui.createElement("option",{"text":entry}));
        }
        if(lineDef.initial) {
            select.value = lineDef.initial;
        }
        if(lineDef.disabled) {
            select.disabled = true;
        }
        line.appendChild(select);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = select.value;
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    //lineDef.type = "inputElement"
    //lineDef.heading = element heading (optional)
    //lineDef.resultKey = name of result in result data
    "inputElement": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var inputElement = apogeeapp.ui.createElement("input",{"type":"text"});
        if(lineDef.initial) {
            inputElement.value = lineDef.initial;
        }
        if(lineDef.disabled) {
            inputElement.disabled = true;
        }
        line.appendChild(inputElement);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = inputElement.value.trim();
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    "aceEditor": function(lineDef,formActions) {
        
    },
    
    "radioButton": function(lineDef,formActions) {
        //implement!
    },
    
    "checkbox": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var checkbox = apogeeapp.ui.createElement("input");
        checkbox.type = "checkbox";
        if(lineDef.name) {
            checkbox.name = lineDef.name;
        }
        if(lineDef.value) {
            checkbox.value = lineDef.value;
        }
        if(lineDef.initial) {
            checkbox.checked = true;
        }
        line.appendChild(checkbox);
        lineObject.element = line;
        //get result
        lineObject.addToResult = function(formData) {
            var result = checkbox.checked;
            formData[lineDef.resultKey] = result;
        }
        //no on Close
        
        return lineObject;
    },
    
    //lineDef.type = "submit"
    //lineDef.submit = name of submit button (optional)
    //lineDef.cancel = name of cancel button (optional)
    "submit": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.submit) {  
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(apogeeapp.ui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.cancel,"onclick":formActions.onCancel}));
        }
        lineObject.element = line;
        //no add to result or on close
        return lineObject;
    },
    
    //This allows the user to input a custom element
    //lineDef.type = "custom"
    //lineDef.createLineObject(formActions) - returns lineObject
    "custom": function(lineDef,formActions) {
        return lineDef.createLineObject(formActions);
    },
    
    //lineDef.type = "invisible"
    //lineDef.intial = value for this element (optional)
    //lineDef.resultKey = name of result in result data
    "invisible": function(lineDef,formActions) {
        var lineObject = {};
        //create the empty element
        lineObject.element = null;
        //get result
        lineObject.addToResult = function(formData) {
            
            formData[lineDef.resultKey] = lineDef.initial;
        }
        //no on Close
        
        return lineObject;
    }
    
    
}
    
    ;
/** This method shows a dialog to update the workspace links. */
apogeeapp.app.dialog.showUpdateLinksDialog = function(workspaceUI) {
    
    var dialog = apogeeapp.ui.createDialog({"minimizable":true,"maximizable":true,"movable":true});
            
//    //create body
//    var content = apogeeapp.ui.createElement("div",{"className":"dialogBody"}); 
    
    //add a scroll container
    var contentContainer = apogeeapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
    
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Links"}));
    content.appendChild(line);
        
    //editor selector
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"}); 
    var jsLinksRadio = apogeeapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"jsLinks"});
    line.appendChild(jsLinksRadio);
    line.appendChild(document.createTextNode("JS Links"));
    content.appendChild(line);
    var cssLinksRadio = apogeeapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"cssLinks"});
    line.appendChild(cssLinksRadio);
    line.appendChild(document.createTextNode("CSS Links"));
    
    //editors
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var editorDiv = apogeeapp.ui.createElement("div",null,
        {
            "position":"relative",
            "width":"500px",
            "height":"300px",
            "border":"1px solid darkgray"
        });
    line.appendChild(editorDiv);
    content.appendChild(line);
        
    //create editor containers - will be hiddedn and shown
    var jsLinksEditorDiv = apogeeapp.ui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var jsLinksEditor = null;
    editorDiv.appendChild(jsLinksEditorDiv);
    
    var cssLinksEditorDiv = apogeeapp.ui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var cssLinksEditor = null;
    editorDiv.appendChild(cssLinksEditorDiv);
    
    //save and cancel buttons
    //buttons and handler
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        closeDialog();
    }
    
    var onSave = function() {
        
        var jsLinkArray;
        var cssLinkArray;

        //get js links
        if(jsLinksEditor) {
            var jsLinks = jsLinksEditor.getSession().getValue().trim();
            jsLinkArray = apogeeapp.app.dialog.createLinkArray(jsLinks);
        }
        else {
            jsLinkArray = [];
        }

        //get css links
        if(cssLinksEditor) {
            var cssLinks = cssLinksEditor.getSession().getValue().trim();
            cssLinkArray = apogeeapp.app.dialog.createLinkArray(cssLinks);
        }
        else {
            cssLinkArray = [];
        }

        //load links if we have any
        workspaceUI.setLinks(jsLinkArray,cssLinkArray);

        closeDialog();
    }
    
    var closeDialog = function() {
        apogeeapp.ui.closeDialog(dialog);
        
        //clean up the editor
        if(jsLinksEditor) { 
            jsLinksEditor.destroy();
            jsLinksEditor = null;
        }
        if(cssLinksEditor) { 
            cssLinksEditor.destroy();
            cssLinksEditor = null;
        }  
    }
    
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
    
    var showJsLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "none";
        jsLinksEditorDiv.style.display = "";
        
        //create html editor if needed
        if(!jsLinksEditor) {
            jsLinksEditor = ace.edit(jsLinksEditorDiv);
//this stops an error message
jsLinksEditor.$blockScrolling = Infinity;
            jsLinksEditor.setTheme("ace/theme/eclipse");
            jsLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var jsLinks = workspaceUI.getJsLinks();
            if(jsLinks) {
                var linkText = jsLinks.join("\n");
                jsLinksEditor.getSession().setValue(linkText);
            }
        }
    }
    
    var showCssLinksFunction = function() {
        //hide the onLoad div and show the html dive
        cssLinksEditorDiv.style.display = "";
        jsLinksEditorDiv.style.display = "none";
        
        //create html editor if needed
        if(!cssLinksEditor) {
            cssLinksEditor = ace.edit(cssLinksEditorDiv);
//this stops an error message
cssLinksEditor.$blockScrolling = Infinity;
            cssLinksEditor.setTheme("ace/theme/eclipse");
            cssLinksEditor.getSession().setMode("ace/mode/text");
            //set the value
            var cssLinks = workspaceUI.getCssLinks();
            if(cssLinks) {
                var linkText = cssLinks.join("\n");
                cssLinksEditor.getSession().setValue(linkText);
            }
        }
    }
    
    //show html first
    jsLinksRadio.checked = true;
    showJsLinksFunction();
    
    //radio change handler
    var onRadioChange = function() {
        if(cssLinksRadio.checked) {
            showCssLinksFunction();
        }
        else if(jsLinksRadio.checked) {
            showJsLinksFunction();
        }
    }
    
    cssLinksRadio.onchange = onRadioChange;
    jsLinksRadio.onchange = onRadioChange;
}

/** @private */
apogeeapp.app.dialog.createLinkText = function(linkArray) {
    return linkArray.join("\n");
}

/** @private */
apogeeapp.app.dialog.createLinkArray = function(linkText) {
    if((!linkText)||(linkText.length === 0)) {
        return [];
    }
    else {
        return linkText.split(/\s/);
    }
}


;
/** This method shows a dialog to select from additional components. */
apogeeapp.app.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = apogeeapp.ui.createDialog({"movable":true});
    
    //add a scroll container
    var contentContainer = apogeeapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = apogeeapp.ui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(apogeeapp.ui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        apogeeapp.ui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        apogeeapp.ui.closeDialog(dialog);
    }
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);  
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}



;
apogeeapp.app.propdialog = {};


//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
apogeeapp.app.propdialog.getDialogLayout = function(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + displayName;
    }
    else {
        titleLine.title = "Update " + displayName; 
    }
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.heading = "Folder: ";
        parentLine.entries = folderNames;
        parentLine.resultKey = "parentName"; 
        lines.push(parentLine);
    }

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    var submitLine = {};
    submitLine.type = "submit";
    if(doCreate) {
        submitLine.submit = "Create";
    }
    else {
        submitLine.submit = "Update";
    }
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    //set the initial values
    if(initialValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.resultKey) {
                line.initial = initialValues[line.resultKey];
            }
        }
    }
    
    return dialogLayout;
}



;

module.exports = apogeeapp;



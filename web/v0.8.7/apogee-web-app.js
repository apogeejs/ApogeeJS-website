/* Apogee Web App Version 0.8.7 */
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

//======================================
//window content types
//These are types of content that can be put in a window or other container. If is it 
//resizable it can be fitted to the window size. If it is fixed size it can be 
//added to a scrolling window or used to set the container size
//======================================
apogeeapp.ui.RESIZABLE = 0x01;
apogeeapp.ui.FIXED_SIZE = 0x02;

//this is not an actual content type, but an option for displaying FIXED_SIZE content
apogeeapp.ui.SIZE_WINDOW_TO_CONTENT = 0x03;




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

/** This sets the content for the window. */
apogeeapp.ui.WindowFrame.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerCell);
    this.headerCell.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
 *  apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.
 *  apogeeapp.ui.SIZE_WINDOW_TO_CONTENT - this is not a content type but a input option for content FIXED_SIZE that shrinks the window to fit the content. */
apogeeapp.ui.WindowFrame.prototype.setContent = function(contentElement,elementType) {
    
    if(!this.contentContainer) {
        this.contentContainer = apogeeapp.ui.createElement("div");
        apogeeapp.ui.removeAllChildren(this.bodyCell);
        this.bodyCell.appendChild(this.contentContainer);
    }
    if(elementType == apogeeapp.ui.RESIZABLE) {
        this.contentContainer.className = "visiui_win_container_fixed";
    }
    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
        this.contentContainer.className = "visiui_win_container_scrolling";
    }
    else if(elementType == apogeeapp.ui.SIZE_WINDOW_TO_CONTENT) {
        this.contentContainer.className = "visiui_win_container_fit_content";
    }
    else {
        throw new Error("Unknown content type: " + elementType);
    }
    
    apogeeapp.ui.removeAllChildren(this.contentContainer);
    this.contentContainer.appendChild(contentElement);
    
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
/** This is a plain div that holds content similar to a window frame
 * but it does not have a outer frame and does not go in a window parent.
 * 
 * @class 
 */
apogeeapp.ui.PlainFrame = function(options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    //base init
    apogee.EventManager.init.call(this);
	
    //variables
    this.options = options;

    this.displayAndHeader = null;
    this.headerCell = null;
    this.bodyCell = null;
    
    this.isShowing = false;
    
    this.headerContent = null;
    this.content = null;
	
    //initialize
    this.initUI();
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.PlainFrame,apogee.EventManager);

//====================================
// Public Methods
//====================================

/** This sets the content for the window. */
apogeeapp.ui.PlainFrame.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerCell);
    this.headerCell.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - for this content, the content is resized to fit the plane frame. The place frame should be initialized with a size.
 *  apogeeapp.ui.FIXED_SIZE - for this content, the plain frame is sized to fit the content. ITs size should not be externally set.  */
apogeeapp.ui.PlainFrame.prototype.setContent = function(contentElement,elementType) {
    
    apogeeapp.ui.removeAllChildren(this.bodyCell);
    
    //set the body type
    var bodyClassName;
    if(elementType == apogeeapp.ui.RESIZABLE) {
       bodyClassName = "visiui-dnh-fixed";
    }
    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
        bodyClassName = "visiui-dnh-shrink-to-fit";
    }
    else {
        throw new Error("Unknown content type: " + elementType);
    }
    this.displayAndHeader.setBodyType(bodyClassName);
    
    //set the content
    this.bodyCell.appendChild(contentElement);
    this.content = contentElement;
}

/** This method removes the given element from the content display. If the element
 * is not in the content display, no action is taken. */
apogeeapp.ui.PlainFrame.prototype.safeRemoveContent = function(contentElement) {
    for(var i = 0; i < this.bodyCell.childNodes.length; i++) {
		var node = this.bodyCell.childNodes[i];
        if(node === contentElement) {
        	this.bodyCell.removeChild(contentElement);
            this.content = null;
        }
    }
}



//---------------------------
// WINDOW CHILD
//---------------------------

/** This method returns true if the window is showing. */
apogeeapp.ui.PlainFrame.prototype.setIsShowing = function(isShowing) {
    if(isShowing) {
        if(!this.isShowing) {
            this.isShowing = true;
            this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
        }
    }
    else if(this.isShowing) {
        this.isShowing = false;
        this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
    }
}

/** This method returns true if the window is showing. */
apogeeapp.ui.PlainFrame.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method closes the window. If the argument forceClose is not
 * set to true the "request_close" handler is called to check if
 * it is ok to close the window. */
apogeeapp.ui.PlainFrame.prototype.close = function(forceClose) {

    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }

    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method returns the main dom element for the window frame. */
apogeeapp.ui.PlainFrame.prototype.getElement = function() {
    return this.displayAndHeader.getOuterElement();
}


//----------------------------------------------------------------
//object specific


/** This method gets the location and size info for the window. */
apogeeapp.ui.PlainFrame.prototype.getWindowState = function() {
    return apogeeapp.ui.WINDOW_STATE_NORMAL;
}

//====================================
// Initialization Methods
//====================================

/** @private */
apogeeapp.ui.PlainFrame.prototype.initUI = function() {
    
    this.displayAndHeader = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
        null,
        apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE,
        null
    );
  
    this.headerCell= this.displayAndHeader.getHeaderContainer();  
    this.bodyCell = this.displayAndHeader.getBody();
    
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    this.headerCell.appendChild(this.windowHeaderManager.getHeaderElement());  
    
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

/** This gets the active tab, by tab id. */
apogeeapp.ui.TabFrame.prototype.getActiveTab = function() {
    return this.activeTab;
}

/** This sets the active tab, by tab id. */
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
        if(oldTab) {
            this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,oldTab);
        }
		this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,tab);
        
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

/** This sets the content for the window. */
apogeeapp.ui.Tab.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    this.headerContainer.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
 *  apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
apogeeapp.ui.Tab.prototype.setContent = function(contentElement,elementType) {
    if(!this.contentContainer) {
        this.contentContainer = apogeeapp.ui.createElement("div");
        apogeeapp.ui.removeAllChildren(this.bodyContainer);
        this.bodyContainer.appendChild(this.contentContainer);
    }
    if(elementType == apogeeapp.ui.RESIZABLE) {
        this.contentContainer.className = "visiui_tf_tab_contents_fixed";
    }
    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
        this.contentContainer.className = "visiui_tf_tab_contents_scrolling";
    }
    else {
        throw new Error("Unknown content type: " + elementType);
    }
    
    apogeeapp.ui.removeAllChildren(this.contentContainer);
    this.contentContainer.appendChild(contentElement);
    
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
    
    this.childContainer = null;
    this.childEntries = [];
    this.parent = null;
    this.sortFunction = null;
    this.extraSortParam = null;
    
    //set the non-empty state for in case we get children
    //but for now it will be empty
    this.nonEmptyState = apogeeapp.ui.treecontrol.DEFAULT_STATE;
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

/** This sets a sort function for the children of the node. If none is set the
 * children will be sorted by the order they are added. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setSortFunction = function(sortFunction) {
    this.sortFunction = sortFunction;
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setLabel = function(labelText) {
    this.labelText = labelText;
    this.label.innerHTML = labelText;
    if(this.parent) {
        this.parent._notifyNameChange(this);
    }
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getLabel = function() {
    return this.labelText;
}

/** This allows for specified ordering of the chidlren. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setExtraSortParam = function(value) {
    this.extraSortParam = value;
}

/** This allows for specified ordering of the chidlren. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getExtraSortParam = function() {
    return this.extraSortParam;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.addChild = function(childTreeEntry) {
    this.childEntries.push(childTreeEntry);
    this._insertChildIntoList(childTreeEntry);
    childTreeEntry._setParent(this);
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(childTreeEntry) {
    if(this.childContainer) {
        var index = this.childEntries.indexOf(childTreeEntry);
        if(index >= 0) {
            this.childEntries.splice(index,1);
            this._removeChildFromList(childTreeEntry);
            childTreeEntry._setParent(null);
        }
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.getState = function() {
    return this.state;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.setState = function(state) {
    //if we have no children, always make the state no control
    //but we will store the state below for latert
    if((!this.childContainer)||(this.childContainer.length == 0)) {
        this.state = apogeeapp.ui.treecontrol.NO_CONTROL;
    }
    else {
        this.state = state;
    }
    
    //save this as the non-empty state if it is not no control
    if(state != apogeeapp.ui.treecontrol.NO_CONTROL) {
        this.nonEmptyState = state;
    }
    
    //configure the state
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
        this.childContainer.style.display = "";
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
        this.childContainer.style.display = "none";
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

//=====================================
// Private
//=====================================

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._setParent = function(parent) {
    this.parent = parent;
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._insertChildIntoList = function(childEntry) {
    if(!this.childContainer) {
        //add the child list if it does not exist
        this.childContainer = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
        this.setState(this.nonEmptyState);
    }
    
    if(this.sortFunction) {
        this._updateChildElements();
    }
    else {
        this.childContainer.appendChild(childEntry.getElement());
    }
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._removeChildFromList = function(childEntry) {
    this.childContainer.removeChild(childEntry.getElement());
    
    //remove the child list if there are no children
    if(this.childContainer.childElementCount === 0) {
        this.element.removeChild(this.childContainer);
        this.childContainer = null;
        //set state to empty, but save our old setting
        this.nonEmtpyState = this.state;
        this.setState(apogeeapp.ui.treecontrol.NO_CONTROL); 
    }
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._notifyNameChange = function(childEntry) {
    if(this.sortFunction) {
        this._updateChildElements();
    }
}

/** This sets the children elements in the sorted order 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._updateChildElements = function() {
  var temp = this.childEntries.map( element => element);
  temp.sort(this.sortFunction);
  apogeeapp.ui.removeAllChildren(this.childContainer);
  temp.forEach(child => this.childContainer.appendChild(child.getElement()));

}    






;
/** This is a panel with forma elements that can be configured using a javascript object.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurablePanel = class {
    
    constructor(optionalContainerClassName = apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_SELF_SIZED) {
        this.elementObjects = [];
        this.panelElement = this.createPanelElement(optionalContainerClassName); 
    }
    
    configureForm(formInitData) {
        
        //TEMPORARY - legacy check correction----------------------
        if((formInitData)&&(formInitData.constructor == Array)) {
            formInitData = {layout:formInitData};
        }
        //---------------------------------------------------------
        
        //check for an invalid input
        if((!formInitData)||(!formInitData.layout)||(formInitData.layout.constructor != Array)) {
            formInitData = apogeeapp.ui.ConfigurablePanel.INVALID_INIT_DATA;
        }
        
        //clear data
        apogeeapp.ui.removeAllChildren(this.panelElement);
        this.elementObjects = [];
        
        try {
            //create elements     
            formInitData.layout.forEach(elementInitData => this.addToPanel(elementInitData));

            //additional init
            if(formInitData.onChange) {
                this.addOnChange(formInitData.onChange);
            }

            if(formInitData.onSubmitInfo) {
                this.addSubmit(formInitData.onSubmitInfo.onSubmit,
                    formInitData.onSubmitInfo.onCancel,
                    formInitData.onSubmitInfo.submitLabel,
                    formInitData.onSubmitInfo.cancelLabel);
            }

            if(formInitData.disabled) {
                this.setDisabled(true);
            }
        }
        catch(error) {
            var errorMsg = "Error in panel: " + error.message;
            
            var errorLayoutInfo = apogeeapp.ui.ConfigurablePanel.getErrorMessageLayoutInfo(errorMsg);
            this.configureForm(errorLayoutInfo);
        }
    }
    
    /** This method returns the ConfigurableElement for the given key. */
    getEntry(key) {
        return this.elementObjects.find(elementObject => elementObject.getKey() == key);
    }

    /** This method returns the data value object for this given panel. */
    getValue() {
        var formValue = {};
        var addValue = elementObject => {
            if(elementObject.getState() != apogeeapp.ui.ConfigurableElement.STATE_INACTIVE) {
                var elementValue = elementObject.getValue();
                if(elementValue !== undefined) {
                    var key = elementObject.getKey();
                    formValue[key] = elementValue;
                }
            }
        }
        this.elementObjects.forEach(addValue);
        return formValue;
    }
    
    /** This method returns the data value object for this given panel. */
    setValue(formValue) {
        for(var key in formValue) {
            var entry = this.getEntry(key);
            if(entry) {
                entry.setValue(formValue[key]);
            }
        }
    }
    
    getElement() {
        return this.panelElement;
    }
    
    getChildEntries() {
        return this.elementObjects;
    }
    
    /** This is an alternate way to add a submit entry to the form. This is useful
     * if the layout has no other handlers in it and is a pure JSON object. This 
     * will then separate out any handlers from the layout. */
    addSubmit(onSubmit,
            onCancel,
            optionalSubmitLabel = apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL,
            optionalCancelLabel = apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL) {
                
        var data = {};
        data.type = apogeeapp.ui.SubmitElement.TYPE_NAME;
        if(onSubmit) {
            data.onSubmit = onSubmit;
            data.submitLabel = optionalSubmitLabel;
        }
        if(onCancel) {
            data.onCancel = onCancel;
            data.cancelLabel = optionalCancelLabel;
        }
        
        this.addToPanel(data);
    }
    
    //takes a handler onChange(formValue,form)
    addOnChange(onChange) {
        var childOnChange = (childValue,form) => {
            var formValue = this.getValue();
            onChange(formValue,form);
        }
        this.elementObjects.forEach( elementObject => {if(elementObject.addOnChange) elementObject.addOnChange(childOnChange);} );
    }
    
    setDisabled(isDisabled) {
        var state = isDisabled ? apogeeapp.ui.ConfigurableElement.STATE_DISABLED :
                apogeeapp.ui.ConfigurableElement.STATE_NORMAL;
        this.elementObjects.forEach( elementObject => elementObject.setState(state) );
    }
    
    /** This method is used to register configurable elements with the panel */
    static addConfigurableElement(constructorFunction) {
        var type = constructorFunction.TYPE_NAME;
        apogeeapp.ui.ConfigurablePanel.elementMap[type] = constructorFunction;
    }
    
    /** This method can be used to generate an error message layout. */
    static getErrorMessageLayoutInfo(errorMsg) {
        var layout = [];
        var entry = {};
        entry.type = "htmlDisplay";
        entry.html = "<em style='color:red'>" + errorMsg + "</em>";
        layout.push(entry);
        return {"layout":layout};
    }
    
    //=================================
    // Private methods
    //=================================
    
    /** This creates the container element for the panel. */
    createPanelElement(containerClassName) {
        var panelElement = document.createElement("div");
        panelElement.className = containerClassName;
        return panelElement;
    }
    
    /** this is called internally to add an element to the panel. */
    addToPanel(elementInitData) {
        var type = elementInitData.type;
        if(!type) {
            throw new Error("Type not found for configurable form entry!");
        }
        
        var elementObject;
        if(type == "custom") {
            //special case - let the user construct an explict object from the base element
            elementObject = new apogeeapp.ui.ConfigurableElement(this,elementInitData);
            elementInitData.builderFunction(elementObject);
        }
        else {
            //standard case - lookup constructor and instantiate
            var constructor = apogeeapp.ui.ConfigurablePanel.getTypeConstructor(type);
            if(!constructor) {
                throw new Error("Type not found for configurable element: " + type);
            }

            elementObject = new constructor(this,elementInitData);
        }
        
        this.elementObjects.push(elementObject);
        var domElement = elementObject.getElement();
        if(domElement) {
            this.panelElement.appendChild(domElement);
        }
    }
    
    static getTypeConstructor(type) {
        return apogeeapp.ui.ConfigurablePanel.elementMap[type];
    }
}

//static fields
apogeeapp.ui.ConfigurablePanel.elementMap = {};

apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_FILL_PARENT = "apogee_configurablePanelBody_fillParent";
apogeeapp.ui.ConfigurablePanel.CONTAINER_CLASS_SELF_SIZED = "apogee_configurablePanelBody_selfSized";

//This is displayed if there is an invalid layout passed in
apogeeapp.ui.ConfigurablePanel.INVALID_INIT_DATA = {
    layout: [
        {
            type: "heading",
            text: "INVALID FORM LAYOUT!",
            level: 4
        }
    ]
}



;
/** This is an element that composes the content of a configurable panel.
 * 
 * @class 
 */
apogeeapp.ui.ConfigurableElement = class {
    constructor(form,elementInitData,optionalContainerClassName = apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD) {
        this.form = form;
        this.key = elementInitData.key;
        this.domElement = apogeeapp.ui.createElement("div",{"className":optionalContainerClassName});
    }
    
    /** This method returns the key for this ConfigurableElement within this panel. */
    getKey() {
        return this.key;
    }

    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return undefined;
    }  
    
    getState() {
        return this.state;
    }

    /** This hides or shows the given element within the panel. */
    setState(state) {
        this.state = state;
         
        switch(state) {
            case apogeeapp.ui.ConfigurableElement.STATE_NORMAL:
                this._setVisible(true);
                this._setDisabled(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_DISABLED:
                this._setVisible(true);
                this._setDisabled(true);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_HIDDEN:
                this._setVisible(false);
                break;
                
            case apogeeapp.ui.ConfigurableElement.STATE_INACTIVE:
                this._setVisible(false);
                break;
        }
        
    }

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
    }

    /** This method returns the DOM element for this configurable element. */
    getElement() {
        return this.domElement;
    }
    
    /** This method returns the parent form for this configurable element. */
    getForm() {
        return this.form;
    }
    
    /** This allows this element to control visibility of the given child.
     * When the value of the element is set, the child will be made visible depending
     * if its childs target valud matches the current element value. */
    addSelectionChild(childElement,value,keepActiveOnHide) {
        if(!this.childSelectionElements) {
            this._initAsParent();
        }
        var childData = {};
        childData.element = childElement;
        childData.value = value;
        childData.keepActiveOnHide = keepActiveOnHide;
        this.childSelectionElements.push(childData);
        
        this.setChildState(childData,this.getValue());
    }
    
    checkChildSelection(value) {
        if((this.childSelectionElements)&&(this.setChildState)) {
            this.childSelectionElements.forEach( childData => this.setChildState(childData,value));
        } 
    }
    
//    /* Implement this if the element can selector children */
//    setChildState(childData,value) {
//        
//    }

    //---------------------------------
    //set child state implementations
    //---------------------------------
    
    /** This is a function that can be used to set values when the parent element has a single value. */
    static setChildStateSingleValue(childData,value) {
        if(childData.value == value) {
            childData.element.setState(apogeeapp.ui.ConfigurableElement.STATE_NORMAL);
        }
        else {
            var state = childData.keepActiveOnHide ? apogeeapp.ui.ConfigurableElement.STATE_HIDDEN : apogeeapp.ui.ConfigurableElement.STATE_INACTIVE;
            childData.element.setState(state);
        }
    }
    
    /** This is a function that can be used to set values when the parent element has an array value. */
    static setChildStateArrayValue(childData,value) {
        if(value.indexOf(childData.value) >= 0) {
            childData.element.setState(apogeeapp.ui.ConfigurableElement.STATE_NORMAL);
        }
        else {
            var state = childData.keepActiveOnHide ? apogeeapp.ui.ConfigurableElement.STATE_HIDDEN : apogeeapp.ui.ConfigurableElement.STATE_INACTIVE;
            childData.element.setState(state);
        }
    }
    
    
    //===================================
    // internal Methods
    //==================================
    
    /** This method does standard initialization which requires the element be created. 
     * Any extending method should call this at the end of the constructor. */
    _postInstantiateInit(elementInitData) {
        
        //standard fields
        if(elementInitData.value !== undefined) {
            this.setValue(elementInitData.value);
        }
        
        var state = (elementInitData.state != undefined) ? elementInitData.state : apogeeapp.ui.ConfigurableElement.STATE_NORMAL;
        this.setState(state);
        
        //standard events
        if(elementInitData.onChange) {
            this.addOnChange(elementInitData.onChange);
        }
        
        //accont for parent elements
        if(elementInitData.selector) {
            if(!elementInitData.selector.parentKey) throw new Error("Parent key is required for a selectable child element:" + elementInitData.key);
            if(elementInitData.selector.parentValue === undefined) throw new Error("A child selectable element must contain a value: " + elementInitData.key)
            var parentElement = this.form.getEntry(elementInitData.selector.parentKey);
            if(!parentElement) throw new Error("Parent element " + elementInitData.selector.parentKey + " not found for selectable child element " + elementInitData.key);
            if(!parentElement.setChildState) throw new Error("Parent element " + elementInitData.selector.parentKey + " does not support selection of a child element - in element = " + elementInitData.key);
            
            parentElement.addSelectionChild(this,elementInitData.selector.parentValue,elementInitData.keepActiveOnHide);
        }
    }
    
    _setDisabled(isDisabled) {};
    
    _setVisible(isVisible) {
        if(isVisible) {
            this.domElement.style.display = "";
        }
        else {
            this.domElement.style.display = "none";
        }
    }
    
    _initAsParent() {
        this.childSelectionElements = [];
        this.parentOnChangeHandler = (value,form) => this.childSelectionElements.forEach( childElement => this.setChildState(childElement,value));
        this.addOnChange(this.parentOnChangeHandler);
    }
}

apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_STANDARD = "apogee_configurablePanelLine_standard";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN = "apogee_configurablePanelPanelLine_noMargin";
apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_INVISIBLE = "apogee_configurablePanelPanelLine_hidden";

apogeeapp.ui.ConfigurableElement.STATE_NORMAL = "normal";
apogeeapp.ui.ConfigurableElement.STATE_DISABLED = "disabled";
apogeeapp.ui.ConfigurableElement.STATE_HIDDEN = "hidden";
apogeeapp.ui.ConfigurableElement.STATE_INACTIVE = "inactive";


;
/** This is a heading element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.HeadingElement = class extends apogeeapp.ui.ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        var headingLevel;
        if(elementInitData.level) { 
            headingLevel = elementInitData.level;
        }
        else {
            headingLevel = apogeeapp.ui.HeadingElement.DEFAULT_HEADING_LEVEL;
        }
        var headingType = "h" + headingLevel;
        
        this.headingElement = apogeeapp.ui.createElement(headingType,{"className":"apogee_configurablePanelHeading","innerHTML":elementInitData.text});
        containerElement.appendChild(this.headingElement);
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action;
    }
}


apogeeapp.ui.HeadingElement.DEFAULT_HEADING_LEVEL = 2;

apogeeapp.ui.HeadingElement.TYPE_NAME = "heading";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.HeadingElement);


;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.TextFieldElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        //text field (maight had password flag)
        var type = (elementInitData.password === true) ? "password" : "text";
        this.inputElement = apogeeapp.ui.createElement("input",{"type":type});
        containerElement.appendChild(this.inputElement); 
        
        if(elementInitData.size !== undefined) {
            this.inputElement.size = elementInitData.size;
        }
        
        //non-standard events
        if(elementInitData.onChangeCompleted) {
            this.addOnChangeCompleted(elementInitData.onChangeCompleted);
        }
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.inputElement.value.trim();
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.inputElement.value = value;
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.inputElement.addEventListener("input",onChangeImpl);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChangeCompleted(onChangeCompleted) {
        var onChangeCompletedImpl = () => {
            onChangeCompleted(this.getValue(),this.getForm());
        }
        this.inputElement.addEventListener("change",onChangeCompletedImpl);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.inputElement.disabled = isDisabled;
    }
}

apogeeapp.ui.TextFieldElement.TYPE_NAME = "textField";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.TextFieldElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.TextareaElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        //text field
        this.inputElement = apogeeapp.ui.createElement("textarea");
        if(elementInitData.rows) {
            this.inputElement.rows = elementInitData.rows;
        }
        if(elementInitData.cols) {
            this.inputElement.cols = elementInitData.cols;
        }
        containerElement.appendChild(this.inputElement); 
        
        //non standard events
        if(elementInitData.onChangeCompleted) {
            this.addOnChangeCompleted(elementInitData.onChangeCompleted);
        }
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.inputElement.value.trim();
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.inputElement.value = value;
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.inputElement.addEventListener("input",onChangeImpl);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChangeCompleted(onChangeCompleted) {
        var onChangeCompletedImpl = () => {
            onChangeCompleted(this.getValue(),this.getForm());
        }
        this.inputElement.addEventListener("change",onChangeCompletedImpl);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.inputElement.disabled = isDisabled;
    }
}

apogeeapp.ui.TextareaElement.TYPE_NAME = "textarea";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.TextareaElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.DropdownElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        this.select = apogeeapp.ui.createElement("select");
        var addEntry = entryInfo => {
            var label;
            var value;
            if(apogee.util.getObjectType(entryInfo) == "Array") {
                label = entryInfo[0]
                value = entryInfo[1];
            }
            else {
                label = entryInfo;
                value = entryInfo;   
            }
            var entry = document.createElement("option");
            entry.text = label;
            entry.value = value;
            this.select.appendChild(entry);
        }
        if(elementInitData.entries) {
            elementInitData.entries.forEach(addEntry);
        }
        containerElement.appendChild(this.select); 
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = apogeeapp.ui.ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.select.value;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.select.value = value;
        
        //needed for selection children
        this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.select.addEventListener("change",onChangeImpl);
    }
    
    
  
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.select.disabled = isDisabled;
    }
}

apogeeapp.ui.DropdownElement.TYPE_NAME = "dropdown";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.DropdownElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.CheckboxElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
        }
        else {
            this.labelElement = null;
        }
        
        //checkbox field
        this.checkbox = apogeeapp.ui.createElement("input",{"type":"checkbox"});
        containerElement.appendChild(this.checkbox);  
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = apogeeapp.ui.ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.checkbox.checked;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.checkbox.checked = (value === true);
        
        //needed for selection children
        this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.checkbox.addEventListener("change",onChangeImpl);
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkbox.disabled = isDisabled;
    }
}

apogeeapp.ui.CheckboxElement.TYPE_NAME = "checkbox";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.CheckboxElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.CheckboxGroupElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
            
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
        }
        else {
            this.labelElement = null;
        }
        
        //check boxes
        this.checkboxList = [];
        var addCheckbox = checkboxInfo => {
            var checkbox = apogeeapp.ui.createElement("input");
            checkbox.type = "checkbox";
            
            var label;
            var value;
            if(apogee.util.getObjectType(checkboxInfo) == "Array") {
                label = checkboxInfo[0]
                value = checkboxInfo[1];     
            }
            else {
                label = checkboxInfo;
                value = checkboxInfo; 
            }
            checkbox.value = value;
            this.checkboxList.push(checkbox);
            containerElement.appendChild(checkbox);
            containerElement.appendChild(document.createTextNode(label));
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
            
            if(elementInitData.disabled) checkbox.disabled = true;
        };
        elementInitData.entries.forEach(addCheckbox);   
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = apogeeapp.ui.ConfigurableElement.setChildStateArrayValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.checkboxList.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    }   

    /** This method updates the list of checked entries. */
    setValue(valueList) {
        this.checkboxList.forEach(checkbox => checkbox.checked = (valueList.indexOf(checkbox.value) >= 0));
        
        //needed for selection children
        this.checkChildSelection(valueList);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.checkboxList.forEach(checkbox => checkbox.addEventListener("change",onChangeImpl));
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.checkboxList.forEach(checkbox => checkbox.disabled = isDisabled);
    }
}

apogeeapp.ui.CheckboxGroupElement.TYPE_NAME = "checkboxGroup";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.CheckboxGroupElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.RadioGroupElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        //label
        if(elementInitData.label) {
            this.labelElement = document.createElement("span");
            this.labelElement.className = "apogee_configurablePanelLabel";
            this.labelElement.innerHTML = elementInitData.label;
            containerElement.appendChild(this.labelElement);
            
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
        }
        else {
            this.labelElement = null;
        }
        
        //radio buttons
        this.buttonList = [];
        var groupName = elementInitData.groupName;
        var addButton = buttonInfo => {
            var radio = apogeeapp.ui.createElement("input");
            radio.type = "radio";
            radio.name = groupName;
            
            var label;
            var value;
            if(apogee.util.getObjectType(buttonInfo) == "Array") {
                label = buttonInfo[0]
                value = buttonInfo[1];     
            }
            else {
                label = buttonInfo;
                value = buttonInfo; 
            }
            radio.value = value;
            this.buttonList.push(radio);
            containerElement.appendChild(radio);
            containerElement.appendChild(document.createTextNode(label));
            if(!elementInitData.horizontal) containerElement.appendChild(document.createElement("br"));
        };
        elementInitData.entries.forEach(addButton);
        
        this._postInstantiateInit(elementInitData);
        
        //add suport for selection children
        this.setChildState = apogeeapp.ui.ConfigurableElement.setChildStateSingleValue;
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        var checkedRadio = this.buttonList.find(radio => radio.checked);
        if(checkedRadio) {
            return checkedRadio.value;
        }
        else {
            return undefined;
        }
    }   

    /** This method updates the list of checked entries. */
    setValue(value) {
        var checkedButton = this.buttonList.find(radioButton => (radioButton.value == value));
        if(checkedButton) {
            checkedButton.checked = true;
        }
        
        //needed for selection children
        this.checkChildSelection(value);
    }
    
    /** This should be extended in elements to handle on change listeners. */
    addOnChange(onChange) {
        var onChangeImpl = () => {
            onChange(this.getValue(),this.getForm());
        }
        this.buttonList.forEach(radioButton => radioButton.addEventListener("change",onChangeImpl));
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.buttonList.forEach(radioButton => radioButton.disabled = isDisabled);
    }
}

apogeeapp.ui.RadioGroupElement.TYPE_NAME = "radioButtonGroup";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.RadioGroupElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.InvisibleElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData,apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_INVISIBLE);
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.value;
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.value = value;
    }
}

apogeeapp.ui.InvisibleElement.TYPE_NAME = "invisible";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.InvisibleElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.PanelElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        super(form,elementInitData,apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN);
        
        var containerElement = this.getElement();
        //update the container class
        containerElement.className = "apogee_configurablePanelPanelLine";
        
        var formInitData = elementInitData.formData;
        this.panel = new apogeeapp.ui.ConfigurablePanel();
        this.panel.configureForm(formInitData);
        var panelElement = this.panel.getElement();
        panelElement.className = "apogee_configurablePanelPanelLine";
        containerElement.appendChild(panelElement);  
        
        this._postInstantiateInit(elementInitData);
    }
    
    /** This method returns value for this given element, if applicable. If not applicable
     * this method returns undefined. */
    getValue() {
        return this.panel.getValue();
    }   

    /** This method updates the value for a given element. See the specific element
     * to see if this method is applicable. */
    setValue(value) {
        this.panel.setValue(value);
    }
    
    /** This will call the handler is this panel changes value. */
    addOnChange(onChange) {
        var childOnChange = (value,childForm) => {
            onChange(this.getValue(),this.getForm());
        }
        //add this to each element in the panel
        this.panel.getChildEntries().forEach( elementObject => {if(elementObject.addOnChange) elementObject.addOnChange(onChange);} );
    }
    
    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.panel.setDisabled(isDisabled);
    }
}

apogeeapp.ui.PanelElement.TYPE_NAME = "panel";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.PanelElement);
;
/** This is an submit element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.SubmitElement = class extends apogeeapp.ui.ConfigurableElement {
    
    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();

        this.submitDisabled = elementInitData.submitDisabled;
        this.cancelDisabled = elementInitData.cancelDisabled;
        
        //create the submit button
        if(elementInitData.onSubmit) {
            
            var onSubmit = () => {
                var formValue = form.getValue();
                elementInitData.onSubmit(formValue,form);
            }
            
            var submitLabel;
            if(elementInitData.submitLabel) { 
                submitLabel = elementInitData.submitLabel;
            }
            else {
                submitLabel = apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL;
            }
            
            this.submitButton = apogeeapp.ui.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":submitLabel,"onclick":onSubmit});
            containerElement.appendChild(this.submitButton);
        }
        else {
            this.submitButton = null;
        }
        
        //create the cancel button
        if(elementInitData.onCancel) {
            
            var onCancel = () => {
                elementInitData.onCancel(form);
            }
            
            var cancelLabel;
            if(elementInitData.cancelLabel) { 
                cancelLabel = elementInitData.cancelLabel;
            }
            else {
                cancelLabel = apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL;
            }
            
            this.cancelButton = apogeeapp.ui.createElement("button",{"className":"apogee_configurablePanelButton","innerHTML":cancelLabel,"onclick":onCancel});
            containerElement.appendChild(this.cancelButton);
        }
        else {
            this.cancelButton = null;
        }  

        this._setButtonState();    
        
        this._postInstantiateInit(elementInitData);
    }
    
    submitDisable(isDisabled) {
        this.submitDisabled = isDisabled;
        this._setButtonState();
    }
    
    cancelDisable(isDisabled) {
        this.cancelDisabled = isDisabled;
        this._setButtonState();
    }

    //===================================
    // internal Methods
    //==================================
    
    _setDisabled(isDisabled) { 
        this.overallDisabled = isDisabled;
        this._setButtonState();
    }

    _setButtonState() {
        if(this.submitButton) this.submitButton.disabled = this.overallDisabled || this.submitDisabled;
        if(this.cancelButton) this.cancelButton.disabled = this.overallDisabled || this.cancelDisabled;
    }
}
 
apogeeapp.ui.SubmitElement.DEFAULT_SUBMIT_LABEL = "OK";
apogeeapp.ui.SubmitElement.DEFAULT_CANCEL_LABEL = "Cancel";

apogeeapp.ui.SubmitElement.TYPE_NAME = "submit";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.SubmitElement);;
/** This is an text field element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.SpacerElement = class extends apogeeapp.ui.ConfigurableElement {
    constructor(form,elementInitData) {
        //we will hide this element by setting display none. Someone can go ahead 
        //and show it, in which case they will get an empty element with margins.
        //maybe we should have a way to not create the element in the first place.
        super(form,elementInitData,apogeeapp.ui.ConfigurableElement.CONTAINER_CLASS_NO_MARGIN);
        
        var containerElement = this.getElement();
        
        this.spacerElement = document.createElement("div");
        var spacerHeight;
        if(elementInitData.height !== undefined) {
            spacerHeight = elementInitData.height;
        }
        else {
            spacerHeight = apogeeapp.ui.SpacerElement.DEFAULT_HEIGHT;
        }
        //this.spacerElement.style.display = "table";
        this.spacerElement.style.height = spacerHeight + "px";
        
        containerElement.appendChild(this.spacerElement);
        
        this._postInstantiateInit(elementInitData);
    }
}

//adding this includes the extra space of two margins rather than one,
//so just one pixel has a large effect
apogeeapp.ui.SpacerElement.DEFAULT_HEIGHT = 15;

apogeeapp.ui.SpacerElement.TYPE_NAME = "spacer";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.SpacerElement);;
/** This is a heading element configurable element.
 * 
 * @class 
 */
apogeeapp.ui.HTMLDisplayElement = class extends apogeeapp.ui.ConfigurableElement {

    constructor(form,elementInitData) {
        super(form,elementInitData);
        
        var containerElement = this.getElement();
        
        containerElement.innerHTML = elementInitData.html
    }

    /** This method updates the data for the given element. See the specific element
     * type for fields that can be updated. */
    updateData(elementInitData) {
        //no action;
    }
}

apogeeapp.ui.HTMLDisplayElement.TYPE_NAME = "htmlDisplay";

apogeeapp.ui.ConfigurablePanel.addConfigurableElement(apogeeapp.ui.HTMLDisplayElement);


;
apogeeapp.app = {};
apogeeapp.app.dialog = {};

//======================================
//class definition
//======================================


/** This is the main class of the apogee application. 
 * This constuctor should not be called externally, the static creation method 
 * should be used. 
 * @private */
apogeeapp.app.Apogee = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    apogee.EventManager.init.call(this);
    
    if(apogeeapp.app.Apogee.instance != null) {
        throw new Error("Error: There is already an Apogee app instance - apogeeapp.app.Apogee is a singleton.");
    }
    else {
        apogeeapp.app.Apogee.instance = this;
    }
    
    //workspaces
    this.workspaceUI = null;
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI - if a container ID is passed in
    if(containerId !== undefined) {
        this.createUI(containerId);
    }
    
    //open a workspace if there is a url present
    var workspaceUrl = apogee.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        apogeeapp.app.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
}
	
//add components to this class
apogee.base.mixin(apogeeapp.app.Apogee,apogee.EventManager);

apogeeapp.app.Apogee.DEFAULT_WORKSPACE_NAME = "workspace";

//======================================
// static singleton methods
//======================================

/** @private */
apogeeapp.app.Apogee.instance = null;

/** This creates and returns an app instance. The app is a singleton. This call
 * should only be made once. The containerId is the DOM element ID in which the
 * app UI is created. If this is left as undefined the UI will not be created. This
 * is used when creating an alternate UI such as with the web app. */
apogeeapp.app.Apogee.createApp = function(containerId) {
    return new apogeeapp.app.Apogee(containerId);
}

/** This retrieves an existing instance. It does not create an instance. */
apogeeapp.app.Apogee.getInstance = function() {
    return apogeeapp.app.Apogee.instance;
}

//======================================
// public methods
//======================================

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

apogeeapp.app.Apogee.prototype.getWorkspaceIsDirty = function() {
    var workspace = this.getWorkspace();
    if(workspace) {
        return workspace.getIsDirty();
    }
    else {
        return false;
    }
}

apogeeapp.app.Apogee.prototype.clearWorkspaceIsDirty = function() {
    var workspace = this.getWorkspace();
    if(workspace) {
        workspace.clearIsDirty();
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

//=================================
// Component Management
//=================================

/** This method registers a component. */
apogeeapp.app.Apogee.prototype.registerComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
//just replace - but existing ones will not change!
//    if(this.componentGenerators[name]) {
//        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
//        if(!replace) return;
//    }

    this.componentGenerators[name] = componentGenerator;
    if(this.additionalComponents.indexOf(name) < 0) {
        this.additionalComponents.push(name);
    }
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
    this.registerStandardComponent(apogeeapp.app.JsonTableComponent);
	this.registerStandardComponent(apogeeapp.app.FolderComponent);
	this.registerStandardComponent(apogeeapp.app.FunctionComponent);
    this.registerStandardComponent(apogeeapp.app.FolderFunctionComponent);
    this.registerStandardComponent(apogeeapp.app.DynamicForm);
    this.registerStandardComponent(apogeeapp.app.FormDataComponent);
	
    //additional components
    this.registerComponent(apogeeapp.app.CustomControlComponent);
    this.registerComponent(apogeeapp.app.JavascriptComponent);
    this.registerComponent(apogeeapp.app.GridTableComponent);
    this.registerComponent(apogeeapp.app.TextComponent);
}

/** This method registers a component. 
 * @private */
apogeeapp.app.Apogee.prototype.registerStandardComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
        if(!replace) return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    if(this.standardComponents.indexOf(name) < 0) {
        this.standardComponents.push(name);
    }
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
    name = "Import/Export";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    var importCallback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderComponent);
    menu.addCallbackMenuItem("Import as Folder",importCallback);
    
    var import2Callback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderFunctionComponent);
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
/** This class manages the user interface for a workspace object. */
apogeeapp.app.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tabFrame = null;
    this.tree = null;
    this.treeEntry = null;
    this.componentMap = {};
    this.referencesManager = new apogeeapp.app.ReferenceManager();
}

apogeeapp.app.WorkspaceUI.ICON_RES_PATH = "/componentIcons/workspace.png";

//====================================
// Workspace Management
//====================================

/** This sets the application. It must be done before the workspace is set. */
apogeeapp.app.WorkspaceUI.prototype.setApp = function(app,tabFrame,treePane) {
    this.app = app;
    this.tabFrame = tabFrame;
    
    //omit tree if tree pane is missing 
    if(treePane) {
        this.tree = new apogeeapp.ui.treecontrol.TreeControl();
        apogeeapp.ui.removeAllChildren(treePane);
        treePane.appendChild(this.tree.getElement());
    }
    
    this.treeEntry = null;
}

/** This gets the application instance. */
apogeeapp.app.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
apogeeapp.app.WorkspaceUI.prototype.load = function(workspaceJson,actionResponse) { 
    
    var workspaceDataJson;
    var workspaceComponentsJson;
    
    if(workspaceJson) {
        workspaceDataJson = workspaceJson.workspace;
        workspaceComponentsJson = workspaceJson.components;
    }
    else {
        workspaceDataJson = undefined;
        workspaceComponentsJson = apogeeapp.app.FolderComponent.EMPTY_FOLDER_COMPONENT_JSON;
    }

    //create workspace
    this.workspace = new apogee.Workspace(workspaceDataJson,actionResponse);
    
    //set up the root folder conmponent, with children if applicable
    var rootFolder = this.workspace.getRoot();
    var rootFolderComponent = this.loadComponentFromJson(rootFolder,workspaceComponentsJson);

    //set up the tree (if tree in use)
    if(this.tree) {
        this.treeEntry = this.createTreeEntry();
        this.treeEntry.setState(apogeeapp.ui.treecontrol.EXPANDED);
        this.tree.setRootEntry(this.treeEntry);
        this.treeEntry.addChild(rootFolderComponent.getTreeEntry(true));
        this.treeEntry.addChild(this.referencesManager.getTreeEntry(true));
    }
    
    //add listeners
    this.workspace.addListener(apogee.updatemember.MEMBER_UPDATED_EVENT, member => this.memberUpdated(member));
    this.workspace.addListener(apogee.deletemember.MEMBER_DELETED_EVENT, member => this.childDeleted(member));
    this.workspace.addListener(apogee.updateworkspace.WORKSPACE_UPDATED_EVENT, () => this.workspaceUpdated());
    
    //set the initial active tab (allow for no tab frame - used in alternate UI)
    if((workspaceJson)&&(workspaceJson.activeTabMember)&&(this.tabFrame)) {
        var activeTabMember = this.workspace.getMemberByFullName(workspaceJson.activeTabMember);
        if(activeTabMember) {
           this.tabFrame.setActiveTab(activeTabMember.getId());
        }
    }
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
    
    //remove tree entry (if tree active)
    if(this.tree) {
        this.tree.clearRootEntry();
    }
    
    //remove links
    this.referencesManager.close();
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
        if((member.isParent)&&(member.getChildrenWriteable())) { 
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

/** This method extends the member udpated function from the base.
 * @protected */    
apogeeapp.app.WorkspaceUI.prototype.workspaceUpdated = function() {
    
    //update name
    if(this.treeEntry) {
        this.treeEntry.setLabel(this.workspace.getName());
    }
}

//====================================
// open and save methods
//====================================

/** This saves the workspace. It the optionalSavedRootFolder is passed in,
 * it will save a workspace with that as the root folder. */
apogeeapp.app.WorkspaceUI.prototype.toJson = function(optionalSavedRootFolder) {
    var json = {};
    json.fileType = "apogee app js workspace";
    
    json.version = "0.40";
    
    json.references = this.referencesManager.saveEntries();
    
    json.workspace = this.workspace.toJson(optionalSavedRootFolder);
    
    var rootFolder;
    if(optionalSavedRootFolder) {
        rootFolder = optionalSavedRootFolder;
    }
    else {
        rootFolder = this.workspace.getRoot();
    }
    
    var rootFolderComponent = this.getComponent(rootFolder);
    json.components = rootFolderComponent.toJson();
    
    if(this.tabFrame) {
        var activeTabId = this.tabFrame.getActiveTab();
        if(activeTabId) {
            json.activeTabMember = this.getMemberNameFromId(activeTabId);
        }
    }
    
    return json;
}

/** This is used in saving the active tab 
 * @private */
apogeeapp.app.WorkspaceUI.prototype.getMemberNameFromId = function(activeTabId) {
    var component = this.getComponentById(activeTabId);
    if(component) {
        var member = component.getMember();
        if(member) {
            return member.getFullName();
        }
    }
    return undefined;
}

apogeeapp.app.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
    var json = {};
    var tableMap = folder.getChildMap();
	for(var key in tableMap) {
		var child = tableMap[key];
        
		//get the object map for the workspace
		var childComponent = this.getComponent(child);
		
		//get the component for this child
		var name = child.getName();
		json[name] = childComponent.toJson();
	}
    return json;
}

apogeeapp.app.WorkspaceUI.prototype.loadComponentFromJson = function(member,componentJson) {
    var componentType = componentJson.type;
    var componentGenerator = this.app.getComponentGenerator(componentType);
	if((!componentGenerator)||(member.constructor == apogee.ErrorTable)) {
        //throw apogee.base.createError("Component type not found: " + componentType);
        
        //table not found - create an empty table
        componentGenerator = apogeeapp.app.ErrorTableComponent;
    }
    
    return apogeeapp.app.Component.createComponentFromMember(componentGenerator,this,member,null,componentJson);
}

apogeeapp.app.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,childrenJson) {
	for(var key in childrenJson) {
		var childJson = childrenJson[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}


//====================================
// properties and display
//====================================

apogeeapp.app.WorkspaceUI.prototype.createTreeEntry = function() {
    //menu item callback
    var labelText = this.workspace.getName(); //add the name
    var iconUrl = this.getIconUrl();
    var menuItemCallback = () => this.getMenuItems();
    var isRoot = true;
    return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, null, menuItemCallback,isRoot);
}

/** This method returns the icon url for the component. */
apogeeapp.app.WorkspaceUI.prototype.getIconUrl = function() {
    return apogeeapp.ui.getResourcePath(apogeeapp.app.WorkspaceUI.ICON_RES_PATH);
}

apogeeapp.app.WorkspaceUI.prototype.getMenuItems = function() {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = apogeeapp.app.updateworkspace.getUpdateWorkspaceCallback(this);
    menuItemList.push(itemInfo);
    
    //DEV ENTRY
    itemInfo = {};
    itemInfo.title = "Print Dependencies";
    itemInfo.callback = () => this.showDependencies();
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

//========================================
// Links
//========================================

apogeeapp.app.WorkspaceUI.prototype.loadReferences = function(referencesJson) {
    return this.referencesManager.openEntries(referencesJson);
}

//==================================
// DEV FUNCTION
//==================================

apogeeapp.app.WorkspaceUI.prototype.showDependencies = function() {
    console.log(JSON.stringify(this.createDependencies()));
}

apogeeapp.app.WorkspaceUI.prototype.createDependencies = function() {
    var memberInfo = [];
    
    for(var key in this.componentMap) {
        var componentInfo = this.componentMap[key];
        if((componentInfo)&&(componentInfo.member)&&(componentInfo.member.isCodeable)) {
            
            
            var member = componentInfo.member;
            
            var memberStruct = {};
            memberStruct.member = member.getFullName();
            memberStruct.memberType = member.generator.type;
            
            if(member.isDependent) {
                if(member.getDependsOn().length > 0) {
                    memberStruct.dependsOn = member.getDependsOn().map(dependency => dependency.getFullName());
                }
            }
            
            memberInfo.push(memberStruct);
        }
    }
    
    return memberInfo;
}
    ;

/** This class manages links and other reference entries.*/
apogeeapp.app.ReferenceManager = function() {
    
    this.referencesTreeEntry = null;
    this.state = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
    
    this.referenceLists = {};
    var jsInfo = apogeeapp.app.LinkEntry.JS_LINK_LIST_INFO;
    var cssInfo = apogeeapp.app.LinkEntry.CSS_LINK_LIST_INFO;
    this.referenceLists[jsInfo.typeName] = this.getListStruct(jsInfo);
    this.referenceLists[cssInfo.typeName] = this.getListStruct(cssInfo);
}

apogeeapp.app.ReferenceManager.prototype.getTreeEntry = function(createIfMissing) {
    if((createIfMissing)&&(!this.referencesTreeEntry)) {
        this.referencesTreeEntry = this.instantiateTreeEntry();
    }
    return this.referencesTreeEntry;
}

/** This method opens the reference entries, from the structure returned from
 * the save call. It returns a promise that
 * resolves when all entries are loaded. 
 */
apogeeapp.app.ReferenceManager.prototype.openEntries = function(referencesJson) {

    var entryPromises = [];
    
    var loadEntry = entryJson => {
        var listStruct = this.referenceLists[entryJson.entryType];
        
        //load this url if it doesn't exist
        if(!listStruct.listEntries.some( listEntry => (listEntry.url == entryJson.url) )) {
            var referenceEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
            var promise = referenceEntry.loadEntry();
            entryPromises.push(promise);
        }
    }
    referencesJson.forEach(loadEntry);
    
    return Promise.all(entryPromises);
}

/** This method opens the reference entries, from the structure returned from
 * the save call. It returns a promise that
 * resolves when all entries are loaded. 
 */
apogeeapp.app.ReferenceManager.prototype.saveEntries = function() {
    var entryListJson = [];
    var saveEntry = listEntry => {
        var entryJson = listEntry.saveEntry();
        entryListJson.push(entryJson);
    }
    
    for(var listType in this.referenceLists) {
        var listStruct =  this.referenceLists[listType];
        listStruct.listEntries.forEach(saveEntry);
    }
   
    return entryListJson;
}

/** This method adds a reference entry, from the structure returned from
 * the save call. It returns a promise that
 * resolves when the entry are loaded. 
 */
apogeeapp.app.ReferenceManager.prototype.addEntry = function(entryJson) {
    
    //check if these object exist - if so, don't add them
 
    var listStruct = this.referenceLists[entryJson.entryType];
    var referenceEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
    return referenceEntry.loadEntry();
}

/** This method should be called when the workspace is closed. It removes all links. 
 */
apogeeapp.app.ReferenceManager.prototype.close = function() {
    for(var listType in this.referenceLists) {
        var listStruct = this.referenceLists[listType];
        listStruct.listEntries.forEach( referenceEntry => referenceEntry.remove() );
    }
}

//================================
// Protected
//================================

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.ReferenceManager.prototype.entryInserted = function(referenceEntry) {
    var entryType = referenceEntry.getEntryType();
    
    var listStruct = this.referenceLists[entryType];
    if(!listStruct) {
        throw new Error("Unrecognized link type: " + entryType);
    }
    
    listStruct.listEntries.push(referenceEntry);
    
    //add tree entry if applicable
    if(listStruct.treeEntry) {
        var treeEntry = referenceEntry.getTreeEntry(true);
        listStruct.treeEntry.addChild(treeEntry);
    }
}


/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.ReferenceManager.prototype.entryStatusChange = function(referenceEntry) {
    //just check all entries for find state
    this.processReferenceState();
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.ReferenceManager.prototype.entryRemoved= function(referenceEntry) {
    var entryType = referenceEntry.getEntryType();
    
    var listStruct = this.referenceLists[entryType];
    if(!listStruct) {
        throw new Error("Unrecognized link type: " + entryType);
    }
    
    listStruct.listEntries = listStruct.listEntries.filter( existingEntry => (existingEntry != referenceEntry) );
    listStruct.treeEntry.removeChild(referenceEntry.getTreeEntry());
}

//=================================
// Private
//=================================

apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH = "/componentIcons/references.png";

apogeeapp.app.ReferenceManager.prototype.getListStruct = function(listInfo) {
    var listStruct = {};
    listStruct.listInfo = listInfo;
    listStruct.listEntries = [];
    listStruct.treeEntry = null;
    listStruct.state = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
    return listStruct;
}


/** @private */
apogeeapp.app.ReferenceManager.prototype.instantiateTreeEntry = function() {
    var iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH);
    var treeEntry = new apogeeapp.ui.treecontrol.TreeEntry("References", iconUrl, null, null, false);
    
    //add child lists
    for(var childKey in this.referenceLists) {
        var childStruct = this.referenceLists[childKey];
        this.addListTreeEntry(treeEntry,childStruct);
    }
    
    //set the state on the banner entry
    apogeeapp.app.ReferenceManager.applyBannerState(treeEntry,this.state);
    
    return treeEntry;
}

apogeeapp.app.ReferenceManager.prototype.addListTreeEntry = function(referenceTreeEntry,childStruct) {
    var listInfo = childStruct.listInfo;
    var iconUrl = apogeeapp.ui.getResourcePath(listInfo.listIconPath);
    var menuItemCallback = () => this.getListMenuItems(listInfo);
    var listTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry(listInfo.listName, iconUrl, null, menuItemCallback, false);
    
    //add existing child entries
    for(var childKey in childStruct.listEntries) {
        var childEntry = childStruct.listEntries[childKey];
        var treeEntry = childEntry.getTreeEntry(true);
        listTreeEntry.addChild(treeEntry);
    }
    
    //set the state on the banner entry
    apogeeapp.app.ReferenceManager.applyBannerState(listTreeEntry,childStruct.state);
    
    childStruct.treeEntry = listTreeEntry;
    referenceTreeEntry.addChild(listTreeEntry);
}


/** @private */
apogeeapp.app.ReferenceManager.prototype.getListMenuItems = function(listInfo) {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = listInfo.addEntryText;
    itemInfo.callback = () => listInfo.addEntry(this);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @private */
apogeeapp.app.ReferenceManager.prototype.processReferenceState = function() {
    //just check all entries for find state
    var hasError = false;
    var hasPending = false;
    
    for(var listType in this.referenceLists) {
        var listStruct = this.referenceLists[listType];
        
        var listState = this.getListState(listStruct);
        
        if(listState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) hasError = true;
        else if(listState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) hasPending = true;
    }
        
    var newState;
    if(hasError) {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
    }
    else if(hasPending) {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
    }
    else {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
    }
    
    if(this.state != newState) {
        this.state = newState;
        if(this.referencesTreeEntry) apogeeapp.app.ReferenceManager.applyBannerState(this.referencesTreeEntry,newState);
    }
}

/** This gets and applies the list state for a reference list. 
 * @private */
apogeeapp.app.ReferenceManager.prototype.getListState = function(listStruct) {
    var hasError = false;
    var hasPending = false;
    
    var checkStatus = refEntry => {
        var state = refEntry.getState();
        if(state == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
            hasError = true;
        }
        else if(state == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
            hasPending = true;
        }
    }
        
    listStruct.listEntries.forEach(checkStatus);
        
    var listState;
    if(hasError) {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
    }
    else if(hasPending) {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
    }
    else {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
    }
    
    if(listState != listStruct.state) {
        listStruct.state = listState;
        if(listStruct.treeEntry) apogeeapp.app.ReferenceManager.applyBannerState(listStruct.treeEntry,listState);
    }
    
    return listState;
}

//=================================
// Static
//=================================

/** THis is used to give an id to the link entries 
 * @private */
apogeeapp.app.ReferenceManager.nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
apogeeapp.app.ReferenceManager._createId = function() {
    return apogeeapp.app.ReferenceManager.nextId++;
}

/** @private */
apogeeapp.app.ReferenceManager.applyBannerState = function(treeEntry,state) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(state);
    if(iconOverlay) {
        treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        treeEntry.clearIconOverlay();
    }
};

/** This class manages links for the web page.*/
apogeeapp.app.LinkEntry = function(referenceManager,linkData,linkType) {
    this.id = apogeeapp.app.ReferenceManager._createId();
    this.referenceManager = referenceManager;
    
    this.linkType = linkType;
    this.url = linkData.url;
    
    this.state = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
    
    var nickname = linkData.nickname;
    if((!nickname)||(nickname.length === 0)) nickname = this.createLinkNameFromUrl(this.url);
    this.nickname = nickname;
    
    this.treeEntry = null;
}

apogeeapp.app.LinkEntry.LINK_TYPE_JS = "js link";
apogeeapp.app.LinkEntry.LINK_TYPE_CSS = "css link";

apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE = "script";
apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE = "link";

apogeeapp.app.LinkEntry.JS_ICON_RES_PATH = "/componentIcons/javascriptLink.png";
apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH = "/componentIcons/cssLink.png";

apogeeapp.app.LinkEntry.JS_LINK_LIST_INFO = {
    "typeName": apogeeapp.app.LinkEntry.LINK_TYPE_JS,
    "addEntry": (referenceManager) => {
        var addEntry = apogeeapp.app.updatelink.getAddLinkCallback(referenceManager,apogeeapp.app.LinkEntry.LINK_TYPE_JS);
        addEntry();
    },
    "createEntryFunction": (referenceManager, linkData) => new apogeeapp.app.LinkEntry(referenceManager,linkData,apogeeapp.app.LinkEntry.LINK_TYPE_JS),
    "listName": "JS Links",
    "addEntryText":"Add JS Link",
    "listIconPath":"/componentIcons/folder.png"
}

apogeeapp.app.LinkEntry.CSS_LINK_LIST_INFO = {
    "typeName": apogeeapp.app.LinkEntry.LINK_TYPE_CSS,
    "addEntry": (referenceManager) => {
        var addEntry = apogeeapp.app.updatelink.getAddLinkCallback(referenceManager,apogeeapp.app.LinkEntry.LINK_TYPE_CSS);
        addEntry();
    },
    "createEntryFunction": (referenceManager, linkData) => new apogeeapp.app.LinkEntry(referenceManager,linkData,apogeeapp.app.LinkEntry.LINK_TYPE_CSS),
    "listName": "CSS Links",
    "addEntryText":"Add CSS Link",
    "listIconPath":"/componentIcons/folder.png"
}

//---------------------------
// references entry interface
//---------------------------

apogeeapp.app.LinkEntry.prototype.getId = function() {
    return this.id;
}

apogeeapp.app.LinkEntry.prototype.getEntryType = function() {
    return this.linkType;
}

apogeeapp.app.LinkEntry.prototype.getState = function() {
    return this.state;
}

/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.getTreeEntry = function(createIfMissing) {
    if((createIfMissing)&&(!this.treeEntry)) {
        this.treeEntry = this.instantiateTreeEntry();
    }
    return this.treeEntry;
}

apogeeapp.app.LinkEntry.prototype.getUrl = function() {
    return this.url;
}

apogeeapp.app.LinkEntry.prototype.getNickname = function() {
    return this.nickname;
}


/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.loadEntry = function() {
    
    var promiseFunction = (resolve,reject) => {

        var linkProps;
        var elementType;

        //create link properties
        if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
            linkProps = this.getJsLinkProps();
            elementType = apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE;
        }
        else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
            linkProps = this.getCssLinkProps();
            elementType = apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE;
        }
        else {
            var errorMsg = "Unknown link type " + this.linkType;
            this.setError(errorMsg);
            reject(errorMsg);
            return;
        }

        //add event handlers
        linkProps.onload = () => {
            this.setClearState();
            resolve(this.url);
        }
        linkProps.onerror = (error) => {
            var errorMsg = "Failed to load link '" + this.url + "'";
            this.setError(errorMsg);
            reject(errorMsg);
        }

        //insert the link entry
        this.setPendingState();
        element = apogeeapp.ui.createElement(elementType,linkProps);
        document.head.appendChild(element);
    }
    
    //call link added to references
    this.referenceManager.entryInserted(this);
    
    //return promise to track loading finish
    return new Promise(promiseFunction);
}

/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.saveEntry = function() {
    var entryJson = {};
    entryJson.url = this.url;
    if(this.nickname != this.url) entryJson.nickname = this.nickname;
    entryJson.entryType = this.linkType;
    return entryJson;
}

/** This method removes the link. */
apogeeapp.app.LinkEntry.prototype.remove = function() {
    var element = document.getElementById(this.getElementId());
    if(element) {
        document.head.removeChild(element);
    }
    
    this.referenceManager.entryRemoved(this);
}

//-------------------------
// Entry specific management methods
//-------------------------

/** This method removes and reloads the link, returning a promise. */
apogeeapp.app.LinkEntry.prototype.updateData = function(url,nickname) {
    
    //update nickname
    if(this.treeEntry) {
        if((!nickname)||(nickname.length === 0)) nickname = this.createLinkNameFromUrl(url);
        if(this.nickname != nickname) {
            this.nickname = nickname;
            this.treeEntry.setLabel(this.nickname);
        }
    }
    
    //update url
    if(this.url != url) {
        this.url = url;
        this.remove();
        var promise = this.loadEntry();
    }
    
    //if we didn't update, create a dummy promise
    if(!promise) promise = Promise.resolve("No url update");
    
    return promise;
}



//===================================
// private methods
//===================================

apogeeapp.app.LinkEntry.prototype.createLinkNameFromUrl = function(url) {
    return url;
}

apogeeapp.app.LinkEntry.prototype.getJsLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.src = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.prototype.getCssLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.rel = "stylesheet";
    linkProps.type = "text/css";
    linkProps.href = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.ELEMENT_ID_BASE = "__apogee_link_element_";

apogeeapp.app.LinkEntry.prototype.getElementId = function() {
    return apogeeapp.app.LinkEntry.ELEMENT_ID_BASE + this.id;
}

apogeeapp.app.LinkEntry.prototype.setClearState = function() {
    this.setState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE);
}

apogeeapp.app.LinkEntry.prototype.setError = function(errorMsg) {
    this.setState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
}

apogeeapp.app.LinkEntry.prototype.setPendingState = function() {
    this.setState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING,"loading");
}

apogeeapp.app.LinkEntry.prototype.setState = function(state,msg) {
    this.state = state;
    if(this.treeEntry) {
        apogeeapp.app.ReferenceManager.applyBannerState(this.treeEntry,this.state);
    }
    this.referenceManager.entryStatusChange(this);
}

apogeeapp.app.LinkEntry.prototype.instantiateTreeEntry = function() {
    var iconUrl = this.getIconUrl();
    var menuItemsCallback = () => this.getMenuItems();
    var treeEntry = new apogeeapp.ui.treecontrol.TreeEntry(this.nickname, iconUrl, null, menuItemsCallback, false);
    apogeeapp.app.ReferenceManager.applyBannerState(treeEntry,this.state);
    return treeEntry;
}

/** This method returns the icon url for the component. */
apogeeapp.app.LinkEntry.prototype.getIconUrl = function() {
    var resPath;
    
    if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        resPath = apogeeapp.app.LinkEntry.JS_ICON_RES_PATH;
    }
    else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
        resPath = apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH;
    }
    else {
        resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
    }
  
    return apogeeapp.ui.getResourcePath(resPath);
}

apogeeapp.app.LinkEntry.prototype.getMenuItems = function() {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Update Link";
    itemInfo.callback = apogeeapp.app.updatelink.getUpdateLinkCallback(this);
    menuItemList.push(itemInfo);
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Remove Link";
    itemInfo.callback = apogeeapp.app.updatelink.getRemoveLinkCallback(this);
    menuItemList.push(itemInfo);
    
    return menuItemList;
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
apogeeapp.app.Component = function(workspaceUI,member,componentGenerator) {
    
    this.workspaceUI = workspaceUI;
    this.member = member;
    this.uiActiveParent = null;
    this.componentGenerator = componentGenerator;
   
    this.workspaceUI.registerMember(this.member,this);
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.openActions = [];
    this.saveActions = [];
    this.cleanupActions = [];
    
    //notifications
    this.bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
    this.bannerMessage = "";
    
    //ui elements
    this.windowDisplay = null;
    this.windowDisplayStateJson = null;
    
    this.tabDisplay = null;
    
    this.treeDisplay = null;
}

//These parameters are used to order the components in the tree entry.
apogeeapp.app.Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER = 5;
apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER = 0;

/** If an extending object has any open actions to read the open json, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
apogeeapp.app.Component.prototype.addOpenAction = function(openFunction) {
    this.openActions.push(openFunction);
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
    if(this.componentGenerator.ICON_URL) {
        return this.componentGenerator.ICON_URL;
    }
    else {
        var resPath = this.componentGenerator.ICON_RES_PATH;
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

apogeeapp.app.Component.prototype.getTreeEntry = function(createIfMissing) {
    if((createIfMissing)&&(!this.treeDisplay)) {
        this.treeDisplay = this.instantiateTreeEntry();
        this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);
        if((this.options)&&(this.options.treeState !== undefined)) {
            this.treeDisplay.setState(this.options.treeState);
        }
    }
    
    if(this.treeDisplay) {
        return this.treeDisplay.getTreeEntry();
    }
    else {
        return null;
    }
}

/** @protected */
apogeeapp.app.Component.prototype.instantiateTreeEntry = function() {
    var treeDisplay = new apogeeapp.app.TreeComponentDisplay(this);
    
    //default sort order within parent
    var treeEntrySortOrder = (this.componentGenerator.TREE_ENTRY_SORT_ORDER !== undefined) ? this.componentGenerator.TREE_ENTRY_SORT_ORDER : apogeeapp.app.Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER;
    treeDisplay.setComponentTypeSortOrder(treeEntrySortOrder);
    
       
//    if(this.treeDisplay) {
//        this.treeDisplay.setComponentTypeSortOrder(apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER);
//    } 
//    
    return treeDisplay;
}

//implement
///** This creates an instance of the window display. 
///* The windowDisplayOverrideOptions are optional options to override ths existing window options from the parent. */
//apogeeapp.app.Component.prototype.instantiateWindowDisplay = function(windowDisplayOverrideOptions);

apogeeapp.app.Component.prototype.getWindowDisplay = function(createIfMissing,windowDisplayOverrideOptions) {
    if((createIfMissing)&&(!this.windowDisplay)) {
        this.windowDisplay = this.instantiateWindowDisplay(windowDisplayOverrideOptions);
        this.windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
    return this.windowDisplay;
}

apogeeapp.app.Component.prototype.closeWindowDisplay = function() {
    if(this.windowDisplay) {
        //first store the window state
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
        
        //delete the window
        this.windowDisplay.deleteDisplay();
        
        this.windowDisplay = null;
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

apogeeapp.app.Component.prototype.getTabDisplay = function(createIfMissing) {
    if((createIfMissing)&&(this.usesTabDisplay())&&(!this.tabDisplay)) {
        this.tabDisplay = this.instantiateTabDisplay();
        this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
    return this.tabDisplay;
}

/** This closes the tab display for the component. */
apogeeapp.app.Component.prototype.closeTabDisplay = function() {
    if(this.tabDisplay) {
        this.tabDisplay.closeTab();
        this.tabDisplay = null;
    }
}

/** This deserializes the component. */
apogeeapp.app.Component.prototype.toJson = function() {
    var json = {};
    json.type = this.componentGenerator.uniqueName;
    
    if(this.windowDisplay != null) {
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
    }
    
    if(this.windowDisplayStateJson) {
        json.windowState = this.windowDisplayStateJson;
    }
    
    if(this.tabDisplay) {
        json.tabOpen = true; 
    }
    
    if(this.treeDisplay) {
        var treeState = this.treeDisplay.getState();
        if(treeState != apogeeapp.ui.treecontrol.NO_CONTROL) {
            json.treeState = treeState;
        }
    }
    
    for(var i = 0; i < this.saveActions.length; i++) {
        this.saveActions[i].call(this,json);
    }
    
    return json;
}

/** This serializes the component. */
apogeeapp.app.Component.prototype.loadSerializedValues = function(json) {
    if(!json) json = {};
    this.options = json;
    
    //take any immediate needed actions
    
    //set the tree state
    if((this.treeDisplay)&&(json.treeState !== undefined)) {
        this.treeDisplay.setState(json.treeState);
    }
    
    //open the tab - if tab frame exists
    if((json.tabOpen)&&(this.usesTabDisplay())) {
        var tabFrame = this.workspaceUI.getTabFrame();
        if(tabFrame) {
            //create the tab display if it is not present
            this.getTabDisplay(true);
            
            var tab = this.tabDisplay.getTab();

            tabFrame.addTab(tab,false);
        }
    }
    
    //set window options
    if(json.windowState !== undefined) {
        this.windowDisplayStateJson = json.windowState;
    }
    
    if(json) {
        for(var i = 0; i < this.openActions.length; i++) {
            this.openActions[i].call(this,json);
        }
    }  
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
    if(this.treeDisplay) {
        this.treeDisplay.updateData();
        this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);
    }
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
    
    var values = {};
    values.name = member.getName();
    var parent = member.getParent();
    if(parent) {
        values.parentName = parent.getFullName();
    }

    if(member.generator.addPropFunction) {
        member.generator.addPropFunction(member,values);
    }
    if(this.componentGenerator.addPropFunction) {
        this.componentGenerator.addPropFunction(this,values);
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
            var tabDisplay = tabComponent.getTabDisplay(true);
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
        //remove the tree from the parent
        openCallback = function() {
            var parent = instance.member.getParent();
            if(parent) {
                var parentComponent = workspaceUI.getComponent(parent);
                if((parentComponent)&&(parentComponent.usesTabDisplay())) {

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
        var actionResponse = apogee.action.doAction(json,true);

        if(!actionResponse.getSuccess()) {
            //show an error message
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
    }
}

//======================================
// Static methods
//======================================

//this creates a component from a member and component options (not property values!)
apogeeapp.app.Component.createComponentFromMember = function(componentGenerator,workspaceUI,member,userInputValues,serializedValues) {
    
    //create empty component
    var component = new componentGenerator(workspaceUI,member);

    //apply any serialized values
    if(serializedValues) {
        component.loadSerializedValues(serializedValues);
    }
    
    //apply any user input (property dialog) values
    if((userInputValues)&&(componentGenerator.updateProperties)) {
        componentGenerator.updateProperties(component,null,userInputValues);
    }

    //call member updated to process and notify of component creation
    component.memberUpdated();
    
    return component;
}

//======================================
// All components should have a generator to creste the component
// from a json. See existing components for examples.
//======================================
;
/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
apogeeapp.app.ParentComponent = function(workspaceUI,member,componentGenerator) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,componentGenerator);
}

apogeeapp.app.ParentComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.ParentComponent.prototype.constructor = apogeeapp.app.ParentComponent;

/** @protected */
apogeeapp.app.ParentComponent.prototype.instantiateWindowDisplay = function(windowDisplayOverrideOptions) {
    var options = windowDisplayOverrideOptions ? windowDisplayOverrideOptions : this.windowDisplayStateJson;
    return new apogeeapp.app.ParentWindowComponentDisplay(this,options);
}

apogeeapp.app.ParentComponent.prototype.instantiateTreeEntry = function() {
    var treeDisplay = apogeeapp.app.Component.prototype.instantiateTreeEntry.call(this);
    
    //add any existing children to the tree entry
    var treeEntry = treeDisplay.getTreeEntry();
    var member = this.getMember();
    var childMap = member.getChildMap();
    for(var childKey in childMap) {
        var childMember = childMap[childKey];
        var childComponent = this.getWorkspaceUI().getComponent(childMember);
        var childTreeEntry = childComponent.getTreeEntry(true);
        treeEntry.addChild(childTreeEntry);
    }
    
    return treeDisplay;
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

/** This flags indicates the component is a parent component. */
apogeeapp.app.ParentComponent.prototype.isParentComponent = true;

/** This function adds a fhile componeent to the displays for this parent component. */
apogeeapp.app.ParentComponent.prototype.removeChildComponent = function(childComponent) {
    //remove from tree entry
    var treeEntry = this.getTreeEntry();
    if(treeEntry) {
        var childTreeEntry = childComponent.getTreeEntry();
        if(childTreeEntry) {
            treeEntry.removeChild(childTreeEntry);
        }
    }
    
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
    if(treeEntry) {
        var childTreeEntry = childComponent.getTreeEntry(true);
        treeEntry.addChild(childTreeEntry);
    }

    //add child entry for tab
    if(this.tabDisplay) {
        this.tabDisplay.addChildComponent(childComponent); 
    }
}


;
/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
apogeeapp.app.EditComponent = function(workspaceUI,member,componentGenerator) {
    //base constructor
	apogeeapp.app.Component.call(this,workspaceUI,member,componentGenerator);
}

apogeeapp.app.EditComponent.prototype = Object.create(apogeeapp.app.Component.prototype);
apogeeapp.app.EditComponent.prototype.constructor = apogeeapp.app.EditComponent;

apogeeapp.app.EditComponent.prototype.instantiateWindowDisplay = function(windowDisplayOverrideOptions) {
    var options = windowDisplayOverrideOptions ? windowDisplayOverrideOptions : this.windowDisplayStateJson;
    return new apogeeapp.app.EditWindowComponentDisplay(this,options);
}

//no longer used
///** This is used when an alternate UI is used for the workspace. This replaces the window display 
// *  used in the standard UI. */
//apogeeapp.app.EditComponent.prototype.setAlternateWindowDisplay = function(windowDisplay) {
//    this.alternateWindowDisplay = windowDisplay;
//    this.windowDisplay = windowDisplay;
//    windowDisplay.setBannerState(this.bannerState,this.bannerMessage);
//}

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
        var actionResponse = apogee.action.doAction(actionData,true); 
        if(!actionResponse.getSuccess()) {
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
    }
}


;
/** This component represents a json table object. */
apogeeapp.app.TreeComponentDisplay = function(component) {
    this.component = component;
    this.member = component.getMember();
    
    this.treeEntry = this.createTreeEntry();
    //opnly needed for parents...
    this.treeEntry.setSortFunction(apogeeapp.app.TreeComponentDisplay.treeSortFunction);
    //this should be overwritten in component
    this.treeEntry.setExtraSortParam(0);
};

apogeeapp.app.TreeComponentDisplay.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.TreeComponentDisplay.prototype.getState = function() {
    return this.treeEntry.getState();
}

apogeeapp.app.TreeComponentDisplay.prototype.setState = function(state) {
    this.treeEntry.setState(state);
}

apogeeapp.app.TreeComponentDisplay.prototype.setComponentTypeSortOrder = function(typeSortOrder) {
    this.treeEntry.setExtraSortParam(typeSortOrder);
}

apogeeapp.app.TreeComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    oldParentTreeEntry.removeChild(this.treeEntry);
    
    var newParentTreeEntry = newParentComponent.getTreeEntry();
    newParentTreeEntry.addChild(this.treeEntry);
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

/** This is used to sort the child tree entries. 
 * We allow for a different ordering for different types by using the extrar sort parameter.
 * (for now, we put folers first. Other component type parameters can be set too) */
apogeeapp.app.TreeComponentDisplay.treeSortFunction = function(entry1,entry2) {
    var typeOrderDiff = (entry1.getExtraSortParam() - entry2.getExtraSortParam());
    if(typeOrderDiff) {
        return typeOrderDiff;
    }
    else {
        return entry1.getLabel().localeCompare(entry2.getLabel());
    }
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
    
    var windowComponentDisplay = childComponent.getWindowDisplay(true);
    var childWindow = windowComponentDisplay.getDisplayFrame();

    
    
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
        var childWindow = windowComponentDisplay.getDisplayFrame();
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
    this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);
    
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
if(childComponent) //TEMPORARY!
        this.addChildComponent(childComponent);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
apogeeapp.app.TabComponentDisplay.prototype.setAddChildrenContextMenu = function() {
    
    var workspaceUI = this.component.getWorkspaceUI();
    var app = workspaceUI.getApp();

    
    
    this.contentElement.oncontextmenu = event => {
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
        
        var initialValues = {};
        initialValues.parentName = this.member.getFullName();
        
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
    
    if(!options) options = {};
    this.options = options;
   
    this.loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.ParentWindowComponentDisplay.destroy);
};


apogeeapp.app.ParentWindowComponentDisplay.prototype.getDisplayFrame = function() {
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
    this.windowFrame.setContent(dummyDiv,apogeeapp.ui.RESIZABLE);
    
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
    
    if(!options) options = {};
    this.options = options;
    
    //content management
    this.viewType = null;
    this.select = null;
    this.viewModeElements = {};
    this.viewModeElement = null;
   
    if(options.PLAIN_FRAME_UI) {
        //this is a non standard UI where we load a plain div rather than window.
        this.loadPlainFrameEntry();
    }
    else {
        //this is the standard windo for a component
        this.loadWindowFrameEntry();
    }
    
    //load initial data
    var settings = this.component.getTableEditSettings();
    var initialViewType = this.getInitialViewType(settings.viewModes,settings.defaultView);
    this.setViewType(initialViewType);
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditWindowComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

apogeeapp.app.EditWindowComponentDisplay.prototype.getDisplayFrame = function() {
    if(this.windowFrame) {
        return this.windowFrame;
    }
    else if(this.plainFrame) {
        return this.plainFrame;
    }
    else {
        return null;
    }
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

apogeeapp.app.EditWindowComponentDisplay.prototype.getDataDisplay = function(viewMode,viewType) {
    return this.component.getDataDisplay(viewMode,viewType);
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
    }
     
    if((this.windowFrame)||(this.plainFrame)) {
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

/** This is the standard window for the component.  
 * @private */
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
        this.windowFrame.setSize(this.component.componentGenerator.DEFAULT_WIDTH,this.component.componentGenerator.DEFAULT_HEIGHT);
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

/** This is the non standard, plain div container for the component.  
 * @private */
apogeeapp.app.EditWindowComponentDisplay.prototype.loadPlainFrameEntry = function() {
    this.plainFrame = new apogeeapp.ui.PlainFrame();
  
    this.windowHeaderManager = new apogeeapp.app.WindowHeaderManager();
    this.plainFrame.setHeaderContent(this.windowHeaderManager.getHeaderElement());    
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
        this.viewModeElement = new apogeeapp.app.ViewMode(this,viewType);
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
    if((this.select)&&(this.select.value != this.viewType)) {
        this.select.value = this.viewType;
    }
}

/** This method should be called to put the display element in the window. */
apogeeapp.app.EditWindowComponentDisplay.prototype.showDataDisplay = function(dataDisplay) {
    if(this.windowFrame) {
        this.windowFrame.setContent(dataDisplay.getContent(),dataDisplay.getContentType());
    } 
    else if(this.plainFrame) {
        this.plainFrame.setContent(dataDisplay.getContent(),dataDisplay.getContentType());
    }
}

/** This method should be called to remove the given element from the window. 
 * If this method is called when this is not the current element, no action is taken. */
apogeeapp.app.EditWindowComponentDisplay.prototype.removeDisplayElement = function(displayElement) {
    if(this.windowFrame) { 
        this.windowFrame.safeRemoveContent(displayElement);
    }
    else if(this.plainFrame) {
        this.plainFrame.safeRemoveContent(displayElement);
    }
}

//----------------------------
// Edit UI - save and cancel buttons for edit mode
//----------------------------

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.startEditUI = function(onSave,onCancel) {
    //disable select (if we are using it)
    if(this.select) {
        this.select.disabled = true;
    }
    
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
apogeeapp.app.EditWindowComponentDisplay.prototype.endEditUI = function() {
    this.hideSaveBar();
    
    //re-enable select (if we are using it)
    if(this.select) {
        this.select.disabled = false;
    }
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
apogeeapp.app.FolderComponent = function(workspaceUI,folder) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folder,apogeeapp.app.FolderComponent);
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FolderComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FolderComponent.writeToJson);
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

apogeeapp.app.FolderComponent.readFromJson = function(json) {
    if(json.children) {
        var workspaceUI = this.getWorkspaceUI();
        var folder = this.getMember();
        workspaceUI.loadFolderComponentContentFromJson(folder,json.children);
    }
}

//======================================
// Static methods
//======================================

//this is a method to help construct an emtpy folder component
apogeeapp.app.FolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.FolderComponent"
};

apogeeapp.app.FolderComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    if(userInputValues.children) {
        json.children = userInputValues.children;
    }
    json.type = apogee.Folder.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderComponent.displayName = "Folder";
apogeeapp.app.FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
apogeeapp.app.FolderComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
apogeeapp.app.FolderComponent.TREE_ENTRY_SORT_ORDER = apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;

apogeeapp.app.FolderComponent.propertyDialogLines = [
    {
        "type":"invisible",
        "resultKey":"children"
    }
];

//if we want to allow importing a workspace as this object, we must add this method to the generator
apogeeapp.app.FolderComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
    optionsJson.children = childrenJson;
}
;
/** This component represents a json table object. */
apogeeapp.app.JsonTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.JsonTableComponent);

    //default view
    this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.JsonTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.JsonTableComponent.writeToJson);
};

apogeeapp.app.JsonTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JsonTableComponent.prototype.constructor = apogeeapp.app.JsonTableComponent;

apogeeapp.app.JsonTableComponent.prototype.getDataView = function() {
    if(!this.dataView) this.dataView = apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW;
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
apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW = "Colorized";
apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW = "Text Data";
apogeeapp.app.JsonTableComponent.GRID_DATA_VEW = "Grid";
apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW = "Form";

apogeeapp.app.JsonTableComponent.DEFAULT_DATA_VIEW = apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW;;


/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JsonTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.JsonTableComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
        case apogeeapp.app.JsonTableComponent.VIEW_DATA:
            switch(this.dataView) {
                case apogeeapp.app.JsonTableComponent.COLORIZED_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
                    
                case apogeeapp.app.JsonTableComponent.TEXT_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
                    
                case apogeeapp.app.JsonTableComponent.GRID_DATA_VEW:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    return new apogeeapp.app.HandsonGridEditor(viewMode,callbacks);

                case apogeeapp.app.JsonTableComponent.FORM_DATA_VIEW:
                    alert("FORM EDITOR NOT IMPLEMENTED YET!");
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
                    //return new apogeeapp.app.FormDataMode(editComponentDisplay);
                    //drop through to below
                    
                case apogeeapp.app.JsonTableComponent.PLAIN_DATA_VEW:
                default:
                    callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.member);
                    return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            }
			
		case apogeeapp.app.JsonTableComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.JsonTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.JsonTableComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}


//======================================
// Static methods
//======================================

apogeeapp.app.JsonTableComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

apogeeapp.app.JsonTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.JsonTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

apogeeapp.app.JsonTableComponent.addPropFunction = function(component,values) {
    values.dataView = component.getDataView();
}

apogeeapp.app.JsonTableComponent.updateProperties = function(component,oldValues,newValues) {
    component.setDataView(newValues.dataView);
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JsonTableComponent.displayName = "Data Table";
apogeeapp.app.JsonTableComponent.uniqueName = "apogeeapp.app.JsonTableComponent";
apogeeapp.app.JsonTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.JsonTableComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.JsonTableComponent.ICON_RES_PATH = "/componentIcons/dataTable.png";
apogeeapp.app.JsonTableComponent.propertyDialogLines = [
    {
        "type":"dropdown",
        "heading":"Data View: ",
        "entries":[
            "Colorized",
            "Plain",
            "Text Data",
            "Grid",
            "Form"
        ],
        "resultKey":"dataView"
    }
];

;

/** This component represents a json table object. */
apogeeapp.app.GridTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.GridTableComponent);
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
    "emptyDataValue": [[""]]
}

apogeeapp.app.GridTableComponent.DEFAULT_VIEW = apogeeapp.app.GridTableComponent.VIEW_GRID;

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.GridTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.GridTableComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.GridTableComponent.VIEW_GRID:
			//return new apogeeapp.app.HandsonGridMode(editComponentDisplay);
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
            return new apogeeapp.app.HandsonGridEditor(viewMode,callbacks);
            
        case apogeeapp.app.GridTableComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.GridTableComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.GridTableComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.GridTableComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.GridTableComponent.displayName = "Grid Table DEPRECATED";
apogeeapp.app.GridTableComponent.uniqueName = "apogeeapp.app.GridTableComponent";
apogeeapp.app.GridTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.GridTableComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.GridTableComponent.ICON_RES_PATH = "/componentIcons/gridTable.png";

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


;

/** This component represents a json table object. */
apogeeapp.app.TextComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.TextComponent);
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

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.TextComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.TextComponent.VIEW_TEXT:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            
		case apogeeapp.app.TextComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member,apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.TextComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member,apogeeapp.app.TextComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.TextComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.TextComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = "";
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.TextComponent.displayName = "Text Table DEPRECATED";
apogeeapp.app.TextComponent.uniqueName = "apogeeapp.app.TextComponent";
apogeeapp.app.TextComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.TextComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.TextComponent.ICON_RES_PATH = "/componentIcons/textTable.png";

;
/** JAVASCRIPT TABLE
 * This is similar to a JSON TABLE except:
 * - The data allows for FUNCTIONS, in addition to plain data as in a json.
 * - IT STILL DOES NOT ALLOW CYCLES! That will crash the program! (detect this, or at least make it not crash.)
 * - It is also dangerous in that it can freeze the wrong thing and crash the program again.
 * - It does not show the DATA, only the code. That is because there is not a pretty way to serialize it. But I could add something.
 * 
 * I am undecided how to include this. It is just too dangerous as is. Maybe I can add some big checks, even though performance will suffer for large objects.
 * */
apogeeapp.app.JavascriptComponent = function(workspaceUI, javascriptObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,javascriptObject,apogeeapp.app.JavascriptComponent);
};

apogeeapp.app.JavascriptComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.JavascriptComponent.prototype.constructor = apogeeapp.app.JavascriptComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.JavascriptComponent.VIEW_CODE = "Code";
apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.JavascriptComponent.VIEW_MODES = [
    apogeeapp.app.JavascriptComponent.VIEW_CODE,
    apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE,
    apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION
];

apogeeapp.app.JavascriptComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.JavascriptComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.JavascriptComponent.VIEW_CODE
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.JavascriptComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.JavascriptComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.JavascriptComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.JavascriptComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.JavascriptComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.JavascriptComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.JavascriptComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    var argList = [];
    json.updateData = {};
    json.updateData.argList = argList;
    json.type = apogee.JavascriptTable.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.JavascriptComponent.displayName = "Javascript Object";
apogeeapp.app.JavascriptComponent.uniqueName = "apogeeapp.app.JavascriptComponent";
apogeeapp.app.JavascriptComponent.DEFAULT_WIDTH = 400;
apogeeapp.app.JavascriptComponent.DEFAULT_HEIGHT = 400;
apogeeapp.app.JavascriptComponent.ICON_RES_PATH = "/componentIcons/javascriptTable.png";
;
/** This component represents a table object. */
apogeeapp.app.FunctionComponent = function(workspaceUI, functionObject) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,functionObject,apogeeapp.app.FunctionComponent);
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

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FunctionComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
			
		case apogeeapp.app.FunctionComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.FunctionComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

apogeeapp.app.FunctionComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    var argList;
    if(userInputValues.argListString) {
        argList = apogee.FunctionTable.parseStringArray(userInputValues.argListString);  
    }
    else {
        argList = [];
    }
    json.updateData = {};
    json.updateData.argList = argList;
    json.type = apogee.FunctionTable.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FunctionComponent.displayName = "Function";
apogeeapp.app.FunctionComponent.uniqueName = "apogeeapp.app.FunctionComponent";
apogeeapp.app.FunctionComponent.DEFAULT_WIDTH = 400;
apogeeapp.app.FunctionComponent.DEFAULT_HEIGHT = 400;
apogeeapp.app.FunctionComponent.ICON_RES_PATH = "/componentIcons/functionTable.png";

apogeeapp.app.FunctionComponent.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
;
/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
apogeeapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction) {
    //extend parent component
    apogeeapp.app.ParentComponent.call(this,workspaceUI,folderFunction,apogeeapp.app.FolderFunctionComponent);
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,this,folderFunction);
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FolderFunctionComponent.readFromJson);
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

apogeeapp.app.FolderFunctionComponent.readFromJson = function(json) {
    if(json.children) {
        var workspaceUI = this.getWorkspaceUI();
        var folderFunction = this.getMember();
        var internalFolder = folderFunction.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(internalFolder,json.children);
    }
}

//======================================
// Static methods
//======================================

apogeeapp.app.FolderFunctionComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    if(userInputValues.argListString) {
        var argList = apogee.FunctionTable.parseStringArray(userInputValues.argListString);
        json.argList = argList;
    }
    if(userInputValues.returnValueString) {
        json.returnValue = userInputValues.returnValueString;
    }
    if(userInputValues.internalFolder) {
        json.internalFolder = userInputValues.internalFolder;
    }
    json.type = apogee.FolderFunction.generator.type;
    return json;
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FolderFunctionComponent.displayName = "Folder Function";
apogeeapp.app.FolderFunctionComponent.uniqueName = "apogeeapp.app.FolderFunctionComponent";
apogeeapp.app.FolderFunctionComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.FolderFunctionComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.FolderFunctionComponent.ICON_RES_PATH = "/componentIcons/folderFunction.png";

apogeeapp.app.FolderFunctionComponent.propertyDialogLines = [
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
apogeeapp.app.FolderFunctionComponent.appendWorkspaceChildren = function(optionsJson,childrenJson) {
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
apogeeapp.app.BasicControlComponent = class extends apogeeapp.app.EditComponent{
    
    constructor(workspaceUI,control,componentGenerator) {
        super(workspaceUI,control,componentGenerator);
    
        //default to keep alive
        this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
    };

    //==============================
    // Methods to Implement
    //==============================

    //This method must be implemented
    ///** This method returns the outout data display/editor for the control */
    //getOutputDisplay(viewMode);

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** Set this value to true if the resource should not be destroyed each time
     * the display is hidden.
     */
    setDisplayDestroyFlags(displayDestroyFlags) {
        this.displayDestroyFlags = displayDestroyFlags;

        if(this.outputMode) {
            this.outputMode.setDisplayDestroyFlags(displayDestroyFlags);
        }
    }



    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return apogeeapp.app.BasicControlComponent.TABLE_EDIT_SETTINGS;
    }

    /** This method should be implemented to retrieve a data display of the give type. 
     * @protected. */
    getDataDisplay(viewMode,viewType) {

        var callbacks;

        //create the new view element;
        switch(viewType) {

            case apogeeapp.app.BasicControlComponent.VIEW_OUTPUT:
                viewMode.setDisplayDestroyFlags(this.displayDestroyFlags);
                this.outputMode = viewMode;
                return this.getOutputDisplay(viewMode);

            case apogeeapp.app.BasicControlComponent.VIEW_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");

            case apogeeapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
                return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");

            case apogeeapp.app.BasicControlComponent.VIEW_DESCRIPTION:
                callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
                //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
                return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);

            default:
    //temporary error handling...
                alert("unrecognized view element!");
                return null;
        }
    }

    static getCreateMemberPayload(userInputValues) {
        var json = {};
        json.name = userInputValues.name;
        json.type = apogee.JsonTable.generator.type;
        return json;
    }

    /** This method creates a basic generator for the extending object. */
    static attachStandardStaticProperties(componentGenerator,displayName,uniqueName) {
        componentGenerator.displayName = displayName;
        componentGenerator.uniqueName = uniqueName;
        componentGenerator.getCreateMemberPayload = apogeeapp.app.BasicControlComponent.getCreateMemberPayload;
        componentGenerator.DEFAULT_WIDTH = 500;
        componentGenerator.DEFAULT_HEIGHT = 500;
        componentGenerator.ICON_RES_PATH = "/componentIcons/chartControl.png";
    }
}

//======================================
// Static properties
//======================================

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





;
/** This is a form that can be dynamically configured. This should be used
 * like an input that takes an action. If you want in input to populate a data
 * value, the FormDataComponent can be used. */
apogeeapp.app.DynamicForm = class extends apogeeapp.app.BasicControlComponent {
    
    constructor(workspaceUI,member) {
        super(workspaceUI,member,apogeeapp.app.DynamicForm);
    }
        
    /** This creates a form whose layout is the member value. */
    getOutputDisplay(viewMode) {
        var getLayout = () => this.getMember().getData();
        return new apogeeapp.app.ConfigurableFormDisplay(viewMode,getLayout);
    }
};

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.DynamicForm,
        "Dynamic Form",
        "apogeeapp.app.DynamicForm");
;
/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */
apogeeapp.app.FormDataComponent = function(workspaceUI,folder) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,folder,apogeeapp.app.FormDataComponent);
    
    //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
    folder.setChildrenWriteable(false);
    
    //load these!
    this.dataTable = folder.lookupChildFromPathArray(["data"]);
    this.layoutTable = folder.lookupChildFromPathArray(["layout"]);
    this.isInputValidFunctionTable = folder.lookupChildFromPathArray(["isInputValid"]);
    
    //keep the form display alive
    this.displayDestroyFlags = apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.FormDataComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.FormDataComponent.writeToJson);
};

apogeeapp.app.FormDataComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.FormDataComponent.prototype.constructor = apogeeapp.app.FormDataComponent;

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.FormDataComponent.VIEW_FORM = "Form";
apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE = "Layout Code";
apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE = "Layout Private";
apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE = "Form Value";
apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE = "isInputValid(formValue)";
apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE = "isInputValid Private";
apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION = "Notes";

apogeeapp.app.FormDataComponent.VIEW_MODES = [
    apogeeapp.app.FormDataComponent.VIEW_FORM,
    apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE,
    apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE,
    apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE,
    apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE,
    apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION
];

apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.FormDataComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.FormDataComponent.VIEW_FORM,
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.FormDataComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.FormDataComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
    
	//create the new view element;
	switch(viewType) {
            
        case apogeeapp.app.FormDataComponent.VIEW_FORM:
            viewMode.setDisplayDestroyFlags(this.displayDestroyFlags);
            callbacks = this.getFormEditorCallbacks();
            var formEditorDisplay = new apogeeapp.app.ConfigurableFormEditor(viewMode,callbacks);
            return formEditorDisplay;
			
		case apogeeapp.app.FormDataComponent.VIEW_LAYOUT_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.layoutTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormDataComponent.VIEW_LAYOUT_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.layoutTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.FormDataComponent.VIEW_FORM_VALUE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks(this.dataTable);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/json");
            
        case apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.isInputValidFunctionTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.FormDataComponent.VIEW_INPUT_INVALID_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.isInputValidFunctionTable,apogeeapp.app.FormDataComponent.TABLE_EDIT_SETTINGS.emptyDataValue);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.FormDataComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.dataTable);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.FormDataComponent.prototype.getFormEditorCallbacks = function() {
    var callbacks = {};
    
    //return desired form value
    callbacks.getData = () => this.dataTable.getData();
    
    //return form layout
    callbacks.getLayoutInfo = () => this.layoutTable.getData();
    
    //edit ok - always true
    callbacks.getEditOk = () => true;
    
    //save data - just form value here
    var messenger = new apogee.action.Messenger(this.layoutTable);
    callbacks.saveData = (formValue) => {
        
        //validate input
        var isInputValid = this.isInputValidFunctionTable.getData();
        var validateResult = isInputValid(formValue);
        if(validateResult !== true) {
            if(typeof validateResult == 'string') {
                alert(validateResult);
                return false;
            }
            else {
                alert("Improper format for isInputValid function. It should return true or an error message");
                return;
            }
        }

        //save the data
        messenger.dataUpdate("data",formValue);
        return true;
    }
    
    return callbacks;
}

//======================================
// Static methods
//======================================

apogeeapp.app.FormDataComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.Folder.generator.type;
    json.childrenNotWriteable = true;
    //add the children
    json.children = {
        "layout": {
            "name": "layout",
            "type": "apogee.JsonTable",
            "updateData": {
                "data": "",
            }
        },
        "data": {
            "name": "data",
            "type": "apogee.JsonTable",
            "updateData": {
                "data": "",
            }
        },
        "isInputValid": {
            "name": "isInputValid",
            "type": "apogee.FunctionTable",
            "updateData": {
                "argList":["formValue"],
                "functionBody": "//If data valid, return true. If data is invalid, return an error message.\nreturn true;"
            }
        }
    };
    return json;
}

apogeeapp.app.FormDataComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.FormDataComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.FormDataComponent.displayName = "Form Data Table";
apogeeapp.app.FormDataComponent.uniqueName = "apogeeapp.app.FormDataComponent";
apogeeapp.app.FormDataComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.FormDataComponent.DEFAULT_HEIGHT = 300;
apogeeapp.app.FormDataComponent.ICON_RES_PATH = "/componentIcons/formControl.png";

;
/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
apogeeapp.app.CustomControlComponent = function(workspaceUI,control) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,control,apogeeapp.app.CustomControlComponent);
    
    this.uiCodeFields = {};
    this.currentCss = "";
    
    //keep alive or destroy on inactive
    this.destroyOnInactive = false;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.CustomControlComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.CustomControlComponent.writeToJson);
};

apogeeapp.app.CustomControlComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.CustomControlComponent.prototype.constructor = apogeeapp.app.CustomControlComponent;

//==============================
//Resource Accessors
//==============================

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

apogeeapp.app.CustomControlComponent.prototype.getDisplayDestroyFlags = function() {
    return this.destroyOnInactive ? apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE :
            apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_NEVER;
}

apogeeapp.app.CustomControlComponent.prototype.setDestroyOnInactive = function(destroyOnInactive) {
    this.destroyOnInactive = destroyOnInactive;
    
    if(this.activeOutputMode) {
        this.activeOutputMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
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

/** This method should be implemented to retrieve a data display of the give type. 
 * @protected. */
apogeeapp.app.CustomControlComponent.prototype.getDataDisplay = function(viewMode,viewType) {
	
    var callbacks;
	
	//create the new view element;
	switch(viewType) {
		
		case apogeeapp.app.CustomControlComponent.VIEW_OUTPUT:
            viewMode.setDisplayDestroyFlags(this.getDisplayDestroyFlags());
            this.activeOutputMode = viewMode;
            var html = this.getUiCodeField(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
            var resource = this.createResource();
            var dataDisplay = new apogeeapp.app.HtmlJsDataDisplay(viewMode,this.member,html,resource);
            return dataDisplay;
			
		case apogeeapp.app.CustomControlComponent.VIEW_CODE:
            callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks(this.member);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
			
		case apogeeapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks(this.member);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
        
        case apogeeapp.app.CustomControlComponent.VIEW_HTML:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_HTML);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/html");
    
        case apogeeapp.app.CustomControlComponent.VIEW_CSS:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_CSS);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/css");
            
        case apogeeapp.app.CustomControlComponent.VIEW_INIT:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_INIT);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_SET_DATA:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_SET_DATA);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_IS_CLOSE_OK:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_IS_CLOSE_OK);    
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_DESTROY:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_DESTROY);    
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_LOAD:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_LOAD);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_UNLOAD:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_UNLOAD);
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_ON_RESIZE:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_ON_RESIZE);
			return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");
            
        case apogeeapp.app.CustomControlComponent.VIEW_CONSTRUCTOR:
            callbacks = this.getCallbacks(apogeeapp.app.CustomControlComponent.CODE_FIELD_CONSTRUCTOR); 
            return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/javascript");

        case apogeeapp.app.CustomControlComponent.VIEW_DESCRIPTION:
			callbacks = apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks(this.member);
            //return new apogeeapp.app.AceTextEditor(viewMode,callbacks,"ace/mode/text");
            return new apogeeapp.app.TextAreaEditor(viewMode,callbacks);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

apogeeapp.app.CustomControlComponent.prototype.getCallbacks = function(codeField) {
    return {
        getData: () => {
            var uiCodeFields = this.getUiCodeFields();
            var data = uiCodeFields[codeField];
            if((data === undefined)||(data === null)) data = "";
            return data;
        },
        
        getEditOk: () => true,
        
        saveData: (text) => {
            var uiCodeFields = this.getUiCodeFields();
            uiCodeFields[codeField] = text;
            var actionResponse = this.update(uiCodeFields);
            if(!actionResponse.getSuccess()) {
                //show an error message
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
            }
            return true;  
        }
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

apogeeapp.app.CustomControlComponent.readFromJson = function(json) {
    if(!json) return;
    
    //set destroy flag
    if(json.destroyOnInactive !== undefined) {
        var destroyOnInactive = json.destroyOnInactive;
        this.setDestroyOnInactive(destroyOnInactive);
    }
    
    //load the resource
    this.loadResourceFromJson(json);
}

/** This serializes the table component. */
apogeeapp.app.CustomControlComponent.writeToJson = function(json) {
    //store the resource info
    json.resource = this.uiCodeFields;
    json.destroyOnInactive = this.destroyOnInactive;
}

apogeeapp.app.CustomControlComponent.addPropFunction = function(component,values) {
    values.destroyOnHide = component.getDestroyOnInactive();
}

apogeeapp.app.CustomControlComponent.updateProperties = function(component,oldValues,newValues) {
    component.setDestroyOnInactive(newValues.destroyOnHide);
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

apogeeapp.app.CustomControlComponent.getCreateMemberPayload = function(userInputValues) {
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.JsonTable.generator.type;
    return json;
}

//======================================
// This is the control generator, to register the control
//======================================

apogeeapp.app.CustomControlComponent.displayName = "Custom Control";
apogeeapp.app.CustomControlComponent.uniqueName = "apogeeapp.app.CustomControlComponent";
apogeeapp.app.CustomControlComponent.DEFAULT_WIDTH = 500;
apogeeapp.app.CustomControlComponent.DEFAULT_HEIGHT = 500;
apogeeapp.app.CustomControlComponent.ICON_RES_PATH = "/componentIcons/chartControl.png";

apogeeapp.app.CustomControlComponent.propertyDialogLines = [
    {
        "type":"checkbox",
        "heading":"Destroy on Hide: ",
        "resultKey":"destroyOnHide"
    }
];



;
/** This component represents a json table object. */
apogeeapp.app.ErrorTableComponent = function(workspaceUI,table) {
    //extend edit component
    apogeeapp.app.EditComponent.call(this,workspaceUI,table,apogeeapp.app.ErrorTableComponent);

    //default view
    this.dataView = apogeeapp.app.ErrorTableComponent.EMPTY_VIEW;
    
    //add a cleanup and save actions
    this.addOpenAction(apogeeapp.app.ErrorTableComponent.readFromJson);
    this.addSaveAction(apogeeapp.app.ErrorTableComponent.writeToJson);
};

apogeeapp.app.ErrorTableComponent.prototype = Object.create(apogeeapp.app.EditComponent.prototype);
apogeeapp.app.ErrorTableComponent.prototype.constructor = apogeeapp.app.ErrorTableComponent;

apogeeapp.app.ErrorTableComponent.prototype.getDataView = function() {
    return this.dataView;
}

apogeeapp.app.ErrorTableComponent.prototype.setDataView = function(dataView) {
    //no action - data view is fixed
}

//==============================
// Protected and Private Instance Methods
//==============================

apogeeapp.app.ErrorTableComponent.EMPTY_VIEW = "EMPTY_VIEW";

apogeeapp.app.ErrorTableComponent.VIEW_MODES = [
    apogeeapp.app.ErrorTableComponent.EMPTY_VIEW
];

apogeeapp.app.ErrorTableComponent.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.ErrorTableComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.ErrorTableComponent.EMPTY_VIEW,
    "emptyDataValue": ""
}

/**  This method retrieves the table edit settings for this component instance
 * @protected */
apogeeapp.app.ErrorTableComponent.prototype.getTableEditSettings = function() {
    return apogeeapp.app.ErrorTableComponent.TABLE_EDIT_SETTINGS;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
apogeeapp.app.ErrorTableComponent.prototype.getDataDisplay = function(viewMode,viewType) {
    return new apogeeapp.app.ErrorDisplay(viewMode,false);
}

//======================================
// Static methods
//======================================

apogeeapp.app.ErrorTableComponent.getCreateMemberPayload = function(userInputValues) {
    
    //we shouldn't be creating this - it should only be used to open from a json
    
    var json = {};
    json.name = userInputValues.name;
    json.type = apogee.ErrorTable.generator.type;
    return json;
}

/** This overrides the save method to return the original input. */
apogeeapp.app.ErrorTableComponent.prototype.toJson = function() {
    return this.completeJson;
}

/** This overrides the open deserialize method to save the entire json. */
apogeeapp.app.ErrorTableComponent.prototype.loadSerializedValues = function(json) {
    this.completeJson = json;
}

apogeeapp.app.ErrorTableComponent.writeToJson = function(json) {
    json.dataView = this.dataView;
}

apogeeapp.app.ErrorTableComponent.readFromJson = function(json) {
    if(json.dataView !== undefined) {
        this.dataView = json.dataView;
    }
}

//======================================
// This is the component generator, to register the component
//======================================

apogeeapp.app.ErrorTableComponent.displayName = "Error Table";
apogeeapp.app.ErrorTableComponent.uniqueName = "apogeeapp.app.ErrorTableComponent";
apogeeapp.app.ErrorTableComponent.DEFAULT_WIDTH = 300;
apogeeapp.app.ErrorTableComponent.DEFAULT_HEIGHT = 100;
apogeeapp.app.ErrorTableComponent.ICON_RES_PATH = "/componentIcons/genericDataTable.png";

;

//==========================
// Error Handling
//==========================

apogeeapp.app.errorHandling = {};
    
apogeeapp.app.errorHandling.handleActionError = function(errorActionResponse) {
    var errors = errorActionResponse.getErrors();
    
    //show alert for messages of type apogee.ActionError.ERROR_TYPE_APP and 
    //apogee.ActionError.ERROR_TYPE_USER. (Do not show model error in alert)
    var isFatal = errors.some( error => error.isFatal);
    var filteredErrors = errors.filter(apogeeapp.app.errorHandling.typeFilter);
    
    if((isFatal)||(filteredErrors.length > 0)) {
        var msg = "";
        if(isFatal) {
            msg += "Fatal Error: The application is in an indeterminant state. It is recommended it be closed.\n";
        }
        msg += apogee.ActionResponse.getListErrorMsg(filteredErrors);
        alert(msg);
    }
    
    //show all errors on the console
    //console.log(errorActionResponse.getErrorMsg());
}

/** This is used to filter out messages we want to alert the user in the ui. */
apogeeapp.app.errorHandling.typeFilter = function(actionError) {
    if(actionError.getType) {
        var actualErrorType = actionError.getType();
        return ( (actualErrorType == apogee.ActionError.ERROR_TYPE_APP) ||
                 (actualErrorType == apogee.ActionError.ERROR_TYPE_USER) );
    }
    else {
        //this is not an action error
        return false;
    } 
}
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
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
        
        //load
        workspaceUI.load();
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
;
apogeeapp.app.updateworkspace = {};

apogeeapp.app.updateworkspace.DIALOG_LAYOUT_TITLE_LINE = {
    "type": "title",
    "title": "Update Workspace"
};
apogeeapp.app.updateworkspace.DIALOG_LAYOUT_NAME_LINE = {
    "type": "inputElement",
    "heading": "Name: ",
    "resultKey": "name",
    "initial": ""
};
apogeeapp.app.updateworkspace.DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updateworkspace.getUpdateWorkspaceCallback = function(workspaceUI) {
    
    var createCallback = function() {
        
        var workspace = workspaceUI.getWorkspace();
        
        //load initial values
        var initialValues = {};
        initialValues.name = workspace.getName();
        
        //create the dialog layout
        var nameLine = apogee.util.jsonCopy(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_NAME_LINE);
        nameLine.initial = initialValues.name;
        
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_TITLE_LINE);
        dialogLayout.lines.push(nameLine);
        //(add any workspace ui lines here)
        dialogLayout.lines.push(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {
            
            var valuesChanged = false;
           
            //validate the name, if it changed
            if(newValues.name !== initialValues.name) {
                //validate name - for now just make sure it is not zero length
                if(newValues.length === 0) {
                    alert("The name must not be empty");
                    return false;
                }
                
                valuesChanged = true;
            }
            
            //validate any other fields here

            //update
            if(valuesChanged) {
                var actionResponse = apogeeapp.app.updateworkspace.updatePropertyValues(workspaceUI,initialValues,newValues);

                //print an error message if there was an error
                if(!actionResponse.getSuccess()) {
                    apogeeapp.app.errorHandling.handleActionError(actionResponse);
                }
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


/** This method is used for updating property values from the property dialog. */
apogeeapp.app.updateworkspace.updatePropertyValues = function(workspaceUI,oldValues,newValues) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResponse = new apogee.ActionResponse();
    
    //check if rename is needed
    if(oldValues.name !== newValues.name) {
        var actionData;
        actionData = {};
        actionData.action = "updateWorkspace";
        actionData.workspace = workspace;
        actionData.name = newValues.name;
        
        actionResponse = apogee.action.doAction(actionData,true,null,actionResponse);
    }
    
    //update any workspace ui properties here
        
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
                        apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
    
        var referencesJson = workspaceJson.references;
        var loadReferencesPromise = workspaceUI.loadReferences(referencesJson);
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
            //load the workspace anyway
            doWorkspaceLoad();
        }
        
//THIS NEEDS TO BE CLEANED UP - ESPECIALLY ERROR HANDLING
        loadReferencesPromise.then(doWorkspaceLoad).catch(linkLoadError);
        
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
apogeeapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
        var actionError = new apogee.ActionError(msg,apogee.ActionError.ERROR_TYPE_APP,null);
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
        
        var workspaceText = apogeeapp.app.saveworkspace.getWorkspaceText(app);
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }
        
        //clear workspace dirty flag on completion of save
        var onSaveSuccess = () => app.clearWorkspaceIsDirty();
        
        if(filename === undefined) {
            apogeeapp.app.saveworkspace.showSaveDialog(workspaceText,onSaveSuccess);
        }
        else {
            apogeeapp.app.saveworkspace.saveFile(filename,workspaceText,onSaveSuccess);
        }
    }
}

apogeeapp.app.saveworkspace.getWorkspaceText = function(app) {
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
apogeeapp.app.importworkspace.getImportCallback = function(app,componentGenerator) {
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
                        apogeeapp.app.errorHandling.handleActionError(actionResponse);
                    }
                };

                //open workspace
                apogeeapp.app.importworkspace.openWorkspace(app,componentGenerator,workspaceData,workspaceHandle,actionCompletedCallback);
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
apogeeapp.app.importworkspace.openWorkspace = function(app,componentGenerator,workspaceText,workspaceHandle,actionCompletedCallback) {
    var actionResponse = new apogee.ActionResponse();
    var name;
    
    try {
        //make sure there is not an open workspace
        var workspaceUI = app.getWorkspaceUI();
        
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!  

        var referencesJson = workspaceJson.references;
        var loadReferencesPromise = workspaceUI.loadReferences(referencesJson);
    	
		//if we have to load links wait for them to load
        var newParentOptionsJson = {};
        newParentOptionsJson.name = workspaceJson.workspace.data.name;
        componentGenerator.appendWorkspaceChildren(newParentOptionsJson,workspaceJson.workspace.data.children);
        var serializedComponentsJson = workspaceJson.components;
		var workspaceImportDialogFunction = apogeeapp.app.addcomponent.getAddComponentCallback(app,componentGenerator,newParentOptionsJson,serializedComponentsJson);
        
        var linkLoadError = function(errorMsg) {
            alert("Error loading links: " + errorMsg);
            //load the workspace anyway
            workspaceImportDialogFunction();
        }
        
        //THIS NEEDS TO BE CLEANED UP - ESPECIALLY ERROR HANDLING
        loadReferencesPromise.then(workspaceImportDialogFunction).catch(linkLoadError);
    }
    catch(error) {
        //figure out what to do here???
        
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
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
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
        var actionError = new apogee.ActionError(msg,apogee.ActionError.ERROR_TYPE_APP,null);
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
        
            var workspaceText = apogeeapp.app.exportworkspace.getWorkspaceText(app,folder);
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

apogeeapp.app.exportworkspace.getWorkspaceText = function(app,folder) {
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
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
            var actionError = new apogee.ActionError(errorMsg,apogee.ActionError.ERROR_TYPE_USER,null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        if(workspace.getIsDirty()) {
            var doRemove = confirm("There is unsaved data. Are you sure you want to close the workspace?");
            if(!doRemove) {
                return actionResponse;
            }
        }
        
        workspaceUIRemoved = app.clearWorkspaceUI();
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,isFatal);
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
apogeeapp.app.addcomponent.getAddComponentCallback = function(app,componentGenerator,optionalInitialValues,optionalComponentJson) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        var displayName = componentGenerator.displayName
        var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderMap = workspaceUI.getFolders();
        var folderList = [];
        for(var folderName in folderMap) {
            folderList.push(folderName);
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = apogeeapp.app.updatecomponent.getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(userInputValues) {
            
            //validate name
            var nameResult = apogee.codeCompiler.validateTableName(userInputValues.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }
            
            //get the parent object
            var parent = folderMap[userInputValues.parentName];
            
            //create the member
            var createAction = {};
            createAction.action = "createMember";
            createAction.owner = parent;
            createAction.workspace = parent.getWorkspace();
            createAction.createData = componentGenerator.getCreateMemberPayload(userInputValues);
            var actionResponse = apogee.action.doAction(createAction,true);
            var member = createAction.member;
            
            if(member) {
                var component;
                
                try {
                    //create the component
                    component = apogeeapp.app.Component.createComponentFromMember(componentGenerator,workspaceUI,member,userInputValues,optionalComponentJson);
                    
                    //unknown failure
                    if(!component) {
                        var message = "Unknown error creating component";
                        var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
                        actionResponse.addError(actionError);
                    }
                }
                catch(error) {
                    //exception creating component
                    var message = "Failed to create UI component: " + error.message;
                    var actionError = new apogee.ActionError(message,apogee.ActionError.ERROR_TYPE_APP);
                    actionResponse.addError(actionError);
                }
                
                if(!component) {
                    //delete the already created member
                    var json = {};
                    json.action = "deleteMember";
                    json.member = member;
                    //if this fails, we will just ignore it for now
                    apogee.action.doAction(json,true);
                }
                
                
            }
            
            if(!actionResponse.getSuccess()) {
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
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
apogeeapp.app.addcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentJson) {
    return function() {
    
        var onSelect = function(componentType) {
            var componentGenerator = app.getComponentGenerator(componentType);
            if(componentGenerator) {
                var doAddComponent = apogeeapp.app.addcomponent.getAddComponentCallback(app,componentGenerator,optionalInitialValues,optionalComponentJson);
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
    
    var componentGenerator = component.componentGenerator;
    
    var createCallback = function() {
        
        var displayName = componentGenerator.displayName
        var additionalLines = apogee.util.jsonCopy(componentGenerator.propertyDialogLines); 
        
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
        var dialogLayout = apogeeapp.app.updatecomponent.getPropertiesDialogLayout(displayName,folderList,additionalLines,false,initialValues);
        
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
            
            //lookup the parent object from the parent name
            if(folderMap) {
                //get the parent value
                newValues.owner = folderMap[newValues.parentName];
                
                if(newValues.owner == component.getMember()) {
                    alert("Illegal destination: you put an object inside itself");
                    return false;
                }
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
                apogeeapp.app.errorHandling.handleActionError(actionResponse);
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

        actionResponse = apogee.action.doAction(actionData,true,null,actionResponse);
    }
    
    //update an component additional properties
    if(component.componentGenerator.updateProperties) {
        component.componentGenerator.updateProperties(component,oldValues,newValues,actionResponse);
    }
        
    return actionResponse;
}

//========================
// dialog setup - this is shared with add component since it is the same basic action
//========================

//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
apogeeapp.app.updatecomponent.getPropertiesDialogLayout = function(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
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
apogeeapp.app.updatelink = {};

apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_JS_TITLE_LINE = {
    "type": "title",
    "title": "Add JS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_CSS_TITLE_LINE = {
    "type": "title",
    "title": "Add CSS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_JS_TITLE_LINE = {
    "type": "title",
    "title": "Update JS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_CSS_TITLE_LINE = {
    "type": "title",
    "title": "Update CSS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE = {
    "type": "inputElement",
    "heading": "URL: ",
    "resultKey": "url",
    "initial": ""
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE = {
    "type": "inputElement",
    "heading": "Nickname (optional): ",
    "resultKey": "nickname",
    "initial": ""
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

//itemInfo.callback = apogeeapp.app.updatelink.getAddLinkCallback(this,linkType);

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getAddLinkCallback = function(referencesUI,linkType) {
    
    var createCallback = function() {
        
        var initialValues = {};
        
        //create the dialog layout 
        var titleLine = (linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) ? 
            apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_JS_TITLE_LINE :
            apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_CSS_TITLE_LINE;
    
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(titleLine);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {

            //validate url- for now just make sure it is not zero length
            if((!newValues.url)||(newValues.url.length === 0)) {
                alert("The url must not be empty");
                return false;
            }

            //not sure what to do with promise
            var entryJson = {};
            entryJson.url = newValues.url;
            entryJson.nickname = newValues.nickname;
            entryJson.entryType = linkType;
            var promise = referencesUI.addEntry(entryJson);
            
            promise.catch(errorMsg => {alert("There was an error loading the link: " + errorMsg);});

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getUpdateLinkCallback = function(linkEntry) {
    
    var createCallback = function() {
        
        var initialValues = {};
        initialValues.url = linkEntry.getUrl();
        initialValues.nickname = linkEntry.getNickname();
        if(initialValues.nickname == initialValues.url) initialValues.nickname = "";
        
        //create the dialog layout
        var titleLine = (linkEntry.getEntryType() == apogeeapp.app.LinkEntry.LINK_TYPE_JS) ? 
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_JS_TITLE_LINE :
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_CSS_TITLE_LINE;
        var urlLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE);
        urlLine.initial = initialValues.url;
        var nicknameLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE);
        nicknameLine.initial = initialValues.nickname;
        
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(titleLine);
        dialogLayout.lines.push(urlLine);
        dialogLayout.lines.push(nicknameLine);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {

            //validate url- for now just make sure it is not zero length
            if((!newValues.url)||(newValues.url.length === 0)) {
                alert("The url must not be empty");
                return false;
            }
            
            //not sure what to do with promise
            linkEntry.updateData(newValues.url,newValues.nickname);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}


/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getRemoveLinkCallback = function(linkEntry) {
    
    var createCallback = function() {

        var doDelete= confirm("Are you sure you want to delete this link?");
        
        //create on submit callback
        if(doDelete) {
            linkEntry.remove();
        }
        
    }
    
    return createCallback;
    
}











;
/* This is a base class for a view mode. */
apogeeapp.app.ViewMode = function(componentDisplay, viewType) {
    this.componentDisplay = componentDisplay;
    
    //for destroying display to save resources
/* displayDestroy flags determine the cases under which the data display
 * will be destroyed (or kept alive). The options are when the display mode
 * is not active, when the window is minimized, and when the parent display
 * is hidden (such as the tab parent for a window). Before the display is destroyed,
 * a check is done to make sure it is ok, such as it is not in edit mode. */
    this.setDisplayDestroyFlags(apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
    
    //data display
    this.viewType = viewType;
    this.dataDisplay = null;
    this.modeActive = false;
    this.displayInWindow = false;
    
    //this is to support editors that have a specila edit more (as opposed to inline editing)
    this.inEditMode = false; 
    
    //window state, and listener for changes to window state (minimize/restore)
    var window = componentDisplay.getDisplayFrame();
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

/** This returns the UiObject, such as the window frame for this data display. */
apogeeapp.app.ViewMode.prototype.getDisplayWindow = function() {
    return this.componentDisplay.getDisplayFrame();
}

apogeeapp.app.ViewMode.prototype.getElement = function() {
    if(this.dataDisplay) {
        return this.dataDisplay.getContent();
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
    if(!this.inEditMode) {
        this.inEditMode = true;
        this.componentDisplay.startEditUI(onSave,onCancel);
    }
}

apogeeapp.app.ViewMode.prototype.endEditMode = function() {
    if(this.inEditMode) {
        this.inEditMode = false;
        this.componentDisplay.endEditUI();
    }
}

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
    this.dataDisplay.showData();
}

/** If we enter a state where we want to destroy the display, try to do that. */
apogeeapp.app.ViewMode.prototype.setDisplayState = function() {
    var showWindow = this.modeActive;
    var destroyWindow = (((!this.modeActive) && this.destroyOnInactive)||(this.windowMinimized && this.destroyOnMinimize));
 
    if(showWindow) {
        //show window, maybe create
        if(!this.dataDisplay) {
            this.dataDisplay = this.componentDisplay.getDataDisplay(this,this.viewType);
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
        this.componentDisplay.showDataDisplay(this.dataDisplay);
        if((this.windowLoaded)&&(this.dataDisplay.onLoad)) this.dataDisplay.onLoad();
        this.displayInWindow = true;
    }
}

apogeeapp.app.ViewMode.prototype.removeDisplayfromWindow = function() {
    if(this.dataDisplay) {
        this.componentDisplay.removeDisplayElement(this.dataDisplay.getContent());
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
/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - the callbacks for the editor {getData,getEditOk,saveData}
 * @param {type} containerClass - the is the css class for the container element OPTIONAL
 */
apogeeapp.app.EditorDataDisplay = class {
    constructor(viewMode,callbacks,containerClass = apogeeapp.app.EditorDataDisplay.NON_SCROLLING) {
        
        this.outsideDiv = apogeeapp.ui.createElementWithClass("div",containerClass);
	
        this.viewMode = viewMode;
        this.callbacks = callbacks;
        this.editOk = false;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    
    save() {
        var data = this.getEditorData();
        var saveComplete;
        
        //figure out if there is a problem with this - we hav to end edit mode before
        //we save because in edit mode it will not overwrite the data in the display
        //if we fail, we restart edit mode below
        this.endEditMode();

        if((this.callbacks)&&(this.callbacks.saveData)) {
            saveComplete = this.callbacks.saveData(data);
        }
        else {
            alert("Error: Data not saved: save callback not set!");
            saveComplete = true;
        }

        //end edit mode if we entered it
        if(!saveComplete) {
            this.startEditMode();
        }
    }

    cancel() {
        //reset the original data
        var cancelComplete = this.viewMode.onCancel();

        if(cancelComplete) {
            this.endEditMode();
        }
    }
    
    //=============================
    // Implemement in extending class
    //=============================
    
    //This method gets the data from the editor. REQUIRED
    //getEditorData() {}
    
    //this sets the data into the editor display. REQUIRED if edit mode or save is used
    //setEditorData(data) {}
    
    //this methodis called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onUnLoad() {}

    //this methodis called on loading the display. OPTIONAL
    //onResize() { }

    //this methodis called on loading the display. OPTIONAL
    //destroy() {}
    
    //This method returns the content element for the data display REQUIRED
    //getContent() {}
    
    //This method returns the content type for the content. The choices of values are REQUIRED
    //apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
    //apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
    //getContentType() {}
    
    


    //=============================
    // protected, package and private Methods
    //=============================
	
    showData() {
        var data;
        var editOk;
        if(this.callbacks) {
            if(this.callbacks.getData) {
                data = this.callbacks.getData();
            }
            if(this.callbacks.getEditOk) {
                editOk = this.callbacks.getEditOk();
            }
        }
        if(data === undefined) {
            data = "DATA UNAVAILABLE";
            this.editOK = false;
        }
        else if(editOk === undefined) {
            this.editOk = false;
        }
        else {
            this.editOk = editOk;
        }
        
        this.setEditorData(data);
    }

    /** @protected */
    endEditMode() {
        this.viewMode.endEditMode();

    }
    
    /** @protected */
    startEditMode() {
        var onSave = () => this.save();
        var onCancel = () => this.cancel();

        this.viewMode.startEditMode(onSave,onCancel);
    }

    /** @protected */
    onTriggerEditMode() {
        if(this.editOk) {
            this.startEditMode();
        }
    }
}

apogeeapp.app.EditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.EditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";

apogeeapp.app.EditorDataDisplay.FIT_CONTENT = "apogee_datadisplay_container_fit_content";
;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - the callbacks for the editor {getData,getEditOk,saveData}
 * @param {type} containerClass - the is the css class for the container element OPTIONAL
 */
apogeeapp.app.NonEditorDataDisplay = class {
    constructor(viewMode,containerClass = apogeeapp.app.NonEditorDataDisplay.NON_SCROLLING) {
        
        this.outsideDiv = apogeeapp.ui.createElementWithClass("div",containerClass);
	
        this.viewMode = viewMode;
    }

    //=============================
    // Implemement in extending class
    //=============================
    
    //this sets the data into the editor display. REQUIRED
    //showData() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this methodis called on loading the display. OPTIONAL
    //onUnLoad() {}

    //this methodis called on loading the display. OPTIONAL
    //onResize() { }

    //this methodis called on loading the display. OPTIONAL
    //destroy() {}
    
    //This method returns the content type for the content. The choices of values are REQUIRED
    //apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
    //apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
    //getContentType() {}


    //=============================
    // protected, package and private Methods
    //=============================

}

apogeeapp.app.NonEditorDataDisplay.NON_SCROLLING = "apogee_datadisplay_container_fixed";
apogeeapp.app.NonEditorDataDisplay.SCROLLING = "apogee_datadisplay_container_scrolling";

apogeeapp.app.NonEditorDataDisplay.FIT_CONTENT = "apogee_datadisplay_container_fit_content";
;

apogeeapp.app.dataDisplayCallbackHelper = {};

apogeeapp.app.dataDisplayCallbackHelper.formatString = "\t";

/** This function creates editor callbacks or member data where the editor takes JSON format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataJsonCallbacks = function(member) {
    return {
        getData: () => member.getData(),
        getEditOk: () => (!member.hasCode()),
        saveData: (data) => apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data)
    }
}

/** This function creates editor callbacks or member data where the editor takes text format. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDataTextCallbacks = function(member) {
    return {
        getData: () => {
            var json = member.getData();	

            var textData;
            if(json === null) {
                textData = "null";
            }
            else if(json === undefined) {
                textData = "undefined";
            }
            else {
                textData = JSON.stringify(json,null,apogeeapp.app.dataDisplayCallbackHelper.formatString);
            }

            return textData;
        },
        getEditOk: () => (!member.hasCode()),
        saveData: (text) => {
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

            return apogeeapp.app.dataDisplayCallbackHelper.saveData(member,data);
        }
    }
}

/** This function creates editor callbacks or the member function body. 
 * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
 * set with this value if the function body and supplemental code are empty. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberFunctionBodyCallbacks = function(member,optionalClearCodeValue) {
    return {
        getData: () => member.getFunctionBody(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = text;
            var supplementalCode = member.getSupplementalCode();
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeValue);
        }
    }
}

/** This function creates editor callbacks or the member supplemental code. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberSupplementalCallbacks = function(member,optionalClearCodeValue) {
    return {
        getData: () => member.getSupplementalCode(),
        getEditOk: () => true,
        saveData: (text) => {
            var argList = member.getArgList();
            var functionBody = member.getFunctionBody();
            var supplementalCode = text;
            return apogeeapp.app.dataDisplayCallbackHelper.setCode(member,argList,functionBody,supplementalCode,optionalClearCodeValue);
        }
    }
}

/** This function creates editor callbacks or the member description. */
apogeeapp.app.dataDisplayCallbackHelper.getMemberDescriptionCallbacks = function(member) {
    return {
        getData: () => member.getDescription(),
        getEditOk: () => true,
        saveData: (text) => {	
            if((text === null)||(text === undefined)) {
                text = "";
            }

            var actionData = {};
            actionData.action = "updateDescription";
            actionData.member = member;
            actionData.description = text;
            var actionResponse =  apogee.action.doAction(actionData,true);

            return true;
        }
    
    }
}

//=============================
// Shared methods
//=============================

/** @private */
apogeeapp.app.dataDisplayCallbackHelper.saveData = function(member,data) {
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = member;
    actionData.data = data;
    var actionResponse =  apogee.action.doAction(actionData,true);

    return true;    
}

/** This method is a common method to set the code and supplemental code. It also
 * will clear the code if both code fields are empty and a defined clearCodeValue is set. 
 * @private */
 apogeeapp.app.dataDisplayCallbackHelper.setCode = function(member,argList,functionBody,supplementalCode,clearCodeValue) {
    var actionData = {};

    if((clearCodeValue !== undefined)&&(functionBody == "")&&(supplementalCode == "")) {
        //special case - clear code
        actionData.action = "updateData";
        actionData.member = member;
        actionData.data = clearCodeValue;
    }
    else {
        //standard case - edit code
        actionData.action = "updateCode";
        actionData.member = member;
        actionData.argList = argList;
        actionData.functionBody = functionBody;
        actionData.supplementalCode = supplementalCode;  
    }

    var actionResponse =  apogee.action.doAction(actionData,true);

    return true;  
}


;
/** Editor that uses the basic text editor */
apogeeapp.app.TextAreaEditor = class extends  apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.SCROLLING);

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

        this.workingData = null;

        //add click handle to enter edit mode
        this.textArea.addEventListener("click",() => this.onTriggerEditMode());
    }
    
    getContent() {
        return this.textArea;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }

    getEditorData() {
        return this.textArea.value;
    }
    
    setEditorData(text) {
        this.textArea.value = text;

        //set the background color
        if(this.editOk) {
            this.textArea.style.backgroundColor = "";
        }
        else {
            this.textArea.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
        }
    }
 
    endEditMode() {
        this.textArea.readOnly = true;
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
        this.textArea.readOnly = false;
    }
}


;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} callbacks - {getData,getEditOk,setData}; format for data is text
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
apogeeapp.app.AceTextEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks,aceMode) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);

        this.editorDiv = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "bottom":"0px",
            "right":"0px",
            "overflow":"auto"
        });

        this.workingData = null;

        var editor = ace.edit(this.editorDiv);
        editor.renderer.setShowGutter(true);
        editor.setReadOnly(true);
        editor.setTheme("ace/theme/eclipse"); //good
        editor.getSession().setMode(aceMode); 
        editor.$blockScrolling = Infinity;
        this.editor = editor;

        //add click handle to enter edit mode
        this.editorDiv.addEventListener("click",() => this.onTriggerEditMode());
    }
    
    getContent() {
        return this.editorDiv;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }

    getEditorData() {
        return this.editor.getSession().getValue();
    }
    
    setEditorData(text) {
        if(apogee.util.getObjectType(text) != "String") {
            var errorMsg = "ERROR: Data value is not text";
            //this.setError(errorMsg);
            text = errorMsg;
        }
        this.editor.getSession().setValue(text);
//figure out how to handle this error

        //set the background color
        if(this.editOk) {
            this.editorDiv.style.backgroundColor = "";
        }
        else {
            this.editorDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
        }
    }
    
    onLoad() {
        if(this.editor) this.editor.resize();
    }

    onResize() {
        if(this.editor) this.editor.resize();
    }

    destroy() {
        if(this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
    
    endEditMode() {
        this.editor.setReadOnly(true);
        super.endEditMode();
    }
    
    startEditMode() {
        super.startEditMode();
        this.editor.setReadOnly(false);
    }
}
;
/** HtmlJsDataDisplay
 * This is the data display for a custom control where the display is generated from
 * HTML and javascript code. Is should be passed a 
 * resource (javascript object) which has the following methods optionally defined: 
 * 
 * constructorAddition(viewMode);
 * init(outputElement,viewMode);
 * setData(data,outputElement,viewMode);
 * isCloseOk(outputElement,viewMode);
 * destroy(outputElement,viewMode);
 * onLoad(outputElement,viewMode);
 * onUnload(outputElement,viewMode);
 * onResize(outputElement,viewMode);
 */

/** This is the display/editor for the custom control output. */
apogeeapp.app.HtmlJsDataDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    constructor(viewMode,member,html,resource) {
        super(viewMode,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);
        
        this.resource = resource;
        this.member = member;
    
        this.outputElement = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "bottom":"0px",
            "right":"0px",
            "overflow":"auto"
        });

        //content
        if(html) {
            this.outputElement.innerHTML = html;
        }
        
        //TEMP - I used to pass the view mode, now I just want to pass something else.
        var mode = {
            getMessenger: () => new apogee.action.Messenger(this.member)
        }

        //-------------------
        //constructor code
        //-------------------

        if(resource.constructorAddition) {
            try {
                //custom code
                resource.constructorAddition.call(resource,mode);
            }
            catch(error) {
                alert("Error in " + this.member.getFullName() + " init function: " + error.message);
            }
        }

        //------------------------
        //add resize/load listener if needed
        //------------------------

        

        if(this.resource.onLoad) {
            this.onLoad = () => {
                try {
                    resource.onLoad.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " onLoad function: " + error.message);
                }
            };
        }

        if(this.resource.onUnload) {   
            this.onUnload = () => {
                try {
                    if(this.resource.onHide) {
                        resource.onUnload.call(resource,this.outputElement,mode);
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName()+ " onUnload function: " + error.message);
                }
            }
        }

        if(this.resource.onResize) {
            this.onResize = () => {
                try {
                    resource.onResize.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    console.log("Error in " + this.member.getFullName() + " onResize function: " + error.message);
                }
            };
        }

        if(this.resource.setData) {
            this.showData = () => {
                try {
                    if(this.resource.setData) {
                        //set data, but only if the member does not have and error and is not pending
                        if((!this.member.hasError())&&(!this.member.getResultPending())) {
                            var data = this.member.getData();
                            resource.setData.call(resource,data,this.outputElement,mode);
                        }
                    }
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " setData function: " + error.message);
                }
            }
        }
        else {
            //we must include a function here
            this.showData = () => {};
        }

        if(this.resource.isCloseOk) {     
            this.isCloseOk = () => {
                try {
                    resource.isCloseOk.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " isCloseOk function: " + error.message);
                }
            }
        }

        if(this.resource.destroy) {
            this.destroy = () => {
                try {
                    resource.destroy.call(resource,this.outputElement,mode);
                }
                catch(error) {
                    alert("Error in " + this.member.getFullName() + " destroy function: " + error.message);
                }
            }
        }

        //-------------------
        //initialization
        //-------------------

        if(resource.init) {
            try {
                resource.init.call(resource,this.outputElement,mode);
            }
            catch(error) {
                alert("Error in " + this.member.getFullName() + " init function: " + error.message);
            }
        }
    }
    
    getContent() {
        return this.outputElement;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }
   
}






;
/** Editor that uses json edit area. I am NOT using it for the time being because
 * I need to improve it a little before it is used.
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
/** This is a grid editor using hands on table*/
apogeeapp.app.HandsonGridEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    constructor(viewMode,callbacks) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.NON_SCROLLING);

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

        this.inputData = null;
        this.activeEditOk = undefined;
        this.dataCached = false;

       //we have to make sure the element is loaded before initailizing for handsontable to work properly
       this.loaded = false;

        //grid edited function
        this.gridEdited = (args) => {
            //I am doing this because it tries to save on the initial creation
            //I am sure there is some other way to prevent this.
            if(!this.gridControl) return;
            
            this.save(arguments);
        }

        //on a paste, the event is fired for each row created. We delay it here to haev fewer updates of the rest of the sheet
        this.timerInProcess = false;
        var REFRESH_DELAY = 50;

        this.delayGridEdited = (args) => {

            //if there is no timer waiting, start a timer
            if(!this.timerInProcess) {
                this.timerInProcess = true;
                var callEditEvent = (args) => {
                    this.timerInProcess = false;
                    this.gridEdited(arguments);
                }
                setTimeout(callEditEvent,REFRESH_DELAY);
            }
        }

    }

//=============================
// "Package" Methods
//=============================

    getContent() {
        return this.gridDiv;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }
    
    getEditorData() {
        //update "input" data before calling update
        if(this.gridControl) this.inputData = apogee.util.jsonCopy(this.gridControl.getData());
        return this.inputData;
    }
    
    setEditorData(json) {
        if((this.inputData === json)&&(this.editOk)) return;
        
        //verify data is the proper format
        if(!this.dataIsValidFormat(json)) {
            var errorMsg = "ERROR: Data value is not an array of arrays"
            json = [[errorMsg]];
        }
//figure out how to handle this error
//I should detect an error if the first array is not as long as all other arrays - handsontable issue
	
        this.inputData = json;
        this.dataCached = true;

        if(this.loaded) {
            this.displayData();
        }
    }

    onLoad() {
        this.loaded = true;
        if(this.dataCached) {
            this.displayData();
        }
    }

    onUnload() {
        this.loaded = false;
    }

    onResize() {
        this.setSize();
    }

    setSize() {  
        if(this.gridDiv) {
            var gridDivParent = this.gridDiv.parentElement;
            if(gridDivParent) {
                this.gridDiv.style.width = gridDivParent.clientWidth + "px";
                this.gridDiv.style.height = gridDivParent.clientHeight + "px";
                if(this.gridControl) {
                    this.gridControl.render();
                }
            }
        }
    }

    destroy() {
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
    createNewGrid(initialData) {
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
    
    
    //we must be loaded before creating objects
    displayData() {

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
    
    //this merifies the data is an array of arrays
    dataIsValidFormat(json) {
        if(Array.isArray(json)) {
            return json.every(Array.isArray);
        }
        else {
            return false;
        }
    }

}

;
/** This is an editor that displays a customized form for data input. */
apogeeapp.app.ConfigurableFormEditor = class extends apogeeapp.app.EditorDataDisplay {
    
    /** This allows for a static or dynamic layout setting
     * @param {type} viewMode - the apogee view mode
     * @param {type} callbacks - {
     *  - getData - returns the desired form value,
     *  - getEditOk - gets if form is editable,
     *  - setData - called when data is saved, with the form value
     *  - getLayoutInfo - OPTIONAL - if this is set, the layout will be dynamically loaded whenever the
     *  form is updated. Alternatively, the fixed layout info can be passed in as a constructor argument.
     *  }
     * @param {type} optionalFixedLayoutInfo - the layout for the configurable panel. 
     * It should be populated if a fixed layout is OK. In this case, the getLayoutInfo
     * allack should not be populated. 
     */
    constructor(viewMode,callbacks,optionalFixedLayoutInfo) {
        super(viewMode,callbacks,apogeeapp.app.EditorDataDisplay.SCROLLING);
        
        //layout can be fixed or dynamic
        this.dynamicLayoutCallback = callbacks.getLayoutInfo;
        
        this.panel = new apogeeapp.ui.ConfigurablePanel();
        
        if(optionalFixedLayoutInfo) {
            this.panel.configureForm(optionalFixedLayoutInfo);
        }
    }

    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }
    
    /** This returns the form value (not the layout too) */
    getEditorData() {
        //output data is the form
        return this.panel.getValue();
    }
    
    /** This is passed the data form the data callback, which should be the extended data  - including layout + value */
    setEditorData(savedFormValue) {
        //input data is the layout and the value

        //set layout if dynmaically loaded
        if(this.dynamicLayoutCallback) {
            var layoutInfo = this.dynamicLayoutCallback();
            this.panel.configureForm(layoutInfo);
        }
        this.panel.setValue(savedFormValue);
        
        //set change to enable save bar is form value differs from initial data
        var onChange = (currentFormValue,form) => {
            if(apogee.util.jsonEquals(currentFormValue,savedFormValue)) {
                this.endEditMode()
            }
            else {
                this.startEditMode();
            }
        }
        this.panel.addOnChange(onChange);     
    }
}

;
/* This is a form display. It is meant for taking a submit action. If you want a form
 * tied to a data value, the ConfigurableFormEditor can be used.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} getLayout - this callback retrieves the form layout
 */
apogeeapp.app.ConfigurableFormDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    
    constructor(viewMode,getLayoutInfo) {
        super(viewMode,apogeeapp.app.NonEditorDataDisplay.SCROLLING);  
        
        this.getLayoutInfo = getLayoutInfo;
        
        this.panel = this.panel = new apogeeapp.ui.ConfigurablePanel();
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.panel.getElement();
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }
    
    
    //this sets the data into the editor display. REQUIRED
    showData() {
        this.panel.configureForm(this.getLayoutInfo());
    }
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
apogeeapp.app.ErrorDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    constructor(viewMode) {
        super(viewMode);
        
        var msg = "ERROR - Component not loaded!";
        var msgDiv = apogeeapp.ui.createElement("div");
        msgDiv.style = "color:red; font-weight:bold";
        msgDiv.innerHTML = msg;
        
        this.displayElement = msgDiv;
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        return this.displayElement;
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }

    showData() {
        //no action
    }
}
;
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
    dialog.setContent(content,apogeeapp.ui.SIZE_WINDOW_TO_CONTENT);
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
/** This method shows a dialog that inputs or outputs a text area.
 * The onSubmitFunction should return true if the dialog should close and false if it should stay open. 
 * This dialog uses a text area that allows for better cut/paste speed with very large input/output. */
apogeeapp.app.dialog.showTextIoDialog = function(options,onSubmitFunction) {
    
    var dialog = apogeeapp.ui.createDialog({"minimizable":true,"maximizable":true,"movable":true});
            
    //add a scroll container
    var contentContainer = apogeeapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer,apogeeapp.ui.SIZE_WINDOW_TO_CONTENT);
    
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
    
    //title
    if(options.title) {
        line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle"}));
        line.innerHTML = options.title;
        content.appendChild(line);
    }
    
    //instructions
    if(options.instructions) {
        line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
        line.appendChild(apogeeapp.ui.createElement("div",/*{"className":"xxx"}*/));
        line.innerHTML = options.instructions;
        content.appendChild(line);
    }
    
    //text area
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
        
//    var jsLinksEditorDiv = apogeeapp.ui.createElement("div",null,{
//        "position":"absolute",
//        "top":"0px",
//        "bottom":"0px",
//        "right":"0px",
//        "left":"0px"
//    });
//    editorDiv.appendChild(jsLinksEditorDiv);
    
    var textEditor = ace.edit(editorDiv);
//this stops an error message
textEditor.$blockScrolling = Infinity;
    textEditor.setTheme("ace/theme/eclipse");
    textEditor.getSession().setMode("ace/mode/text");
    //set the value
    if(options.initialText) {
        textEditor.getSession().setValue(options.initialText);
    }
    
    //save and cancel buttons
    //buttons and handler
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        closeDialog();
    }
    
    var onSave = function() {
        var outputText = textEditor.getSession().getValue();
        var doClose = onSubmitFunction(outputText);
        if(doClose) closeDialog();
    }
    
    var closeDialog = function() {
        apogeeapp.ui.closeDialog(dialog);
        
        //clean up the editor
        if(textEditor) { 
            textEditor.destroy();
            textEditor = null;
        }
    }
    
    var submitLabel = options.submitLabel ? options.submitLabel : "Submit";
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":submitLabel,"onclick":onSave}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content,apogeeapp.ui.SIZE_WINDOW_TO_CONTENT);
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
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
	dialog.setContent(contentContainer,apogeeapp.ui.SIZE_WINDOW_TO_CONTENT);
    
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
    
    dialog.setContent(content,apogeeapp.ui.SIZE_WINDOW_TO_CONTENT);  
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}




/* Hax Web App Version 0.3.0 */
//main haxapp file
var haxapp = {};

;
/** This is the main haxapp ui file */
haxapp.ui = {};

/** This should be called to initializethe resource path. */
haxapp.ui.initResourcePath = function(resourceDirectory) {
    haxapp.ui.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
haxapp.ui.getResourcePath = function(relativePath) {
    return haxapp.ui.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
haxapp.ui.MENU_ZINDEX = 100;
haxapp.ui.WINDOW_FRAME_ZINIDEX = 10;
haxapp.ui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

haxapp.ui.idIndex = 0;
haxapp.ui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
haxapp.ui.createId = function() {
    return haxapp.ui.idBase + haxapp.ui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
haxapp.ui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// screate dom methods
//=========================================

/** This method applies the style json to the dom element. All arguments
 * besides type are optional.
 * 
 * type is the element type
 * properties are javascript properties, 
 * styleProperties are the style properties
 * */
haxapp.ui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        haxapp.ui.applyStyle(element,styleProperties);
    }
    return element;
}

//=========================================
// window and dialog methods
//=========================================

haxapp.ui.dialogLayer = null;

haxapp.ui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

haxapp.ui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

haxapp.ui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
haxapp.ui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw hax.util.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = haxapp.ui.createElement("div",null,haxapp.ui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = haxapp.ui.createElement("div",null,haxapp.ui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    haxapp.ui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the haxapp.ui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
haxapp.ui.createDialog = function(options) {
    var shieldElement = haxapp.ui.createElement("div",null,haxapp.ui.DIALOG_SHIELD_STYLE);
    var dialogParent = new haxapp.ui.SimpleParentContainer(shieldElement,true);
    haxapp.ui.dialogLayer.appendChild(shieldElement);
    
    if(!options.frameColorClass) options.frameColorClass = "visicomp_windowColor";
    if(!options.titleBarClass) options.titleBarClass = "visicomp_titleBarClass";
    return new haxapp.ui.WindowFrame(dialogParent,options);
}

/** This method closes a dialog created with haxapp.ui.createDialog. It
 *hides the window and removes the modal shiled. */
haxapp.ui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.hide();
    haxapp.ui.dialogLayer.removeChild(parent.getContainerElement());
}





;
/** This is a mixin that encapsulates the base functionality of a parent container for a control
 * The parent container must provide events for when is is shown, hidden.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.ui.ParentContainer = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
haxapp.ui.ParentContainer.init = function(containerElement, eventManager) {
    this.containerElement = containerElement;
    this.eventManager = eventManager;
    
    this.windowFrameStack = [];
    
    //child auto positioning variables
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}

haxapp.ui.ParentContainer.BASE_ZINDEX = 0;

//constants for window placement
haxapp.ui.ParentContainer.DELTA_CHILD_X = 75;
haxapp.ui.ParentContainer.DELTA_CHILD_Y = 75;
haxapp.ui.ParentContainer.MIN_WRAP_WIDTH = 20; 
haxapp.ui.ParentContainer.MIN_WRAP_HEIGHT = 200;

//events
haxapp.ui.ParentContainer.CONTENT_SHOWN = "content shown";
haxapp.ui.ParentContainer.CONTENT_HIDDEN = "content hidden";

//==============================
// Public Instance Methods
//==============================

///** This method must be implemented in inheriting objects. */
//haxapp.ui.ParentContainer.getContentIsShowing = function();

/** This returns the dom element taht contains the child. */
haxapp.ui.ParentContainer.getContainerElement = function() {
    return this.containerElement;
}

/** This gets the event manager associated with window evetns for the container, such as resize. */
haxapp.ui.ParentContainer.getEventManager = function() {
    return this.eventManager;
}


/** This method adds a windows to the parent. It does not show the window. Show must be done. */
haxapp.ui.ParentContainer.addWindow = function(windowFrame) {
    this.containerElement.appendChild(windowFrame.getElement());
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method removes the window from the parent container. */
haxapp.ui.ParentContainer.removeWindow = function(windowFrame) {
    this.containerElement.removeChild(windowFrame.getElement());
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

/** This brings the given window to the front inside this container. */
haxapp.ui.ParentContainer.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
haxapp.ui.ParentContainer.getCenterOnPagePosition = function(child) {
    var element = child.getElement();
    var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
    var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
    return [x,y];
}


/** This method returns the position of the next window for auto/cascade positioning. */
haxapp.ui.ParentContainer.getNextWindowPosition = function() {
    var x = this.prevNewChildX + haxapp.ui.ParentContainer.DELTA_CHILD_X;
    var y = this.prevNewChildY + haxapp.ui.ParentContainer.DELTA_CHILD_Y;
    
    if( ((x > this.containerElement.offsetWidth)&&(x > haxapp.ui.ParentContainer.MIN_WRAP_WIDTH)) && 
        ((y > this.containerElement.offsetHeight)&&(y > haxapp.ui.ParentContainer.MIN_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = haxapp.ui.ParentContainer.DELTA_CHILD_X * (this.wrapCount + 1);
        y = haxapp.ui.ParentContainer.DELTA_CHILD_Y;
    }
    
    this.prevNewChildX = x;
    this.prevNewChildY = y;
    
    return [x,y];
}

//=========================
// Private Methods
//=========================

/** This updates the order for the windows.
 * @private */
haxapp.ui.ParentContainer.updateOrder = function() {
    var zIndex = haxapp.ui.ParentContainer.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
};
/** This is a mixin is used by parents to highlight children, to display to which
 * parent a child belons.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.ui.ParentHighlighter = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
haxapp.ui.ParentHighlighter.init = function(containerElement) {

this.borderOutlineStyle = "solid 3px " + haxapp.ui.ParentHighlighter.getColor();
containerElement.style.border = this.borderOutlineStyle;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
haxapp.ui.ParentHighlighter.addWindow = function(windowFrame) {
	
var windowElement = windowFrame.getElement();
windowElement.style.outline = this.borderOutlineStyle;
	
    haxapp.ui.ParentContainer.addWindow.call(this,windowFrame);
}

/** This method removes the window from the parent container. */
haxapp.ui.ParentHighlighter.removeWindow = function(windowFrame) {
var windowElement = windowFrame.getElement();
windowElement.style.outline = "";
	
    haxapp.ui.ParentContainer.removeWindow.call(this,windowFrame);
}

//==========================
// Static method (even though it is inherited by objects)
//==========================
haxapp.ui.ParentHighlighter.colorIndex = 0;
haxapp.ui.ParentHighlighter.getColor = function() {
	var colorString = haxapp.ui.ParentHighlighter.colorArray[haxapp.ui.ParentHighlighter.colorIndex];
	haxapp.ui.ParentHighlighter.colorIndex = (haxapp.ui.ParentHighlighter.colorIndex + 1) % haxapp.ui.ParentHighlighter.colorArray.length;
	return colorString;
}

haxapp.ui.ParentHighlighter.colorArray = [
    "DimGray",
    "Indigo",
    "DarkCyan",
    "LimeGreen",
    "RebeccaPurple",
    "MediumBlue",
    "DarkGoldenRod",
    "Navy",
    "MediumSeaGreen",
    "DarkViolet",
    "ForestGreen",
    "RoyalBlue",
    "Chocolate",
    "Red",
    "Purple",
    "DarkSlateGray",
    "OliveDrab",
    "DarkRed",
    "MidnightBlue",
    "Brown",
    "DarkMagenta",
    "DarkSlateBlue",
    "Green",
    "Sienna",
    "FireBrick",
    "Blue",
    "Olive",
    "SteelBlue",
    "Teal",
    "IndianRed",
    "MediumVioletRed",
    "SlateGray",
    "SaddleBrown",
    "SeaGreen",
    "Chartreuse",
    "LightSeaGreen",
    "DarkBlue",
    "Crimson",
    "Lime",
    "LawnGreen",
    "DarkOliveGreen",
    "OrangeRed",
    "Maroon",
    "DarkOrange",
    "Gray",
    "SpringGreen"
];

;
/** This is a window frame component. IT is used the table window and the dialog.
 *
 * It can be minimized an maximized and dragged and resized with the mouse.  
 * 
 * options:
 * minimizable - allow content to be minimized. defaylt value: false
 * maximizable - allow content to be maximized. defaylt value: false
 * closable - display a close button. defalt value: false
 * resizable- allow resizing window with mouse. default vlue: false
 * movable - allow moving window with mouse. default value : false
 *
 * @class 
 */
haxapp.ui.WindowFrame = function(parentContainer, options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    if(!options.frameColorClass) options.frameColorClass = haxapp.ui.WindowFrame.DEFAULT_FRAME_COLOR_CLASS;
    if(!options.titleBarClass) options.titleBarClass = haxapp.ui.WindowFrame.DEFAULT_TITLE_BAR_CLASS;
    
    //base init
    hax.EventManager.init.call(this);
	
    //variables
    this.parentContainer = parentContainer;
    this.parentElement = parentContainer.getContainerElement();
    this.options = options;

    this.windowState = haxapp.ui.WindowFrame.NORMAL; //minimize, normal, maximize
    
	//set default size values
	this.coordinateInfo = {};
	this.coordinateInfo.x = 0;
	this.coordinateInfo.y = 0;
	this.coordinateInfo.width = haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH;
	this.coordinateInfo.height = haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT;
	
    this.isShowing = false;
	
    this.frame = null;
    this.titleCell = null;
    this.bodyCell = null;
    this.headerCell = null;
    
    this.titleBar = null;
    this.titleBarLeftElements = null;
    this.titleBarRightElements = null;
    
    this.header = null;
    
    this.body = null;
    this.content = null;
    
    this.minimizeButton = null;
    this.restoreButton = null;
    this.maximizeButton = null;
    this.closable = null;
    
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
        instance.parentContainer.bringToFront(instance);
    };
    var element = this.getElement();
	element.addEventListener("mousedown",frontHandler);
    
    //this makes sure to update the window when the parent becomes visible
    this.onShow = function() {
        //refresh the element
        instance.show();
    }
    this.onHide = function() {
        //don't remove element, but mark it as hidden
        instance.isShowing = false;
    }
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    parentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
}

//add components to this class
hax.util.mixin(haxapp.ui.WindowFrame,hax.EventManager);

haxapp.ui.WindowFrame.MINIMIZED = -1;
haxapp.ui.WindowFrame.NORMAL = 0;
haxapp.ui.WindowFrame.MAXIMIZED = 1;

haxapp.ui.WindowFrame.MINIMIZE_CMD_IMAGE = "/minimize.png";
haxapp.ui.WindowFrame.RESTORE_CMD_IMAGE = "/restore.png";
haxapp.ui.WindowFrame.MAXIMIZE_CMD_IMAGE = "/maximize.png";
haxapp.ui.WindowFrame.CLOSE_CMD_IMAGE = "/close.png";
haxapp.ui.WindowFrame.MENU_IMAGE = "/hamburger.png";

haxapp.ui.WindowFrame.RESIZE_LOCATION_SIZE = 10;

//constants for resizing
haxapp.ui.WindowFrame.RESIZE_TOLERANCE = 5;
haxapp.ui.WindowFrame.RESIZE_EAST = 1;
haxapp.ui.WindowFrame.RESIZE_WEST = 2;
haxapp.ui.WindowFrame.RESIZE_SOUTH = 4;
haxapp.ui.WindowFrame.RESIZE_NORTH = 8;
haxapp.ui.WindowFrame.RESIZE_NE = haxapp.ui.WindowFrame.RESIZE_NORTH + haxapp.ui.WindowFrame.RESIZE_EAST;
haxapp.ui.WindowFrame.RESIZE_NW = haxapp.ui.WindowFrame.RESIZE_NORTH + haxapp.ui.WindowFrame.RESIZE_WEST;
haxapp.ui.WindowFrame.RESIZE_SE = haxapp.ui.WindowFrame.RESIZE_SOUTH + haxapp.ui.WindowFrame.RESIZE_EAST;
haxapp.ui.WindowFrame.RESIZE_SW = haxapp.ui.WindowFrame.RESIZE_SOUTH + haxapp.ui.WindowFrame.RESIZE_WEST;

/** size must be speicifed for the window. If not these values are used. */
haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT = 300;
haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH = 300;

haxapp.ui.WindowFrame.DEFAULT_TITLE_BAR_CLASS = "visiui_win_titleBarClass";
haxapp.ui.WindowFrame.DEFAULT_FRAME_COLOR_CLASS = "visiui_win_windowColorClass";

//======================================
// CSS STYLES
//======================================

haxapp.ui.WindowFrame.TITLE_BAR_LEFT_STYLE = {
    //fixed
    "display":"inline",
    "width":"100%"
};

haxapp.ui.WindowFrame.TITLE_BAR_RIGHT_STYLE = {
    //fixed
    "float":"right",
    "display":"inline"
};

haxapp.ui.WindowFrame.TITLE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":"default",
    "font-weight":"bold",
    "color":"darkblue"
    
};

haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE = { 
    //fixed
    "display":"inline-block",

    //configurable
    "marginRight":"3px"
};

//====================================
// Public Methods
//====================================

haxapp.ui.WindowFrame.prototype.getTitle = function(title) {
    return this.title;
}

/** This method sets the title on the window frame.
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is immediately after the menu, if the menu is present. */
haxapp.ui.WindowFrame.prototype.setTitle = function(title) {
	if((title === null)||(title === undefined)||(title.length === 0)) {
		title = "&nbsp;";
	}
    //title
    this.title = title;
    if(!this.titleElement) {
        this.titleElement = document.createElement("div");
        haxapp.ui.applyStyle(this.titleElement,haxapp.ui.WindowFrame.TITLE_STYLE);
    }
    this.titleElement.innerHTML = title;
    this.titleBarLeftElements.appendChild(this.titleElement);
}

/** This gets the menu for the window frame. If this is called, a menu will be added
 * to the window frame, empty or otherwise. If it is not called, there will be no menu. 
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is first. */
haxapp.ui.WindowFrame.prototype.getMenu = function() {
    if(!this.menu) {
        this.menu = haxapp.ui.Menu.createMenuFromImage(haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MENU_IMAGE));
		var firstLeftElementChild = this.titleBarLeftElements.firstChild;
		if(firstLeftElementChild) {
			this.titleBarLeftElements.insertBefore(this.menu.getElement(),firstLeftElementChild);
		}
		else {
			this.titleBarLeftElements.appendChild(this.menu.getElement());
		}
    }
    return this.menu;
}

/** This method sets the headers for the window. They appreare between the title
 * bar and the body. The elements should typicaly be "block" type components, such
 * as a div.
 */
haxapp.ui.WindowFrame.prototype.loadHeaders = function(headerElements) {
    hax.util.removeAllChildren(this.headerElement);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			this.headerElement.appendChild(headerElements[i]);
		}
    }
}

/** This method shows the window. */
haxapp.ui.WindowFrame.prototype.changeParent = function(newParentContainer) {
    this.hide();
    var oldParentContainer = this.parentContainer;
    var oldParentEventManager = oldParentContainer.getEventManager();
    oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    
    this.parentContainer = newParentContainer;
    this.parentElement = newParentContainer.getContainerElement();
    
    var newParentEventManager = newParentContainer.getEventManager();
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.show();
}

/** This method shows the window. */
haxapp.ui.WindowFrame.prototype.show = function() {
    if(this.isShowing) return;
    
    //add window to the parent
    this.parentContainer.addWindow(this);

    if(this.parentContainer.getContentIsShowing()) {
        this.isShowing = true;
        this.frameShown();

        //we will redo this since the size of elements used in calculation may have been wrong
        if(this.coordinateInfo.height !== undefined) {
            this.updateCoordinates();
        }
    }
}

/** This method hides the window. */
haxapp.ui.WindowFrame.prototype.hide = function() {
    this.parentContainer.removeWindow(this);
    if(this.isShowing) {
        this.isShowing = false;
        this.frameHidden();
    }
}

/** This method closes the window. */
haxapp.ui.WindowFrame.prototype.deleteWindow = function() {
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.hide();
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowFrame.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowFrame.prototype.getContentIsShowing = function() {
    return (this.isShowing)&&(this.windowState != haxapp.ui.WindowFrame.MINIMIZED);
}

/** This method sets the position of the window frame in the parent. */
haxapp.ui.WindowFrame.prototype.setPosition = function(x,y) {
	//don't let window be placed at a negative coord. We can lose it.
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	this.coordinateInfo.x = x;
	this.coordinateInfo.y = y;
	
    this.updateCoordinates();
}

/** This method sets the size of the window frame, including the title bar. */
haxapp.ui.WindowFrame.prototype.setSize = function(width,height) {
    this.coordinateInfo.width = width;
	this.coordinateInfo.height = height;
    
    this.updateCoordinates();
}

/** This method sets the size of the window to fit the content. It should only be 
 * called after the window has been shown. The argument passed should be the element
 * that holds the content and is sized to it. */
haxapp.ui.WindowFrame.prototype.fitToContent = function(contentContainer) {
	//figure out how big to make the frame to fit the content
    var viewWidth = this.body.offsetWidth;
    var viewHeight = this.body.offsetHeight;
    var contentWidth = contentContainer.offsetWidth;
    var contentHeight = contentContainer.offsetHeight;
	
	var targetWidth = this.coordinateInfo.width + contentWidth - viewWidth + haxapp.ui.WindowFrame.FIT_WIDTH_BUFFER;
	var targetHeight = this.coordinateInfo.height + contentHeight - viewHeight + haxapp.ui.WindowFrame.FIT_HEIGHT_BUFFER;
	
    this.setSize(targetWidth,targetHeight);
}

/** This method centers the window in its parent. it should only be called
 *after the window is shown. */
haxapp.ui.WindowFrame.prototype.centerInParent = function() {
    var coords = this.parentContainer.getCenterOnPagePosition(this);
    this.setPosition(coords[0],coords[1]);
}

/** @private */
haxapp.ui.WindowFrame.FIT_HEIGHT_BUFFER = 20;
/** @private */
haxapp.ui.WindowFrame.FIT_WIDTH_BUFFER = 20;
	
/** This method gets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.getCoordinateInfo= function() {
    return this.coordinateInfo;
}

/** This method sets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.setCoordinateInfo= function(coordinateInfo) {
    this.coordinateInfo = coordinateInfo;
    this.updateCoordinates();
}

/** This method gets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.getWindowState = function() {
    return this.windowState;
}

/** This method sets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.setWindowState = function(windowState) {
    switch(windowState) {
        case haxapp.ui.WindowFrame.NORMAL:
            this.restoreContent();
            break;
            
        case haxapp.ui.WindowFrame.MINIMIZED:
            this.minimizeContent();
            break;
            
        case haxapp.ui.WindowFrame.MAXIMIZED:
            this.maximizeContent();
            break;
            
        default:
            alert("Unknown window state: " + windowState);
            break;
    }
}

/** This method returns the main dom element for the window frame. */
haxapp.ui.WindowFrame.prototype.getElement = function() {
    return this.frame;
}

/** This method returns the window body.*/
haxapp.ui.WindowFrame.prototype.getBody = function() {
    return this.body;
}

/** This method returns the window body.*/
haxapp.ui.WindowFrame.prototype.getParent = function() {
    return this.parentContainer;
}

/** This method sets a content element in the body. Alternatively the body can 
 * be retrieved and loaded as desired. */
haxapp.ui.WindowFrame.prototype.setContent = function(element) {
    //remove the old content
    while(this.body.firstChild) {
        this.body.removeChild(this.body.firstChild);
    }
	
    //add the new content
    this.content = element;
    if(this.content) {
        this.body.appendChild(this.content);
    }
}

/** This method sets the size of the window, including the title bar and other decorations. */
haxapp.ui.WindowFrame.prototype.setZIndex = function(zIndex) {
    this.frame.style.zIndex = String(zIndex);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.addTitleBarElement = function(element) {
    this.titleBarLeftElements.appendChild(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.removeTitleBarElement = function(element) {
    this.titleBarLeftElements.appendRemove(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.addRightTitleBarElement = function(element) {
    if(this.titleBarRightElements.firstChild) {
		this.titleBarRightElements.insertBefore(element,this.titleBarRightElements.firstChild);
	}
    else {
        this.titleBarRightElements.appendChild(element);
    }
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.removeRightTitleBarElement = function(element) {
    this.titleBarRightElements.appendRemove(element);
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================

/** Mouse down handler for moving the window. */
haxapp.ui.WindowFrame.prototype.moveMouseDown = function(e) {
    //do not do move in maximized state
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) return;
    
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
haxapp.ui.WindowFrame.prototype.moveMouseMove = function(e) {
    if(!this.windowDragActive) return;
	var newX = e.clientX - this.moveOffsetX;
	if(newX < 0) newX = 0;
	var newY = e.clientY - this.moveOffsetY;
	if(newY < 0) newY = 0;
    this.coordinateInfo.x = newX;
    this.coordinateInfo.y = newY;
    this.updateCoordinates();
}

/** Mouse up handler for moving the window. */
haxapp.ui.WindowFrame.prototype.moveMouseUp = function(e) {
    this.endMove();
}

/** Mouse leave handler for moving the window. */
haxapp.ui.WindowFrame.prototype.moveMouseLeave = function(e) {
    this.endMove();
}

/** Mouse down handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseDown = function(e,resizeFlags) {
    //do not do resize in maximized state
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) return;

	if(resizeFlags) {
		if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_EAST) {
			this.resizeEastActive = true;
			this.resizeOffsetWidth = e.clientX - this.frame.clientWidth;
		}
		else if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_WEST) {
			this.resizeWestActive = true;
			this.resizeOffsetWidth = e.clientX + this.frame.clientWidth;
			this.moveOffsetX = e.clientX - this.frame.offsetLeft;
		}
		if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_SOUTH) {
			this.resizeSouthActive = true;
			this.resizeOffsetHeight = e.clientY - this.frame.clientHeight;
		}
		else if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_NORTH) {
			this.resizeNorthActive = true;
			this.resizeOffsetHeight = e.clientY + this.frame.clientHeight;
			this.moveOffsetY = e.clientY - this.frame.offsetTop;
		}

        //add resize events to the parent, since the mouse can leave this element during a move
		this.parentElement.addEventListener("mouseup",this.resizeOnMouseUp);
		this.parentElement.addEventListener("mousemove",this.resizeOnMouseMove);
        this.parentElement.addEventListener("mouseleave",this.resizeOnMouseLeave);
	}
}

/** Mouse move handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseMove = function(e) {
    var newHeight;
    var newWidth;
    var newX;
    var newY;
    var changeMade = false;
    
	if(this.resizeEastActive) {
		newWidth = e.clientX - this.resizeOffsetWidth;
		if(newWidth < this.minWidth) return;
        this.coordinateInfo.width = newWidth;
        changeMade = true;
	}
	else if(this.resizeWestActive) {
		newWidth = this.resizeOffsetWidth - e.clientX;
		if(newWidth < this.minWidth) return;
		newX = e.clientX - this.moveOffsetX;
		if(newX < 0) newX = 0;
        this.coordinateInfo.width = newWidth;
        this.coordinateInfo.x = newX;
        changeMade = true;
	}
	if(this.resizeSouthActive) {
		newHeight = e.clientY - this.resizeOffsetHeight;
		if(newHeight < this.minHeight) return;
		this.coordinateInfo.height = newHeight;
        changeMade = true;
	}
	else if(this.resizeNorthActive) {
		newHeight = this.resizeOffsetHeight - e.clientY;
		if(newHeight < this.minHeight) return;
		newY = e.clientY - this.moveOffsetY;
		if(newY < 0) newY = 0;
		this.coordinateInfo.height = newHeight;
		this.coordinateInfo.y = newY;
        changeMade = true;
	}
        
    if(changeMade) {
        //update coordinates
        this.updateCoordinates();
    }
}

/** Mouse up handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseUp = function(e) {
    this.endResize();
}

/** Mouse up handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseLeave = function(e) {
    this.endResize();
}


/** This method ends a move action. 
 * @private */
haxapp.ui.WindowFrame.prototype.endMove = function(e) {
    this.windowDragActive = false;
    this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
}

/** this method ends a resize action.
 * @private */
haxapp.ui.WindowFrame.prototype.endResize = function() {
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeSouthActive = false;
	this.resizeNorthActive = false;
	this.parentElement.removeEventListener("mouseup",this.resizeOnMouseUp);
	this.parentElement.removeEventListener("mousemove",this.resizeOnMouseMove);
}

//====================================
//  Min/max Methods
//====================================

/** This is the minimize function for the window.*/
haxapp.ui.WindowFrame.prototype.minimizeContent = function() {
    
    //set body as hidden
    this.body.style.display = "none";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === haxapp.ui.WindowFrame.MAXIMIZED);
 
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.MINIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    //dispatch resize event
    if(!wasMinimized) this.contentOnlyHidden();
}

/** This is the restore function for the window.*/
haxapp.ui.WindowFrame.prototype.restoreContent = function() {
    
    //set body as not hidden
    this.body.style.display = "";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === haxapp.ui.WindowFrame.MAXIMIZED);
    
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.NORMAL;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
}

/** This is the minimize function for the window.*/
haxapp.ui.WindowFrame.prototype.maximizeContent = function() {
    
    //set body as not hidden
    this.body.style.display = "";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.MAXIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
}


/** This method ends a move action. 
 * @private */
haxapp.ui.WindowFrame.prototype.setMinMaxButtons = function() {
    if(this.minimizeButton) {
        if(this.windowState == haxapp.ui.WindowFrame.MINIMIZED) {
            this.minimizeButton.style.display = "none";
        }
        else {
            this.minimizeButton.style.display = "";
        }
    }
    if(this.restoreButton) {
        if(this.windowState == haxapp.ui.WindowFrame.NORMAL) {
            this.restoreButton.style.display = "none";
        }
        else {
            this.restoreButton.style.display = "";
        }
    }
    if(this.maximizeButton) {
        if(this.windowState == haxapp.ui.WindowFrame.MAXIMIZED) {
            this.maximizeButton.style.display = "none";
        }
        else {
            this.maximizeButton.style.display = "";
        }
    }
}

/** @private */
haxapp.ui.WindowFrame.prototype.updateCoordinates = function() {
	
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) {
        //apply the maximized coordinates size
        this.frame.style.left = "0px";
		this.frame.style.top = "0px";
		this.frame.style.height = "100%";
		this.frame.style.width = "100%";
    }
    else if(this.windowState === haxapp.ui.WindowFrame.NORMAL) {
        //apply the normal size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		if(this.coordinateInfo.height !== undefined) {
			this.frame.style.height = this.coordinateInfo.height + "px";
		}
		else {
			this.frame.style.height = haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT + "px";
		}
		if(this.coordinateInfo.width !== undefined) {
			this.frame.style.width = this.coordinateInfo.width + "px";
		}
		else {
			this.frame.style.width = haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH + "px";
		}
    }
    else if(this.windowState === haxapp.ui.WindowFrame.MINIMIZED) {
        //apply the minimized size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		
		this.frame.style.height = "0px";
		this.frame.style.width = "0px";
    }
}

/** This method should be called when the entire window is shown.
 * @private */
haxapp.ui.WindowFrame.prototype.frameShown = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method should be called when the entire window is hidden.
 * @private */
haxapp.ui.WindowFrame.prototype.frameHidden = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}

/** This method should be called when the entire window is hidden
 * @private */
haxapp.ui.WindowFrame.prototype.contentOnlyShown = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method shoudl be called when the window contents are show
 * @private */
haxapp.ui.WindowFrame.prototype.contentOnlyHidden = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}

//====================================
// Initialization Methods
//====================================

/** @private */
haxapp.ui.WindowFrame.prototype.initUI = function() {
    
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
    cell.className = this.options.frameColorClass + " visiui_win_topLeft";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST | haxapp.ui.WindowFrame.RESIZE_NORTH);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_top";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_topRight";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST | haxapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    
    //title bar
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_left";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass;
    this.titleBarCell = cell;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_right";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    
    //header row
    row = document.createElement("tr");
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
    cell.className = this.options.frameColorClass + " visiui_win_bottomLeft";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST | haxapp.ui.WindowFrame.RESIZE_SOUTH); 
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_bottom";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_SOUTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_bottomRight";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST | haxapp.ui.WindowFrame.RESIZE_SOUTH);
    row.appendChild(cell);
    
    this.createTitleBar();
    this.createHeaderContainer();
    this.createBody();
}

/** @private */
haxapp.ui.WindowFrame.prototype.addResizeHandlers = function(cell,flags) {
    //add handlers if the window is resizable
    if(this.options.resizable) {
        var instance = this;
        cell.onmousedown = function(event) {
            instance.resizeMouseDown(event,flags);
        }
        
        //these are not cel specific. they are used on all cells and on the parent container
        //during a move.
        if(!this.resizeOnMouseMove) {
            this.resizeOnMouseMove = function(event) {
                instance.resizeMouseMove(event);
            };
            this.resizeOnMouseUp = function(event) {
                instance.resizeMouseUp(event);
            };
            this.resizeOnMouseLeave = function(event) {
                instance.resizeMouseLeave(event);
            };
        }
    }
}

/** @private */
haxapp.ui.WindowFrame.prototype.createTitleBar = function() {
    
    this.titleBar = document.createElement("div");
    this.titleBar.className = this.options.titleBarClass;

    //add elements
    this.titleBarLeftElements = document.createElement("div");
    haxapp.ui.applyStyle(this.titleBarLeftElements,haxapp.ui.WindowFrame.TITLE_BAR_LEFT_STYLE);
    this.titleBar.appendChild(this.titleBarLeftElements);


    this.titleBarRightElements = document.createElement("div");
    haxapp.ui.applyStyle(this.titleBarRightElements,haxapp.ui.WindowFrame.TITLE_BAR_RIGHT_STYLE);
    this.titleBar.appendChild(this.titleBarRightElements);

    //for handlers below
    var instance = this;
    
    //add window commands ( we will hide the bottons that are not needed)
    //minimize button
    if(this.options.minimizable) {
        this.minimizeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.minimizeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.minimizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MINIMIZE_CMD_IMAGE);
        this.minimizeButton.onclick = function() {
            instance.minimizeContent();
        }
        this.titleBarRightElements.appendChild(this.minimizeButton);
    }
	
    //restore button - only if we cn minimize or maximize
    if(this.options.minimizable || this.options.maximizable) {	
        this.restoreButton = document.createElement("img");
        haxapp.ui.applyStyle(this.restoreButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.restoreButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.RESTORE_CMD_IMAGE);
        this.restoreButton.onclick = function() {
            instance.restoreContent();
        }
        this.titleBarRightElements.appendChild(this.restoreButton);
    }
    
    //maximize button and logic
    if(this.options.maximizable) {
        this.maximizeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.maximizeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.maximizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MAXIMIZE_CMD_IMAGE);
        this.maximizeButton.onclick = function() {
            instance.maximizeContent();
        }
        this.titleBarRightElements.appendChild(this.maximizeButton);
    }
    
    //layout the window buttons
    this.windowState = haxapp.ui.WindowFrame.NORMAL;
    this.setMinMaxButtons();
    
    //close button
    if(this.options.closable) {
        this.closeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.closeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.closeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.CLOSE_CMD_IMAGE);
        this.closeButton.onclick = function() {
            instance.hide();
        }
        this.titleBarRightElements.appendChild(this.closeButton);
    }
	
	//add am empty title
	this.setTitle("");
    
    //mouse move and resize
    if(this.options.movable) {
        //add mouse handlers for moving the window 
        this.titleBar.onmousedown = function(event) {
            instance.moveMouseDown(event);
        }

        //mouse window drag events we will place on the parent container - since the mouse drag 
        //may leave the window frame during the move
        this.moveOnMouseMove = function(event) {
            instance.moveMouseMove(event);
        };
        this.moveOnMouseUp = function(event) {
            instance.moveMouseUp(event);
        }
        this.moveOnMouseLeave = function(event) {
            instance.moveMouseLeave(event);
        }
    }
    
    //add to window
    this.titleBarCell.appendChild(this.titleBar);
}

/** @private */
haxapp.ui.WindowFrame.prototype.createHeaderContainer = function() {
    
    this.headerElement = document.createElement("div");
    this.headerElement.className = "visiui_win_header";
    
    this.headerCell.appendChild(this.headerElement);
 
    //load empty headers
    this.loadHeaders([]);
}
	
/** @private */
haxapp.ui.WindowFrame.prototype.createBody = function() {
    
    this.body = document.createElement("div");
    this.body.className = "visiui_win_body";
    
    this.bodyCell.appendChild(this.body);
}
;
/** This is a minimal parent container. The resize, show and hide events must be 
 * externally managed.
 * 
 * @class 
 */
haxapp.ui.SimpleParentContainer = function(div,initialIsShowing) {
    
    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.ParentContainer.init.call(this,div,this);
    
    this.isShowing = initialIsShowing;
}

//add components to this class
hax.util.mixin(haxapp.ui.SimpleParentContainer,hax.EventManager);
hax.util.mixin(haxapp.ui.SimpleParentContainer,haxapp.ui.ParentContainer);

/** This method must be implemented in inheriting objects. */
haxapp.ui.SimpleParentContainer.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This should be called when the element is shown. */
haxapp.ui.SimpleParentContainer.prototype.isShown = function() {
    this.isShowing = true;
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This should be called when the element is hidden. */
haxapp.ui.SimpleParentContainer.prototype.isHidden = function() {
    this.isShowing = false;
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
};
/** This is a tab frame. The constructor takes an id for the container and
 * an options object. The tab frame wil lbe appended to the given container.
 * 
 * This is not really a general window element. It is made to fit this use case.
 * It resizes to occupy all space in the parent, starting form its existing location,
 * which in this case should be right after the menu.
 * 
 * note - document external color classes set in options
 * 
 * options: none
 * 
 * @class 
 */
haxapp.ui.TabFrame = function(parentDiv,options) {
	
    if(!options) {
        options = {};
    }
    
    //make sure these are passed in with valid colors!
    if((!options.tabBarColorClass)||(!options.activeTabColorClass)) {
        alert("The tabBarColorClass and  activeTabColorClass must be set in the options for tab frame!");
    } options.titleBarClass = "";
  
    
    //base init
    hax.EventManager.init.call(this);
    //initialize parent container after conatiner div created
	
    //variables
    this.options = options;
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = document.createElement("div");
    haxapp.ui.applyStyle(this.tabFrameControl,haxapp.ui.TabFrame.CONTAINER_STYLE);
    parentDiv.appendChild(this.tabFrameControl);
	
    this.tabFrame = document.createElement("div");
    haxapp.ui.applyStyle(this.tabFrame,haxapp.ui.TabFrame.DISPLAY_FRAME_STYLE);
	this.tabFrameControl.appendChild(this.tabFrame);  
    
    this.tabBar = document.createElement("div");
    haxapp.ui.applyStyle(this.tabBar,haxapp.ui.TabFrame.TAB_BAR_STYLE);
    this.tabBar.className = this.options.tabBarColorClass;
    this.tabFrameControl.appendChild(this.tabBar);
    
    //base init for parent continer mixin
    haxapp.ui.ParentContainer.init.call(this,this.tabFrame,this);	
}

//add components to this class
hax.util.mixin(haxapp.ui.TabFrame,hax.EventManager);
hax.util.mixin(haxapp.ui.TabFrame,haxapp.ui.ParentContainer);

//events
haxapp.ui.TabFrame.TAB_SHOWN = "tabShown";
haxapp.ui.TabFrame.TABS_RESIZED = "tabsResized";

haxapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

haxapp.ui.TabFrame.CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px",
};
haxapp.ui.TabFrame.DISPLAY_FRAME_STYLE = {
    //fixed
    "position":"relative",
    "display":"table-row",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px",
    
    //configurable
    "backgroundColor":"white",
    //"border":" 1px solid gray",
    "borderBottomWidth":" 0px"
}
haxapp.ui.TabFrame.TAB_BAR_STYLE = {
    //fixed
    "position":"relative",
    "display":"table-row",
    "width":"100%",
    
    /* set background color with an external style */
    "margin":"0px",
    "border":" 1px solid gray",
    "borderTopWidth":" 0px"
}
haxapp.ui.TabFrame.TAB_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    //configurable
    "border":" 1px solid black",
    "padding":"2px"
}
haxapp.ui.TabFrame.TAB_INACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    /* set color with external class */
    "border":" 1px solid black",
    "borderTopColor":"",
    "padding":"2px"
}
haxapp.ui.TabFrame.TAB_ACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    /* set background color with an external style */
    "border":" 1px solid black",
    "borderTopColor":"white",
    "padding":"2px"
}

/** This method returns the dom element for the control. */
haxapp.ui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
haxapp.ui.TabFrame.prototype.getTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        return tabData.tabDisplay;
    }
    else {
        return null;
    }
}

/** This method adds a tab to the tab frame. */
haxapp.ui.TabFrame.prototype.addTab = function(name) {
    //make sure there is no tab with this name
    if(this.tabTable[name]) {
        alert("There is already a tab with this name!");
        return null;
    }
    
    //create the tab object
    var tab = new haxapp.ui.Tab(name, this);
    this.tabFrame.appendChild(tab.getContainerElement());
    
    //create tab label
    var tabLabelElement = document.createElement("div");
    haxapp.ui.applyStyle(tabLabelElement,haxapp.ui.TabFrame.TAB_BASE_STYLE);
    tabLabelElement.innerHTML = name;
    this.tabBar.appendChild(tabLabelElement);
	
    //add the click handler
    var instance = this;
    tabLabelElement.onclick = function() {
        instance.setActiveTab(name);
    }
    tabLabelElement.onmousedown = function(e) {
        //this prevents text selection
        e.preventDefault();
    }
	
    //add to tabs
    var tabData = {};
    tabData.tabDisplay = tab;
    tabData.tabLabel = tabLabelElement;
    
    this.tabTable[name] = tabData;
    if(this.activeTab == null) {
        this.activeTab = name;
    }
    this.updateTabDisplay();
    
//    //resize the main control element
//    this.resizeElement();
    
    return tab;
}

/** This method adds a tab to the tab frame. */
haxapp.ui.TabFrame.prototype.removeTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        this.tabFrame.removeChild(tabData.tabDisplay.getContainerElement());
        this.tabBar.removeChild(tabData.tabLabel);
        delete this.tabTable[name];
		
        if(this.activeTab == name) {
            this.activeTab = null;
            //choose a random tab
            for(var title in this.tabTable) {
                this.activeTab = title;
                break;
            }
        }
        this.updateTabDisplay();
    }
}

/** This mesets the active tab, by tab title. */
haxapp.ui.TabFrame.prototype.setActiveTab = function(title) {
    this.activeTab = title;
    this.updateTabDisplay();
}

/** This mesets the active tab, by tab title. */
haxapp.ui.TabFrame.prototype.getActiveTabTitle = function() {
    return this.activeTab;
}

/** This updates the tabs. */
haxapp.ui.TabFrame.prototype.updateTabDisplay = function() {
    var title;
    for(title in this.tabTable) {
        var tabData = this.tabTable[title];
        if(title == this.activeTab) {
            tabData.tabDisplay.getContainerElement().style.display = "";
            haxapp.ui.applyStyle(tabData.tabLabel,haxapp.ui.TabFrame.TAB_ACTIVE_STYLE);
            tabData.tabLabel.className = this.options.activeTabColorClass;
            this.dispatchEvent(haxapp.ui.TabFrame.TAB_SHOWN,this.activeTab);
        }
        else {
            tabData.tabDisplay.getContainerElement().style.display = "none";
            haxapp.ui.applyStyle(tabData.tabLabel,haxapp.ui.TabFrame.TAB_INACTIVE_STYLE);
            tabData.tabLabel.className = this.options.tabBarColorClass;
        }
    }
}
;

haxapp.ui.Tab = function(name, tabFrame) {
    
    //create the tab element
    var element = document.createElement("div");

    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.ParentContainer.init.call(this,element,this);
	haxapp.ui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;
    
    haxapp.ui.applyStyle(element,haxapp.ui.Tab.TAB_WINDOW_STYLE);
	this.displayFrame = element;
    
    //add handlers for resize and show
    var instance = this;
    tabFrame.addListener(haxapp.ui.TabFrame.TABS_RESIZED, function() {  
        instance.dispatchEvent(haxapp.ui.WindowFrame.RESIZED,this);
    });
    tabFrame.addListener(haxapp.ui.TabFrame.TAB_SHOWN, function(activeTabName) {
        if(activeTabName == instance.name) {
            instance.isShowing = true;
            instance.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,instance);
        }
        else {
            instance.isShowing = false;
            instance.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,instance);
        }
    });
    
    
}

//add components to this class
hax.util.mixin(haxapp.ui.Tab,hax.EventManager);
hax.util.mixin(haxapp.ui.Tab,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.ui.Tab,haxapp.ui.ParentHighlighter);

haxapp.ui.Tab.TAB_WINDOW_STYLE = {
    "top":"0px",
    "left":"0px",
	"height":"100%",
    "position":"relative",
    "backgroundColor":"white",
    "overflow":"auto"
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
};
/** Thiis is a namespace with functions to control menu operation
 *
 * @class 
 */
haxapp.ui.Menu = {};

haxapp.ui.Menu.initialized = false;
haxapp.ui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
haxapp.ui.Menu.createMenu = function(text) {
    var element = document.createElement("div");
    element.innerHTML = text;
    return new haxapp.ui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
haxapp.ui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = document.createElement("div");
    element.appendChild(imageElement);
    return new haxapp.ui.MenuHeader(element);
}

haxapp.ui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    haxapp.ui.Menu.show(menuBody);
}

haxapp.ui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing the header closes the active menu otherwise show the menu
	if(haxapp.ui.Menu.activeMenu) {
		//active menu - close the menu
		haxapp.ui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		haxapp.ui.Menu.show(menuHeader.getMenuBody());
	}
}

haxapp.ui.Menu.menuHeaderEntered = function(menuHeader) {
	//if a header is entered and there is an active, non-context menu, open this menu
	if((haxapp.ui.Menu.activeMenu)&&(!haxapp.ui.Menu.activeMenu.getIsContext())) {
		haxapp.ui.Menu.show(menuHeader.getMenuBody());
	}
}

haxapp.ui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(haxapp.ui.Menu.activeMenu) {
		haxapp.ui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

haxapp.ui.Menu.show = function(menuBody) {
	if(haxapp.ui.Menu.activeMenu) {
		haxapp.ui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        haxapp.ui.Menu.activeMenu = menuBody;
    }
}

haxapp.ui.Menu.hideActiveMenu = function() {
	if(haxapp.ui.Menu.activeMenu) {
        var parentElement = haxapp.ui.Menu.activeMenu.getParentElement();
        var menuElement = haxapp.ui.Menu.activeMenu.getMenuElement();
        var menuHeader = haxapp.ui.Menu.activeMenu.getMenuHeader();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            haxapp.ui.Menu.activeMenu = null;
        }	
        if(menuHeader) {
            menuHeader.restoreNormalAppearance();
        }
	}
}

haxapp.ui.Menu.nonMenuMouseHandler = null;

haxapp.ui.Menu.initialize = function() {
	window.addEventListener("mousedown",haxapp.ui.Menu.nonMenuPressed);
	haxapp.ui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
haxapp.ui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",haxapp.ui.Menu.nonMenuPressed);
	haxapp.ui.Menu.initialized = false;
}
	;
/** This is a menu component, attached to the given dom element
 *
 * @class 
 */
haxapp.ui.MenuHeader = function(domElement) {
	
	//initialize menus, if needed
	if(!haxapp.ui.Menu.initialized) {
		haxapp.ui.Menu.initialize();
	}
	
    //variables
    this.domElement = domElement;
    this.menuBody = new haxapp.ui.MenuBody();
	
    //construct the menu
	this.initHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHeader(this);
}

//style info
haxapp.ui.MenuHeader.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "border":"",
    "backgroundColor":"",
    "padding":"2px"
}
haxapp.ui.MenuHeader.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "backgroundColor":"lightgray",
    "padding":"2px"
}

/** this returns the dom element for the menu heading. */
haxapp.ui.MenuHeader.prototype.getElement = function() {
    return this.domElement;
}

/** this returns the dom element for the menu object. */
haxapp.ui.MenuHeader.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.removeMenuItem = function(title) {
	this.menuBody.removeMenuItem(title);
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.initHeadingElement = function() {
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_BASE_STYLE);
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
	
    var instance = this;
    this.domElement.onmousedown = function(e) {
        haxapp.ui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }	
	
    this.domElement.onmouseenter = function(e) {
		haxapp.ui.applyStyle(instance.domElement,haxapp.ui.MenuHeader.MENU_HEADING_HOVER_STYLE);
        haxapp.ui.Menu.menuHeaderEntered(instance);
    }
	this.domElement.onmouseleave = function(e) {
        haxapp.ui.applyStyle(instance.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.restoreNormalAppearance = function() {
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
}
;
/** This is a menu component
 *
 * @class 
 */
haxapp.ui.MenuBody = function() {
	
	//initialize menus, if needed
	if(!haxapp.ui.Menu.initialized) {
		haxapp.ui.Menu.initialize();
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

//style info
haxapp.ui.MenuBody.MENU_STYLE = {
    //fixed
    "overflow":"visible",
    "position":"absolute",
    "top":"100%",
    "left":"0%",
    "zIndex":"2000",
    
    //configurable
    "border":"1px solid lightgray",
    "backgroundColor":"white"
}
haxapp.ui.MenuBody.MENU_ITEM_BASE_STYLE = {
    //fixed
    "cursor":"default",
    "display":"table"
}
haxapp.ui.MenuBody.MENU_ITEM_NORMAL_STYLE = {
    //configurable
    "backgroundColor":"",
    "padding":"2px"
}
haxapp.ui.MenuBody.MENU_ITEM_HOVER_STYLE = {
    //configurable
    "backgroundColor":"lightgray",
    "padding":"2px"
}

/** This method replaces on spaces with &nbsp; spaces. It is intedned to prevent
 * wrapping in html. */
haxapp.ui.MenuBody.convertSpacesForHtml = function(text) {
    return text.replace(/ /g,"&nbsp;");
}


/** this returns the dom element for the menu object. */
haxapp.ui.MenuBody.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getParentElement = function() {
    return this.parentElement;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getMenuHeader = function() {
    return this.menuHeader;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getIsContext = function() {
    return (this.menuHeader == null);
}

/** This method is used to attach the menu to the menu head, in a static menu. */
haxapp.ui.MenuBody.prototype.attachToMenuHeader = function(menuHeader) {
    //attach menu to heading
    this.parentElement = menuHeader.getElement();
    this.menuDiv.style.left = "0%";
    this.menuDiv.style.top = "100%";
    
    this.menuHeader = menuHeader;
}

/** This method is used to set the position for a context menu. The x and y coordinates
 * should be the coordinates in the parent element. It is recommended to use the 
 * document body. */
haxapp.ui.MenuBody.prototype.setPosition = function(x, y, parentElement) {
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

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.eventData = eventData;
    itemInfo.eventManager = eventManager;
    this.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addCallbackMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
    this.addMenuItem(itemInfo);
}
    
/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addMenuItem = function(itemInfo) {
    itemInfo.element = document.createElement("div");
    haxapp.ui.applyStyle(itemInfo.element,haxapp.ui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    
    var title = haxapp.ui.MenuBody.convertSpacesForHtml(itemInfo.title);
    itemInfo.element.innerHTML = title;
	
    itemInfo.element.onmousedown = function(event) {
		event.stopPropagation();
    }
	itemInfo.element.onmouseup = function(event) {
		//close menu
		haxapp.ui.Menu.hideActiveMenu();
        
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
        haxapp.ui.applyStyle(itemInfo.element,haxapp.ui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    }
	//css hover did not work with drag
	itemInfo.element.onmouseenter= function(e) {
        haxapp.ui.applyStyle(itemInfo.element,haxapp.ui.MenuBody.MENU_ITEM_HOVER_STYLE);
    }
	itemInfo.element.onmouseleave= function(e) {
        haxapp.ui.applyStyle(itemInfo.element,haxapp.ui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    }
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[itemInfo.title] = itemInfo;
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.setMenuItems = function(itemInfos) {
    for(var i = 0; i < itemInfos.length; i++) {
        this.addMenuItem(itemInfos[i]);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.removeMenuItem = function(title) {
    var itemInfo = this.menuItems[title];
    if(itemInfo) {
        this.menuDiv.removeChild(itemInfo.element);
        delete this.menuItems[title];
    }
}

//================================
// Init
//================================

/** This method creates the menu body that is shown below the header. */
haxapp.ui.MenuBody.prototype.createMenuElement = function() {
    this.menuDiv = document.createElement("div");

    //style like a normal manu
    haxapp.ui.applyStyle(this.menuDiv,haxapp.ui.MenuBody.MENU_STYLE);
}
;
haxapp.jsonedit = {};

var OBJECT_CONSTRUCTOR = {}.constructor;
var ARRAY_CONSTRUCTOR = [].constructor;
var STRING_CONSTRUCTOR = "".constructor;
var NUMBER_CONSTRUCTOR = (0).constructor;
var BOOLEAN_CONSTRUCTOR = (true).constructor;

//inputs to this should be "object", "array" or "value". Other type objects will not be processed properly
haxapp.jsonedit.getObjectType = function(data) {
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
haxapp.jsonedit.getValueType = function(value) {
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

haxapp.jsonedit.isBoolString = function(stringValue) {
    return (stringValue === "false" || stringValue === "true");
}

haxapp.jsonedit.isNullString = function(stringValue) {
    return (stringValue === "null");
}

//This method retuns true if the stringToNonString method will successfully convet the object.
haxapp.jsonedit.canBeConvertedToNonString = function(stringValue) {
	return(isFinite(stringValue) || haxapp.jsonedit.isBoolString(stringValue) || haxapp.jsonedit.isNullString(stringValue) );
}

//This method coverts a string value to non-string value (currently a number or boolean). 
//If the conversion fails, it returns the string value.
//before the method is called it should be checked that it is a valid
//number or boolean.
haxapp.jsonedit.stringToNonString = function(stringValue) {
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
haxapp.jsonedit.createIndentElement = function(indentLevel) {
	var cell = document.createElement("div");
	cell.className = "indentCell";
	cell.style.width = (PIXELS_PER_INDENT * indentLevel) + "px";
	return cell;
}

haxapp.jsonedit.createObjectDelimiter = function(delimiter) {
	var cell = document.createElement("div");
	cell.className = "objectDelimCell";
	cell.innerHTML = delimiter;
	return cell;
}
haxapp.jsonedit.createExpandButton = function(valueEntry) {
	var cell = document.createElement("div");
	cell.className = "buttonCell";
	cell.innerHTML = "+";
	cell.onclick = function() {
		valueEntry.setExpanded(true);
	}
	return cell;
}
haxapp.jsonedit.createContractButton = function(valueEntry) {
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
haxapp.jsonedit.KeyEntry = function(editArea,parentValue,key,keyType,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.key = key;
	this.type = keyType; //haxapp.jsonedit.EditField.FIELD_TYPE_KEY ro haxapp.jsonedit.EditField.FIELD_TYPE_INDEX
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

haxapp.jsonedit.KeyEntry.prototype.setKey = function(key) {
	this.key = key;
    this.keyEditObject.setValue(key);
}

haxapp.jsonedit.KeyEntry.prototype.getInitialKey = function() {
	return this.key;
}

haxapp.jsonedit.KeyEntry.prototype.getCurrentKey = function() {
	return this.keyEditObject.getValue();
}

haxapp.jsonedit.KeyEntry.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

haxapp.jsonedit.KeyEntry.prototype.getElement = function() {
	return this.body;
}

haxapp.jsonedit.KeyEntry.prototype.getParentValueObject = function() {
	return this.parentValue;
}

haxapp.jsonedit.KeyEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

haxapp.jsonedit.KeyEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;
	this.keyEditObject.setIsVirtual(isVirtual);

    this.valueEntry.setIsVirtual(isVirtual);
}

haxapp.jsonedit.KeyEntry.prototype.updateValueElements = function() {
    //remove all from element
	hax.util.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

//=================================
// Others Methods
//=================================

/** This method created the key entry, clearing the old one if applicable.
 * @private */
haxapp.jsonedit.KeyEntry.prototype.createBody = function(entryData) {
	
	//create main row
	//create row div
	this.body = document.createElement("div");
	this.body.className = "jsonBody";
    
    //create the key
    this.createKeyElement();
    
    //create value entry
	this.valueEntry = new haxapp.jsonedit.ValueEntry(this.editArea,this,entryData,this.isEditable,this.isVirtual);
	
    this.formatBody();
}

/** @private */
haxapp.jsonedit.KeyEntry.prototype.formatBody = function() {
	//add indent
	this.body.appendChild(haxapp.jsonedit.createIndentElement(this.indentLevel));
	
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
haxapp.jsonedit.KeyEntry.prototype.createKeyElement = function() {
    
	var isEditable = (this.type === haxapp.jsonedit.EditField.FIELD_TYPE_KEY) ? this.isEditable : false;
	
    this.keyEditObject = new haxapp.jsonedit.EditField(this.key,this.type,isEditable,this.isVirtual);
    
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
haxapp.jsonedit.KeyEntry.prototype.navigateCells = function(direction) {
    if(this.parentValue) {
        this.parentValue.navigateChildren(this,true,direction);
    }
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
haxapp.jsonedit.KeyEntry.prototype.loadContextMenu = function(parentKeyCount,keyIndex) {

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
        
        var contextMenu = new haxapp.ui.MenuBody();
        
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
        
        haxapp.ui.Menu.showContextMenu(contextMenu,event);
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

haxapp.jsonedit.KeyEntry.prototype.convertToKeyType = function(key) {
    if(this.type == haxapp.jsonedit.EditField.FIELD_TYPE_KEY) return;
    
    this.type = haxapp.jsonedit.EditField.FIELD_TYPE_KEY;
    this.key = String(key);
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
	hax.util.removeAllChildren(this.body);
    this.formatBody();
}

haxapp.jsonedit.KeyEntry.prototype.convertToIndexType = function(index) {
    if(this.type == haxapp.jsonedit.EditField.FIELD_TYPE_INDEX) return;
    
    this.type = haxapp.jsonedit.EditField.FIELD_TYPE_INDEX;
    this.key = index;
    
    //create the key
    this.createKeyElement();
    
    //remove and reset all from element
    hax.util.removeAllChildren(this.body);
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
haxapp.jsonedit.ValueEntry = function(editArea,parent,data,isEditable,isVirtual) {
    this.editArea = editArea;
	this.parent = parent;
    this.data = data;
	this.isEditable = isEditable;
	this.type = haxapp.jsonedit.getObjectType(data); //"value", "object", "array"

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

haxapp.jsonedit.ValueEntry.prototype.getInitialValue = function() {
    return this.data;
}

haxapp.jsonedit.ValueEntry.prototype.getCurrentValue = function() {
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

haxapp.jsonedit.ValueEntry.prototype.getType = function() {
	return this.type;
}

haxapp.jsonedit.ValueEntry.prototype.setExpanded = function(isExpanded) {
	this.isExpanded = isExpanded;
    this.doExpandContract();
}

haxapp.jsonedit.ValueEntry.prototype.getElementList = function() {
	return this.elementList;
}

haxapp.jsonedit.ValueEntry.prototype.getValueEditObject = function() {
	return this.valueEditObject;
}

haxapp.jsonedit.ValueEntry.prototype.getIndentLevel = function() {
	return this.indentLevel;
}

haxapp.jsonedit.ValueEntry.prototype.setIsVirtual = function(isVirtual) {
	this.isVirtual = isVirtual;  
    
	this.valueEditObject.setIsVirtual(isVirtual);
}



//----------------------------
// Navigation between cells
//----------------------------

/** This navigates to a next cell on completion of editing. 
 * @private */
haxapp.jsonedit.ValueEntry.prototype.navigateCells = function(direction) {
    var parentValue = this.parent.getParentValueObject();
    if(parentValue) {
        parentValue.navigateChildren(this.parent,false,direction);
    }
}

/** This method determines the place to navigation to, and starts editing there
 * if the re is a valid location. 
 * @private */
haxapp.jsonedit.ValueEntry.prototype.navigateChildren = function(keyEntry,originIsKey,direction) {
    
    //gerate the nav fruls
    var destIsKey = false;
    var deltaIndex = 0;
    var doMove;
    
    if(this.type == "array") {
        if((direction == haxapp.jsonedit.EditField.DIRECTION_NEXT)||(direction == haxapp.jsonedit.EditField.DIRECTION_DOWN)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 1;
            }
        }
        else if((direction == haxapp.jsonedit.EditField.DIRECTION_PREV)||(direction == haxapp.jsonedit.EditField.DIRECTION_UP)) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = -1;
            }
        }
        else if((direction == haxapp.jsonedit.EditField.DIRECTION_RIGHT)||(direction == haxapp.jsonedit.EditField.DIRECTION_LEFT)) {
            doMove = false;
        }
    }
    else if(this.type == "object") {
        if(direction == haxapp.jsonedit.EditField.DIRECTION_NEXT) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? 0 : 1;  
        }
        else if(direction == haxapp.jsonedit.EditField.DIRECTION_PREV) {
            doMove = true;
            destIsKey = !originIsKey;
            deltaIndex = originIsKey ? -1 : 0; 
        }
        else if(direction == haxapp.jsonedit.EditField.DIRECTION_RIGHT) {
            doMove = originIsKey;
            if(doMove) {
                destIsKey = false;
                deltaIndex = 0; 
            }
        }
        else if(direction == haxapp.jsonedit.EditField.DIRECTION_LEFT) {
            doMove = !originIsKey;
            if(doMove) {
                destIsKey = true;
                deltaIndex = 0; 
            }
        }
        else if(direction == haxapp.jsonedit.EditField.DIRECTION_UP) {
            doMove = true;
            destIsKey = originIsKey;
            deltaIndex = -1; 
        }
        else if(direction == haxapp.jsonedit.EditField.DIRECTION_DOWN) {
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
haxapp.jsonedit.ValueEntry.prototype.insertElement = function(key,value,index) {

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
        childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,key,"key",value,this.isEditable,false);     
    }
    else if(this.type == "array") {
        childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,index,"index",value,this.isEditable,false);
        
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
haxapp.jsonedit.ValueEntry.prototype.moveChildKeyToNextIndex = function(index) {
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
haxapp.jsonedit.ValueEntry.prototype.deleteChildElement = function(keyEntry) {
    
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


haxapp.jsonedit.ValueEntry.prototype.convertibleToNumber = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = haxapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return isFinite(currentValue);
        }
    }
    return false;
}

haxapp.jsonedit.ValueEntry.prototype.convertibleToBool = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = haxapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return haxapp.jsonedit.isBoolString(currentValue);
        }
    }
    return false;
}

haxapp.jsonedit.ValueEntry.prototype.convertibleToNull = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = haxapp.jsonedit.getValueType(currentValue);
        if(valueType === "string") {
            return haxapp.jsonedit.isNullString(currentValue);
        }
    }
    return false;
}

//this converts a string to a number or boolean
haxapp.jsonedit.ValueEntry.prototype.valueToNonString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = haxapp.jsonedit.stringToNonString(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}

haxapp.jsonedit.ValueEntry.prototype.convertibleToString = function() {
    if(this.type === "value") {
        var currentValue = this.getCurrentValue();
        var valueType = haxapp.jsonedit.getValueType(currentValue);
        return (valueType !== "string");
    }
    return false;
}

haxapp.jsonedit.ValueEntry.prototype.valueToString = function() {
    var currentValue = this.getCurrentValue();
    //change the data in this object
    var newData = String(currentValue);
    this.valueEditObject.setValue(newData);
    
    //notify of edit
    this.editArea.valueEdited();
}


haxapp.jsonedit.ValueEntry.prototype.valueToArray = function() {
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

haxapp.jsonedit.ValueEntry.prototype.valueToObject = function() {
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

haxapp.jsonedit.ValueEntry.prototype.objectToArray = function() {
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

haxapp.jsonedit.ValueEntry.prototype.arrayToObject = function() {
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

haxapp.jsonedit.ValueEntry.prototype.convertToValue = function() {
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
haxapp.jsonedit.ValueEntry.prototype.createValueEntry = function(elementsData) {
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
haxapp.jsonedit.ValueEntry.prototype.createChildKeyEntries = function(elementsData) {
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
            childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,key,"key",elementsData[key],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

        //add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }
    else if(this.type == "array") {
        for(var keyIndex = 0; keyIndex < elementsData.length; keyIndex++) {
            childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index",elementsData[keyIndex],this.isEditable,false);
            this.childKeyEntries.push(childKeyEntry);
        }

		//add a dummy entry if this is editable
		if(this.isEditable) {
			childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,keyIndex,"index","",this.isEditable,true);
			this.virtualChildKey = childKeyEntry;
		}
    }

}

/** This create the dom element list for the child key entries 
* @private */
haxapp.jsonedit.ValueEntry.prototype.createElementList = function() {

    //initialize elements
	this.listDiv = document.createElement("div");
    this.elementList = [];
    this.contractedList = [];
    this.expandedList = [];
    
    var startDelimiter;
    var endDelimiter1;
    var endDelimiter2;
    var endIndent = haxapp.jsonedit.createIndentElement(this.indentLevel);

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
    var expandButton = haxapp.jsonedit.createExpandButton(this);
    var contractButton = haxapp.jsonedit.createContractButton(this);

    if(this.type == "object") { 
        startDelimiter = haxapp.jsonedit.createObjectDelimiter("{");
        endDelimiter1 = haxapp.jsonedit.createObjectDelimiter("}");
        endDelimiter2 = haxapp.jsonedit.createObjectDelimiter("}");
    }
    else if(this.type == "array") {
        startDelimiter = haxapp.jsonedit.createObjectDelimiter("[");
        endDelimiter1 = haxapp.jsonedit.createObjectDelimiter("]");
        endDelimiter2 = haxapp.jsonedit.createObjectDelimiter("]");
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
haxapp.jsonedit.ValueEntry.prototype.updateChildKeys = function() {
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


haxapp.jsonedit.ValueEntry.prototype.doExpandContract = function() {
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
haxapp.jsonedit.ValueEntry.prototype.createValueElement = function(data) {

    //create a simple element
    this.valueEditObject = new haxapp.jsonedit.EditField(data,haxapp.jsonedit.EditField.FIELD_TYPE_VALUE,this.isEditable,this.isVirtual);
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
haxapp.jsonedit.ValueEntry.prototype.makeVirtualEntryReal = function(data) {
    var newRealEntry = this.virtualChildKey
    newRealEntry.setIsVirtual(false);
    this.childKeyEntries.push(newRealEntry);
    
    var childKeyEntry;
    if(this.type == "object") { 
        //add a dummy entry
        childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,"","key","",this.isEditable,true);
        this.virtualChildKey = childKeyEntry;
    }
    else if(this.type == "array") {
        //add a dummy entry
        childKeyEntry = new haxapp.jsonedit.KeyEntry(this.editArea,this,this.childKeyEntries.length,"index","",this.isEditable,true);
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
haxapp.jsonedit.EditField = function (value,fieldType,isEditable,isVirtual) {
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

haxapp.jsonedit.EditField.FIELD_TYPE_VALUE = "value";
haxapp.jsonedit.EditField.FIELD_TYPE_KEY = "key";
haxapp.jsonedit.EditField.FIELD_TYPE_INDEX = "index";

haxapp.jsonedit.EditField.prototype.setOnEditCallback= function(onEdit) {
    return this.onEdit = onEdit;
}

haxapp.jsonedit.EditField.prototype.setNavCallback = function(onNavigate) {
    this.onNavigate = onNavigate;
}

haxapp.jsonedit.EditField.prototype.setIsVirtual = function(isVirtual) {
    this.isVirtual = isVirtual;
	this.setCssClass();
}

haxapp.jsonedit.EditField.prototype.getValue= function() {
    return this.value;
}

haxapp.jsonedit.EditField.prototype.setValue = function(value) {
	
	if(value === undefined) {
		value = null;
		console.log("The value undefined is not valid for a JSON. It has been converted to null.");
	}
	
    this.value = value;
    this.isString = (haxapp.jsonedit.getValueType(value) === "string");
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
haxapp.jsonedit.EditField.prototype.setCssClass = function() {
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

haxapp.jsonedit.EditField.prototype.getElement = function() {
    return this.element;
}

haxapp.jsonedit.EditField.prototype.onClick = function() {
    if((this.isEditable)&&(!this.editField)) {
        this.startEdit();
    }
 
}

haxapp.jsonedit.EditField.prototype.startEdit = function() {
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
		
		hax.util.removeAllChildren(this.element);
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

haxapp.jsonedit.EditField.prototype.endEdit = function() {
    if(this.editField) {
        var newValue = this.editField.value;
        if(newValue != this.value) {
            //read the value, in the appropriate format
            var editStringValue = this.editField.value;
            var editValue;
            if((!this.isString)||(this.value === "")) {
				//try to convert to a number if the original value was a number if it was an empty string
                if(haxapp.jsonedit.canBeConvertedToNonString(editStringValue)) {
                    editValue = haxapp.jsonedit.stringToNonString(editStringValue);
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

haxapp.jsonedit.EditField.DIRECTION_NONE = 0;
haxapp.jsonedit.EditField.DIRECTION_UP = 1;
haxapp.jsonedit.EditField.DIRECTION_DOWN = 2;
haxapp.jsonedit.EditField.DIRECTION_RIGHT = 3;
haxapp.jsonedit.EditField.DIRECTION_LEFT = 4;
haxapp.jsonedit.EditField.DIRECTION_NEXT = 5;
haxapp.jsonedit.EditField.DIRECTION_PREV = 6;

haxapp.jsonedit.EditField.ENTER_KEY = 13;
haxapp.jsonedit.EditField.TAB_KEY = 9;
haxapp.jsonedit.EditField.UP_KEY = 38;
haxapp.jsonedit.EditField.DOWN_KEY = 40;
haxapp.jsonedit.EditField.RIGHT_KEY = 39;
haxapp.jsonedit.EditField.LEFT_KEY = 37;

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


haxapp.jsonedit.EditField.prototype.onKeyDown = function(event) {
    var doExit = false;
    var direction = haxapp.jsonedit.EditField.DIRECTION_NONE;
    var cancelDefault = false;
    if(event.keyCode == haxapp.jsonedit.EditField.ENTER_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? haxapp.jsonedit.EditField.DIRECTION_PREV : haxapp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
	}
    else if(event.keyCode == haxapp.jsonedit.EditField.TAB_KEY) {
        //next or prev, based on shift key
        doExit = true;
        direction = event.shiftKey ? haxapp.jsonedit.EditField.DIRECTION_PREV : haxapp.jsonedit.EditField.DIRECTION_NEXT;
        cancelDefault = true;
    }
    else if(event.keyCode == haxapp.jsonedit.EditField.UP_KEY) {
        doExit = true;
        direction = haxapp.jsonedit.EditField.DIRECTION_UP;
        cancelDefault = true;
    }
    else if(event.keyCode == haxapp.jsonedit.EditField.DOWN_KEY) {
        doExit = true;
        direction = haxapp.jsonedit.EditField.DIRECTION_DOWN;
        cancelDefault = true;
    }
    else if(event.keyCode == haxapp.jsonedit.EditField.RIGHT_KEY) {
        if(this.cursorAtEndOfEditField()) {
            doExit = true;
            direction = haxapp.jsonedit.EditField.DIRECTION_RIGHT;
            cancelDefault = true;
        }
    }
    else if(event.keyCode == haxapp.jsonedit.EditField.LEFT_KEY) {
        if(this.cursorAtStartOfEditField()) {
            doExit = true;
            direction = haxapp.jsonedit.EditField.DIRECTION_LEFT;
            cancelDefault = true;
        }
    }
    
    if(cancelDefault) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if(doExit) {
        this.endEdit();
        if((direction != haxapp.jsonedit.EditField.DIRECTION_NONE)&&(this.onNavigate)) {
            this.onNavigate(direction);
        }
    }
}

haxapp.jsonedit.EditField.prototype.cursorAtStartOfEditField = function() {
    return ((this.editField.selectionStart == 0)&&(this.editField.selectionEnd == 0));
}

haxapp.jsonedit.EditField.prototype.cursorAtEndOfEditField = function() {
    var length = String(this.editField.value).length;
    return ((this.editField.selectionStart == length)&&(this.editField.selectionEnd == length));
};

haxapp.jsonedit.JsonEditArea = function(divElement,initialValue,isEditable) {
    this.body = divElement;
	this.isEditable = isEditable;
	
	//undefined is not a valid json value and will screw things up
	if(initialValue === undefined) {
		initialValue = "";
	}
    
	this.valueEntry = new haxapp.jsonedit.ValueEntry(this,this,initialValue,this.isEditable);
    this.valueEntry.setExpanded(true);
 
	this.formatBody();
}

haxapp.jsonedit.JsonEditArea.prototype.setEditCallback = function(editCallback) {
	this.editCallback = editCallback;
}

haxapp.jsonedit.JsonEditArea.prototype.getCurrentValue = function() {
	return this.valueEntry.getCurrentValue();
}

haxapp.jsonedit.JsonEditArea.prototype.getElement = function() {
	return this.body;
}

haxapp.jsonedit.JsonEditArea.prototype.getParentValueObject = function() {
	return undefined;
}

haxapp.jsonedit.JsonEditArea.prototype.getIndentLevel = function() {
	return 0;
}

haxapp.jsonedit.JsonEditArea.prototype.formatBody = function() {
    var elementList = this.valueEntry.getElementList();
    for(var i = 0; i < elementList.length; i++) {
        this.body.appendChild(elementList[i]);
    }
    
    this.loadContextMenu();
}


haxapp.jsonedit.JsonEditArea.prototype.loadContextMenu = function() {

    var instance = this;
    var element = this.body;
    var valueEntry = this.valueEntry;
    var valueType = valueEntry.getType();
    element.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        var contextMenu = new haxapp.ui.MenuBody();
        
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
        
        haxapp.ui.Menu.showContextMenu(contextMenu,event);
    }
  
}

haxapp.jsonedit.JsonEditArea.prototype.updateValueElements = function() {
    //remove all from element
	hax.util.removeAllChildren(this.body);
    //recreate
    this.formatBody();
}

/** This methd is called internally when an edit takes place in the edit are. 
 * @private */
haxapp.jsonedit.JsonEditArea.prototype.valueEdited = function() {
    if(this.editCallback) {
        this.editCallback();
    }
}




;
/** This file provides a resize listener. The element must be a positioned element
 * (position must be set to something besides static. It can only be called once (!)
 * 
 * It places an iframe inside the element to be tested and uses the onresize of the 
 * iframe document body.
 */

haxapp.ui.setResizeListener = function(element, resizeCallback){

    var styleJson = {
        "position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"100%",
        "height":"100%",
        "overflow":"hidden",
        "zIndex":-1
    };

    var onLoadCallback = function() {
        var dummyFrameBody = dummyFrameElement.contentDocument.body;
        dummyFrameBody.onresize = resizeCallback; 

        //do an initial callback for each
        resizeCallback();

        //we can do an on load too
        //onloadCallback();
    }

    //create and attach element
    var dummyFrameElement = haxapp.ui.createElement("iframe",null,styleJson);
    dummyFrameElement.onload = onLoadCallback;
    element.appendChild(dummyFrameElement);
}

haxapp.ui.removeResizeListener = function(element, resizeCallback){
    alert("implement this!");
}


;
haxapp.app = {};
haxapp.app.dialog = {};

/** This is the main class of the hax application. */
haxapp.app.Hax = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    hax.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUIs = {};
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new haxapp.app.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI
	this.createUI(containerId);
    
    //open a workspace - from url or default
    var workspaceUrl = hax.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        haxapp.app.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
    else {
        //create a default workspace 
        haxapp.app.createworkspace.createWorkspace(this,haxapp.app.Hax.DEFAULT_WORKSPACE_NAME);
    }
}
	
//add components to this class
hax.util.mixin(haxapp.app.Hax,hax.EventManager);

haxapp.app.Hax.DEFAULT_WORKSPACE_NAME = "workspace";

haxapp.app.Hax.prototype.getWorkspace = function(name) {
    var workspaceUI = this.getWorkspaceUI(name);
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

haxapp.app.Hax.prototype.getWorkspaceUI = function(name) {
	return this.workspaceUIs[name];
}

haxapp.app.Hax.prototype.getActiveWorkspaceUI = function() {
    var name = this.tabFrame.getActiveTabTitle();
    if(name) {
        return this.workspaceUIs[name];
    }
    else {
        return null;
    }
}

haxapp.app.Hax.prototype.getActiveWorkspace = function() {
    var workspaceUI = this.getActiveWorkspaceUI();
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
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
haxapp.app.Hax.prototype.addWorkspaceUI = function(workspaceUI,name) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUIs[name]) {
        throw hax.util.createError("There is already an open workspace with the name " + name,false);
    }
    
	var tab = this.tabFrame.addTab(name);
    this.tabFrame.setActiveTab(name);
    workspaceUI.setApp(this,tab);
    this.workspaceUIs[name] = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
haxapp.app.Hax.prototype.removeWorkspaceUI = function(name) {
    //remove the workspace from the app
    delete this.workspaceUIs[name];
    this.tabFrame.removeTab(name);
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
haxapp.app.Hax.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(workspaceName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
haxapp.app.Hax.prototype.registerComponent = function(componentGenerator) {
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
haxapp.app.Hax.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
haxapp.app.Hax.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(haxapp.app.JsonTableComponent.generator);
    this.registerStandardComponent(haxapp.app.GridTableComponent.generator);
	this.registerStandardComponent(haxapp.app.FolderComponent.generator);
	this.registerStandardComponent(haxapp.app.FunctionComponent.generator);
    this.registerStandardComponent(haxapp.app.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(haxapp.app.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
haxapp.app.Hax.prototype.registerStandardComponent = function(componentGenerator) {
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
haxapp.app.Hax.prototype.createUI = function(containerId) {
    
    var windowElements = haxapp.ui.initWindows(containerId);
    var topContainer = windowElements.baseElement;
    
    var container = document.createElement("div");
    var containerStyle = {
        "position":"relative",
        "display":"table",
        "width":"100%",
        "height":"100%"
    };
    haxapp.ui.applyStyle(container,containerStyle);
    topContainer.appendChild(container);
    
    //-------------------
    //create menus - note this functino is defined differently for web and electron, in a remote file
    //-------------------
    var menuBar = this.createMenuBar();
    container.appendChild(menuBar);

    //----------------------
    //create the tab frame - there is a tab for each workspace
    //--------------------------
    
    var tabFrameDiv = document.createElement("div");
    var tabFrameDivStyle = {
        "position":"relative",
        "backgroundColor":"white",
        "display":"table-row",
        "width":"100%",
        "height":"100%"
    }
    haxapp.ui.applyStyle(tabFrameDiv,tabFrameDivStyle);
    container.appendChild(tabFrameDiv);
    
    var options = {};
    options.tabBarColorClass = "visicomp_tabFrameColor";
    options.activeTabColorClass = "visicomp_tabFrameActiveColor";
    this.tabFrame = new haxapp.ui.TabFrame(tabFrameDiv,options);
    
}

//=================================
// Menu Functions
//=================================

haxapp.app.Hax.prototype.populateAddChildMenu = function(menu,optionalInitialValues,optionalComponentOptions) {
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        var title = "Add " + generator.displayName;
        var callback = haxapp.app.updatecomponent.getAddComponentCallback(this,generator,optionalInitialValues,optionalComponentOptions);
        menu.addCallbackMenuItem(title,callback);
    }

    //add the additional component item
    var componentCallback = haxapp.app.addadditionalcomponent.getAddAdditionalComponentCallback(this,optionalInitialValues,optionalComponentOptions);
    menu.addCallbackMenuItem("Other Components...",componentCallback);
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
haxapp.app.Hax.prototype.setFolderContextMenu = function(contentElement,folder) {
    
    var app = this;

    var initialValues = {};
    initialValues.parentKey = haxapp.app.WorkspaceUI.getObjectKey(folder);
    
    contentElement.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        //position the window if we can
        if(event.offsetX) {
            var componentOptions = {};
            var coordInfo = {};
            coordInfo.x = event.offsetX;
            coordInfo.y = event.offsetY;
            componentOptions.coordInfo = coordInfo;
        }
        
        var contextMenu = new haxapp.ui.MenuBody();
        app.populateAddChildMenu(contextMenu,initialValues,componentOptions);
        
        haxapp.ui.Menu.showContextMenu(contextMenu,event);
    }
}

;

/** This is the main class of the hax application. */
haxapp.app.LinkManager = function() {
	//external links infrastructure
	this.linkMap = {};
}

/** This method adds links as registered by a given workspace. Links can be added and
 * removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * workspase. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page.
 * The arguments "addList" and"removeList" are arrays with the entries {"link":(url),"type":("js" or "css")}
 */
haxapp.app.LinkManager.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	
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
				linkWorkspaces.push(workspaceName);
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
			linkWorkspaces.push(workspaceName);
			this.linkMap[link] = linkWorkspaces;
			this.addLinkToPage(link,type,responseProcessor);
		}
	}
}

haxapp.app.LinkManager.prototype.addLinkToPage = function(link,type,responseProcessor) {
	
	if(type === "js") {
		haxapp.app.LinkManager.addJsLink(link,responseProcessor)
	}
	else if(type === "css") {
		haxapp.app.LinkManager.addCssLink(link,responseProcessor);
	}
}

haxapp.app.LinkManager.prototype.removeLinkFromPage = function(link,type) {
	//for now do not remove js link, only css
	//we can not unexectue the js script
	//css does get removed
	if(type === "css") {
		haxapp.app.LinkManager.removeLink(link);
		return true;
	}
	else {
		return false;
	}
}

/** @private */
haxapp.app.LinkManager.addJsLink = function(link,responseProcessor) {

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
        element = haxapp.ui.createElement("script",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
haxapp.app.LinkManager.addCssLink = function(link,onResponseProcessor) {
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
        element = haxapp.ui.createElement("link",linkProps);
        document.head.appendChild(element);
    }
	else {
		alert("THIS SHOULDN'T HAPPEN!");
	}
}

/** @private */
haxapp.app.LinkManager.removeLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(element) {
        document.head.removeChild(element);
    }
}

/** This returns an object that manages calling the given callback when all requested links
 * are loaded.
 * @private */
haxapp.app.LinkManager.prototype.getResponseProcessor = function(addList,linksLoadedCallback) {
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
/** This is a mixin that encapsulates the base functionality of a Component
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.app.Component = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.Component.init = function(workspaceUI,object,generator,options) {
    
    if(!options) {
        options = {};
    }
    
    this.workspaceUI = workspaceUI;
    this.object = object;
    this.generator = generator;
    
    this.parentContainer = this.workspaceUI.getParentContainerObject(object);
    if(!this.parentContainer) {
        throw hax.util.createError("Parent object not found: " + object.getFullName());
    }
    
    this.workspaceUI.registerMember(this.object,this);
    
    //inheriting objects can pass functions here to be called on cleanup
    this.cleanupActions = [];
    
    //--------------
    //create window
    //--------------
    var windowOptions = {};
    windowOptions.minimizable = true;
    windowOptions.maximizable = true;
    windowOptions.resizable = true;
    windowOptions.movable = true;
    windowOptions.frameColorClass = "visicomp_windowColor";
    windowOptions.titleBarClass = "visicomp_titleBarClass";
    this.window = new haxapp.ui.WindowFrame(this.parentContainer,windowOptions);

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = this.window.getMenu();
    
    //------------------
    //set the title
    //------------------
    this.window.setTitle(this.getObject().getDisplayName());
    
    //show the window
    if(options.coordInfo) {
        this.window.setCoordinateInfo(options.coordInfo);
    }
    else {
        //set position 
        var pos = this.parentContainer.getNextWindowPosition();
        this.window.setPosition(pos[0],pos[1]);
        
        //set default size
        this.window.setSize(generator.DEFAULT_WIDTH,generator.DEFAULT_HEIGHT);
    }
    if(options.windowState) {
        this.window.setWindowState(options.windowState);
    }
    this.window.show();
    
    
    //------------------
    // Add window content
    //------------------
    
    //menu items
    this.menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this,this.generator);
    this.menuItemInfoList.push(itemInfo);
    
    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    this.menuItemInfoList.push(itemInfo);
    
    //let the extending object populate the frame and the menu items
	if(this.populateFrame) {
		this.populateFrame();
	}
    
    //set the menu items
    menu.setMenuItems(this.menuItemInfoList);
}

/** This method should be called if any cleanup actions are needed on delete. */
haxapp.app.Component.addCleanupAction = function(cleanupFunction) {
    this.cleanupActions.push(cleanupFunction);
}

//=======================
// dev
//=======================

/** This method returns the base member for this component. */
haxapp.app.Component.showErrorBar = function(text) {
    if(!this.errorDiv) {
        this.errorDiv = haxapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":"red",
                "color":"white"
            });
    }
    this.errorDiv.innerHTML = text;
    this.errorBarActive = true;
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.Component.hideErrorBar = function() {
	this.errorBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.Component.showSaveBar = function(onSave,onCancel) {
    if(!this.saveDiv) {
        this.saveDiv = haxapp.ui.createElement("div",null,
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
	
	this.showActiveHeaders();
}

/** This returns true if the user is editing, as signified by the edit bar showing. */
haxapp.app.Component.editActive = function() {
    return this.saveBarActive;
}

/** This method returns the base member for this component. */
haxapp.app.Component.hideSaveBar = function() {
    this.saveBarActive = false;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.app.Component.showActiveHeaders = function() {
	var window = this.getWindow();
	
	var headers = [];
	if((this.errorBarActive)&&(this.errorDiv)) {
		headers.push(this.errorDiv);
	}
	if((this.saveBarActive)&&(this.saveDiv)) {
		headers.push(this.saveDiv);
	}
	
    window.loadHeaders(headers);
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the base member for this component. */
haxapp.app.Component.getObject = function() {
    return this.object;
}

/** This method returns the workspace for this component. */
haxapp.app.Component.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
haxapp.app.Component.getWorkspaceUI = function() {
    return this.workspaceUI;
}

/** This method populates the frame for this component. */
haxapp.app.Component.getWindow = function() {
     return this.window;
}

/** This method sets the content element as a scrolling element. */
haxapp.app.Component.setScrollingContentElement = function() {
    //load the content div
    this.contentDiv = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
    this.window.setContent(this.contentDiv);
}

/** This method sets the content element as a fixed element. */
haxapp.app.Component.setFixedContentElement = function() {
    //load the content div
    this.contentDiv = this.window.getBody();
}

/** This method returns the content element for the windowframe for this component. */
haxapp.app.Component.getContentElement = function() {
     return this.contentDiv;
}

/** This serializes the component. */
haxapp.app.Component.toJson = function() {
    var json = {};
    json.type = this.generator.uniqueName;
    
    json.coordInfo = this.window.getCoordinateInfo();
    json.windowState = this.window.getWindowState();
    
    if(this.writeToJson) {
        this.writeToJson(json);
    }
    
    return json;
}

//==============================
// Protected Instance Methods
//==============================

//This method should be populated by an extending object. It should return a json object.
//** This serializes the table component. */
//haxapp.app.Component.prototype.writeToJson = function(json);

//This method should be populated by an extending object iof it needs to add any UI elements
// to the frame.
//** This method populates the frame for this component. */
//haxapp.app.Component.populateFrame = function();

/** This method should include an needed functionality to clean up after a delete. */
haxapp.app.Component.onDelete = function() {
    //remove the UI element
    var componentWindow = this.getWindow();
    componentWindow.deleteWindow();
    
    //execute cleanup actions
    for(var i = 0; i < this.cleanupActions.length; i++) {
        this.cleanupActions[i]();
    }
}

/** This method should include an needed functionality to clean up after a delete. */
haxapp.app.Component.memberMoved = function(newParentContainer) {
        //move the window to the proper parent container
    this.parenContainer = newParentContainer;
    this.window.changeParent(newParentContainer);
    this.updateTitle();
}

/** This method extends the member udpated function from the base.
 * @protected */    
haxapp.app.Component.memberUpdated = function() {
    this.updateTitle();
}

/** This method makes sure the window title is up to date.
 * @private */    
haxapp.app.Component.updateTitle = function() {
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var member = this.getObject();
        var displayName = member.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle !== displayName) {
            window.setTitle(displayName);
        }
    }
}

/** This method is used for setting initial values in the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to give the values of those properties too. */
haxapp.app.Component.getPropertyValues = function() {
    
    var member = this.object;
    
    var values = {};
    values.name = member.getName();
    values.parentKey = haxapp.app.WorkspaceUI.getObjectKey(member.getParent());
    
    if(this.generator.addPropFunction) {
        this.generator.addPropFunction(member,values);
    }
    return values;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
haxapp.app.Component.updatePropertyValues = function(oldValues,newValues) {
    var actionResponse = new hax.ActionResponse();
    var recalculateList = [];
    var member = this.object;
    
    try {
        if((oldValues.name !== newValues.name)||(oldValues.parentKey !== newValues.parentKey)) {
            var parent = this.workspaceUI.getObjectByKey(newValues.parentKey);
            hax.movemember.moveMember(member,newValues.name,parent,recalculateList);
        }

        if(this.generator.updatePropHandler) {
            this.generator.updatePropHandler(member,oldValues,newValues,recalculateList);
        }
        
        //recalculate
        hax.calculation.callRecalculateList(recalculateList,actionResponse);
        
        hax.updatemember.fireUpdatedEventList(recalculateList);
    }
    catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for deleting the component. 
 *  @private */
haxapp.app.Component.createDeleteCallback = function() {
    var object = this.getObject();
    return function() {
        var doDelete = confirm("Are you sure you want to delete this object?");
        if(!doDelete) {
            return;
        }
        
        //delete the object - the component we be deleted after the delete event received
        var actionResponse = hax.deletemember.deleteMember(object);
        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
}

//======================================
// All components should have a generator to register the component, as below
//======================================
//
//haxapp.app.JsonTableComponent.generator = {};
//haxapp.app.JsonTableComponent.generator.displayName = "JSON Table";
//haxapp.app.JsonTableComponent.generator.uniqueName = "haxapp.app.JsonTableComponent";
//haxapp.app.JsonTableComponent.generator.createComponent = haxapp.app.JsonTableComponent.createComponent;
//haxapp.app.JsonTableComponent.generator.createComponentFromJson = haxapp.app.JsonTableComponent.createComponentFromJson;
//haxapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
//haxapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;;
/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.app.TableEditComponent = {};

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.TableEditComponent.init = function(viewTypes,defaultView,optionalClearFunctionOnBlankInfo) {
	
	this.viewTypes = viewTypes;
	this.defaultView = defaultView;
	
	this.initUI();
	
	//this.viewModeElement
    //this.viewType
    //this.viewModeElementShowing
    //this.select
	
	this.clearFunctionOnBlankInfo = optionalClearFunctionOnBlankInfo;
	this.clearFunctionActive = false;
	this.clearFunctionCallback = null;
    
    //add a cleanup action to the base component - component must already be initialized
    var instance = this;
    var cleanupAction = function() {
        instance.destroy();
    }
    this.addCleanupAction(cleanupAction);

}

/** This value is used as the background color when an editor is read only. */
haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.setViewType = function(viewType) {
	//return if there is no change
	if(this.viewType === viewType) return false;
    
    //check if we are editing
    if(this.editActive()) {
        alert("You must save or cancel the edit session to change the view mode.");
        return false;
    }
	
	//if there is an old view, remove it
	if(this.viewModeElement) {
		this.showModeElement(null);
	}
    
    this.viewModeElement = this.getViewModeElement(viewType);
    this.viewType = viewType;
    
    return true;
}

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
//haxapp.app.TableEditComponent.getViewModeElement = function(viewType);

//this function will update the view shown in the dropdown
haxapp.app.TableEditComponent.updateViewDropdown = function(viewType) {
    if(!viewType) {
        viewType = this.defaultView;
    }
    this.select.value = viewType;
}

/** This method updates the table data 
 * @private */    
haxapp.app.TableEditComponent.memberUpdated = function() {
    //call the base function
    haxapp.app.Component.memberUpdated.call(this);
    
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.showErrorBar(errorMsg);
    }
    else {   
        this.hideErrorBar();
    }
        
    if(this.viewModeElementShowing !== this.viewModeElement) {
        this.showModeElement(this.viewModeElement);
    }

    var editable = ((this.viewModeElement.isData === false)||(!object.hasCode()));

    this.viewModeElement.showData(editable);
	
	//add the clear function menu item if needed
	if(this.clearFunctionOnBlankInfo) {
	
		if(object.hasCode()) {
			if(!this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				
				if(!this.clearFunctionCallback) {
					this.clearFunctionCallback = this.getClearFunctionCallback();
				}
				
				menu.addCallbackMenuItem(this.clearFunctionOnBlankInfo.menuLabel,this.clearFunctionCallback);
				this.clearFunctionActive = true;
			}
		}
		else {
			if(this.clearFunctionActive) {
				var menu = this.getWindow().getMenu();
				menu.removeMenuItem(this.clearFunctionOnBlankInfo.menuLabel);
				this.clearFunctionActive = false;
			}
		}
	}
}

haxapp.app.TableEditComponent.getClearFunctionCallback = function() {
	var table = this.getObject();
	var blankDataValue = this.clearFunctionOnBlankInfo.dataValue;
    return function() {
        var actionResponse = hax.updatemember.updateData(table,blankDataValue); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

/** This method should be called to set up the component ui for edit mode. 
 * @protected */
haxapp.app.TableEditComponent.startEditUI = function(onSave,onCancel) {
    this.select.disabled = true;
    this.showSaveBar(onSave,onCancel);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.endEditUI = function() {
    this.hideSaveBar();
    this.select.disabled = false;
}
/** This method populates the frame for this component. 
 * @protected */
haxapp.app.TableEditComponent.initUI = function() {
	
	this.setFixedContentElement();
	
	//create the view selection ui
	this.select = haxapp.ui.createElement("select",null,{
        "marginRight":"3px",
        "backgroundColor":"transparent"
    });
    
    for(var i = 0; i < this.viewTypes.length; i++) {
        var entry = this.viewTypes[i];
        this.select.add(haxapp.ui.createElement("option",{"text":entry}));
    }
    
    //create on functions
    var instance = this;
    var onViewSet = function(event) {
        var success = instance.setViewType(instance.select.value);
        if(success) {
            instance.memberUpdated();
        }
        else {
            //make sure correct view type is displayed
            instance.updateViewDropdown(this.viewType);
        }
        return success;
    }
    
    this.select.onchange = onViewSet;
   
    //add the view select to the title bar
    this.window.addRightTitleBarElement(this.select);
    
    this.setViewType(this.defaultView);
    this.updateViewDropdown();
}

/** @private */
haxapp.app.TableEditComponent.showModeElement = function(viewModeElement) {
    
	var contentDiv = this.getContentElement();
	hax.util.removeAllChildren(contentDiv);
	
    if(viewModeElement) {
		var viewDiv = viewModeElement.getElement();
		contentDiv.appendChild(viewDiv);
	}
	
	if(this.viewModeElementShowing) {
		this.viewModeElementShowing.destroy();
	}
	this.viewModeElementShowing = viewModeElement;
}

/** @protected */
haxapp.app.TableEditComponent.destroy = function() {
    if(this.viewModeElement) {
        this.viewModeElement.destroy();
    }
}
;
/** This class manages the user interface for a workspace object. */
haxapp.app.WorkspaceUI = function() {

    this.workspace = null;
	
    //properties
	this.app = null;
    this.tab = null;
    this.componentMap = {};
    this.activeFolderName = null;
   
    this.jsLinkArray = [];
    this.cssLinkArray = [];
}

/** This sets the application. It must be done before the workspace is set. */
haxapp.app.WorkspaceUI.prototype.setApp = function(app,tab) {
    this.app = app;
    this.tab = tab;
}

/** This gets the application instance. */
haxapp.app.WorkspaceUI.prototype.getApp = function() {
    return this.app;
}

 /** This method sets the workspace. The argument componentsJson should be included
  * if the workspace is not empty, such as when opening a existing workspace. It
  * contains the data for the component associated with each workspace member. For 
  * a new empty workspace the componentsJson should be omitted. */
haxapp.app.WorkspaceUI.prototype.setWorkspace = function(workspace, componentsJson) {   
    this.workspace = workspace; 
    
    //set up the root folder
    var rootFolder = this.workspace.getRoot();
    this.registerMember(rootFolder,null);
    this.addComponentContainer(rootFolder,this.tab);
  
    //load components from json if present
    if(componentsJson) {
        this.loadFolderComponentContentFromJson(rootFolder,componentsJson);
    }
    
    //listeners
    var instance = this;
    
    //add a member updated listener
    var memberUpdatedCallback = function(memberObject) {
        instance.memberUpdated(memberObject);
    }
    this.workspace.addListener(hax.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
	
	//add child deleted listener
    var childDeletedListener = function(fullName) {
        instance.childDeleted(fullName);
    }
    this.workspace.addListener(hax.deletemember.MEMBER_DELETED_EVENT, childDeletedListener);
    var childMovedListener = function(moveInfo) {
        instance.childMoved(moveInfo);
    }
    this.workspace.addListener(hax.movemember.MEMBER_MOVED_EVENT, childMovedListener);
    
    //add context menu to create childrent
    var contentElement = this.tab.getContainerElement();
    var app = this.getApp();
    app.setFolderContextMenu(contentElement,rootFolder);
    
}

/** This method gets the workspace object. */
haxapp.app.WorkspaceUI.prototype.getWorkspace = function() {
    return this.workspace;
}

/** This method gets the component associated with a member object. */
haxapp.app.WorkspaceUI.prototype.getComponent = function(object) {
    var key = haxapp.app.WorkspaceUI.getObjectKey(object);
	var componentInfo = this.componentMap[key];
	if(componentInfo) {
		return componentInfo.component;
	}
	else {
		return null;
	}
}

/** This returns the map of component objects. */
haxapp.app.WorkspaceUI.prototype.getFolderList = function() {
	var folderList = []; 
    for(var key in this.componentMap) {
		var componentInfo = this.componentMap[key];
		if(componentInfo.parentContainer) { 
			folderList.push(key);
		}
    }
    return folderList;
}

haxapp.app.WorkspaceUI.prototype.getParentContainerObject = function(object) {
    var parent = object.getParent();
    
    //get parent component info
    var parentKey = haxapp.app.WorkspaceUI.getObjectKey(parent);
    var parentComponentInfo = this.componentMap[parentKey];
    if(!parentComponentInfo.parentContainer) {
        throw hax.util.createError("Parent container not found!");
    }
    return parentComponentInfo.parentContainer;
}

/** This method registers a member data object and its optional component object.
 * for each folder, and only folders at this point, the mehod addComponentContainer
 * should also be called to set the container for the children of this folder. */
haxapp.app.WorkspaceUI.prototype.registerMember = function(object,component) {
    
    //make sure this is for us
    if(object.getWorkspace() !== this.workspace) {
        throw hax.util.createError("Component registered in wrong workspace: " + object.getFullName());
    }
    
    //store the ui object
	var key = haxapp.app.WorkspaceUI.getObjectKey(object);
	
	if(this.componentMap[key]) {
		//already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
        throw hax.util.createError("There is already a component with the given name.",true);
	}
	
    var componentInfo = {};
    componentInfo.object = object;
	componentInfo.component = component;
	
    this.componentMap[key] = componentInfo;
    
}

/** This method sets the parent for the given component. */
haxapp.app.WorkspaceUI.prototype.addComponentContainer = function(object,parentContainer) {
    
    //store the ui object
	var key = haxapp.app.WorkspaceUI.getObjectKey(object);
	
    var componentInfo = this.componentMap[key];
    if(!componentInfo) {
		alert("Unknown error - component info not found: " + key);
		return;
	}
	componentInfo.parentContainer = parentContainer;
}
	

/** This method responds to a member updated. */
haxapp.app.WorkspaceUI.prototype.memberUpdated = function(memberObject) {
    //store the ui object
	var key = memberObject.getFullName();
	
	var componentInfo = this.componentMap[key];
	if((componentInfo)&&(componentInfo.component)) {
        componentInfo.component.memberUpdated();
    }
}

/** This method responds to a "new" menu event. */
haxapp.app.WorkspaceUI.prototype.childDeleted = function(deleteInfo) {
	
	//store the ui object
	var key = deleteInfo.fullName;
	
	var componentInfo = this.componentMap[key];
	delete this.componentMap[key];

	if((componentInfo)&&(componentInfo.component)) {
        //do any needed cleanup
        componentInfo.component.onDelete();
	}
}

/** This method responds to a "new" menu event. */
haxapp.app.WorkspaceUI.prototype.childMoved = function(moveInfo) {
    
    var componentInfo = this.componentMap[moveInfo.oldFullName];
    delete this.componentMap[moveInfo.oldFullName];
    this.componentMap[moveInfo.newFullName] = componentInfo;
    
    //update the component
	if((componentInfo)&&(componentInfo.component)) {
        var parentContainer = this.getParentContainerObject(componentInfo.object);
        componentInfo.component.memberMoved(parentContainer);
    }
}

haxapp.app.WorkspaceUI.getObjectKey = function(object) {
	return object.getFullName();
}

haxapp.app.WorkspaceUI.prototype.getObjectByKey = function(key) {
    var componentInfo = this.componentMap[key];
    if(componentInfo) {
        return componentInfo.object;
    }
    else {
        return null;
    }
}

haxapp.app.WorkspaceUI.prototype.getComponentByKey = function(key) {
    var componentInfo = this.componentMap[key];
    if(componentInfo) {
        return componentInfo.component;
    }
    else {
        return null;
    }
}

/** This method gets the workspace object. */
haxapp.app.WorkspaceUI.prototype.close = function() {
    //delete all the components - to make sure the are cleaned up
    for(var key in this.componentMap) {
        var componentInfo = this.componentMap[key];
        if((componentInfo)&&(componentInfo.component)) {
            componentInfo.component.onDelete();
        }
    }
}

//====================================
// open and save methods
//====================================

haxapp.app.WorkspaceUI.prototype.toJson = function() {
    var json = {};
    json.name = this.workspace.getName();
    json.fileType = "hax workspace";
    
    json.jsLinks = this.jsLinkArray;
    json.cssLinks = this.cssLinkArray;
    
    json.workspace = this.workspace.toJson();
    
    var rootFolder = this.workspace.getRoot();
    json.components = this.getFolderComponentContentJson(rootFolder);
    
    return json;
}

haxapp.app.WorkspaceUI.prototype.getFolderComponentContentJson = function(folder) {
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

haxapp.app.WorkspaceUI.prototype.loadFolderComponentContentFromJson = function(folder,json) {
	for(var key in json) {
		var childJson = json[key];
		var childMember = folder.lookupChild(key);	
		this.loadComponentFromJson(childMember,childJson);
	}
}

haxapp.app.WorkspaceUI.prototype.loadComponentFromJson = function(member,json) {
    var componentType = json.type;
    var generator = this.app.getComponentGenerator(componentType);
	if(generator) {
        generator.createComponentFromJson(this,member,json);
    }
    else {
        throw hax.util.createError("Component type not found: " + componentType);
    }
}


//========================================
// Links
//========================================

haxapp.app.WorkspaceUI.prototype.getJsLinks = function() {
	return this.jsLinkArray;
}

//GET RUID OF NAME ARG!!!
haxapp.app.WorkspaceUI.prototype.setLinks = function(newJsLinkArray,newCssLinkArray,onLinksLoaded,name) {
    //update the page links
    var oldJsLinkArray = this.jsLinkArray;
	var oldCssLinkArray = this.cssLinkArray;
	var addList = [];
	var removeList = [];
	
    this.createLinkAddRemoveList(newJsLinkArray,oldJsLinkArray,"js",addList,removeList);
	this.createLinkAddRemoveList(newCssLinkArray,oldCssLinkArray,"css",addList,removeList);
	
    this.jsLinkArray = newJsLinkArray;
	this.cssLinkArray = newCssLinkArray;
	this.app.updateWorkspaceLinks(name,addList,removeList,onLinksLoaded);;
}

haxapp.app.WorkspaceUI.prototype.getCssLinks = function() {
	return this.cssLinkArray;
}

/** This method determins which links are new, which are old and which are removed.  
 * @private */
haxapp.app.WorkspaceUI.prototype.createLinkAddRemoveList = function(linkArray,oldLinkArray,type,addList,removeList) { 
    
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
/** This component represents a table object. */
haxapp.app.FolderComponent = function(workspaceUI,folder,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folder,haxapp.app.FolderComponent.generator,componentJson);
    haxapp.ui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	haxapp.ui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this folder as a parent container
    workspaceUI.addComponentContainer(folder,this);
};

//add components to this class
hax.util.mixin(haxapp.app.FolderComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FolderComponent,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.app.FolderComponent,haxapp.ui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.FolderComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the table component. */
haxapp.app.FolderComponent.prototype.writeToJson = function(json) {
    var folder = this.getObject();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(folder);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.FolderComponent.prototype.populateFrame = function() {
	this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folder = this.getObject();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,folder);
    
}


//======================================
// Static methods
//======================================

//add table listener
haxapp.app.FolderComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.Folder.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var folder = actionResponse.member;
    if(folder) {       
        var folderComponent = new haxapp.app.FolderComponent(workspaceUI,folder,componentOptions);
        actionResponse.component = folderComponent;
    }
    return actionResponse;
}

haxapp.app.FolderComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderComponent = new haxapp.app.FolderComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        workspaceUI.loadFolderComponentContentFromJson(member,componentJson.children);
    }
    
    return folderComponent;
}


//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FolderComponent.generator = {};
haxapp.app.FolderComponent.generator.displayName = "Folder";
haxapp.app.FolderComponent.generator.uniqueName = "haxapp.app.FolderComponent";
haxapp.app.FolderComponent.generator.createComponent = haxapp.app.FolderComponent.createComponent;
haxapp.app.FolderComponent.generator.createComponentFromJson = haxapp.app.FolderComponent.createComponentFromJson;
haxapp.app.FolderComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.FolderComponent.generator.DEFAULT_HEIGHT = 500;;
/** This component represents a json table object. */
haxapp.app.JsonTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,table,haxapp.app.JsonTableComponent.generator,componentJson);
    haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.JsonTableComponent.VIEW_MODES,
        haxapp.app.JsonTableComponent.DEFAULT_VIEW,
		haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO);
	
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.JsonTableComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.JsonTableComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT = "Text";
haxapp.app.JsonTableComponent.VIEW_JSON_TEXT = "JSON";
haxapp.app.JsonTableComponent.VIEW_FORM = "Form";
haxapp.app.JsonTableComponent.VIEW_CODE = "Formula";
haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.JsonTableComponent.VIEW_MODES = [
    haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT,
    haxapp.app.JsonTableComponent.VIEW_JSON_TEXT,
    haxapp.app.JsonTableComponent.VIEW_FORM,
    haxapp.app.JsonTableComponent.VIEW_CODE,
    haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE
];

//haxapp.app.JsonTableComponent.DEFAULT_VIEW = haxapp.app.JsonTableComponent.VIEW_FORM;
haxapp.app.JsonTableComponent.DEFAULT_VIEW = haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT;

haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":"",
	"menuLabel":"Clear Formula"
};

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.JsonTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
        case haxapp.app.JsonTableComponent.VIEW_PLAIN_TEXT:
            return new haxapp.app.AceDataMode(this,false);
            
		case haxapp.app.JsonTableComponent.VIEW_JSON_TEXT:
			return new haxapp.app.AceDataMode(this,true);
			
		case haxapp.app.JsonTableComponent.VIEW_FORM:
			return new haxapp.app.FormDataMode(this);
			
		case haxapp.app.JsonTableComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,haxapp.app.JsonTableComponent.BLANK_DATA_VALUE_INFO,haxapp.app.JsonTableComponent.editorCodeWrapper);
			
		case haxapp.app.JsonTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


haxapp.app.JsonTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.JsonTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.JsonTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.JsonTableComponent.generator = {};
haxapp.app.JsonTableComponent.generator.displayName = "Data Table";
haxapp.app.JsonTableComponent.generator.uniqueName = "haxapp.app.JsonTableComponent";
haxapp.app.JsonTableComponent.generator.createComponent = haxapp.app.JsonTableComponent.createComponent;
haxapp.app.JsonTableComponent.generator.createComponentFromJson = haxapp.app.JsonTableComponent.createComponentFromJson;
haxapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// This is a code wrapper so the user works with the formula rather than the function body
//======================================

haxapp.app.JsonTableComponent.editorCodeWrapper = {};

haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX = "var value;\n";
haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX = "\nreturn value;\n\n";

haxapp.app.JsonTableComponent.editorCodeWrapper.displayName = "Formula";

haxapp.app.JsonTableComponent.editorCodeWrapper.wrapCode = function(formula) { 
    return haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_PREFIX + formula + 
        haxapp.app.JsonTableComponent.editorCodeWrapper.FUNCTION_SUFFIX;
}

haxapp.app.JsonTableComponent.editorCodeWrapper.unwrapCode = function(functionBody) {
	if((functionBody == null)||(functionBody.length = 0)) return "";
	
    var formula = functionBody.replace("var value;","");
    formula = formula.replace("return value;","");
    return formula.trim();
}

;

/** This component represents a json table object. */
haxapp.app.GridTableComponent = function(workspaceUI,table,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,table,haxapp.app.GridTableComponent.generator,componentJson);
	haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.GridTableComponent.VIEW_MODES,
		haxapp.app.GridTableComponent.DEFAULT_VIEW,
		haxapp.app.GridTableComponent.BLANK_DATA_VALUE_INFO
	);
    
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.GridTableComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.GridTableComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.GridTableComponent.VIEW_GRID = "Grid";
haxapp.app.GridTableComponent.VIEW_CODE = "Formula";
haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.GridTableComponent.VIEW_MODES = [
	haxapp.app.GridTableComponent.VIEW_GRID,
    haxapp.app.GridTableComponent.VIEW_CODE,
    haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE
];

haxapp.app.GridTableComponent.BLANK_DATA_VALUE_INFO = {
	"dataValue":[[null]],
	"menuLabel":"Clear Formula"
};

haxapp.app.GridTableComponent.DEFAULT_VIEW = haxapp.app.GridTableComponent.VIEW_GRID;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.GridTableComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.GridTableComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,haxapp.app.GridTableComponent.BLANK_DATA_VALUE_INFO,haxapp.app.JsonTableComponent.editorCodeWrapper);
			
		case haxapp.app.GridTableComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
		case haxapp.app.GridTableComponent.VIEW_GRID:
			return new haxapp.app.HandsonGridMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================


haxapp.app.GridTableComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.JsonTable.generator.type;
	json.updateData = {};
	json.updateData.data = [[""]]; //empty single cell
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var table = actionResponse.member;
    if(table) {
        var tableComponent = new haxapp.app.GridTableComponent(workspaceUI,table,componentOptions);
        actionResponse.component = tableComponent;
    }
    return actionResponse;
}


haxapp.app.GridTableComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var tableComponent = new haxapp.app.GridTableComponent(workspaceUI,member,componentJson);
    return tableComponent;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.GridTableComponent.generator = {};
haxapp.app.GridTableComponent.generator.displayName = "Grid Table";
haxapp.app.GridTableComponent.generator.uniqueName = "haxapp.app.GridTableComponent";
haxapp.app.GridTableComponent.generator.createComponent = haxapp.app.GridTableComponent.createComponent;
haxapp.app.GridTableComponent.generator.createComponentFromJson = haxapp.app.GridTableComponent.createComponentFromJson;
haxapp.app.GridTableComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.GridTableComponent.generator.DEFAULT_HEIGHT = 200;

//======================================
// Use the json table code wrapper
//======================================

//external links
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.js
//https://handsontable.com/bower_components/handsontable/dist/handsontable.full.css


;
/** This component represents a table object. */
haxapp.app.FunctionComponent = function(workspaceUI, functionObject, componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,functionObject,haxapp.app.FunctionComponent.generator,componentJson);
    haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.FunctionComponent.VIEW_MODES,
        haxapp.app.FunctionComponent.DEFAULT_VIEW);
    
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.FunctionComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FunctionComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.FunctionComponent.VIEW_CODE = "Code";
haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.FunctionComponent.VIEW_MODES = [
    haxapp.app.FunctionComponent.VIEW_CODE,
    haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE
];

haxapp.app.FunctionComponent.DEFAULT_VIEW = haxapp.app.FunctionComponent.VIEW_CODE;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.FunctionComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
			
		case haxapp.app.FunctionComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.FunctionComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
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
haxapp.app.FunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    if(data.argListString) {
        var argList = haxapp.app.FunctionComponent.parseStringArray(data.argListString);
        json.updateData = {};
        json.updateData.argList = argList;
    }
    json.type = hax.FunctionTable.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var functionObject = actionResponse.member;
    if(functionObject) {
        var functionComponent = new haxapp.app.FunctionComponent(workspaceUI,functionObject,componentOptions);
        actionResponse.component = functionComponent;
    }
    return actionResponse;
}

haxapp.app.FunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var functionComponent = new haxapp.app.FunctionComponent(workspaceUI,member,componentJson);
    return functionComponent;
}

/** This method extends the base method to get the property values
 * for the property edit dialog. */
haxapp.app.FunctionComponent.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

haxapp.app.FunctionComponent.propUpdateHandler = function(member,oldValues,newValues,recalculateList) {
    if(oldValues.argListString !== newValues.argListString) {
        var newArgList = haxapp.app.FunctionComponent.parseStringArray(newValues.argListString);
        var functionBody = member.getFunctionBody();
        var supplementalCode = member.getSupplementalCode();

        hax.updatemember.updateCode(member,
            newArgList,
            functionBody,
            supplementalCode,
            recalculateList);
    }
}

haxapp.app.FunctionComponent.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FunctionComponent.generator = {};
haxapp.app.FunctionComponent.generator.displayName = "Function";
haxapp.app.FunctionComponent.generator.uniqueName = "haxapp.app.FunctionComponent";
haxapp.app.FunctionComponent.generator.createComponent = haxapp.app.FunctionComponent.createComponent;
haxapp.app.FunctionComponent.generator.createComponentFromJson = haxapp.app.FunctionComponent.createComponentFromJson;
haxapp.app.FunctionComponent.generator.DEFAULT_WIDTH = 200;
haxapp.app.FunctionComponent.generator.DEFAULT_HEIGHT = 200;

haxapp.app.FunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    }
];
haxapp.app.FunctionComponent.generator.addPropFunction = haxapp.app.FunctionComponent.addPropValues;
haxapp.app.FunctionComponent.generator.updatePropHandler = haxapp.app.FunctionComponent.propUpdateHandler;
 ;
/** This component represents a folderFunction, which is a function that is programmed using
 *hax tables rather than writing code. */
haxapp.app.FolderFunctionComponent = function(workspaceUI,folderFunction,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,folderFunction,haxapp.app.FolderFunctionComponent.generator,componentJson);
    haxapp.ui.ParentContainer.init.call(this,this.getContentElement(),this.getWindow());
	haxapp.ui.ParentHighlighter.init.call(this,this.getContentElement());
    
    //register this object as a parent container
    var internalFolder = folderFunction.getInternalFolder();
    workspaceUI.registerMember(internalFolder,null);
    workspaceUI.addComponentContainer(internalFolder,this);
    
    this.memberUpdated();
};

//add components to this class
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.app.FolderFunctionComponent,haxapp.ui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.FolderFunctionComponent.prototype.getContentIsShowing = function() {
    return this.getWindow().getContentIsShowing();
}

//==============================
// Protected and Private Instance Methods
//==============================

/** This serializes the folderFunction component. */
haxapp.app.FolderFunctionComponent.prototype.writeToJson = function(json) {
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var workspaceUI = this.getWorkspaceUI();
    json.children = workspaceUI.getFolderComponentContentJson(internalFolder);
}

/** This method populates the frame for this component. 
 * @protected */
haxapp.app.FolderFunctionComponent.prototype.populateFrame = function() {	
	this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folderFunction = this.getObject();
    var internalFolder = folderFunction.getInternalFolder();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,internalFolder);
}

//======================================
// Static methods
//======================================

/** This method creates the component. */
haxapp.app.FolderFunctionComponent.createComponent = function(workspaceUI,data,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!

    var json = {};
    json.name = data.name; 
    if(data.argListString) {
        var argList = haxapp.app.FunctionComponent.parseStringArray(data.argListString);
        json.argList = argList;
    }
    if(data.returnValueString) {
        json.returnValue = data.returnValueString;
    }
    json.type = hax.FolderFunction.generator.type;
    
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var folderFunction = actionResponse.member;
    if(actionResponse.getSuccess()) {
        var folderFunctionComponent = new haxapp.app.FolderFunctionComponent(workspaceUI,folderFunction,componentOptions);
        actionResponse.component = folderFunctionComponent;
    }
    return actionResponse;
}

haxapp.app.FolderFunctionComponent.createComponentFromJson = function(workspaceUI,member,componentJson) {
    var folderFunctionComponent = new haxapp.app.FolderFunctionComponent(workspaceUI,member,componentJson);
    if((componentJson)&&(componentJson.children)) {
        var folder = member.getInternalFolder();
        workspaceUI.loadFolderComponentContentFromJson(folder,componentJson.children);
    }
    return folderFunctionComponent;
}


/** This method extends the base method to get the property values
 * for the property edit dialog. */
haxapp.app.FolderFunctionComponent.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    values.returnValueString = member.getReturnValueString();
    return values;
}

haxapp.app.FolderFunctionComponent.propUpdateHandler = function(member,oldValues,newValues,recalculateList) {
    if((oldValues.argListString !== newValues.argListString)||(oldValues.returnValueString !== newValues.returnValueString)) {
        var newArgList = haxapp.app.FunctionComponent.parseStringArray(newValues.argListString);
        hax.updatefolderFunction.updatePropertyValues(member,newArgList,newValues.returnValueString,recalculateList);
    }    
}

//======================================
// This is the component generator, to register the component
//======================================

haxapp.app.FolderFunctionComponent.generator = {};
haxapp.app.FolderFunctionComponent.generator.displayName = "Folder Function";
haxapp.app.FolderFunctionComponent.generator.uniqueName = "haxapp.app.FolderFunctionComponent";
haxapp.app.FolderFunctionComponent.generator.createComponent = haxapp.app.FolderFunctionComponent.createComponent;
haxapp.app.FolderFunctionComponent.generator.createComponentFromJson = haxapp.app.FolderFunctionComponent.createComponentFromJson;
haxapp.app.FolderFunctionComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.FolderFunctionComponent.generator.DEFAULT_HEIGHT = 500;

haxapp.app.FolderFunctionComponent.generator.propertyDialogLines = [
    {
        "type":"inputElement",
        "heading":"Arg List: ",
        "resultKey":"argListString"
    },
    {
        "type":"inputElement",
        "heading":"Return Val: ",
        "resultKey":"returnValueString"
    }
];
haxapp.app.FolderFunctionComponent.generator.addPropFunction = haxapp.app.FolderFunctionComponent.addPropValues;
haxapp.app.FolderFunctionComponent.generator.updatePropHandler = haxapp.app.FolderFunctionComponent.propUpdateHandler;
;
/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.BasicControlComponent = function(workspaceUI,control,generator,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,control,generator,componentJson);
	haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.BasicControlComponent.VIEW_MODES,
		haxapp.app.BasicControlComponent.DEFAULT_VIEW
	);
	
	var resource = control.getResource();
	resource.setComponent(this);
    //redo calculate in contrl now the UI is set up
    control.calculate();
    
    //add a cleanup action to call resource when delete is happening
    var cleanupAction = function() {
        if(resource.delete) {
            resource.delete();
        }
    }
    this.addCleanupAction(cleanupAction);
};

//add components to this class
hax.util.mixin(haxapp.app.BasicControlComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.BasicControlComponent,haxapp.app.TableEditComponent);

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.BasicControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

haxapp.app.BasicControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.BasicControlComponent.VIEW_CODE = "Code";
haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";

haxapp.app.BasicControlComponent.VIEW_MODES = [
	haxapp.app.BasicControlComponent.VIEW_OUTPUT,
	haxapp.app.BasicControlComponent.VIEW_CODE,
    haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE
];

haxapp.app.BasicControlComponent.DEFAULT_VIEW = haxapp.app.BasicControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.BasicControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.BasicControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case haxapp.app.BasicControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.BasicControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

//======================================
// Static methods
//======================================

haxapp.app.BasicControlComponent.createBaseComponent = function(workspaceUI,data,resource,generator,componentOptions) {
    
    var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
    var json = {};
    json.name = data.name;
    json.type = hax.Control.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    
    var control = actionResponse.member;
    if(control) {
		//set the resource
		control.updateResource(resource);
		
        //create the component
        var basicControlComponent = new haxapp.app.BasicControlComponent(workspaceUI,control,generator,componentOptions);
        actionResponse.component = basicControlComponent;
    }
    return actionResponse;
}


haxapp.app.BasicControlComponent.createBaseComponentFromJson = function(workspaceUI,member,generator,componentJson) {
    var customControlComponent = new haxapp.app.BasicControlComponent(workspaceUI,member,generator,componentJson);
    return customControlComponent;
}

;
/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
haxapp.app.CustomControlComponent = function(workspaceUI,control,componentJson) {
    //base init
    haxapp.app.Component.init.call(this,workspaceUI,control,haxapp.app.CustomControlComponent.generator,componentJson);
	haxapp.app.TableEditComponent.init.call(this,
		haxapp.app.CustomControlComponent.VIEW_MODES,
		haxapp.app.CustomControlComponent.DEFAULT_VIEW
	);
	
	//create a resource based on the json (or lack of a json)
    if((componentJson)&&(componentJson.resource)) {
        this.loadResourceFromJson(componentJson.resource);
    }
    else {
        this.loadEmptyResource();
    }
    
    //add a cleanup action to call resource when delete is happening
    var cleanupAction = function() {
        if(resource.delete) {
            resource.delete();
        }
    }
    this.addCleanupAction(cleanupAction);
};

//add components to this class
hax.util.mixin(haxapp.app.CustomControlComponent,haxapp.app.Component);
hax.util.mixin(haxapp.app.CustomControlComponent,haxapp.app.TableEditComponent);

//==============================
//Resource Accessors
//==============================

haxapp.app.CustomControlComponent.prototype.getHtml = function() {
    return this.html;
}

haxapp.app.CustomControlComponent.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

haxapp.app.CustomControlComponent.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

haxapp.app.CustomControlComponent.prototype.getCss = function(msg) {
    return this.css;
}

//==============================
// Protected and Private Instance Methods
//==============================

haxapp.app.CustomControlComponent.prototype.getOutputElement = function() {
	return this.outputMode.getElement();
}

haxapp.app.CustomControlComponent.VIEW_OUTPUT = "Output";
haxapp.app.CustomControlComponent.VIEW_CODE = "Model Code";
haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE = "Private";
haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE = "Base Code";
haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE = "Base Private";

haxapp.app.CustomControlComponent.VIEW_MODES = [
	haxapp.app.CustomControlComponent.VIEW_OUTPUT,
	haxapp.app.CustomControlComponent.VIEW_CODE,
    haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE,
    haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE
];

haxapp.app.CustomControlComponent.DEFAULT_VIEW = haxapp.app.CustomControlComponent.VIEW_OUTPUT;

/** This method should be implemented to retrieve a view mode of the give type. 
 * @protected. */
haxapp.app.CustomControlComponent.prototype.getViewModeElement = function(viewType) {
	
	//create the new view element;
	switch(viewType) {
		
		case haxapp.app.CustomControlComponent.VIEW_OUTPUT:
			if(!this.outputMode) {
				this.outputMode = new haxapp.app.ResourceOutputMode(this);
			}
			return this.outputMode;
			
		case haxapp.app.CustomControlComponent.VIEW_CODE:
			return new haxapp.app.AceCodeMode(this,false);
			
		case haxapp.app.CustomControlComponent.VIEW_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceSupplementalMode(this);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_CODE:
			return new haxapp.app.AceCustomCodeMode(this);
			
		case haxapp.app.CustomControlComponent.VIEW_CUSTOM_SUPPLEMENTAL_CODE:
			return new haxapp.app.AceCustomSupplementalMode(this);
			
		default:
//temporary error handling...
			alert("unrecognized view element!");
			return null;
	}
}

/** This serializes the table component. */
haxapp.app.CustomControlComponent.prototype.writeToJson = function(json) {
    //store the resource info
    var control = this.getObject();
	var resource = control.getResource();
    if(resource) {
        json.resource = {};
        json.resource.html = this.html;
        json.resource.customizeScript = this.customizeScript;
        json.resource.supplementalCode = this.supplementalCode;
        json.resource.css = this.css;
    }
}

/** This method deseriliazes data for the custom resource component. */
haxapp.app.CustomControlComponent.prototype.updateFromJson = function(json) {  
    //load resource
    if(json.resource) {
        this.loadResourceFromJson(json.resource);
    }
    else {
        this.loadEmptyResource();
    }
}

haxapp.app.CustomControlComponent.prototype.loadEmptyResource = function() {
	this.update("","return {};","","");
}

/** This method deseriliazes data for the custom resource component. */
haxapp.app.CustomControlComponent.prototype.loadResourceFromJson = function(json) {   
	if(!json) json = {};
	var html = (json.html !== undefined) ? json.html : "";
	var customizeScript = (json.customizeScript !== undefined) ? json.customizeScript : "";
	var supplementalCode = (json.supplementalCode !== undefined) ? json.supplementalCode : "";
	var css = (json.css === undefined) ? json.css : "";
	
    this.update(html,customizeScript,supplementalCode,css);    
}

//=============================
// Action
//=============================

haxapp.app.CustomControlComponent.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
    
	var actionResponse = new hax.ActionResponse();
    var control = this.getObject();
    control.clearErrors();
    
    try { 
        //create a new resource
        var resource = this.createResource();
        if(!resource) {
            throw new Error("resource.setComponent(component) is not defined");
        }

        //update the resource
        control.updateResource(resource);
        
        if(resource.setComponent) {
            resource.setComponent(this);
        }
        
        control.calculate();
        this.memberUpdated();
    }
    catch(error) {
        //user application error
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = error.message ? error.message : hax.ActionError.UNKNOWN_ERROR_MESSAGE;
        var actionError = new hax.ActionError(errorMsg,"Custom Control - Update",control);
        actionError.setParentException(error);
        
        control.addError(actionError);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}


//======================================
// Resource methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
haxapp.app.CustomControlComponent.prototype.createResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.util.formatString(
        haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	
    var resource = updateFunction(this);
    return resource;
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
haxapp.app.CustomControlComponent.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var generator = function(component) {",
"{0}",
"}",
"//end member function",
"return generator;",
""
   ].join("\n");





//======================================
// Static methods
//======================================


/** This method creates the control. */
haxapp.app.CustomControlComponent.createComponent = function(workspaceUI,data,componentOptions) {
	var parent = workspaceUI.getObjectByKey(data.parentKey);
    //should throw an exception if parent is invalid!
    
	//create a generic component of this given name
    var json = {};
    json.name = data.name;
    json.type = hax.Control.generator.type;
    var actionResponse = hax.createmember.createMember(parent,json);
    var control = actionResponse.member;
	
    if(control) {
        //create the component
        var customControlComponent = new haxapp.app.CustomControlComponent.createComponentFromJson(workspaceUI,control,componentOptions);
        actionResponse.component = customControlComponent;
    }
    return actionResponse;
}

haxapp.app.CustomControlComponent.createComponentFromJson = function(workspaceUI,control,componentJson) {
    var customControlComponent = new haxapp.app.CustomControlComponent(workspaceUI,control,componentJson);
    return customControlComponent;
}


//======================================
// This is the control generator, to register the control
//======================================

haxapp.app.CustomControlComponent.generator = {};
haxapp.app.CustomControlComponent.generator.displayName = "Custom Control";
haxapp.app.CustomControlComponent.generator.uniqueName = "haxapp.app.CustomControlComponent";
haxapp.app.CustomControlComponent.generator.createComponent = haxapp.app.CustomControlComponent.createComponent;
haxapp.app.CustomControlComponent.generator.createComponentFromJson = haxapp.app.CustomControlComponent.createComponentFromJson;
haxapp.app.CustomControlComponent.generator.DEFAULT_WIDTH = 500;
haxapp.app.CustomControlComponent.generator.DEFAULT_HEIGHT = 500;

;
haxapp.app.CustomResource = function() {
	this.contentElement = null;
	
	this.html = "";
	this.customizeScript = "";
	this.supplementalCode = "";
	this.css = "";
}

haxapp.app.CustomResource.prototype.setComponent = function(component) {
    this.component = component;
}

haxapp.app.CustomResource.prototype.getContentElement = function() {
    return this.component.getOutputElement();
}

haxapp.app.CustomResource.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.CustomResource.prototype.getHtml = function() {
    return this.html;
}

haxapp.app.CustomResource.prototype.getCustomizeScript = function() {
    return this.customizeScript;
}

haxapp.app.CustomResource.prototype.getSupplementalCode = function() {
    return this.supplementalCode;
}

haxapp.app.CustomResource.prototype.getCss = function(msg) {
    return this.css;
}

haxapp.app.CustomResource.prototype.update = function(html,customizeScript,supplementalCode,css) {
    this.html = html;
	this.customizeScript = customizeScript;
	this.supplementalCode = supplementalCode;
	this.css = css;
	
	//update the resource with the given data
	this.updateResource();
}

//======================================
// Resource methods
//======================================

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
haxapp.app.CustomResource.prototype.updateResource = function() {
    
    //create the resource generator wrapped with its closure
    var generatorFunctionBody = hax.util.formatString(
        haxapp.app.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT,
		this.customizeScript,
        this.supplementalCode
    );
	
	//create the function generator, with the aliased variables in the closure
	var generatorFunction = new Function(generatorFunctionBody);
	var updateFunction = generatorFunction();
	
    var resource = updateFunction(this);
    var control = this.getObject();
    control.updateResource(resource);
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: customize script
 * 1: supplemental code text
 * @private
 */
haxapp.app.CustomResource.GENERATOR_FUNCTION_FORMAT_TEXT = [
"",
"//supplemental code",
"{1}",
"//end supplemental code",
"",
"//member function",
"var generator = function(component) {",
"{0}",
"}",
"//end member function",
"return generator;",
""
   ].join("\n");


;

haxapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


haxapp.app.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        var onCreate = function(name) {
            var actionResponse = haxapp.app.createworkspace.createWorkspace(app,name);
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg());
            }
            return true;
        }
        
        haxapp.app.dialog.showCreateWorkspaceDialog(onCreate); 
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
haxapp.app.createworkspace.createWorkspace = function(app,name) {
    var actionResponse = new hax.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make the workspace ui
        var workspaceUI = new haxapp.app.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
        
        //create and edd an empty workspace
        var workspace = new hax.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        
        var actionError = hax.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
;


haxapp.app.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.closeworkspace.getCloseCallback = function(app) {
    return function() {

        var actionResponse = haxapp.app.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

haxapp.app.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new hax.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
    
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new hax.ActionError(errorMsg,"User",null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        
        var name = workspace.getName();
        
        var doRemove = confirm("Are you sure you want to close the workspace " + name + "?");
        if(!doRemove) {
            return actionResponse;
        }
        
        workspaceUIRemoved = app.removeWorkspaceUI(name);
        
        activeWorkspaceUI.close();
        workspace.close();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = hax.ActionError.processException(error,"AppException",isFatal);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




;


haxapp.app.updatecomponent = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.updatecomponent.getAddComponentCallback = function(app,generator,optionalInitialValues,optionalComponentOptions) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getActiveWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.updatecomponent.getDialogLayout(workspaceUI,generator,true,optionalInitialValues);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            
            //need to test if fields are valid!

            var actionResponse =  generator.createComponent(workspaceUI,result,optionalComponentOptions);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        haxapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

haxapp.app.updatecomponent.getUpdateComponentCallback = function(component,generator) {
    
    var createCallback = function() {
        
        var workspaceUI = component.getWorkspaceUI();       
        var initialValues = component.getPropertyValues();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = haxapp.app.updatecomponent.getDialogLayout(workspaceUI,generator,false,initialValues);
        
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
            
            //need to test if fields are valid!

            //update
            var actionResponse = component.updatePropertyValues(initialValues,newValues);
              
            //print an error message if there was an error
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        haxapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

//this is for a create or update dialog
haxapp.app.updatecomponent.getDialogLayout = function(workspaceUI,generator,doCreate,initialValues) {
    
    var additionalLines = hax.util.deepJsonCopy(generator.propertyDialogLines);  
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + generator.displayName;
    }
    else {
        titleLine.title = "Update " + generator.displayName; 
    }
    lines.push(titleLine);

    var parentLine = {};
    parentLine.type = "dropdown";
    parentLine.heading = "Folder: ";
    parentLine.entries = workspaceUI.getFolderList();
    parentLine.resultKey = "parentKey"; 
    lines.push(parentLine);

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

//=====================================
// Action
//=====================================

//action is in the component generator






;


haxapp.app.addadditionalcomponent = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.addadditionalcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentOptions) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = haxapp.app.updatecomponent.getAddComponentCallback(app,generator,optionalInitialValues,optionalComponentOptions);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        haxapp.app.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


;


haxapp.app.updatelinks = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.updatelinks.getUpdateLinksCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(!activeWorkspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        haxapp.app.dialog.showUpdateLinksDialog(activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================
;
/** This method creates the creates the menu bar, with the attached functionality. 
 * @private */
haxapp.app.Hax.prototype.createMenuBar = function() {
    
    //-------------------
    //create menus
    //-----------------------
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "position":"relative",
        "display":"table-row",
        "width":"100%",
        "padding":"2px"
    };
    haxapp.ui.applyStyle(menuBar,menuBarStyle);
    menuBar.className = "visicomp_menuBarStyle";
    
    //create the menus
    var menu;

    //Workspace menu
    menu = haxapp.ui.Menu.createMenu("Workspace");
    menuBar.appendChild(menu.getElement());
    
    var newCallback = haxapp.app.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = haxapp.app.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = haxapp.app.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = haxapp.app.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    menu = haxapp.ui.Menu.createMenu("Components");
    menuBar.appendChild(menu.getElement());
    
    //add create child elements
    this.populateAddChildMenu(menu);
    
    //libraries menu
    menu = haxapp.ui.Menu.createMenu("Libraries");
    menuBar.appendChild(menu.getElement());
    
    var linksCallback = haxapp.app.updatelinks.getUpdateLinksCallback(this);
    menu.addCallbackMenuItem("Update Links",linksCallback);
    
    return menuBar;
    
}

;

haxapp.app.openworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.openworkspace.getOpenCallback = function(app) {
    return function() {
    
        var onOpen = function(workspaceData) {
                
            var actionCompletedCallback = function(actionResponse) {
                if(!actionResponse.getSuccess()) {
                    alert(actionResponse.getErrorMsg());
                }
            };
            
            //open workspace
            haxapp.app.openworkspace.openWorkspace(app,workspaceData,actionCompletedCallback);

            //we should show some sort of loading message or symbol
            return true;
        }
        
        haxapp.app.dialog.showOpenWorkspaceDialog(onOpen);
    }
}

//=====================================
// Action
//=====================================


/** This method opens an workspace, from the text file. 
 * The result is returnd through the callback function rather than a return value,
 * since the function runs (or may run) asynchronously. */
haxapp.app.openworkspace.openWorkspace = function(app,workspaceText,actionCompletedCallback) {
    var actionResponse = new hax.ActionResponse();
    var name;
    var workspaceUIAdded;
    
    try {
        //parse the workspace json
        var workspaceJson = JSON.parse(workspaceText);

//I should verify the file type and format!    

		//make a blank workspace
        name = workspaceJson.workspace.name;
        
        var workspaceUI = new haxapp.app.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
    
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
            haxapp.app.openworkspace.loadWorkspace(workspaceUI,workspaceJson);
            actionCompletedCallback(actionResponse);
        }
        
        if(linksAdded) {
			//set links and set the callback to complete loading the workspace
			workspaceUI.setLinks(jsLinks,cssLinks,doWorkspaceLoad,name);
		}
		else {
			//immediately load the workspace - no links to wait for
            doWorkspaceLoad();
		}
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        var actionError = hax.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }
}

/** This method loads an existing workspace into an empty workspace UI. */
haxapp.app.openworkspace.loadWorkspace = function(workspaceUI,workspaceJson,actionResponse) {
    var workspaceDataJson = workspaceJson.workspace;
    var workspaceComponentsJson = workspaceJson.components;

    var workspace = new hax.Workspace(workspaceDataJson,actionResponse);
    
    workspaceUI.setWorkspace(workspace,workspaceComponentsJson);
}


//------------------------
// open from url
//------------------------

/** This method opens an workspace by getting the workspace file from the url. */
haxapp.app.openworkspace.openWorkspaceFromUrl = function(app,url) {
    var actionCompletedCallback = function(actionResponse) {
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    };
    
    haxapp.app.openworkspace.openWorkspaceFromUrlImpl(app,url,actionCompletedCallback);
}

/** This method opens an workspace by getting the workspace file from the url. */
haxapp.app.openworkspace.openWorkspaceFromUrlImpl = function(app,url,actionCompletedCallback) {
    var onDownload = function(workspaceText) {
        haxapp.app.openworkspace.openWorkspace(app,workspaceText,actionCompletedCallback);
    }
    
    var onFailure = function(msg) {
        var actionError = new hax.ActionError(msg,"AppException",null);
        var actionResponse = new hax.ActionResponse();
        actionResponse.addError(actionError);
        actionCompletedCallback(actionResponse);
    }   
    haxapp.app.openworkspace.doRequest(url,onDownload,onFailure);   
}

/**
 * This is an http request for the worksheet data
 */
haxapp.app.openworkspace.doRequest= function(url,onDownload,onFailure) {
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


haxapp.app.saveworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.saveworkspace.getSaveCallback = function(app) {
    return function() {
        
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            alert("There is no workspace open.");
            return
        }
        
        haxapp.app.dialog.showSaveWorkspaceDialog(app, activeWorkspaceUI);
    }
}

//=====================================
// Action
//=====================================

//for now there is no action
;

/** This method shows a open workspace dialog. The argument onOpenFunction
 * should take the folder text as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
haxapp.app.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialog = haxapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");

    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = haxapp.ui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        var closeDialog = onOpenFunction(jsonText);
        if(closeDialog) {
            haxapp.ui.closeDialog(dialog);
        }
	}
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}

;

/** This method shows a save folder dialog. I simply displays the text of
 * the workspace json for the user to copy and save elsewhere. */
haxapp.app.dialog.showSaveWorkspaceDialog = function(app,workspaceUI) {
    
    if((!workspaceUI)||(!workspaceUI.getWorkspace())) {
        alert("There is no workspace open.");
        return;
    }
    
    var workspaceJson = workspaceUI.toJson();
    var workspaceText = JSON.stringify(workspaceJson);

    var dialog = haxapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");
    
    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Save Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"innerHTML":"Copy the data below and save it in a file to open later."}));
    content.appendChild(line);
    
    //input
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = haxapp.ui.createElement("textarea",{"value":workspaceText,"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onOk = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onOk}));
    content.appendChild(line);

    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}

;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the hax component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
haxapp.app.TextAreaEditor = function(component,onSave,onCancel) {
    
    this.outsideDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	var textArea = haxapp.ui.createElement("TEXTAREA",null,{
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
	
	this.component = component;
	this.table = component.getObject();
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
//	//resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
	
//    haxapp.ui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.textArea.addEventListener("click",onMouseClick);
}

haxapp.app.TextAreaEditor.prototype.save = function() {
	
	var text = this.textArea.value;
	
	var saveComplete = this.parentSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

haxapp.app.TextAreaEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.parentCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

haxapp.app.TextAreaEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
haxapp.app.TextAreaEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
    this.textArea.readOnly = !editOk;
	this.textArea.value = text;
    
    //set the background color
    if(this.editOk) {
        this.textArea.style.backgroundColor = "";
    }
    else {
        this.textArea.style.backgroundColor = haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

haxapp.app.TextAreaEditor.prototype.destroy = function() {
}

//==============================
// Private Methods
//==============================

/** @private */
haxapp.app.TextAreaEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.textArea.readOnly = true;
	this.component.endEditUI();
}

/** @private */
haxapp.app.TextAreaEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.component.startEditUI(onSave,onCancel);
		
		this.textArea.readOnly = false;
		this.editMode = true;
	}
}


;

haxapp.app.TextAreaMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.TextAreaEditor(component,onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.TextAreaMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.TextAreaMode.prototype.isData = true;

haxapp.app.TextAreaMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.TextAreaMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,haxapp.app.TextAreaMode.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

haxapp.app.TextAreaMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.TextAreaMode.prototype.onSave = function(text) {
	
	
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
	
	var table = this.component.getObject();
	hax.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
haxapp.app.TextAreaMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the hax component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
haxapp.app.AceTextEditor = function(component,aceMode,onSave,onCancel) {
    
    this.outsideDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
   
	this.editorDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
    this.outsideDiv.appendChild(this.editorDiv);
	
	this.component = component;
	this.table = component.getObject();
	this.workingData = null;
	this.editOk = false;
	this.editMode = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
	var editor = ace.edit(this.editorDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode(aceMode); 
	editor.$blockScrolling = Infinity;
    this.editor = editor;
	
	//resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
	
    haxapp.ui.setResizeListener(this.outsideDiv, resizeCallback);
	
	//add click handle to enter edit mode
	var instance = this;
	var onMouseClick = function() {
		instance.onMouseClick();
	}
	this.editorDiv.addEventListener("click",onMouseClick);
}

haxapp.app.AceTextEditor.prototype.save = function() {
	
	var text = this.editor.getSession().getValue();
	
	var saveComplete = this.parentSave(text);
	
	if(saveComplete) {
		this.endEditMode();
	}
}

haxapp.app.AceTextEditor.prototype.cancel = function() {
	//reset the original data
	var cancelComplete = this.parentCancel();
	
	if(cancelComplete) {
		this.endEditMode();
	}
}

//=============================
// "Package" Methods
//=============================

haxapp.app.AceTextEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
haxapp.app.AceTextEditor.prototype.showData = function(text,editOk) {
	this.editOk = editOk;
	this.editor.getSession().setValue(text);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
    
}

haxapp.app.AceTextEditor.prototype.destroy = function() {
	if(this.editor) {
        this.editor.destroy();
        this.editor = null;
    }
}

//==============================
// Private Methods
//==============================

/** @private */
haxapp.app.AceTextEditor.prototype.endEditMode = function() {
	this.editMode = false;
	this.editor.setReadOnly(true);
	this.component.endEditUI();
}

/** @private */
haxapp.app.AceTextEditor.prototype.onMouseClick = function() {
	if((this.editOk)&&(!this.editMode)) {
		
		var instance = this;
		var onSave = function() {
			instance.save();
		}
		var onCancel = function() {
			instance.cancel();
		}
		
		this.component.startEditUI(onSave,onCancel);
		
		this.editor.setReadOnly(false);
		this.editMode = true;
	}
}
;
/** This is a base class for different code editors (this is not a mixin). */
haxapp.app.AceCodeModeBase = function(component,mode) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceCodeModeBase.prototype.isData = false;

haxapp.app.AceCodeModeBase.prototype.getElement = function() {
	return this.editor.getElement();
}

haxapp.app.AceCodeModeBase.prototype.getComponent = function() {
	return this.component;
}
	
//Implement this!
//haxapp.app.AceCodeModeBase.prototype.showData = function(editOk);

haxapp.app.AceCodeModeBase.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

//Implemn
//haxapp.app.AceCodeModeBase.prototype.onSave = function(text);

haxapp.app.AceCodeModeBase.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
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
haxapp.app.AceCodeMode = function(component,optionalOnBlankData,optionalEditorCodeWrapper) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
	
	this.onBlankData = optionalOnBlankData;
	this.editorCodeWrapper = optionalEditorCodeWrapper;
}

haxapp.app.AceCodeMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCodeMode.prototype.constructor = haxapp.app.AceCodeMode;
	
haxapp.app.AceCodeMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	
	var codeText;
	if(this.editorCodeWrapper) {
		codeText = this.editorCodeWrapper.unwrapCode(functionBody);
	}
	else {
		codeText = functionBody;
	}
	
    this.editOk = editOk;
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCodeMode.prototype.onSave = function(text) {	
	
	var table = this.component.getObject();
	
	if((this.onBlankData)&&(text === "")) {
		//special case - clear code
		var data = this.onBlankData.dataValue; 
		hax.updatemember.updateData(table,data);
	}
	else {
		//standard case - edit code
	
		var functionBody;
		if(this.editorCodeWrapper) {
			functionBody = this.editorCodeWrapper.wrapCode(text);
		}
		else {
			functionBody = text;
		}

		var supplementalCode = table.getSupplementalCode();
		var argList = table.getArgList();
		var actionResponse =  hax.updatemember.updateCode(table,argList,functionBody,supplementalCode);
		if(!actionResponse.getSuccess()) {
			//show an error message
			var msg = actionResponse.getErrorMsg();
			alert(msg);
		}
	}
        
	return true;  
}
;

haxapp.app.AceDataMode = function(component,doJsonFormatting) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(text) {
		return instance.onSave(text);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
    var mode = doJsonFormatting ? "ace/mode/json" : "ace/mode/text";
	this.editor = new haxapp.app.AceTextEditor(component,mode,onSave,onCancel);
	
}

/** This is the format character use to display tabs in the display editor. 
 * @private*/
haxapp.app.AceDataMode.formatString = "\t";

/** This indicates if this element displays data or something else (code) */
haxapp.app.AceDataMode.prototype.isData = true;

haxapp.app.AceDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.AceDataMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	
	var textData;
	if(json === null) {
		textData = "null";
	}
	else if(json === undefined) {
		textData = "undefined";
	}
	else {
		textData = JSON.stringify(json,null,haxapp.app.AceDataMode.formatString);
	}
	
	this.editor.showData(textData,editOk);
}

haxapp.app.AceDataMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.AceDataMode.prototype.onSave = function(text) {
	
	
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
	
	var table = this.component.getObject();
	hax.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
haxapp.app.AceDataMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}
;

haxapp.app.AceSupplementalMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceSupplementalMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceSupplementalMode.prototype.constructor = haxapp.app.AceSupplementalMode;

haxapp.app.AceSupplementalMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var codeText = table.getSupplementalCode();	
	
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceSupplementalMode.prototype.onSave = function(text) {	
	var table = this.component.getObject();
	var functionBody = table.getFunctionBody();
	var supplementalCode = text;
	var argList = table.getArgList();
	var actionResponse =  hax.updatemember.updateCode(table,argList,functionBody,supplementalCode);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
;

haxapp.app.AceCustomCodeMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceCustomCodeMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomCodeMode.prototype.constructor = haxapp.app.AceCustomCodeMode;
	
haxapp.app.AceCustomCodeMode.prototype.showData = function(editOk) {
		
	var codeText = this.component.getCustomizeScript();
	
    this.editOk = editOk;
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomCodeMode.prototype.onSave = function(text) {	
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = text;
	var supplementalCode = this.component.getSupplementalCode();
	
	var actionResponse = this.component.update(html,customizeScript,supplementalCode,css);
	if(!actionResponse.getSuccess()) {
		//show an error message
		var msg = actionResponse.getErrorMsg();
		alert(msg);
	}
        
	return true;  
}
;

haxapp.app.AceCustomSupplementalMode = function(component) {
	//base constructor
	haxapp.app.AceCodeModeBase.call(this,component,"ace/mode/javascript");
}

haxapp.app.AceCustomSupplementalMode.prototype = Object.create(haxapp.app.AceCodeModeBase.prototype);
haxapp.app.AceCustomSupplementalMode.prototype.constructor = haxapp.app.AceCustomSupplementalMode;

haxapp.app.AceCustomSupplementalMode.prototype.showData = function(editOk) {
	var codeText = this.component.getSupplementalCode();
	this.editor.showData(codeText,editOk);
}

haxapp.app.AceCustomSupplementalMode.prototype.onSave = function(text) {	
	
	//add these later
	var html = "";
	var css = "";
	
	var customizeScript = this.component.getCustomizeScript();
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
;
/** Editor that uses json edit area
 * 
 * @param {type} onSave - should take a json object that should be saved.
 */
haxapp.app.JsonFormEditor = function(onSave) {
	
	this.editorDiv = haxapp.ui.createElement("div",null,{
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
        onSave(currentData);
    }
}

haxapp.app.JsonFormEditor.prototype.getElement = function() {
	return this.editorDiv;
}

haxapp.app.JsonFormEditor.prototype.showData = function(data,editOk) {
    if((data === this.workingData)&&(this.editOk === editOk)) {
        //no need to update
        return;
    }
	
	//the value undefined will break things. It is not a valid json value.
	//I should verify I handle this consistently through app.
	if(data === undefined) data = null;
    
    this.workingData = hax.util.deepJsonCopy(data);
    this.editOk = editOk;
    
	hax.util.removeAllChildren(this.editorDiv);
	this.editor = new haxapp.jsonedit.JsonEditArea(this.editorDiv,data,editOk);
    
    this.editor.setEditCallback(this.editCallback);
    
    //set the background color
    if(this.editOk) {
        this.editorDiv.style.backgroundColor = "";
    }
    else {
        this.editorDiv.style.backgroundColor = haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
}

;

haxapp.app.FormDataMode = function(component) {
	this.component = component;

	var instance = this;
	var onSave = function(data) {
		instance.onSave(data);
	}
	
	this.editor = new haxapp.app.JsonFormEditor(onSave);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.FormDataMode.prototype.isData = true;

haxapp.app.FormDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.FormDataMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	
	
	this.editor.showData(json,editOk);
}

haxapp.app.FormDataMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

haxapp.app.FormDataMode.prototype.onSave = function(data) {

	var table = this.component.getObject();
	hax.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}

;
/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - the hax component
 * @param {type} onSave - takes a text json representation for saving. returns true if the edit should end.
 * @param {type} onCancel - returns true if the edit should end
 */
haxapp.app.HandsonGridEditor = function(component,onSave,onCancel) {
   
	this.outsideDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"hidden"
	});
	
//TBR initial sizing. now I just set it to a dummy number	
	
	this.gridDiv = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
        "width":"50px",
        "height":"50px",
		"overflow":"hidden",
        "zIndex":0
	});
	this.outsideDiv.appendChild(this.gridDiv);
	
	this.component = component;
	this.table = component.getObject();
	this.inputData = null;
	this.editOk = false;
	
	this.parentSave = onSave;
	this.parentCancel = onCancel;
	
	//resize the editor on window size change
    var instance = this;
    var resizeCallback = function() {
        instance.gridDiv.style.width = instance.outsideDiv.clientWidth + "px";
        instance.gridDiv.style.height = instance.outsideDiv.clientHeight + "px";
        if(instance.gridControl) {
            instance.gridControl.render();
        }
    }
   haxapp.ui.setResizeListener(this.outsideDiv, resizeCallback);
	
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

haxapp.app.HandsonGridEditor.prototype.save = function(argArray) {
	//no action for this case
	if(argArray[1] == "loadData") return;

	//update "input" data before calling update
	this.inputData = hax.util.deepJsonCopy(this.gridControl.getData());

	this.parentSave(this.inputData);
}

haxapp.app.HandsonGridEditor.prototype.cancel = function() {
	//reset the original data
	this.parentCancel();
}

//=============================
// "Package" Methods
//=============================

haxapp.app.HandsonGridEditor.prototype.getElement = function() {
	return this.outsideDiv;
}
	
haxapp.app.HandsonGridEditor.prototype.showData = function(json,editOk) {
	if((this.inputData === json)&&(editOk)) return;
	
	var oldEditOk = this.editOk;
	this.editOk = editOk;
	this.inputData = json;
	var editData = hax.util.deepJsonCopy(json);
	
	if((!this.gridControl)||(oldEditOk !== editOk)) {
		this.createNewGrid();
	}
	
    if(!editData) {
        editData = [[]];
    }
	this.gridControl.loadData(editData);
    
    //set the background color
    if(this.editOk) {
        this.gridDiv.style.backgroundColor = "";
    }
    else {
        this.gridDiv.style.backgroundColor = haxapp.app.TableEditComponent.NO_EDIT_BACKGROUND_COLOR;
    }
}

haxapp.app.HandsonGridEditor.prototype.destroy = function() {
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
haxapp.app.HandsonGridEditor.prototype.createNewGrid = function() {
    if(this.gridControl) {
        this.gridControl.destroy();
        this.gridControl = null;
    }
    
    var gridOptions; 
    if(this.editOk) {
        gridOptions = {
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
            readOnly: true,
            rowHeaders: true,
            colHeaders: true
        }
        this.gridEditable = false;
    }
        
    this.gridControl = new Handsontable(this.gridDiv,gridOptions); 
}

;

haxapp.app.HandsonGridMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(data) {
		return instance.onSave(data);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.HandsonGridEditor(component,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.HandsonGridMode.prototype.isData = true;

haxapp.app.HandsonGridMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.HandsonGridMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	this.editor.showData(json,editOk);
}

haxapp.app.HandsonGridMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.HandsonGridMode.prototype.onSave = function(data) {
	var table = this.component.getObject();
	hax.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
haxapp.app.HandsonGridMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}

////////////////////////////////////////////////////////////////////////

;

haxapp.app.ResourceOutputMode = function(component) {
	this.component = component;
	
	this.outputElement = haxapp.ui.createElement("div",null,{
		"position":"absolute",
        "top":"0px",
        "left":"0px",
		"bottom":"0px",
        "right":"0px",
		"overflow":"auto"
	});
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.ResourceOutputMode.prototype.isData = true;

haxapp.app.ResourceOutputMode.prototype.getElement = function() {
	return this.outputElement;
}
	
haxapp.app.ResourceOutputMode.prototype.showData = function(editOk) {
	//edit ok ignored - no edit of the control data object - there is none
	
	var control = this.component.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.show)) {
        resource.show();
    }   
}

haxapp.app.ResourceOutputMode.prototype.destroy = function() {
    var control = this.component.getObject();
    var resource = control.getResource();
    if((resource)&&(resource.hide)) {
        resource.hide();
    }
}

//==============================
// internal
//==============================

haxapp.app.ResourceOutputMode.prototype.onSave = function(data) {
	//no saving action
}

;
/** This method shows a configurable dialog. The layout object
 * defines the form content for the dialog. The on submit
 * function is called when submit is pressed. The on submit function should
 * return true or false, indicating whether of not to close the dialog. */
haxapp.app.dialog.showConfigurableDialog = function(layout,onSubmitFunction) {

    var dialog = haxapp.ui.createDialog({"movable":true});
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
        haxapp.ui.closeDialog(dialog);
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
    
    var content = haxapp.ui.createElement("div",{"className":"dialogBody"});
    for(var i = 0; i < layout.lines.length; i++) {
        var lineDef = layout.lines[i];
        
        //create line
        var lineObject = haxapp.app.dialog.showConfigurableDialog.createLine(lineDef,formActions);
        lineObjects.push(lineObject);
        if(lineObject.element) { //no element for "invisible" entry, which is used to pass values along
            content.appendChild(lineObject.element);
        }
    }
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}
    
    
    
haxapp.app.dialog.showConfigurableDialog.createLine = function(lineDef,formActions) {
    var lineFunction = haxapp.app.dialog.showConfigurableDialog.lineFunctions[lineDef.type];
    if(lineFunction) {
        return lineFunction(lineDef,formActions);
    }
    else {
        //print an error message
        alert("Error: Unknown for element type: " + lineDef.type);
        return null;
    }
}

haxapp.app.dialog.showConfigurableDialog.lineFunctions = {
    //linedef.type = "title"
    //linedef.title = title
    "title": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = haxapp.ui.createElement("div",{"className":"dialogLine"});
        line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":lineDef.title}));
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
        var line = haxapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var select = haxapp.ui.createElement("select");
        for(var i = 0; i < lineDef.entries.length; i++) {
            var entry = lineDef.entries[i];
            select.add(haxapp.ui.createElement("option",{"text":entry}));
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
        var line = haxapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.heading) {
            line.appendChild(document.createTextNode(lineDef.heading));
        }
        var inputElement = haxapp.ui.createElement("input",{"type":"text"});
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
        
    },
    
    //lineDef.type = "submit"
    //lineDef.submit = name of submit button (optional)
    //lineDef.cancel = name of cancel button (optional)
    "submit": function(lineDef,formActions) {
        var lineObject = {};
        //create the element
        var line = haxapp.ui.createElement("div",{"className":"dialogLine"});
        if(lineDef.submit) {  
            line.appendChild(haxapp.ui.createElement("button",
            {"className":"dialogButton","innerHTML":lineDef.submit,"onclick":formActions.onSubmit}));
        }
        if(lineDef.cancel) {
            line.appendChild(haxapp.ui.createElement("button",
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
/** This method shows a create folder dialog. The argument onCreateFunction
 * should take the folder name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
haxapp.app.dialog.showCreateWorkspaceDialog = function(onCreateFunction) {

    var dialog = haxapp.ui.createDialog({"movable":true});
    dialog.setTitle("&nbsp;");
    
    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"New Workspace"}));
    content.appendChild(line);
    
    //input
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Name:"));
    var inputElement = haxapp.ui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    var onCreate = function() {
        var name = inputElement.value.trim();
        if(name.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var closeDialog = onCreateFunction(name);
        if(closeDialog) {
			haxapp.ui.closeDialog(dialog);
		}    
    }
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}


;
/** This method shows a dialog to update the workspace links. */
haxapp.app.dialog.showUpdateLinksDialog = function(workspaceUI) {
    
    var dialog = haxapp.ui.createDialog({"minimizable":true,"maximizable":true,"movable":true,"resizable":true});
            
//    //create body
//    var content = haxapp.ui.createElement("div",{"className":"dialogBody"}); 
    
    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
    
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Links"}));
    content.appendChild(line);
        
    //editor selector
    line = haxapp.ui.createElement("div",{"className":"dialogLine"}); 
    var jsLinksRadio = haxapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"jsLinks"});
    line.appendChild(jsLinksRadio);
    line.appendChild(document.createTextNode("JS Links"));
    content.appendChild(line);
    var cssLinksRadio = haxapp.ui.createElement("input",{"type":"radio","name":"componentContent","value":"cssLinks"});
    line.appendChild(cssLinksRadio);
    line.appendChild(document.createTextNode("CSS Links"));
    
    //editors
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var editorDiv = haxapp.ui.createElement("div",null,
        {
            "position":"relative",
            "width":"500px",
            "height":"300px",
            "border":"1px solid darkgray"
        });
    line.appendChild(editorDiv);
    content.appendChild(line);
        
    //create editor containers - will be hiddedn and shown
    var jsLinksEditorDiv = haxapp.ui.createElement("div",null,{
        "position":"absolute",
        "top":"0px",
        "bottom":"0px",
        "right":"0px",
        "left":"0px"
    });
    var jsLinksEditor = null;
    editorDiv.appendChild(jsLinksEditorDiv);
    
    var cssLinksEditorDiv = haxapp.ui.createElement("div",null,{
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
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        closeDialog();
    }
    
    var onSave = function() {
        
        var jsLinkArray;
        var cssLinkArray;

        //get js links
        if(jsLinksEditor) {
            var jsLinks = jsLinksEditor.getSession().getValue().trim();
            jsLinkArray = haxapp.app.dialog.createLinkArray(jsLinks);
        }
        else {
            jsLinkArray = [];
        }

        //get css links
        if(cssLinksEditor) {
            var cssLinks = cssLinksEditor.getSession().getValue().trim();
            cssLinkArray = haxapp.app.dialog.createLinkArray(cssLinks);
        }
        else {
            cssLinkArray = [];
        }

        //load links if we have any
        workspaceUI.setLinks(jsLinkArray,cssLinkArray);

        closeDialog();
    }
    
    var closeDialog = function() {
        haxapp.ui.closeDialog(dialog);
        
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
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Save","onclick":onSave}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
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
    
    //set the resize handler
    //resize the editor on window size change
    var resizeCallback = function() {
        //this needs to be fixed
        var container = content.parentElement;
        //this is kind of cludgy, I am using this as the last line and assuming it has even margins
        var margin = line.offsetLeft;
        var endPosition = line.offsetTop + line.offsetHeight + margin;
        var totalWidth = container.clientWidth - 2 * margin;
        var extraHeight = container.clientHeight - endPosition;
        //size the editor, with some arbitrary padding
        editorDiv.style.width = (totalWidth - 5) + "px";
        editorDiv.style.height = (editorDiv.offsetHeight + extraHeight - 5) + "px";
       
        if(cssLinksEditor) cssLinksEditor.resize();
        if(jsLinksEditor) jsLinksEditor.resize();
    }
    var container = content.parentElement;
    haxapp.ui.setResizeListener(container, resizeCallback);
}

/** @private */
haxapp.app.dialog.createLinkText = function(linkArray) {
    return linkArray.join("\n");
}

/** @private */
haxapp.app.dialog.createLinkArray = function(linkText) {
    if((!linkText)||(linkText.length === 0)) {
        return [];
    }
    else {
        return linkText.split(/\s/);
    }
}


;
/** This method shows a dialog to select from additional components. */
haxapp.app.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = haxapp.ui.createDialog({"movable":true});
    
    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = haxapp.ui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(haxapp.ui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        haxapp.ui.closeDialog(dialog);
    }
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);  
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}




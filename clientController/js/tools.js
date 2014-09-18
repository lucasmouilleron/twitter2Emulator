/*----------------------------------------------------------------------------*/
var i = console.log.bind(console);

/*----------------------------------------------------------------------------*/
var generateUID = function(separator) {
    var delim = separator || "-";
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
};

/*----------------------------------------------------------------------------*/
function displayLoaderForElement(elementID, fixed) {
    if (elementID.substr(0, 1) !== "#") {
        elementID = "#" + elementID;
    }
    var elementIDWithoutHash = elementID.substr(1, elementID.length);
    var $t = $(elementID);
    var $loadingElement = $("#loading" + elementIDWithoutHash);

    if ($loadingElement.length === 0) {
        $t.parent().append("<div class='loading' id='loading" + elementIDWithoutHash + "'></div>");
        $loadingElement = $("#loading" + elementIDWithoutHash);
        $loadingElement.hide().fadeIn(100);
        $loadingElement.width($t.outerWidth());
        $loadingElement.height($t.outerHeight());
        var position = "absolute";
        if (fixed) {
            position = "fixed";
        }
        $loadingElement.css({
            position: position,
            "z-index": 999
        });
        $loadingElement.offset({
            top: $t.offset().top,
            left: $t.offset().left
        });
    }
}

/*----------------------------------------------------------------------------*/
function hideLoaderForElement(elementID, callback) {
    if (elementID.substr(0, 1) !== "#") {
        elementID = "#" + elementID;
    }
    var $t = $(elementID);
    var elementIDWithoutHash = elementID.substr(1, elementID.length);
    var $loadingElement = $("#loading" + elementIDWithoutHash);
    if ($loadingElement.length > 0) {
        $loadingElement.fadeOut(300, function() {
            $loadingElement.hide();
            $loadingElement.remove();
            if (callback) {
                callback();
            }
        });
    }
}

/*----------------------------------------------------------------------------*/
function displayMainLoader() {
    displayLoaderForElement("body", true);
}

/*----------------------------------------------------------------------------*/
function hideMainLoader(callback) {
    hideLoaderForElement("body", callback);
}
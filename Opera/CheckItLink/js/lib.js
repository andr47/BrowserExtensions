//lib.js
var URL;

(function() {
	var isIE = window.navigator.userAgent.indexOf('MSIE') != -1;
	URL = function(url) {
	    var data = {href: '', protocol: '', host: '', hostname: '', port: '', pathname: '', search: '', hash: ''};
	    var gs = {
	        getHref: function() {
	            return data.href;
	        },
	        setHref: function(val) {
	            data.href = val;
	            parseURL.call(this);
	            return data.href;
	        },
	        getProtocol: function() {
	            return data.protocol;
	        },
	        setProtocol: function(val) {
	            if (!val)
	                val = data.protocol || window.location.protocol; // update || init
	            data.protocol = val;
	            updateURL.call(this);
	            return data.protocol;
	        },
	        getHost: function() {
	            return data.host;
	        },
	        setHost: function(val) {
	            val = val || '';
	            var v = val.split(':');
	            var h = v[0], p = v[1] || '';
	            data.host = val;
	            data.hostname = h;
	            data.port = p;
	            updateURL.call(this);
	            return data.host;
	        },
	        getHostname: function() {
	            return data.hostname;
	        },
	        setHostname: function(val) {
	            if (!val)
	                val = data.hostname || window.location.hostname; // update || init
	            data.hostname = val;
	            data.host = val + (("" + data.port) ? ":" + data.port : "");
	            updateURL.call(this);
	            return data.hostname;
	        },
	        
	        getPort: function() {
	            return data.port;
	        },
	        setPort: function(val) {
	            data.port = val;
	            data.host = data.hostname + (("" + data.port) ? ":" + data.port : "");
	            updateURL.call(this);
	            return data.port;
	        },
	        
	        getPathname: function() {
	            return data.pathname;
	        },
	        setPathname: function(val) {
	            if (val.indexOf("/") != 0) { // relative url
	                var _p = (data.pathname || window.location.pathname).split("/");
	                _p[_p.length - 1] = val;
	                val = _p.join("/");
	            }
	            data.pathname = val;
	            updateURL.call(this);
	            return data.pathname;
	        },
	        getSearch: function() {
	            return data.search;
	        },
	        setSearch: function(val) {
	            return data.search = val;
	        },
	        
	        getHash: function() {
	            return data.hash;
	        },
	        setHash: function(val) {
	            return data.hash = val;
	        }
	    };
	    if (isIE) { // IE5.5+
	        var el=document.createElement('div');
	        el.style.display='none';
	        document.body.appendChild(el);
	        el.assign = URL.prototype.assign;
	        el.replace = URL.prototype.replace;
	        var keys = ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash"];
	        el.onpropertychange=function(){
	            var pn = event.propertyName;
	            var pv = event.srcElement[event.propertyName];
	            if (this._holdOnMSIE || pn == '_holdOnMSIE')
	                return pv;
	            this._holdOnMSIE = true;
	            for (var i = 0, l = keys.length; i < l; i++)
	                el[keys[i]] = data[keys[i]];
	            this._holdOnMSIE = false;
	            for (var i = 0, l = keys.length; i < l; i++) {
	                var key = keys[i];
	                if (pn == key) {
	                    var sKey = 'set' + key.substr(0, 1).toUpperCase() + key.substr(1);
	                    return gs[sKey].call(el, pv);
	                }
	            }
	        }
	        url = url || "";
	        parseURL.call(el, url);
	        return el;
	    } else if (URL.prototype.__defineSetter__) { // FF
	        var keys = ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash"];
	        for (var i = 0, l = keys.length; i < l; i++) {
	            (function(i) {
	                var key = keys[i];
	                var gKey = 'get' + key.substr(0, 1).toUpperCase() + key.substr(1);
	                var sKey = 'set' + key.substr(0, 1).toUpperCase() + key.substr(1);
	                URL.prototype.__defineGetter__(key, gs[gKey]);
	                URL.prototype.__defineSetter__(key, gs[sKey]);
	            })(i);
	        }
	        url = url || "";
	        parseURL.call(this, url);
	    }
	}

	URL.prototype = {
	    assign: function(url) {
	        parseURL.call(this, url);
	        window.location.assign(this.href);
	    },
	    replace: function(url) {
	        parseURL.call(this, url);
	        window.location.replace(this.href);
	    }
	}

	function parseURL(url) {
	    if (this._innerUse)
	        return;
	    url = url || this.href;
	    var pattern = "^(([^:/\\?#]+):)?(//(([^:/\\?#]*)(?::([^/\\?#]*))?))?([^\\?#]*)(\\?([^#]*))?(#(.*))?$";
	    var rx = new RegExp(pattern); 
	    var parts = rx.exec(url);
	    this._innerUse = true;
	    this.href = parts[0] || "";
	    this.protocol = parts[1] || "";
	    //this.host = parts[4] || "";
	    this.hostname = parts[5] || "";
	    this.port = parts[6] || "";
	    this.pathname = parts[7] || "/";
	    this.search = parts[8] || "";
	    this.hash = parts[10] || "";
	    if (!isIE)
	        delete this._innerUse;
	    else
	        this._innerUse = false;
	    updateURL.call(this);
	}

	function updateURL() {
	    if (this._innerUse)
	        return;
	    this._innerUse = true;
	    this.href = this.protocol + '//' + this.host + this.pathname + this.search + this.hash;
	    if (!isIE)
	        delete this._innerUse;
	    else
	        this._innerUse = false;
	}

})();

function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        return getOffsetRect(elem)
    } else {
        return getOffsetSum(elem)
    }
}

function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseInt(elem.offsetTop)
        left = left + parseInt(elem.offsetLeft)
        elem = elem.offsetParent
    }
    return {
    	top: top, 
    	left: left
    }
}

function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect()

    var body = document.body
    var docElem = document.documentElement

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return { 
    	top: Math.round(top), 
    	left: Math.round(left) 
    }
}
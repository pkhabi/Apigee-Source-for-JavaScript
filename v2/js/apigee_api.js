/**
  * This library depends on jQuery and the base64 jQuery plugin (http://plugins.jquery.com/project/base64)
  * Sample Usage:
  * Working with the Apigee API
  * - Setting up an Apigee account:
  * var apigee = new $.apigee_api('https://api.apigee.com');
  * apigee.init("earth2marsh","supersecret"); // pwd will be base64 encoded
  *
  * - Adding an application:
  * apigee.request('post','/apps/myappname.json');
  *
  * Working with a proxied API
  * - Set up the app object:
  * var myapp = $.apigee_api('endpoint');
  *
  * - Casting an app to a user:
  * myapp.init("myappuser","myappuserpwd"); // base64 encode pwd
  *
  * - Making a request:
  * function renderTimeline(data) {
  *   // do clever things with that data, assume for now that rendering is outside the scope of the library
  * }
  * myapp.request('get','/1/statuses/home_timeline.json',{},{callback:'renderTimeline'}); // callback to custom function
*/

(function($) {
/**
  * Creates API object
  * Optionally accepts:
  * - endpoint
  * - username
  * - password
*/
  function ApigeeApi(endpoint,username,password) {
    var theApi = this;
/**
  * Default verb, response type, and endpoint; can be overridden by passing in settings to request
*/
    this.defaults = {
      verb:"get",
      type:"json",
      endpoint:endpoint || "https://api.apigee.com"
    };
/**
  * Makes request to endpoint + request
  * Accepts:
  * - verb (if not provided, defaults to the object's default verb (typically "get")
  * - request (NOT optional; request will not be made if not provided)
  * - headers (optional object - these are passed in as request headers or query parameters, depending on verb)
  * - settings (optional object - this allows defaults to be overridden, callback function to be provided, etc.)
  * Sample Request:
  * - (assuming "thisApi" is the name of an instance of the ApigeeApi object, and also that there is a function called "renderTimeline" that expects the response data as a parameter)
  * - thisApi.request('get','/1/statuses/home_timeline.json',{sort:'ascending'},{callback:'renderTimeline'});
*/
    this.request = function(verb,request,headers,settings) {
      if (request) {
        var request = request;
        var returnObject = {};
        var verb = verb || theApi.defaults.verb;
        var headers = headers || {};
        var requestArray = request.toString().split("?");
        var requestHeaders = (requestArray.length > 1) ? requestArray[1].split('&') : false;
        if (requestHeaders) {
          //request = requestHeaders[0];
          var extraHeaders = {};
          for (var i=0; i<requestHeaders.length; i++) {
            var thisPair = requestHeaders[i].split('=');
            extraHeaders[thisPair[0]] = thisPair[i];
          }
          $.extend(extraHeaders, headers);
          headers = extraHeaders;
        }
        if (theApi.smartkey) headers = $.extend(true, headers, {"smartkey":theApi.smartkey});
        if (theApi.authorization) headers = $.extend(true, headers, {"Authorization":"Basic "+theApi.authorization});
        var settings = $.extend({}, theApi.defaults, settings);
        settings.verb = verb;
        var fullRequest = request.toString().split(".")
        request = fullRequest[0];
        if (fullRequest.length > 1) settings.type = fullRequest[1];
        if (settings.type === 'jsonp') settings.type = 'json';
        console.log('url: '+settings.endpoint+request+'.'+settings.type.split(" ")[0]);
        console.log('data: '+JSON.stringify(headers));
        console.log('verb: '+settings.verb);
        var requestData = (settings.verb === 'get') ? null : JSON.stringify(headers);
        if (settings.popnewwin && (settings.popnewwin === 'true')) window.open(settings.endpoint+request+'.'+settings.type.split(" ")[0]);
        $.ajax({
          url: settings.endpoint+request+'.'+settings.type.split(" ")[0],
          headers: headers,
          data: requestData, //JSON.stringify(headers),
          type: settings.verb,
          dataType: settings.type,
          contentType: "application/json",
          xhrFields: {
            withCredentials: true
          },
          success: function(data,textStatus,jqXHR) {
            returnObject.response_message = textStatus;
            returnObject.payload = data;
            returnObject.xhr = jqXHR;
            if (settings.callback) {
              var callbackFunction = new Function(settings.callback+'(\''+JSON.stringify(data)+'\')');
              callbackFunction();
            }     
            $.after_request();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            responseMessage = textStatus+" ("+errorThrown+")";
            console.log(responseMessage);
            returnObject.response_message = responseMessage;
            returnObject.xhr = jqXHR;
            try {
              showResponseMessage('Sorry, that didn’t work. Please <a href="#" title="instructions">check the instructions</a> and try again.');
            } catch (e) {
            
            }
            $.after_request();
          }
        });
        return returnObject;
      }
    }
/**
  * check if environment supports localStorage
*/
    this.checkLocalStorage = function () {
      try {
        return (('localStorage' in window) && (window.localStorage !== null));
      } catch (e) {
        return false;
      }
    }
    this.doesLocalStorage = this.checkLocalStorage();
/**
  * base64-encodes username and password, adds this to the ApigeeAPI object, which in turn adds it as a header to each subsequent request
*/
    this.init = function(username,password) {
      var username = username || "";
      var password = password || "";
      var authParam = $.base64Encode(username+':'+password);
      theApi.authorization = authParam; 
    };
    var uid = getUrlParam('uid');
    console.log('uid: '+uid);
    if (username && password) {
      this.init(username,password);
    } else if (uid) {
      theApi.authorization = uid;
    } else if (this.doesLocalStorage && localStorage.smartkey) {
      theApi.smartkey = localStorage.smartkey;
    }
  }  
  
  function getUrlParam(paramName) {
    var paramValue = false;
    var urlArray = document.location.href.toString().split("?");
    if (urlArray.length > 1) {
      var paramArray = urlArray[1].toString().split("&");
      for (var i=0; i<paramArray.length; i++) {
        var thisParamSet = paramArray[i].toString().split("=");
        if (thisParamSet[0] == paramName) {
          paramValue = paramArray[i].substring(thisParamSet[0].length + 1);
          break;
        }
      }
    }
    return paramValue;
  }
  
  $.after_request = function() {}
    
  $.apigee_api = function(endpoint,username,password) {
    return new ApigeeApi(endpoint || false,username || false,password || false);
  }
  
})(jQuery);
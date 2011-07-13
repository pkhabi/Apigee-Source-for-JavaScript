var cliApps = {};

function ApigeeCli() {
  var theCli = this;
  this.apps = {};
  this.doCommand = function(rawCommand) {
    var commandObject = buildCommand(rawCommand || "");
    if (commandObject.hasOwnProperty('noun') && commandObject.hasOwnProperty('verb')) {
      if (theCli.apps.hasOwnProperty(commandObject.noun) && (theCli.apps[commandObject.noun].hasOwnProperty(commandObject.verb) && theCli.apps[commandObject.noun].hasOwnProperty('api'))) {
        theCli.apps[commandObject.noun][commandObject.verb](commandObject.params);     
      } else if (commandObject.noun === 'create') {
        var appName = commandObject.verb;
        if (!(theCli.apps[appName])) theCli.apps[appName] = new ApigeeApp(appName,commandObject.params); //possible to pass in username, password here and have that respected
      } else {
        console.log('Could not build request');
      }
    } else {
      console.log('Command was not formed properly');
    }
  }
  var buildCommand = function(rawCommand) {
    var trimmedCommand = $.trim(rawCommand.replace(/\s+/gi,' '));
    var extraVerbiage = {
      " app " : " ",
      " add provider " : " add_provider ",
      " add user " : " add_user ",
      " to smartkey " : " ",
      " authorization for smartkey " : " ",
      " authorization" : "",
      " access " : " "
    };
    for (var beforeString in extraVerbiage) {
      if (extraVerbiage.hasOwnProperty(beforeString)) {
        trimmedCommand = trimmedCommand.replace(new RegExp(beforeString,'gi'),extraVerbiage[beforeString]);
      }
    }
    var commandArray = trimmedCommand.split(" ");
    var cleanCommand = {};
    if (commandArray.length > 1) {
      cleanCommand = {
        "noun" : commandArray.shift(),
        "verb" : commandArray.shift()
      };
      cleanCommand.params = (commandArray.length > 0) ? commandArray : null;
    }
    return cleanCommand;
  }  
}

function ApigeeApp(appName,requestParams) {
  var theApp = this;
  this.providers = {};
  this.users = {};
  this.preparams = {};
  this.create = function(appName) {
    var appName = parseAndReturn(appName);
    if (appName.hasOwnProperty('appName')) {
/*
      if (appName.hasOwnProperty('endpoint')) {
        theApp.api.defaults.endpoint = appName.endpoint + '/';
      }
*/
      showResponseMessage('App endpoint: '+appName.endpoint+'<br />[<strong>'+appName.appName+' created</strong> - You\'ve completed step 1 of 5]');
    } else {
      theApp.api.request('post','apps',{'appName':appName,'displayName':appName,'version':'0'},{'callback':'cliApps["'+appName+'"].create'});
    }
  }
  this.configure = function(requestParams) {
    if ($.isArray(requestParams)) {
      if (theApp.providers.hasOwnProperty(requestParams[0]) && (requestParams.length === 3)) {
        var providerName = requestParams[0];
        var newParams = {'consumerKey':requestParams[1],'consumerSecret':requestParams[2]};
        $.extend(theApp.providers[providerName].preparams, newParams);
        theApp.api.request('post','apps/'+theApp.appName+'/providers/'+providerName+'/credentials',newParams,{'callback':'cliApps["'+theApp.appName+'"].configure'}); 
      }
    } else {
      var requestParams = parseAndReturn(requestParams);
      if (requestParams.hasOwnProperty("provider") && theApp.providers.hasOwnProperty(requestParams.provider)) {
        showResponseMessage(requestParams.provider+' Consumer Key and Secret added to '+theApp.appName+'.  Users can now be authenticated with '+requestParams.provider+'.<br />[<strong>'+requestParams.provider+' is now configured</strong> - You\'ve completed step 3 of 5]');
      }
    }
  }
  this.add_provider = function(requestParams) {
    if ($.isArray(requestParams)) {
      var providername = requestParams[0];
      if (!(theApp.providers.hasOwnProperty(providername))) {
        theApp.providers[providername] = new ApigeeProvider(providername);   
        showResponseMessage(providername+' uses OAuth 1.0a. You will need the Consumer Key and Consumer Secret that '+providername+' provides for your app, see: <a href="http://dev.twitter.com/applications" title="documentation">http://dev.twitter.com/applications</a><br />[<strong>'+providername+' added to '+theApp.appName+'</strong> - You\'ve completed step 2 of 5]');   
      }
    }
  }
  this.add_user = function(requestParams) {
    if ($.isArray(requestParams)) {
      var username = requestParams[0];
      var password = requestParams[1];
      if (!(theApp.users.hasOwnProperty(username))) {
        theApp.api.request('post','apps/'+theApp.appName+'/users',{'userName':username,'fullName':username,'password':password},{'callback':'cliApps["'+theApp.appName+'"].add_user'});
      }
    } else {
      var requestParams = parseAndReturn(requestParams);
      if (requestParams.hasOwnProperty('userName') && requestParams.hasOwnProperty('smartKey')) {
        theApp.users[requestParams.userName] = new ApigeeUser(requestParams);
        showResponseMessage('Username and password exchanged for an Apigee SmartKey.  The SmartKey for '+requestParams.userName+' is '+requestParams.smartKey+'.  You\'ll use this SmartKey to authorize all API calls on behalf of this new user.<br />Keep this secret safe!<br />[<strong>user '+requestParams.userName+' added to '+theApp.appName+'</strong>]<br /><a href="http://api.apigee.com/v1/apps/'+theApp.appName+'/providers/twitter/authenticate?smartkey='+requestParams.smartKey+'&app_callback=www.google.com" title="authenticate in a new window" target="_blank">Connect the '+theApp.appName+' application user to a twitter account</a> for API request testing.<br />[<strong>After you connect the user to the twitter account</strong> - You\'ve completed step 4 of 5]'); 
        
/*
        https://api.apigee.com/v1/ is the endpoint
        https://api.apigee.com/v1/apps/fw0/providers/twitter/credentials.json
        http://api.apigee.com/v1/apps/fw0/providers/twitter/authenticate?smartkey='+requestParams.smartKey+'&app_callback=www.google.com
        
        http://'+theApp.appName+'-api.apigee.com/v1/providers/twitter/authenticate?smartkey='+requestParams.smartKey+'&app_callback=www.google.com
        
        
        http://api.twitter.com/oauth/authorize?oauth_token=
        2. Authenticate (Start the dance)
    http://favewits11-api.apigee.com/v1/providers/twitter/authenticate?smartkey=8bdb28f7-15a1-4f00-bd34-4ea5b2f95686&app_callback=www.google.com

3. Issue a request
    http://favewits11-api.apigee.com/v1/twitter/1/statuses/home_timeline.xml?smartkey=8bdb28f7-15a1-4f00-bd34-4ea5b2f95686
*/
        
      }
    }
  }
  this.add = function(requestParams) {
    if ($.isArray(requestParams)) {
      if (theApp.providers.hasOwnProperty(requestParams[0]) && (requestParams.length === 4)) {
        var newRequest = theApp.api.request('post','smartkeys/'+requestParams[3]+'/providers/'+requestParams[0],{"oauthToken":requestParams[1],"oauth_token_secret":requestParams[2]});
        newRequest.responseMessage = requestParams[0]+' Access Key and Secret added to the SmartKey.  You can now make authenticated requests to the '+requestParams[0]+' API with this SmartKey.<br /><strong>[smartkey '+requestParams[3]+' is authorized with '+requestParams[0]+']</strong>';
        showResponseMessage(newRequest.responseMessage);
      }
    }
  }
  this.get = function(requestParams) {
    if ($.isArray(requestParams)) {
      if (theApp.providers.hasOwnProperty(requestParams[0]) && (requestParams.length === 1)) {
        console.log('request here');
        /*
var newRequest = theApp.api.request('get','apps/'+theApp.appName+'/providers/'+requestParams[0]+'/authurl.json',{},{});
        newRequest.responseMessage = 'The authorization url is <a href="https://api.twitter.com/oauth/authorize?taoethth">https://api.twitter.com/oauth/authorize?taoethth</a>.  Sign in with '+requestParams[0]+' and make '+theApp.appName+' a trusted application.';
        showResponseMessage(newRequest.responseMessage);
*/
      } else {
        var newRequest = theApp.api.request('get',requestParams[0]);
        newRequest.responseMessage = '';
        showResponseMessage(newRequest.responseMessage);
      }
    } else if (requestParams.hasOwnProperty('authurl') && requestParams.hasOwnProperty('authorization')) {
      //pop a new window with authurl so that we can do the dance; example response headers are:
      /* {“authurl”:”http://api.twitter.com/oauth/request_token”,”authorization”:{"oauth_nonce":"QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk","oauth_callback":"https%3A%2F%2Fapigee.com%2F%cli%2Fdance?3A3005%2Fthe_dance%2Fprocess_callback%3Fservice_provider_id%3D11","oauth_signature_method":"HMAC-SHA1","oauth_timestamp":"1272323042","oauth_consumer_key":"GDdmIQH6jhtmLUypg82g","oauth_signature":"8wUi7m5HFQy76nowoCThusfgB%2BQ%3D","oauth_version":"1.0"}} */
    }
  }
  this.init = function(appName,requestParams) {
    //var endPoint = 'https://'+appName+'-api.apigee.com';
    //var endPoint = 'http://fountainhead.apigee.com';
    var endPoint = 'https://api.apigee.com/v1/';
    var appParams = (requestParams == null) ? endPoint : [endPoint].concat(requestParams).join(',');
    theApp.api = (requestParams === null) ? new $.apigee_api(endPoint) : new $.apigee_api(endPoint,requestParams[0],requestParams[1])
    theApp.appName = appName;
    cliApps[appName] = theApp;
    theApp.create(appName);
  }
  if (appName) this.init(appName,requestParams);
}

function ApigeeProvider(providername) {
  var theProvider = this;
  this.preparams = {};
  this.configure = function(responseObject) {
    for (var key in responseObject) {
      if (responseObject.hasOwnProperty(key)) {
        theProvider[key] = responseObject[key];
      }
    }
    theProvider.preparams = {};
  }
  this.init = function(providername) {
    theProvider.providername = providername;
  }
  if (providername) this.init(providername);
}

function ApigeeUser(responseObject) {
  var theUser = this;
  this.preparams = {};
  this.init = function(responseObject) {
    for (var key in responseObject) {
      if (responseObject.hasOwnProperty(key)) {
        theUser[key] = responseObject[key];
      }
    }
    theUser.preparams = {};
  }
  this.init(responseObject);
}

function showResponseMessage(responseMessage) {
  console.log(responseMessage);
}

function parseAndReturn(theText) {
  var theJson = '';
  try {
    theJson = $.parseJSON(theText);
  } catch (e) {
    theJson = theText;
  }
  return theJson;
}

/*
TRANSLATION MAPPING
create app favewits - create APPNAME
favewits configure twitter 89aoi8a9a98 aio89ai8ad89a092 - APPNAME configure providername CONSUMERKEY CONSUMERSECRET
favewits add provider twitter - APPNAME add_provider providername
favewits add user marsh@earth2marsh.com supersecret0 - APPNAME add_user username PASSWORD
favewits add twitter access 53745772890 53tn5hd369iue to smartkey 220961tty9089 - APPNAME add providername ACCESSKEY SECRET SMARTKEY
favewits get twitter authorization for smartkey 220961tty9089 - APPNAME get providername SMARTKEY
favewits get /twitter/1/statuses/home_timeline.json?smartkey=220961tty9089 - APPNAME get URL
*/
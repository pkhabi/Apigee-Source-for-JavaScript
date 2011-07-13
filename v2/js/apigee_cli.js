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
        if (!(theCli.apps[appName])) theCli.apps[appName] = new ApigeeApp(appName,commandObject.params);
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
      //theApp.api.defaults.endpoint = appName.endpoint + '/v1/';
      showResponseMessage('App endpoint: '+appName.endpoint+'<br /><span>[<strong>'+appName.appName+' created</strong> - You\'ve completed step 1 of 5]</span>');
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
        showResponseMessage(requestParams.provider+' Consumer Key and Secret added to '+theApp.appName+'.  Users can now be authenticated with '+requestParams.provider+'.<br /><span>[<strong>'+requestParams.provider+' is now configured</strong> - You\'ve completed step 3 of 5]</span>');
      }
    }
  }
  this.add_provider = function(requestParams) {
    if ($.isArray(requestParams)) {
      var providername = requestParams[0];
      if (!(theApp.providers.hasOwnProperty(providername))) {
        theApp.providers[providername] = new ApigeeProvider(providername);   
        showResponseMessage(providername+' uses OAuth 1.0a. You will need the Consumer Key and Consumer Secret that '+providername+' provides for your app, see: <a href="http://dev.twitter.com/applications" title="documentation">http://dev.twitter.com/applications</a><br /><span>[<strong>'+providername+' added to '+theApp.appName+'</strong> - You\'ve completed step 2 of 5]</span>');   
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
        showResponseMessage('Username and password exchanged for an Apigee SmartKey.  The SmartKey for '+requestParams.userName+' is '+requestParams.smartKey+'.  You\'ll use this SmartKey to authorize all API calls on behalf of this new user.<br />Keep this secret safe!<br /><span>[<strong>user '+requestParams.userName+' added to '+theApp.appName+'</strong>]</span><br /><a href="http://'+theApp.appName+'-api.apigee.com/v1/providers/twitter/authenticate?smartkey='+requestParams.smartKey+'&app_callback=https://apigee.com/oauthSuccess.jsp" title="authenticate in a new window" target="_blank">Connect the '+theApp.appName+' application user to a twitter account</a> for API request testing.<br /><span>[<strong>After you connect the user to the twitter account</strong> - You\'ve completed step 4 of 5]</span>');         
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
    theApp.verbRequest('get',requestParams);
  }
  this.verbRequest = function(verb,requestParams) {
    if ($.isArray(requestParams)) {
      theApp.api.request(verb,requestParams,{},{'endpoint':'http://'+theApp.appName+'-api.apigee.com/v1','callback':'cliApps["'+theApp.appName+'"].'+verb});
    } else {
      var requestParams = parseAndReturn(requestParams);
      showResponseMessage('Congrats, you\'ve made an authenticated call!<br /><span>[<strong>Source Setup Complete!</strong>]</span><br /><a href="#" title="download">Download the code library</a> and paste your endpoint into the sample app source code: http://'+theApp.appName+'-api.apigee.com<br />Upload the sample app to the web server of your choice and off you go!<br />Thank you for getting your app started with Apigee Source.  Please send feedback to <a href="mailto:feedback@apigee.com?subject=Source Labs Feedback" title="send feedback">feedback@apigee.com</a>');      
    }
  }
  this.init = function(appName,requestParams) {
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
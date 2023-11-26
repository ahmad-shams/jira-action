const fs = require('fs')

var jiraUserName = process.env.JIRA_USER_NAME
var jiraUserToken = process.env.JIRA_USER_TOKEN
var jiraAPI = process.env.JIRA_API
var githubOutput = process.env.GITHUB_OUTPUT
var jiraParams = process.env.JIRA_PARAMS

var myHeaders = new Headers()

myHeaders.append(
  'Authorization',
  'Basic ' + Buffer.from(jiraUserName + ':' + jiraUserToken).toString('base64')
)
myHeaders.append(
  'Cookie',
  'atlassian.xsrf.token=7bea62edb9351620fd1ae50dfa58e608607c01bf_lin'
)

getEvents = (myHeaders, githubOutput) => {

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }
  
  fetch('https://dariosw.atlassian.net/rest/api/2/' + jiraAPI, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result)
      fs.writeFileSync(githubOutput, 'jira-api-output=' + JSON.stringify(result))
    })
    .catch(error => console.log('error', error))
}


searchJira = (myHeaders, githubOutput, jiraParams) => {

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }

  paramsJSON = JSON.parse(jiraParams);
  paramsString = "";
  for (const key in paramsJSON){
    if(paramsJSON.hasOwnProperty(key)){
      console.log(`${key} : ${res[key]}`);
      paramsString.append(key + "=" + res[key] + "&");
    }
  }
  paramsString = paramsString.replace(/&\s*$/, "");

  fetch('https://dariosw.atlassian.net/rest/api/2/' + jiraAPI + "?jql="+paramsString, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result)
      fs.writeFileSync(githubOutput, 'jira-api-output=' + JSON.stringify(result))
    })
    .catch(error => console.log('error', error))
}





  switch (jiraAPI) {
    case "events":
      return getEvents(myHeaders, githubOutput)
      break;
    case "search":
      return searchJira(myHeaders, githubOutput, jiraParams)
      break;

    default:
      console.log("I don't own a pet");
      break;
  }

  // http://kelpie9:8081/rest/api/2/search?jql=assignee=fred&startAt=2&maxResults=2
const fs = require('fs')

const FIELD_BRANCH = "\"Branch[Radio Buttons]\""; //"customfield_11985";
const FIELD_REPOSITORY = "\"Repository[URL Field]\"";

var jiraUserName = process.env.JIRA_USER_NAME
var jiraUserToken = process.env.JIRA_USER_TOKEN
var jiraAPI = process.env.JIRA_API
var githubOutput = process.env.GITHUB_OUTPUT
var jiraParams = process.env.JIRA_PARAMS
var githubRefName = process.env.GITHUB_REF_NAME
var githubRepo = process.env.GITHUB_REPOSITORY
var githubRefProtected = process.env.GITHUB_REF_PROTECTED
var githubServerURL = process.env.GITHUB_SERVER_URL


var myHeaders = new Headers()

var globalParams = { "project": "DEVOPS", "type": "Release" };
globalParams[FIELD_BRANCH] = githubRefName;
globalParams[FIELD_REPOSITORY] = githubServerURL + "/" + githubRepo;


myHeaders.append(
  'Authorization',
  'Basic ' + Buffer.from(jiraUserName + ':' + jiraUserToken).toString('base64')
)
myHeaders.append(
  'Cookie',
  'atlassian.xsrf.token=7bea62edb9351620fd1ae50dfa58e608607c01bf_lin'
)


async function createJira(myHeaders, githubOutput, jiraParams) {
  let myJira = {};
  let myJiraList = await searchJira(myHeaders, githubOutput, jiraParams);
  let total = myJiraList.total;

  if (total === 0) {
    console.log("Jira Should be created");
    let data = {
      "fields": {
        "project":
        {
          "key": globalParams.project
        },
        "summary": " Build Number:" + process.env.GITHUB_RUN_ID,
        "description": "Test By Ahmad",
        "issuetype": {
          "name": globalParams.type
        },
        "customfield_11985": {
          "value": githubRefName
        },
        "customfield_11986": githubServerURL + "/" + githubRepo,


      }
    }

    console.log(data);
    myHeaders.append(
      "Content-Type", "application/json"
    )

    let myJira = await fetch("https://dariosw.atlassian.net/rest/api/2/issue/", {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data)
    })
      .then(response => response.text())
      .then(result => {
        console.log(result);
        return JSON.parse(result || '{}');
      })
      .catch(error => {
        console.log('error', error)
        return error;
      })
  } else {
    myJira = myJiraList.issues[0];
  }

  let jiraId = myJira.id;
  let jiraKey = myJira.key;
  console.log(myJiraList.total);

}

async function searchJira(myHeaders, githubOutput, jiraParams) {
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }

  let paramsJSON = JSON.parse(jiraParams || "{}");
  Object.keys(globalParams).forEach(function (key) {
    paramsJSON[key] = globalParams[key];
  })


  let paramsString = "";

  console.log(paramsJSON);

  Object.keys(paramsJSON).forEach(function (key) {
    console.log(key, paramsJSON[key]);
    paramsString += key + "=\"" + paramsJSON[key] + "\" and "
  })
  paramsString = encodeURIComponent(paramsString.replace(/\s*and\s*$/, ""));
  console.log("https://dariosw.atlassian.net/rest/api/2/search?jql=" + paramsString);

  return await fetch("https://dariosw.atlassian.net/rest/api/2/search?jql=" + paramsString, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result);
      fs.writeFileSync(githubOutput, 'jira-api-output=' + JSON.stringify(result));
      return JSON.parse(result);
    })
    .catch(error => {
      console.log('error', error)
      return error;
    })
}





switch (jiraAPI) {

  case "search":
    return searchJira(myHeaders, githubOutput, jiraParams)
    break;
  case "createJira":
    return createJira(myHeaders, githubOutput, jiraParams)
    break;


  default:
    console.log("No API Specified");
    break;
}

// http://kelpie9:8081/rest/api/2/search?jql=assignee=fred&startAt=2&maxResults=2
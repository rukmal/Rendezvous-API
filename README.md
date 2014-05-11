# [Rendezvous](http://getrendezvous.co) API Endpoints

This Wiki contains documentation for all Rendezvous REST API endpoints. All functioning endpoints are documented below. There is currently no limit on API calls per user.

Base URL: http://api.getrendezvous.co/

**IMPORTANT:**
- **Most API calls require a valid API key. Contact system administrator for more information. API keys must be passed through with the header 'key', unless otherwise specified.**
- **All status codes are returned as a JSON object with a key 'status'**

*Note: For information about HTTP error codes, see the W3 guide [here](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).*

##```/user``` Endpoint

|Endpoint|Method|Request Headers|Response Codes|Response Object Headers|Security|
|:-------|:----:|:--------------|:-------------|:--------------|:-------|
|```/user/new/```|POST|<ul><li>```username``` Username of the new user. Must be unique</li><li>```password``` Password of the new user</li><li>```firstname``` First name of the new user</li><li>```lastname``` Last name of the new user</li><li>```email``` Email address of the new user</li><li>```picture``` URL to user picture. Can be blank, but the header is required</li><li>```phone``` Phone number of the new user</li></ul>|<ul><li>```200``` All OK. Returns new user object</li><li>```400``` Invalid request</li><li>```409``` Duplicates detected in conflicting fields. User not added</li></ul>|Response code ```200```|API key|
|```/user/new/```|PUT|<ul><li>```username``` Username of the new user</li><li>```code``` Confirmation code of the new user</li></ul>|<ul><li>```200``` All OK. User object sent as response</li><li>```204``` User object not found. This would occur if this step is attempted before initializing the new user</li><li>```400``` Invalid request</li><li>```401``` Unauthorized. Confirmation codes did not match</li><li>```409``` Duplicate fields found. This occurs when another user has signed up before the current user has completed his/her authentication process</li></ul>|<ul><li>```firstname``` First name of the user</li><li>```lastname``` Last name of the user</li><li>```password``` Hashed password (for local authentication)</li><li>```username``` Username of the user</li><li>```phone``` Phone number of the user</li><li>```email``` Email address of the user</li><li>```picture``` URL of the user picture</li><li>```friends``` Friend's user object of the current user</li><li>```current_status``` Current status of the user</li></ul>|API key|
|```/user/login/```|POST|<ul><li>```username``` Username of the person to be logged on</li><li>```password``` Password of the user</li></ul>|<ul><li>```200``` All OK. Returns user object</li><li>```204``` Username not found on server</li><li>```400``` Invalid request</li><li>```401``` Unauthorized. Valid username, invalid password</li></ul>|<ul><li>```firstname``` First name of the user</li><li>```lastname``` Last name of the user</li><li>```password``` Hashed password (for local authentication)</li><li>```username``` Username of the user</li><li>```phone``` Phone number of the user</li><li>```email``` Email address of the user</li><li>```picture``` URL of the user picture</li><li>```friends``` Friend's user object of the current user</li><li>```current_status``` Current status of the user</li></ul>|API key|


## Workflows

### Adding a new user

Due to the nature of the two step verification process of adding a new user, two seperate requests must be made. The following steps must be followed:

- Send a POST request to the ```/user/new/``` endpoint with the required headers. This will then send a verification text message to the user.
- Prompt the user to enter the confirmation code sent via text, and send a PUT request to ```/user/new/``` with the required headers. This process will authenticate the confirmation code and add the new user to the database.
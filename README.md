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
|```/user/new/```|POST|<ul><li>```username``` Username of the new user. Must be unique</li><li>```password``` Password of the new user</li><li>```firstname``` First name of the new user</li><li>```lastname``` Last name of the new user</li><li>```facebook_id``` Facebook ID of the user (if logging in with Facebook) [optional]<li>```picture``` URL to user picture. Can be blank, but the header is required</li><li>```phone``` Phone number of the new user</li></ul>|<ul><li>```200``` All OK. Returns new user object</li><li>```400``` Invalid request</li><li>```409``` Duplicates detected in conflicting fields. User not added</li></ul>|Response code ```200```|API key|
|```/user/new/```|PUT|<ul><li>```username``` Username of the new user</li><li>```code``` Confirmation code of the new user</li></ul>|<ul><li>```200``` All OK. User object sent as response</li><li>```204``` User object not found. This would occur if this step is attempted before initializing the new user</li><li>```400``` Invalid request</li><li>```401``` Unauthorized. Confirmation codes did not match</li><li>```409``` Duplicate fields found. This occurs when another user has signed up before the current user has completed his/her authentication process</li></ul>|<ul><li>```firstname``` First name of the user</li><li>```lastname``` Last name of the user</li><li>```facebook_id``` Facebook ID of the user (only appears if the user initially authenticated with Facebook)</li><li>```password``` Hashed password (for local authentication)</li><li>```username``` Username of the user</li><li>```phone``` Phone number of the user</li><li>```picture``` URL of the user picture</li><li>```friends``` Friend's user object of the current user</li><li>```current_status``` Current status of the user</li></ul>|API key|
|```/user/exists/```|GET|<ul><li>```username``` Username to be checked for availability</li></ul>|<ul><li>```200``` All OK. Request succcessful</li><li>```400``` Invalid request</li></ul>|<ul><li>```availability``` Boolean value. True if available, false if not</li></ul>|API key|
|```/user/exists/fb/```|GET|<ul><li>```facebook_id``` Facebook ID of the person to be serached for in the database</li></ul>|<ul><li>```200``` All OK. Returns the user object of the corresponding person (if it exists)</li><li>```204``` No user found for the corresponding ID</li><li>```400``` Invalid request</li></ul>|<ul><li>```firstname``` First name of the user</li><li>```lastname``` Last name of the user</li><li>```facebook_id``` Facebook ID of the user (only appears if they registered with it)<li>```password``` Hashed password (for local authentication)</li><li>```username``` Username of the user</li><li>```phone``` Phone number of the user</li><li>```picture``` URL of the user picture</li><li>```friends``` Friend's user object of the current user</li><li>```current_status``` Current status of the user</li></ul>|API key|
|```/user/login/```|POST|<ul><li>```username``` Username of the person to be logged on</li><li>```password``` Password of the user</li></ul>|<ul><li>```200``` All OK. Returns user object</li><li>```204``` Username not found on server</li><li>```400``` Invalid request</li><li>```401``` Unauthorized. Valid username, invalid password</li></ul>|<ul><li>```firstname``` First name of the user</li><li>```lastname``` Last name of the user</li><li>```facebook_id``` Facebook ID of the user (only appears if they registered with it)<li>```password``` Hashed password (for local authentication)</li><li>```username``` Username of the user</li><li>```phone``` Phone number of the user</li><li>```picture``` URL of the user picture</li><li>```friends``` Friend's user object of the current user</li><li>```current_status``` Current status of the user</li></ul>|API key|

##```/status``` Endpoint

|Endpoint|Method|Request Headers|Response Codes|Response Object Headers|Security|
|:-------|:----:|:--------------|:-------------|:--------------|:-------|
|```/status/new/```|POST|<ul><li>```username``` Username of the person whose status is to be set</li><li>```type``` Type of status (i.e. Movie, Chill etc.)</li><li>```location_lat``` Latitudinal location of the person at the time the post was made</li><li>```location_lon``` Longitudinal location of the person at the time the post was made</li><li>```expiration_time``` Expiration time of the post (OPTIONAL). If not set, this value falls back to the default. This must be sent in milliseconds</li></ul>|<ul><li>```200``` All OK. Returns status object with the following fields</li><li>```400``` Invalid request</li><li>```409``` Duplicates detected. The current status must either be deleted with a DELETE request, or updated with a PUT request. See other endpoints|<ul><li>```time``` Time the status object was created</li><li>```type``` Type of the status (i.e. Movie, chill etc.)</li><li>````location_lat``` Latitude of the user when the status was created</li><li>```location_lon``` Longitude of the user when the statuswas created</li><li>```expiration_time``` Expiration time of the status (JS date object)</li></ul>|API key|

## Workflows

### Adding a new user

Due to the nature of the two step verification process of adding a new user, two seperate requests must be made. The following steps must be followed:

- Send a POST request to the ```/user/new/``` endpoint with the required headers. This will then send a verification text message to the user.
- Prompt the user to enter the confirmation code sent via text, and send a PUT request to ```/user/new/``` with the required headers. This process will authenticate the confirmation code and add the new user to the database.
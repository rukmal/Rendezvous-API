# Author: Rukmal Weerawarana
#
# Description: Shell script to run all services to run the application in the background

sudo npm install
sudo mongod &
sudo nodejs app.js
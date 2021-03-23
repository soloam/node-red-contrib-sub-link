# node-red-contrib-sub-link
# Sub Link - A link to Subflows

## Install

npm install node-red-contrib-sub-link


## Usage
This node can be used to link flows and subflows, it will flow the image from a input, casting to all outputs that are linked. Linking can  be done by configuring a link and can be refined by topics, similar to MQTT

### Config
![Config](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/alpha/resources/config.png)

**Name:** Name of the link

**Clone All Messages:** Clones all messages that are handled by this link

### Input
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/alpha/resources/input.png)

**Link:** The selected link to handle the messages

**Topic:** The topic that will send the message, this is optional. If not specified, only outputs with all (#) wildcard will recive the message, and outputs without topic

### Output
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/alpha/resources/output.png)

**Link:** The selected link to handle the messages

**Topic:** The topic that will send the message, this is optional. If not specified, only outputs with all (#) wildcard will recive the message, and outputs without topic

**Clone:** Clones all messages that are exit this node

## Example
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/alpha/resources/example.png)

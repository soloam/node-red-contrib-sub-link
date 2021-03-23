# node-red-contrib-sub-link
# Sub Link - A link to Subflows

## Install
```
npm install node-red-contrib-sub-link
```

## Usage
This node can be used to link flows and subflows, it will send the message from an input, casting to all outputs that are linked. Linking can be done by configuring a "link" (each configuration node is a link) and can be refined by topics, similar to MQTT, a alias or even a direct id of the istance.


A message can be sent as it is, or cloned! Cloning a message can be achieved by cloning in the link (config node), in the output of the message. A message that is cloned will be a new instance of the object. If not cloned, all changes to the message in one flow, will impact the other.

### Config
![Config](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/config.png)

- **Name:** Name of the link
- **Clone All Messages:** Clones all messages that are handled by this link



### Input
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/input.png)

- **Link:** The selected link to handle the messages
- **Topic:** The topic that will send the message, this is optional. If not specified, only outputs with all wildcard (#) and outputs without topic will receive the message

- **Message Properties**
    - **subTopic**: The topic to send the message
    - **subAlias**: The alias from the output node (can be captured in the output message in subMyAlias)
    - **subId**: The id from the output node (can be captured in the output message in subMyId)

### Output
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/output.png)

- **Link:** The selected link to handle the messages
- **Topic:** The topic that will send the message, this is optional. If not specified, only outputs with all wildcard (#) and outputs without topic will receive the message
- **Clone:** Clones all messages that exit this node

- **Message Properties**
    - **subTopic**: The topic of the message
    - **subMyAlias**: The alias the output node (can be captured in the output message in subMyAlias)
    - **subMyId**: The id from the output node (can be captured in the output message in subMyId)
    - **subFromId**: The id of the input node



## Example
![Input](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/example-1.png)

```
[{"id":"adedd85f.d15e58","type":"subflow","name":"Subflow test/2 - Alias","info":"","category":"","in":[],"out":[{"x":260,"y":60,"wires":[{"id":"fa346945.85eea8","port":0}]}],"env":[],"color":"#DDAA99"},{"id":"fa346945.85eea8","type":"sub-link-output","z":"adedd85f.d15e58","name":"","topic":"test/2","link":"d3ff029b.e3a1","alias":"myalias","clone":true,"x":110,"y":60,"wires":[[]]},{"id":"b541e6c.edc0418","type":"subflow","name":"Subflow Empty","info":"","category":"","in":[],"out":[{"x":360,"y":80,"wires":[{"id":"c87ae8c6.9bf478","port":0}]}],"env":[],"color":"#DDAA99"},{"id":"c87ae8c6.9bf478","type":"sub-link-output","z":"b541e6c.edc0418","name":"","link":"d3ff029b.e3a1","clone":true,"x":200,"y":80,"wires":[[]]},{"id":"1a29752.8268f8b","type":"subflow","name":"Subflow #","info":"","category":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"9d0d79d0.c7cd68","port":0}]}],"env":[],"color":"#DDAA99"},{"id":"9d0d79d0.c7cd68","type":"sub-link-output","z":"1a29752.8268f8b","name":"","topic":"#","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[]]},{"id":"f4458344.f38d4","type":"subflow","name":"Subflow test/2","info":"","category":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"68691869.3c7178","port":0}]}],"env":[],"color":"#DDAA99"},{"id":"68691869.3c7178","type":"sub-link-output","z":"f4458344.f38d4","name":"","topic":"test/2","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[]]},{"id":"437255a2.1856bc","type":"subflow","name":"Subflow 5","info":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"cec150.29716eb","port":0}]}]},{"id":"cec150.29716eb","type":"sub-link-output","z":"437255a2.1856bc","name":"","topic":"test/1","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[]]},{"id":"b6731dd8.60d45","type":"tab","label":"SubLink Example","disabled":false,"info":""},{"id":"653cb1a0.91487","type":"sub-link-input","z":"b6731dd8.60d45","name":"","topic":"test/1","link":"d3ff029b.e3a1","x":270,"y":40,"wires":[]},{"id":"55745a84.770bd4","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":40,"wires":[["653cb1a0.91487"]]},{"id":"fe4b9bf7.dbd198","type":"sub-link-output","z":"b6731dd8.60d45","name":"Empty","topic":"","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":420,"wires":[["32154fd.2e2d6b"]]},{"id":"32154fd.2e2d6b","type":"debug","z":"b6731dd8.60d45","name":"Test5","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":420,"wires":[]},{"id":"bd7f2e41.6ff6a","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/1","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":260,"wires":[["363322fe.62a8ae"]]},{"id":"363322fe.62a8ae","type":"debug","z":"b6731dd8.60d45","name":"Test1","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":260,"wires":[]},{"id":"95c252aa.c1079","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","alias":"myalias2","clone":true,"x":120,"y":300,"wires":[["1bb779a9.ed2976"]]},{"id":"1bb779a9.ed2976","type":"debug","z":"b6731dd8.60d45","name":"Test2","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":300,"wires":[]},{"id":"aefa9841.70ee58","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"#","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":380,"wires":[["2ec9b537.d952ea"]]},{"id":"2ec9b537.d952ea","type":"debug","z":"b6731dd8.60d45","name":"Test4","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":380,"wires":[]},{"id":"2f407250.f68d7e","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":80,"wires":[["1e6468af.197217"]]},{"id":"1e6468af.197217","type":"sub-link-input","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","x":270,"y":80,"wires":[]},{"id":"e8051ebd.d56d4","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":200,"wires":[["f205d9e8.b7a528"]]},{"id":"f205d9e8.b7a528","type":"sub-link-input","z":"b6731dd8.60d45","name":"","link":"d3ff029b.e3a1","x":300,"y":200,"wires":[]},{"id":"4e5913f2.54149c","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/1","info":"","x":510,"y":40,"wires":[]},{"id":"dafdde3d.a1cf1","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message)","info":"","x":560,"y":80,"wires":[]},{"id":"919fdb87.dc4ba8","type":"comment","z":"b6731dd8.60d45","name":"Sends without topic","info":"","x":490,"y":200,"wires":[]},{"id":"c43fe8c5.c67958","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1","info":"","x":530,"y":260,"wires":[]},{"id":"52da3e1f.c66cf","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2","info":"","x":530,"y":300,"wires":[]},{"id":"16420768.4e7cb9","type":"comment","z":"b6731dd8.60d45","name":"Receives All","info":"","x":470,"y":380,"wires":[]},{"id":"547b9a8b.fde254","type":"comment","z":"b6731dd8.60d45","name":"Receives Messages Without SubTopic","info":"","x":550,"y":420,"wires":[]},{"id":"6f215a20.c7b084","type":"debug","z":"b6731dd8.60d45","name":"Test10","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":660,"wires":[]},{"id":"5cf59a66.d77854","type":"debug","z":"b6731dd8.60d45","name":"Test6","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":480,"wires":[]},{"id":"1d563654.7805da","type":"debug","z":"b6731dd8.60d45","name":"Test7","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":520,"wires":[]},{"id":"4208c185.65935","type":"debug","z":"b6731dd8.60d45","name":"Test9","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":620,"wires":[]},{"id":"1c60a82b.6bbf88","type":"subflow:437255a2.1856bc","z":"b6731dd8.60d45","name":"Subflow test/1","env":[],"x":110,"y":480,"wires":[["5cf59a66.d77854"]]},{"id":"561b9cb1.5921f4","type":"subflow:f4458344.f38d4","z":"b6731dd8.60d45","name":"","env":[],"x":110,"y":520,"wires":[["1d563654.7805da"]]},{"id":"77161e7e.9d5a9","type":"subflow:1a29752.8268f8b","z":"b6731dd8.60d45","name":"","env":[],"x":100,"y":620,"wires":[["4208c185.65935"]]},{"id":"6f3cbe2d.ee005","type":"subflow:b541e6c.edc0418","z":"b6731dd8.60d45","name":"","env":[],"x":120,"y":660,"wires":[["6f215a20.c7b084"]]},{"id":"e3c3230a.83a7c","type":"comment","z":"b6731dd8.60d45","name":"Receives All","info":"","x":470,"y":620,"wires":[]},{"id":"1b873936.e73147","type":"comment","z":"b6731dd8.60d45","name":"Receives Messages Without SubTopic","info":"","x":550,"y":660,"wires":[]},{"id":"5f46d312.8e19ec","type":"sub-link-output","z":"b6731dd8.60d45","name":"test/1 - No Clone","topic":"test/1","link":"d3ff029b.e3a1","alias":"","clone":false,"x":120,"y":740,"wires":[["40d140c4.99bf3"]]},{"id":"2094a526.9cc57a","type":"sub-link-output","z":"b6731dd8.60d45","name":"test/1 - No Clone","topic":"test/1","link":"d3ff029b.e3a1","alias":"","clone":false,"x":120,"y":780,"wires":[["337aa181.c4033e"]]},{"id":"c86426fc.bea5f8","type":"debug","z":"b6731dd8.60d45","name":"Test11","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":450,"y":740,"wires":[]},{"id":"27203fa0.7a6fd","type":"debug","z":"b6731dd8.60d45","name":"Test12","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":450,"y":780,"wires":[]},{"id":"337aa181.c4033e","type":"delay","z":"b6731dd8.60d45","name":"","pauseType":"delay","timeout":"1","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":300,"y":780,"wires":[["27203fa0.7a6fd"]]},{"id":"40d140c4.99bf3","type":"change","z":"b6731dd8.60d45","name":"Change","rules":[{"t":"set","p":"payload","pt":"msg","to":"Hello World","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":740,"wires":[["c86426fc.bea5f8"]]},{"id":"bf079277.2ef48","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1","info":"","x":530,"y":480,"wires":[]},{"id":"d9f73743.60ef98","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2","info":"","x":530,"y":520,"wires":[]},{"id":"35ea00ca.c9507","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1 - And Changes","info":"","x":710,"y":740,"wires":[]},{"id":"47d6fe82.50ed8","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1 - Not Cloned, so reflects changes","info":"","x":770,"y":780,"wires":[]},{"id":"fa0070c0.f7e75","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"},{"p":"subId","v":"95c252aa.c1079","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":120,"wires":[["2a6a43dd.493b9c"]]},{"id":"2a6a43dd.493b9c","type":"sub-link-input","z":"b6731dd8.60d45","name":"","link":"d3ff029b.e3a1","x":300,"y":120,"wires":[]},{"id":"908cfa82.3cb648","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message And SubId)","info":"","x":600,"y":120,"wires":[]},{"id":"57d5a4b1.e5513c","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"},{"p":"subAlias","v":"myalias","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":160,"wires":[["a1661205.f55d3"]]},{"id":"a1661205.f55d3","type":"sub-link-input","z":"b6731dd8.60d45","name":"","link":"d3ff029b.e3a1","x":300,"y":160,"wires":[]},{"id":"fe83cc10.617fd","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message And Alias)","info":"","x":590,"y":160,"wires":[]},{"id":"6f7b197a.c697f8","type":"debug","z":"b6731dd8.60d45","name":"Test3","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":340,"wires":[]},{"id":"1e50810c.94dcaf","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2 - Alias","info":"","x":550,"y":340,"wires":[]},{"id":"11c25ae.2fb4ca5","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","alias":"myalias","clone":true,"x":110,"y":340,"wires":[["6f7b197a.c697f8"]]},{"id":"de3de113.eab9b","type":"subflow:adedd85f.d15e58","z":"b6731dd8.60d45","name":"","env":[],"x":130,"y":560,"wires":[["275146d.b2e3dba"]]},{"id":"275146d.b2e3dba","type":"debug","z":"b6731dd8.60d45","name":"Test8","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":560,"wires":[]},{"id":"362bbce8.a728f4","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2 - Alias","info":"","x":550,"y":560,"wires":[]},{"id":"d3ff029b.e3a1","type":"sub-link-config","name":"Test","clone":false}]
```
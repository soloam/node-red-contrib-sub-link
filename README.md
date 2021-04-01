# **node-red-contrib-sub-link**

# Sub Link - A link to Subflows

## **Install**

```
npm install node-red-contrib-sub-link
```

## **Usage**

This node can be used to link flows and subflows, it will send the message from an sending node, casting to all receaving nodes that are linked. Linking can be done by configuring a "link" (each configuration node is a link) and can be refined by topics, similar to MQTT, a alias or even a direct id of the instance.

A message can be sent as it is, or cloned! Cloning a message can be achieved by cloning in the link (config node) or in the output of the message. A message that is cloned will be a new instance of the object. If not cloned, all changes to the message in one flow, will impact the other (see example, test11 and test12)

### **Config**

Config node acts like a router to send the messages, you can have multiple config nodes, each will handle is own messages.

![Config](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/config.png)

- **Name:** Name of the link
- **Clone All Messages:** Clones all messages that are handled by this link

### **Send Message**

![Send](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/send.png)

- **Link:** The selected link to handle the messages
- **Topic:** The topic that will send the message, this is optional. If not specified, only outputs with all wildcard (#) and outputs without topic will receive the message
- **Alias:** The alias that will recive the message, it can be a string or a array of multiple strings (multiple aliases). A special char "#" can be set to send the message to all the nodes.
- **Match All Alias:** All the alias from this node must be contained in the destination node to cast a message

- **Message Properties**
  - **subTopic:** The topic to send the message
  - **subAlias:** The alias from the sending node, can be a string or a array of strings
  - **subId:** The id from the receaving node
  - **aliasMatchAll:** All the alias from this node must be contained in the destination node to cast a message (true or false)

### **Receive Message**

![Receive](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/receive.png)

- **Link:** The selected link to handle the messages
- **Topic:** The topic pattern to get the messages
- **Alias:** The alias from the node, it can be a string or a array of multiple strings (multiple aliases). A special char "#" can be set to receive the message from all the nodes.
- **aliasMatchAll:** All the alias from this node must be contained in the source node to cast a message (true or false)
- **Clone:** Clones all messages that exit this node (true or false)
- **Input Data:** Allows the input of the config of the node. You can inform the source of the fields (for example a specific msg field or a flow. Very useful is setting a env var in the subflow) or using the config variables:
  - subTopic - Set Topic (string)
  - subAlias - Set Alias (string|string[])
  - subPriority - Set Priority (number)
  - subAliasMatchAll - Match all alias (boolean)
  - reset - Set to true to reset node to initial state
  - config - Set to true to force output of the second output with the config of the node
- **Priority** The priority to receive the message, where 0 will be the last, and 999 the first

- **Message Properties Second Output**
  - **subFromTopic:** The topic of the message
  - **subFromAlias:** The alias list from de sending node
  - **subFromId:** The id of the sending node
  - **subFromName:** The name of the sending node
  - **subFromTotal:** The total number of messages cast from the sending node
  - **subMyPattern:** The topic pattern of the receaving node
  - **subMyAlias:** The alias the receaving node, can be a string or a array of strings
  - **subMyId:** The id from the receaving node
  - **subMyName:** The name from the receaving node
  - **subMyPriority** The priority on the sending queue from de receaving node
  - **subMyPosition:** The position of the sending node on the queue

## **Notes**

### **Cloning**

Cloning is **off by default**, meaning that if you manipulate a message after an output, all other flows that use the same message will be changed, this is useful to keep the memory consumption to a minimum, but can result in unwanted results. Consider allways to turn on clone (in the output or in the link itself) if you plan to manipulate the message that exits the receive node.

When a message is cloned, the first output is updated with extra information and the topic is changed to the topic of the flow (if any). If the message is not cloned, it will never be changed.

### **Performance enhancements**

The performance can start to get worse with the increase of receive nodes, please note that an receive node inside a subflow, will have as many instances, as the instances of the subflow. To help improve you can split your receive nodes into several aliases (casting to them), or split the nodes into several links (config files).

You can check the number of messages beeing generated in the receive node (subFromTotal) and also in the status of the sending node

### **Aliases and casting**

- A sending node without any aliases, will cast to all receaving nodes that match the other criteria (topic)
- A sending/receaving node with an empty alias array will be considered without alias
- You can use the special "#" char for alias, if specified in the seending node, it will match all destination aliases. If specified in the reciving node, it will recive messages from all aliases.

### **Second Output**

The second output in out node will cast a message at deploy and every time a message arrives. This message contains information regarding the out link, as the "subId", that can be stored and used to ensure that only that node gets the message, even if inside a subflow.

### Use Cases

- Broadcast into subflows
- Get messages into subflows and out
- many more....

## Example

![Sending](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/example-1_1.png)
![Sending](https://raw.githubusercontent.com/soloam/node-red-contrib-sub-link/beta/resources/example-1_2.png)

```
[{"id":"adedd85f.d15e58","type":"subflow","name":"Subflow test/2 - Alias","info":"","category":"","in":[],"out":[{"x":260,"y":60,"wires":[{"id":"fa346945.85eea8","port":0}]},{"x":260,"y":120,"wires":[{"id":"fa346945.85eea8","port":1}]}],"env":[],"color":"#DDAA99","status":{"x":600,"y":60,"wires":[{"id":"84e435ec.5f59b8","port":0}]}},{"id":"fa346945.85eea8","type":"sub-link-output","z":"adedd85f.d15e58","name":"","topic":"test/2","link":"d3ff029b.e3a1","priority":"","alias":"myalias2","aliasType":"str","clone":true,"x":140,"y":60,"wires":[[],[]]},{"id":"84e435ec.5f59b8","type":"status","z":"adedd85f.d15e58","name":"","scope":["fa346945.85eea8"],"x":440,"y":60,"wires":[[]]},{"id":"b541e6c.edc0418","type":"subflow","name":"Subflow Empty","info":"","category":"","in":[],"out":[{"x":360,"y":80,"wires":[{"id":"c87ae8c6.9bf478","port":0}]},{"x":360,"y":140,"wires":[{"id":"c87ae8c6.9bf478","port":1}]}],"env":[],"color":"#DDAA99","status":{"x":680,"y":80,"wires":[{"id":"7fbf4ef7.d9726","port":0}]}},{"id":"c87ae8c6.9bf478","type":"sub-link-output","z":"b541e6c.edc0418","name":"","link":"d3ff029b.e3a1","clone":true,"x":200,"y":80,"wires":[[],[]]},{"id":"7fbf4ef7.d9726","type":"status","z":"b541e6c.edc0418","name":"","scope":["c87ae8c6.9bf478"],"x":500,"y":80,"wires":[[]]},{"id":"1a29752.8268f8b","type":"subflow","name":"Subflow #","info":"","category":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"9d0d79d0.c7cd68","port":0}]},{"x":240,"y":100,"wires":[{"id":"9d0d79d0.c7cd68","port":1}]}],"env":[],"color":"#DDAA99","status":{"x":540,"y":40,"wires":[{"id":"9936ca38.4cf518","port":0}]}},{"id":"9d0d79d0.c7cd68","type":"sub-link-output","z":"1a29752.8268f8b","name":"","topic":"#","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[],[]]},{"id":"9936ca38.4cf518","type":"status","z":"1a29752.8268f8b","name":"","scope":["9d0d79d0.c7cd68"],"x":400,"y":40,"wires":[[]]},{"id":"f4458344.f38d4","type":"subflow","name":"Subflow test/2","info":"","category":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"68691869.3c7178","port":0}]},{"x":240,"y":100,"wires":[{"id":"68691869.3c7178","port":1}]}],"env":[],"color":"#DDAA99","status":{"x":540,"y":40,"wires":[{"id":"da9236b0.bb7418","port":0}]}},{"id":"68691869.3c7178","type":"sub-link-output","z":"f4458344.f38d4","name":"","topic":"test/2","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[],[]]},{"id":"da9236b0.bb7418","type":"status","z":"f4458344.f38d4","name":"","scope":["68691869.3c7178"],"x":400,"y":40,"wires":[[]]},{"id":"437255a2.1856bc","type":"subflow","name":"Subflow 5","info":"","in":[],"out":[{"x":240,"y":40,"wires":[{"id":"cec150.29716eb","port":0}]},{"x":240,"y":100,"wires":[{"id":"cec150.29716eb","port":1}]}],"status":{"x":500,"y":40,"wires":[{"id":"12cda21b.6bd96e","port":0}]}},{"id":"cec150.29716eb","type":"sub-link-output","z":"437255a2.1856bc","name":"","topic":"test/1","link":"d3ff029b.e3a1","alias":"","clone":true,"x":90,"y":40,"wires":[[],[]]},{"id":"12cda21b.6bd96e","type":"status","z":"437255a2.1856bc","name":"","scope":["cec150.29716eb"],"x":360,"y":40,"wires":[[]]},{"id":"b6731dd8.60d45","type":"tab","label":"SubLink Example","disabled":false,"info":""},{"id":"fe4b9bf7.dbd198","type":"sub-link-output","z":"b6731dd8.60d45","name":"Empty","topic":"","link":"d3ff029b.e3a1","priority":"95","alias":"","aliasType":"str","clone":true,"x":90,"y":700,"wires":[["32154fd.2e2d6b"],["e32a154e.51ac08"]]},{"id":"32154fd.2e2d6b","type":"debug","z":"b6731dd8.60d45","name":"Test5","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":700,"wires":[]},{"id":"363322fe.62a8ae","type":"debug","z":"b6731dd8.60d45","name":"Test1","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":280,"wires":[]},{"id":"1bb779a9.ed2976","type":"debug","z":"b6731dd8.60d45","name":"Test2","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":400,"wires":[]},{"id":"aefa9841.70ee58","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"#","link":"d3ff029b.e3a1","priority":"96","alias":"","aliasType":"str","clone":true,"x":90,"y":600,"wires":[["2ec9b537.d952ea"],["56050d98.1c0f94"]]},{"id":"2ec9b537.d952ea","type":"debug","z":"b6731dd8.60d45","name":"Test4","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":600,"wires":[]},{"id":"2f407250.f68d7e","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":80,"wires":[["1e6468af.197217"]]},{"id":"1e6468af.197217","type":"sub-link-input","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","x":270,"y":80,"wires":[]},{"id":"e8051ebd.d56d4","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":200,"wires":[["f205d9e8.b7a528"]]},{"id":"f205d9e8.b7a528","type":"sub-link-input","z":"b6731dd8.60d45","name":"","link":"d3ff029b.e3a1","x":300,"y":200,"wires":[]},{"id":"4e5913f2.54149c","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/1","info":"","x":510,"y":40,"wires":[]},{"id":"dafdde3d.a1cf1","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message)","info":"","x":560,"y":80,"wires":[]},{"id":"919fdb87.dc4ba8","type":"comment","z":"b6731dd8.60d45","name":"Sends without topic","info":"","x":490,"y":200,"wires":[]},{"id":"c43fe8c5.c67958","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1","info":"","x":530,"y":280,"wires":[]},{"id":"52da3e1f.c66cf","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2","info":"","x":530,"y":400,"wires":[]},{"id":"16420768.4e7cb9","type":"comment","z":"b6731dd8.60d45","name":"Receives All","info":"","x":470,"y":600,"wires":[]},{"id":"547b9a8b.fde254","type":"comment","z":"b6731dd8.60d45","name":"Receives Messages Without SubTopic","info":"","x":550,"y":700,"wires":[]},{"id":"6f215a20.c7b084","type":"debug","z":"b6731dd8.60d45","name":"Test10","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":1200,"wires":[]},{"id":"5cf59a66.d77854","type":"debug","z":"b6731dd8.60d45","name":"Test6","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":800,"wires":[]},{"id":"1d563654.7805da","type":"debug","z":"b6731dd8.60d45","name":"Test7","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":900,"wires":[]},{"id":"4208c185.65935","type":"debug","z":"b6731dd8.60d45","name":"Test9","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":1100,"wires":[]},{"id":"1c60a82b.6bbf88","type":"subflow:437255a2.1856bc","z":"b6731dd8.60d45","name":"Subflow test/1","env":[],"x":110,"y":800,"wires":[["5cf59a66.d77854","ac2e5def.2f2de"],[]]},{"id":"561b9cb1.5921f4","type":"subflow:f4458344.f38d4","z":"b6731dd8.60d45","name":"","env":[],"x":110,"y":900,"wires":[["1d563654.7805da"],["15137f85.ab042"]]},{"id":"77161e7e.9d5a9","type":"subflow:1a29752.8268f8b","z":"b6731dd8.60d45","name":"","env":[],"x":100,"y":1100,"wires":[["4208c185.65935"],["b46d92a3.8d516"]]},{"id":"6f3cbe2d.ee005","type":"subflow:b541e6c.edc0418","z":"b6731dd8.60d45","name":"","env":[],"x":120,"y":1200,"wires":[["6f215a20.c7b084"],["3c6c8881.056798"]]},{"id":"e3c3230a.83a7c","type":"comment","z":"b6731dd8.60d45","name":"Receives All","info":"","x":470,"y":1100,"wires":[]},{"id":"1b873936.e73147","type":"comment","z":"b6731dd8.60d45","name":"Receives Messages Without SubTopic","info":"","x":550,"y":1200,"wires":[]},{"id":"5f46d312.8e19ec","type":"sub-link-output","z":"b6731dd8.60d45","name":"test/1 - No Clone","topic":"test/1","link":"d3ff029b.e3a1","priority":"20","alias":"","aliasType":"str","clone":false,"x":120,"y":1300,"wires":[["40d140c4.99bf3"],[]]},{"id":"2094a526.9cc57a","type":"sub-link-output","z":"b6731dd8.60d45","name":"test/1 - No Clone","topic":"test/1","link":"d3ff029b.e3a1","priority":"19","alias":"","aliasType":"str","clone":false,"x":120,"y":1360,"wires":[["337aa181.c4033e"],[]]},{"id":"c86426fc.bea5f8","type":"debug","z":"b6731dd8.60d45","name":"Test11","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":430,"y":1300,"wires":[]},{"id":"27203fa0.7a6fd","type":"debug","z":"b6731dd8.60d45","name":"Test12","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":450,"y":1360,"wires":[]},{"id":"337aa181.c4033e","type":"delay","z":"b6731dd8.60d45","name":"","pauseType":"delay","timeout":"500","timeoutUnits":"milliseconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":310,"y":1360,"wires":[["27203fa0.7a6fd"]]},{"id":"40d140c4.99bf3","type":"change","z":"b6731dd8.60d45","name":"Change","rules":[{"t":"set","p":"payload","pt":"msg","to":"Hello World","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":1300,"wires":[["c86426fc.bea5f8"]]},{"id":"bf079277.2ef48","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1","info":"","x":530,"y":800,"wires":[]},{"id":"d9f73743.60ef98","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2","info":"","x":530,"y":900,"wires":[]},{"id":"35ea00ca.c9507","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1 - And Changes","info":"","x":690,"y":1300,"wires":[]},{"id":"47d6fe82.50ed8","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/1 - Not Cloned, so reflects changes","info":"","x":770,"y":1360,"wires":[]},{"id":"fa0070c0.f7e75","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"},{"p":"subId","v":"node_target","vt":"flow"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":120,"wires":[["2a6a43dd.493b9c"]]},{"id":"2a6a43dd.493b9c","type":"sub-link-input","z":"b6731dd8.60d45","name":"","topic":"","alias":"","aliasType":"str","link":"d3ff029b.e3a1","x":300,"y":120,"wires":[]},{"id":"908cfa82.3cb648","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message And SubId)","info":"","x":600,"y":120,"wires":[]},{"id":"57d5a4b1.e5513c","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"},{"p":"subTopic","v":"test/2","vt":"str"},{"p":"subAlias","v":"[\"myalias\",\"myalias2\"]","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":160,"wires":[["a1661205.f55d3"]]},{"id":"a1661205.f55d3","type":"sub-link-input","z":"b6731dd8.60d45","name":"","link":"d3ff029b.e3a1","x":300,"y":160,"wires":[]},{"id":"fe83cc10.617fd","type":"comment","z":"b6731dd8.60d45","name":"Sends To SubTopic test/2 (set in message And Alias)","info":"","x":590,"y":160,"wires":[]},{"id":"6f7b197a.c697f8","type":"debug","z":"b6731dd8.60d45","name":"Test3","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":500,"wires":[]},{"id":"1e50810c.94dcaf","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2 - Alias","info":"","x":550,"y":500,"wires":[]},{"id":"de3de113.eab9b","type":"subflow:adedd85f.d15e58","z":"b6731dd8.60d45","name":"","env":[],"x":130,"y":1000,"wires":[["275146d.b2e3dba"],["40eb8b87.32d434"]]},{"id":"275146d.b2e3dba","type":"debug","z":"b6731dd8.60d45","name":"Test8","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":310,"y":1000,"wires":[]},{"id":"362bbce8.a728f4","type":"comment","z":"b6731dd8.60d45","name":"Receives From SubTopic test/2 - Alias","info":"","x":550,"y":1000,"wires":[]},{"id":"653cb1a0.91487","type":"sub-link-input","z":"b6731dd8.60d45","name":"","topic":"test/1","link":"d3ff029b.e3a1","x":270,"y":40,"wires":[]},{"id":"55745a84.770bd4","type":"inject","z":"b6731dd8.60d45","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":120,"y":40,"wires":[["653cb1a0.91487"]]},{"id":"ba4e934d.04dd3","type":"debug","z":"b6731dd8.60d45","name":"Test1 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":320,"wires":[]},{"id":"c3487efa.c771d","type":"change","z":"b6731dd8.60d45","name":"Save Target","rules":[{"t":"set","p":"node_target","pt":"flow","to":"subMyId","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":330,"y":440,"wires":[["851c772d.196708"]]},{"id":"851c772d.196708","type":"debug","z":"b6731dd8.60d45","name":"Test2 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":500,"y":440,"wires":[]},{"id":"1deced25.1e8913","type":"debug","z":"b6731dd8.60d45","name":"Test3 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":540,"wires":[]},{"id":"56050d98.1c0f94","type":"debug","z":"b6731dd8.60d45","name":"Test4 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":640,"wires":[]},{"id":"e32a154e.51ac08","type":"debug","z":"b6731dd8.60d45","name":"Test5 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":740,"wires":[]},{"id":"ac2e5def.2f2de","type":"debug","z":"b6731dd8.60d45","name":"Test6 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":840,"wires":[]},{"id":"15137f85.ab042","type":"debug","z":"b6731dd8.60d45","name":"Test7 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":940,"wires":[]},{"id":"40eb8b87.32d434","type":"debug","z":"b6731dd8.60d45","name":"Test8 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":1040,"wires":[]},{"id":"b46d92a3.8d516","type":"debug","z":"b6731dd8.60d45","name":"Test9 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":1140,"wires":[]},{"id":"3c6c8881.056798","type":"debug","z":"b6731dd8.60d45","name":"Test10 - Result","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":340,"y":1240,"wires":[]},{"id":"307e8e06.783ad2","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","priority":"98","alias":"","aliasType":"str","clone":true,"x":90,"y":400,"wires":[["1bb779a9.ed2976"],["c3487efa.c771d"]]},{"id":"91b32226.3b45b","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/2","link":"d3ff029b.e3a1","priority":"97","alias":"myalias","aliasType":"str","clone":true,"x":110,"y":500,"wires":[["6f7b197a.c697f8"],["1deced25.1e8913"]]},{"id":"f816b9ed.d20268","type":"sub-link-output","z":"b6731dd8.60d45","name":"","topic":"test/1","link":"d3ff029b.e3a1","priority":"99","alias":"","aliasType":"str","clone":true,"x":90,"y":280,"wires":[["363322fe.62a8ae"],["ba4e934d.04dd3"]]},{"id":"d3ff029b.e3a1","type":"sub-link-config","name":"Test","clone":false}]
```

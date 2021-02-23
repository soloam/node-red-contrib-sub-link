module.exports = function(RED) {
    function SubLinkNodeConfig(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;

        var node = this;

        //List of Outputs to this config
        node.target = {};

        //Listener To Emit New Messages To Output
        node.listener = function(message) {
            for(out in node.target){
                //TODO: Possible give option to clone message
                node.target[out].sendMessage(message);
            }
        }
        
        node.addListener("newMessage", node.listener);

        //Register New Output
        node.registerSubOutput = function(n){
            node.target[n.id] = n;
        }

        //Unegister Output
        node.unregisterSubOutput = function(n){
            delete node.target[n.id];
        }

        //Remove New Message Listener
        node.on("close",function() { 
            if (node.listener) {
                node.removeListener("newMessage", node.listener);
            }
        });

    }
    RED.nodes.registerType("sub-link-config",SubLinkNodeConfig);
}
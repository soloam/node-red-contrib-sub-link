module.exports = function(RED) {
    function SubLinkNodeConfig(config) {
        RED.nodes.createNode(this, config);
        this.name  = config.name;
        this.clone = config.clone

        var node = this;

        //List of Outputs to this config
        node.target = {};

        //Listener To Emit New Messages To Output
        node.listener = function(msg) {
            for(out in node.target){
                if(node.clone === true && msg._sub_flow_clone !== true){
                    //Clone Message if requested by link config
                    message = RED.util.cloneMessage(msg);
                    message._sub_flow_clone = true;
                }else
                    message = msg;

                node.target[out].sendMessage(message);
                delete message;
                delete msg;
            }
        }

        //Register New Output
        node.registerSubOutput = function(n){
            node.target[n.id] = n;
        }

        //Unegister Output
        node.unregisterSubOutput = function(n){
            delete node.target[n.id];
        }

        //Remove New Message Listener
        node.on("close",function(removed, done) { 
            for(t in node.target)
                node.unregisterSubOutput(n);
            if(done)
                done();
        });

    }
    RED.nodes.registerType("sub-link-config",SubLinkNodeConfig);
}
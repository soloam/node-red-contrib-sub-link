module.exports = function(RED) {
    function SubLinkNodeIn(config) {
        RED.nodes.createNode(this,config);
        this.topic = config.topic;

        this.aliasType = config.aliasType;

        switch(this.aliasType){
            case "str":
                this.alias = [];
                if(config.alias !== undefined && config.alias !== null && config.alias !== "")
                    this.alias = [config.alias];
            break;
            case "json":
                this.alias = JSON.parse(config.alias);
            break;
        }

        if(Array.isArray(this.alias) === false || this.alias.length === 0)
            this.alias = null;

        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);

        //Update Status
        node.updateStatus = function(n,t){
            this.status({fill:"green",shape:"dot",text:"Linked ("+n+"/"+t+")"});
        }
       
        //Send Inbound Message (Emit Event)
        this.on('input', function(msg, send, done) {
            if(this.alias !== undefined && this.alias !== "" && this.alias !== null)
                msg.subAlias = this.alias;

            if(Array.isArray(msg.subAlias) && msg.subAlias.length === 0)
                delete msg.subAlias;

            if(msg.subAlias === undefined){

            }else if(typeof msg.subAlias === "string")
                msg.subAlias = [msg.subAlias]
            else if(Array.isArray(msg.subAlias)){
                for(var i=0;i<msg.subAlias.length;i++){
                    if(typeof msg.subAlias[i] !== "string"){
                        node.error("Alias must be a string or a array or strings");
                        return null;
                    }
                }
            }else{
                node.error("Alias must be a string or a array or strings");
                return null;
            }

            var topic = msg.subTopic;
            if(this.topic !== undefined && this.topic !== "" &&  this.topic !== null )
                topic = this.topic;

            node.subLink.listener(msg,this,topic);  
            delete msg;

            if (done)
                done(); 
        });
    }
    RED.nodes.registerType("sub-link-input",SubLinkNodeIn);
}

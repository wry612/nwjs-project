/**
 * Created by Administrator on 2017/6/19.
 */
module.exports = {
    apiBasePath:'http://192.168.10.163:8073/jmepuer',
    netHeader: {
        sid: '',
        version: 'v2.2',
        source: 'pc',
        ip: getIPAdress(),
        'Content-Type': 'application/json;charset=utf-8'
    }
};
function getIPAdress(){
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
}

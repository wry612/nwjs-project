/**
 * Created by Administrator on 2017/6/19.
 */
//加载网络配置模块
var config = require('./js/config');
var netHeader = config.netHeader;

//加载弹框组件
// var dialogComponent = null;
// $.get('./components/dialog.html',function (data) {
//     $('body').append(data);
//     dialogComponent = new Vue({
//         el: '#dialogComponent',
//         data: {
//             parentModalDialog: {
//                 show: false,
//                 header: '按钮弹框',
//                 body: '按钮弹框内容',
//                 leftBtnText: '取消',
//                 rightBtnText: '去设置'
//             },
//             parentTipDialog: {
//                 show: false,
//                 body: 'asfasf',
//                 btnText:'确定'
//             }
//         },
//         computed: {},
//         methods: {
//             leftBtn: function () {
//                 this.parentModalDialog.show = false;
//             },
//             rightBtn: function () {
//                 this.parentModalDialog.show = false;
//             },
//             enterBtn:function () {
//                 this.parentTipDialog.show = false
//             }
//         }
//     });
// });

//初始化头部组件
var header = new Vue({
    el:'#header',
    data:{
        version:'',
        win:null,
        minOrMax:false,
        clientId:''
    },
    beforeMount:function () {
        this.version = netHeader.version;
        this.clientId = getQueryString('clientId');
    },
    mounted:function () {
        this.win = nw.Window.get();
    },
    computed:{
    },
    methods:{
        setMin:function () {
            if(this.minOrMax){
                this.win.restore();
                this.minOrMax = false;
            }else{
                this.win.minimize();
                this.minOrMax = true;
            }
        },
        setMax:function () {
            if(this.minOrMax){
                this.win.restore();
                this.minOrMax = false;
            }else {
                this.minOrMax = true;
                this.win.maximize();
            }
        },
        closeCurrent:function () {
            var win = this.win;
            win.on('closed', function() {
                win.removeAllListeners('closed');
                win = null;
            });
            win.on('close', function() {
                var result = confirm('您确定要退出当前页面？');
                if(result){
                    this.hide();
                    // If the new window is still open then close it.
                    if (win != null)
                        win.close(true);
                }else{
                    console.log('not close')
                }
                win.removeAllListeners('close');
            });
            win.close();
        },
        closeAll:function () {
            var win = this.win;
            win.on('closed', function() {
                win.removeAllListeners('closed');
                win = null;
            });
            win.on('close', function() {
                var result = confirm('您确定要退出客户端？');
                if(result){
                    nw.App.quit();
                }else{
                    console.log('not close')
                }
                win.removeAllListeners('close');
            });
            win.close();
        }
    }
});

//日期格式化
Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}
function timeToDate(time) {
    var date = new Date(time);
    return date.format('yyyy-MM-dd hh:mm:ss');
}
function GetDateStr(currDate,AddMonthCount) {
    var dd = new Date(currDate);
    var currMonth = parseInt(dd.getMonth(),10);
    var year =  parseInt(dd.getFullYear(),10);
    if(AddMonthCount==-1){
        if(currMonth==0){
            currMonth = 12;
            year-=1;
        }else{
            currMonth=currMonth+AddMonthCount+1;
        }
    }else if(AddMonthCount==1){
        if(currMonth==11){
            currMonth = 1;
            year+=1;
        }else{
            currMonth=currMonth+AddMonthCount+1;
        }
    }
    if(currMonth<10){
        currMonth='0'+currMonth;
    }
    return year+'-'+currMonth;
}

//获取url参数
function getQueryString(name) {
    var r = window.location.search.substr(1);
    var arr = r.split('&');
    var obj = {};
    for(var i=0;i<arr.length;i++){
        var val = arr[i].split('=');
        obj[val[0]] = decodeURI(val[1]);
    }
    if(name){
        if(obj[name]) {
            return obj[name];
        }else{
            return "";
        }

    }
    return obj;
}

Array.prototype.unique = function(){
    this.reverse(); //先排序
    var res = [this[0]];
    for(var i = 1; i < this.length; i++){
        if(this[i] !== res[res.length - 1]){
            res.push(this[i]);
        }
    }
    return res;
};
/**
 * Created by Administrator on 2017/6/19.
 */
var login = new Vue({
    el:'#login',
    data:{
        account:'',
        password:'',
        code:'',
        checkBox:false,
        accountList:[],
        backgroundImg:'',
        sid:''
    },
    beforeMount:function () {
        global.userInfo = {
            sid:'',
            userid:'',
            exchangeCodes:'',
            nick_name:'',
            last_loginip:'',
            last_logintime:''
        };
        global.netHeader = netHeader;
        this.getAccountList();
        this.getImgCode();
    },
    mounted:function () {
    },
    computed:{
    },
    methods:{
        getAccountList:function () {
            var list = window.localStorage.accountList;
            if(list){
                this.accountList = list.split(',');
                this.account = this.accountList[0];
            }else{
                this.accountList = [];
            }
        },
        getImgCode:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/base/v1/vcode',
                type: "POST",
                data: '',
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.backgroundImg = 'url(data:image/gif;base64,'+data.image+')';
                        that.sid = xhr.getResponseHeader("sid");
                        global.netHeader.sid = that.sid;
                        global.userInfo.sid = that.sid;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        saveAccount:function () {
            if(this.checkBox){
                var isHas = false;
                for(var i = 0;i<this.accountList.length;i++){
                    if(this.accountList[i] == this.account){
                        isHas = true;
                        break;
                    }
                }
                if(isHas){
                    return;
                }else{
                    this.accountList.push(this.account);
                    window.localStorage.accountList = this.accountList;
                }
            }
        },
        doEnter:function (id) {
            if(id){
                $('#'+id).focus();
            }else{
                this.login();
            }
        },
        login:function () {
            if(this.password==''){
                alert('请输入密码！');
                return;
            }
            var re = new RegExp('^[0-9]+$');
            if(!re.test(this.code)){
                alert('请输入4位纯数字验证码！');
                this.getImgCode();
                return;
            }
            var that = this;
            that.saveAccount();
            $.ajax({
                url: config.apiBasePath+'/base/v1/login',
                type: "POST",
                data: JSON.stringify({userid:that.account,password:that.password,usertype:3,vcode:that.code}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        global.userInfo.userid = that.account;
                        global.userInfo.exchangeCodes = data.exchange_codes[0];
                        global.userInfo.nick_name = data.nick_name;
                        global.userInfo.last_loginip = data.last_loginip;
                        global.userInfo.last_loginip = data.last_logintime
                        window.location.href = '../../pages/index.html';
                    }else{
                        that.getImgCode();
                        that.password = '';
                        alert(rsp.head.msg);
                    }
                }
            });
        }
    }
});



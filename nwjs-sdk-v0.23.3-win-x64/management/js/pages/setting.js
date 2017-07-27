/**
 * Created by Administrator on 2017/6/19.
 */
var setting = new Vue({
    el:'#setting',
    data:{
        contractCode:'',
        exchangeCodes:'',
        contractName:'',
        favId:'',
        win:null,
        favDetail:{
            param_decimal:[],
            param_color:[],
            param_font:[]
        },
        isConfirm:false
    },
    beforeMount:function () {
        this.contractCode = getQueryString('contractCode');
        this.exchangeCodes = getQueryString('exchangeCodes');
        this.contractName = getQueryString('contractName');
        this.favId = getQueryString('favId');
        this.win = nw.Window.get();
        this.win.width = 400;
        this.win.height = 650;
        this.win.focus();
        this.win.setResizable(false);
        this.getFavDetail();
    },
    mounted:function () {
        $('.right').css('height',$('.left').outerHeight());
    },
    computed:{
    },
    methods:{
        getFavDetail:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/contract/v1/favDetail',
                type: "POST",
                data: JSON.stringify({fav_id:that.favId,contract_code:that.contractCode,exchange_code:that.exchangeCodes}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.favDetail = data;
                        if(window.localStorage.isConfirmList){
                            var isConfirmList = JSON.parse(window.localStorage.isConfirmList);
                            var has = false;
                            for(var i=0;i<isConfirmList.length;i++){
                                if(isConfirmList[i][0]==that.contractCode){
                                    has = true;
                                    that.isConfirm = isConfirmList[i][1];
                                    break;
                                }
                            }
                            if(!has){
                                that.isConfirm = false;
                            }
                        }else{
                            that.isConfirm = false;
                        }
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        favSave:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/contract/v1/favSave',
                type: "POST",
                data: JSON.stringify({fav_id:that.favId,contract_code:that.contractCode,exchange_code:that.exchangeCodes,param_decimal:that.favDetail.param_decimal,param_color:that.favDetail.param_color,param_font:that.favDetail.param_font}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        if(window.localStorage.isConfirmList) {
                            var isConfirmList = JSON.parse(window.localStorage.isConfirmList);
                            var has = false;
                            for (var i = 0; i < isConfirmList.length; i++) {
                                if (isConfirmList[i][0] == that.contractCode) {
                                    has = true;
                                    isConfirmList[i][1] = that.isConfirm;
                                    break;
                                }
                            }
                            if(!has){
                                isConfirmList.push([that.contractCode,that.isConfirm]);
                            }
                            window.localStorage.isConfirmList = JSON.stringify(isConfirmList);
                        }else{
                            window.localStorage.isConfirmList = JSON.stringify([that.contractCode,that.isConfirm]);
                        }
                        alert('保存成功！');
                        that.win.close(true);
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });

        }
    }
});



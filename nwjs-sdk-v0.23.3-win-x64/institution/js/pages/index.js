/**
 * Created by Administrator on 2017/6/19.
 */
var index = new Vue({
    el:'#index',
    data:{
        nickName:'',
        userId:'',
        market:'',
        accountList:[],
        contractList:[],
        currentTime:'',
        sysStatus:'',
        getTime:'',
        selectContract:0,
        win:null
    },
    beforeMount:function () {
        this.version = netHeader.version;
        this.getUserInfo();
        this.getAccount();
        this.getContract();
        this.getSync();
        $(window).on('resize',function () {
            $('#table1').css('height',$(window).height()-$('#table1').offset().top-40);
            $('#table2').css('height',$(window).height()-$('#table2').offset().top-40);
        });
        this.win = nw.Window.get();
    },
    mounted:function () {
        $('#tabs').tabulous();
        $('#table1').css('height',$(window).height()-$('#table1').offset().top-40);
        $('#table2').css('height',$(window).height()-$('#table2').offset().top-40);
        $('#tabs_container').css('height',$(window).height()-$('#table1').offset().top-40);
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
    },
    methods:{
        getUserInfo:function () {
            this.nickName = global.userInfo.nick_name;
            this.userId = global.userInfo.userid;
            this.market = global.userInfo.exchangeCodes.split(':')[1];
        },
        getAccount:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/account/v1/queryAsList',
                type: "POST",
                data: JSON.stringify({"exchange_code":global.userInfo.exchangeCodes.split(':')[0]}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.accountList = data;
                    }else{
                       alert(rsp.head.msg);
                    }
                }
            });
        },
        getContract:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/contract/v1/queryAsList',
                type: "POST",
                data: JSON.stringify({"exchange_code":global.userInfo.exchangeCodes.split(':')[0]}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.contractList = data;
                    }else{
                        alert(rsp.head.msg);
                    }

                }
            });
        },
        getSync:function () {
            var that = this;
            setInterval(function () {
                $.ajax({
                    url: config.apiBasePath+'/base/v1/sync',
                    type: "POST",
                    data: JSON.stringify({"exchange_code":global.userInfo.exchangeCodes.split(':')[0]}),
                    dataType: "json",
                    headers:global.netHeader,
                    success: function (rsp) {
                        if(rsp.head.code == 0) {
                            var data = rsp.body;
                            that.currentTime = new Date(data.current_time).format('yyyy-MM-dd hh:mm:ss');
                            that.getTime = data.current_time;
                            that.currentTime = new Date(that.getTime).format('yyyy-MM-dd hh:mm:ss');
                            switch(data.sys_status){
                                case '0':
                                    that.sysStatus='开市';
                                    break;
                                case '1':
                                    that.sysStatus='休市';
                                    break;
                                case '2':
                                    that.sysStatus='闭市';
                                    break;
                            }
                        }else{
                            alert(rsp.head.msg);
                        }
                    }
                });
            },1000);
        },
        logOut:function () {
            var result = confirm('确认要注销吗？');
            if(result){
                var that = this;
                var win = that.win;
                win.on('closed', function() {
                    win.removeAllListeners('closed');
                    win = null;
                });
                win.on('close', function() {
                    win.removeAllListeners('close');
                });
                $.ajax({
                    url: config.apiBasePath+'/base/v1/logout',
                    type: "POST",
                    data: JSON.stringify({"reason":"N"}),
                    dataType: "json",
                    headers:global.netHeader,
                    success: function (rsp) {
                        if(rsp.head.code == 0) {
                            var data = rsp.body;
                            nw.App.closeAllWindows();
                            window.location.href = '../../login.html';
                        }else{
                            alert(rsp.head.msg);
                        }
                    }
                });
            }else{
                console.log('cancel');
            }
        },
        openRiskManagement:function () {
            nw.Window.open('pages/riskManagement.html',{'id':'riskManagement',"frame":false,"position":"center",
                "min_width":800,
                "min_height":500,
                "resizable":true});
        },
        openMarket:function () {
            nw.Window.open('pages/market.html',{'id':'market',"frame":false,"position":"center",
                "min_width":800,
                "min_height":500,
                "resizable":true});
        },
        openDealRecord:function (clientId) {
            nw.Window.open('pages/dealRecord.html?clientId='+clientId+'&exchangeCodes='+global.userInfo.exchangeCodes.split(':')[0],{"frame":false,"position":"center",
                "min_width":800,
                "min_height":500,
                "resizable":true});
        },
        openOperate:function () {
            $('.dialog-cover').show();
        },
        openEntrustRecord:function (clientId) {
            nw.Window.open('pages/entrustRecord.html?clientId='+clientId+'&exchangeCodes='+global.userInfo.exchangeCodes.split(':')[0],{"frame":false,"position":"center",
                "min_width":950,
                "min_height":500,
                "resizable":true});
        },
        openSetting:function (contractCode,contractName,favId) {
            nw.Window.open('pages/setting.html?contractCode='+contractCode+'&exchangeCodes='+global.userInfo.exchangeCodes.split(':')[0]+'&contractName='+contractName+'&favId='+favId,{'id':'setting'+contractCode,"frame":false,"position":"center",
                "min_width":800,
                "min_height":500,
                "resizable":true});
        },
        goOperate:function () {
            this.cancel();
            var contractCode = this.contractList[this.selectContract][1];
            var contractName = this.contractList[this.selectContract][2];
            var favId = this.contractList[this.selectContract][5];
            nw.Window.open('pages/operate.html?clientId='+this.accountList[0][1]+'&contractCode='+contractCode+'&exchangeCodes='+global.userInfo.exchangeCodes.split(':')[0]+'&contractName='+contractName+'&favId='+favId,{'id':'operate'+contractCode,"frame":false,"position":"center",
                "min_width":500,
                "min_height":950,
                "resizable":true,
            "position":'center'});
        },
        cancel:function () {
            $('.dialog-cover').hide();
        }
    }
});


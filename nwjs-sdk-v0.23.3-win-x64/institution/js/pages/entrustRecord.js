/**
 * Created by Administrator on 2017/6/19.
 */
var entrustRecord = new Vue({
    el:'#entrustRecord',
    data:{
        clientId:'',
        exchangeCodes:'',
        queryAsList:[],
        orderStateEnum:{'1':'已接收','2':'已委托','3':'部分成交','4':'全部成交','5':'取消','6':'拒绝'}
    },
    beforeMount:function () {
        this.clientId = getQueryString('clientId');
        this.exchangeCodes = getQueryString('exchangeCodes');
        this.getArray();
        $(window).on('resize',function () {
            $('#queryAsList').css('height',$(window).height()-$('#queryAsList').offset().top-20);
        });
    },
    mounted:function () {
        $('#queryAsList').css('height',$(window).height()-$('#queryAsList').offset().top-20);
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
    },
    methods:{
        getArray:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/order/v1/queryAsList',
                type: "POST",
                data: JSON.stringify({"client_id": that.clientId,"exchange_code":that.exchangeCodes}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.queryAsList = data;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        revoke:function (contractCode,id) {
            var that = this;
            var result = confirm('您确定要撤销该委托单吗？');
            if(result){
                $.ajax({
                    url: config.apiBasePath+'/order/v1/revoke',
                    type: "POST",
                    data: JSON.stringify({"client_id": that.clientId,"exchange_code":that.exchangeCodes,"contract_code":contractCode,"order_id":id}),
                    dataType: "json",
                    headers:global.netHeader,
                    success: function (rsp) {
                        if(rsp.head.code == 0) {
                            alert('撤单成功');
                        }else{
                            alert(rsp.head.msg);
                        }
                    }
                });
            }else{
                console.log('cancel');
            }

        },
        revokeBSA:function (type) {
            var that = this;
            var str = '';
            switch(type){
                case 'B':
                    str ='您确定要撤销全部买入委托单吗？';
                    break;
                case 'S':
                    str ='您确定要撤销全部卖出委托单吗？';
                    break;
                case 'A':
                    str ='您确定要撤销全部委托单吗？';
                    break;
            }
            var result = confirm(str);
            if(result){
                $.ajax({
                    url: config.apiBasePath+'/order/v1/batchRevoke',
                    type: "POST",
                    data: JSON.stringify({"client_id": that.clientId,"exchange_code":that.exchangeCodes,"action":type}),
                    dataType: "json",
                    headers:global.netHeader,
                    success: function (rsp) {
                        if(rsp.head.code == 0) {
                            alert('撤单成功');
                        }else{
                            alert(rsp.head.msg);
                        }
                    }
                });
            }else{
                console.log('cancel');
            }
        },
        timeToDate: function(time) {
            var date = new Date(time);
            return date.format('yyyy/MM/dd hh:mm:ss');
        }
    }
});

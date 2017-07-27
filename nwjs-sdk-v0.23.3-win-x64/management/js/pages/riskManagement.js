/**
 * Created by Administrator on 2017/6/19.
 */
var riskManagement = new Vue({
    el:'#riskManagement',
    data:{
        riskList:[]
    },
    beforeMount:function () {
        this.getData();
        $(window).on('resize',function () {
            $('#table1').css('height',$(window).height()-$('#table1').offset().top-20);
        });
    },
    mounted:function () {
        $('#table1').css('height',$(window).height()-$('#table1').offset().top-20);
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
    },
    methods:{
        getData:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/trade/v1/summary',
                type: "POST",
                data: JSON.stringify({"exchange_code":global.userInfo.exchangeCodes.split(':')[0]}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.riskList = data;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        }
    }
});



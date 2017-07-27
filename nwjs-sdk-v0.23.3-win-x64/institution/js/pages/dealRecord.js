/**
 * Created by Administrator on 2017/6/19.
 */
var dealRecord = new Vue({
    el:'#dealRecord',
    data:{
        clientId:'',
        exchangeCodes:'',
        summaryArray:[],
        detailArray:[],
        checkArray:[]
    },
    beforeMount:function () {
        this.clientId = getQueryString('clientId');
        this.exchangeCodes = getQueryString('exchangeCodes');
        this.getArray();
        $(window).on('resize',function () {
            $('#detailTable').css('height',$(window).height()-$('#detailTable').offset().top-20);
        });
    },
    mounted:function () {
        var that = this;
        $('#detailTable').css('height',$(window).height()-$('#detailTable').offset().top-20);
        //点击每一个item触发
        $('[name="single"]:checkbox').on('click', function(){
            var value = $(this).val();
            var index = $.inArray(value,that.checkArray);
            if(index==-1){
                that.checkArray.push(value);
            }else{
                that.checkArray.splice(index,1);
            }
            var $items = $("[name='single']:checkbox");
            $("[name='checkAll']:checkbox").attr('checked', $items.length == $items.filter("[name='single']:checked").length);
        });
        //点击全选触发
        $("[name='checkAll']:checkbox").on('click', function(){
            var $items = $("[name='single']:checkbox");
            $items.attr('checked', this.checked);
            if(this.checked){
                that.checkArray = [];
                for(var i=0;i<$items.length;i++){
                    that.checkArray.push($items.eq(i).val());
                }
            }else{
                that.checkArray = [];
            }
        });
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
        selectArray:function () {
            var arr = [];
            for(var i=0;i<this.checkArray.length;i++){
                var contractCode = this.summaryArray[this.checkArray[i]].contract_code;
                for(var j=0;j<this.detailArray.length;j++){
                    if(contractCode == this.detailArray[j].contract_code){
                        arr.push(this.detailArray[j]);
                    }
                }
            }
            return arr;
        }
    },
    methods:{
        getArray:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/trade/v1/recordList',
                type: "POST",
                data: JSON.stringify({"client_id": that.clientId,"exchange_code":that.exchangeCodes}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.summaryArray = data.summaryArray;
                        that.detailArray = data.detailArray;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        }
    }
});

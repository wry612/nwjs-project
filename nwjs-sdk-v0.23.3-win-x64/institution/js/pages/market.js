/**
 * Created by Administrator on 2017/6/19.
 */
var market = new Vue({
    el:'#market',
    data:{
        contractList:[],
        showList:[],
        selectContract:0,
        addContractList:[]
    },
    beforeMount:function () {
        var that = this;
        that.getContract(function () {
            if(window.localStorage.addContractList) {
                var addContractList = window.localStorage.addContractList.split(',');
                for (var i = 0; i < addContractList.length; i++) {
                    for(var j=0;j<that.contractList.length;j++){
                        if (addContractList[i] == that.contractList[j][1]) {
                            that.addContractList.push(addContractList[i]);
                        }
                    }
                }
                for(var k = 0;k<that.addContractList.length;k++){
                    that.getRecordTotal(that.addContractList[k]);
                }
            }
        });
    },
    mounted:function () {
        var that = this;
        setInterval(function () {
            for(var i=0;i<that.showList.length;i++){
                that.getRecordTotal(Number(that.showList[i].id));
            }
        },30000);
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
    },
    methods:{
        getContract:function (call) {
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
                        if(call){
                            call();
                        }
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        getRecordTotal:function (code) {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/hq/v1/recordTotal',
                type: "POST",
                data: JSON.stringify({"exchange_code":global.userInfo.exchangeCodes.split(':')[0],"contract_code":code,"last_line":0}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        var index = 0;
                        for(var q=0;q<that.contractList.length;q++){
                            if(that.contractList[q][1] == code){
                                index = q;
                                break;
                            }
                        }
                        var has = false;
                        for(var i=0;i<that.showList.length;i++){
                            if(that.showList[i].id == index){
                                that.showList[i].record = data;
                                has = true;
                                break;
                            }
                        }
                        var tickArray = data.tick_array;
                        var sellIn = 0;
                        var sellOut = 0;
                        for(var j=0;j<tickArray.length;j++){
                            if(tickArray[1] == '1'){
                                sellIn+=tickArray[j][2];
                            }else{
                                sellOut+=tickArray[j][2];
                            }
                        }
                        var totalNumber = sellIn+sellOut;
                        var fenjiaArr = [];//[["09:50:23", "2", 1, 9.01], ["09:50:14", "2", 2, 9.01]]
                        var priceArr = [];
                        for(var m=0;m<tickArray.length;m++){
                            priceArr.push(tickArray[m][3]);
                        }
                        priceArr = priceArr.unique();
                        for(var n = 0;n<priceArr.length;n++){
                            var id = n+1;
                            var total = 0;
                            var recordNumber = 0;
                            for(var a = 0;a<tickArray.length;a++){
                                if(tickArray[a][3] == priceArr[n]){
                                    total+=tickArray[a][2];
                                    recordNumber+=1;
                                }
                            }
                            var money = priceArr[n]*total;
                            fenjiaArr.push([id,priceArr[n],total,recordNumber,money]);
                        }
                        var totalAll = 0;
                        for(var b=0;b<fenjiaArr.length;b++){
                            totalAll+=fenjiaArr[b][2];
                        }
                        for(var k=0;k<fenjiaArr.length;k++){
                            var percent = (100*fenjiaArr[k][2]/totalAll).toFixed(2)+'%';
                            fenjiaArr[k].push(percent);
                        }
                        if(!has){
                            that.showList.push({'id':index,'contract':that.contractList[index],'record':data,'sellInNumber':sellIn,'sellOutNumber':sellOut,'totalNumber':totalNumber,'fenjia':fenjiaArr});
                            setTimeout(function(){$('.tabs').tabulous();},200);
                        }
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        addNew:function () {
            this.getContract(function () {
                $('.dialog-cover').show();
            });
        },
        cancel:function () {
            $('.dialog-cover').hide();
        },
        addNewContract:function () {
            var code = this.contractList[this.selectContract][1];
            this.getRecordTotal(code);
            var has = false;
            for (var i = 0; i < this.addContractList.length; i++) {
                if (this.addContractList[i] == code) {
                    has = true;
                    break;
                }
            }
            if(!has){
                this.addContractList.push(code);
                window.localStorage.addContractList = this.addContractList;
            }
            $('.dialog-cover').hide();
        },
        removeMarket:function (index,code) {
            this.showList.splice(index,1);
            for (var i = 0; i < this.addContractList.length; i++) {
                if (this.addContractList[i] == code) {
                    this.addContractList.splice(i,1);
                    window.localStorage.addContractList = this.addContractList;
                    break;
                }
            }
        },
        filter:function (index) {
            var start = $('.market-box').eq(index).find('input[name="start"]');
            var end = $('.market-box').eq(index).find('input[name="end"]');
            var re = new RegExp('^[0-9]*$');
            if(!re.test(start.val()) && start.val()!=''){
                start.val('');
                return;
            }
            if(!re.test(end.val()) && end.val()!=''){
                end.val('');
                return;
            }
            if(start.val()!=''&&end.val()!=''){
                if(Number(start.val())>Number(end.val())){
                    alert('过滤单范围错误！');
                    return;
                }else{
                    var trList = $('.market-box').eq(index).find('tbody tr');
                    var startNum = Number(start.val());
                    var endNum = Number(end.val());
                    for(var i=0;i<trList.length;i++){
                        var num = trList.eq(i).find('td').eq(2).html();
                        if(Number(num)<startNum||Number(num)>endNum){
                            trList.eq(i).hide();
                        }else{
                            trList.eq(i).show();
                        }
                    }
                }
            }else{
                var trList = $('.market-box').eq(index).find('tbody tr');
                if(start.val()!=''){
                    var startNum = Number(start.val());
                    for(var i=0;i<trList.length;i++){
                        var num = trList.eq(i).find('td').eq(2).html();
                        if(Number(num)<startNum){
                            trList.eq(i).hide();
                        }else{
                            trList.eq(i).show();
                        }
                    }
                }
                if(end.val()!='') {
                    var endNum = Number(end.val());
                    for(var i=0;i<trList.length;i++){
                        var num = trList.eq(i).find('td').eq(2).html();
                        if(Number(num)>endNum){
                            trList.eq(i).hide();
                        }else{
                            trList.eq(i).show();
                        }
                    }
                }
            }
        }
    }
});


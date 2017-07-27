/**
 * Created by Administrator on 2017/6/19.
 */
var operate = new Vue({
    el:'#operate',
    data:{
        contractCode:'',
        exchangeCodes:'',
        contractName:'',
        favId:'',
        clientId:'',
        win:null,
        favDetail:{
            param_decimal:[],
            param_color:[],
            param_font:[]
        },
        riskList:[],
        fundTotal:'',
        usableFund:'',
        holderQty:'',
        enableQty:'',
        hq:{
            currentPrice:'',
            down_price:'',
            upPrice:'',
            prePrice:'',
            currentQty:'',
            buyArray:[],
            sellArray:[],
            profitLoss:'',
            profitLossRate:'',
            tradeTotal:'',
            bestBuyQueue:'',
            bestSellQueue:''
        },
        inputPrice:'',
        inputNumber:'',
        isFixed:false,
        isFifth:false,
        showList:[],
        fifthList:[]
    },
    beforeMount:function () {
        this.contractCode = getQueryString('contractCode');
        this.exchangeCodes = getQueryString('exchangeCodes');
        this.contractName = getQueryString('contractName');
        this.favId = getQueryString('favId');
        this.clientId = getQueryString('clientId');
        this.win = nw.Window.get();
        this.win.width = 500;
        this.win.height = 950;
        this.win.x = 0;
        this.win.y = 0;
        this.win.focus();
        this.getFavDetail();
        this.getFund();
        this.getTrade();
        this.getContractDetail();
        this.createWebScoket();
    },
    mounted:function () {
        $('.container').css('height',$(window).height()-$('.container').offset().top-20);
        $(window).on('resize',function () {
            $('.container').css('height',$(window).height()-$('.container').offset().top-20);
        });
        $('.table-wrap').on('scroll',function () {
            var scrollTop = $(this).scrollTop();
            $(this).find('.fixed').css('top',scrollTop);
        });
    },
    computed:{
        isDisabled:function () {
            return this.isFixed;
        }
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
                        that.favDetail = {
                            param_color:data.param_color,
                            param_decimal:data.param_decimal,
                            param_font:data.param_font
                        };
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        getFund:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/finance/v1/detail',
                type: "POST",
                data: JSON.stringify({exchange_code:that.exchangeCodes,client_id:that.clientId}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.fundTotal = data.fund_total;
                        that.usableFund = data.usable_fund;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        getTrade:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/trade/v1/detail',
                type: "POST",
                data: JSON.stringify({client_id:that.clientId,contract_code:that.contractCode,exchange_code:that.exchangeCodes}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.holderQty = data.holder_qty;
                        that.enableQty = data.enable_qty;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        getContractDetail:function () {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/hq/v1/contractDetail',
                type: "POST",
                data: JSON.stringify({contract_code:that.contractCode,exchange_code:that.exchangeCodes}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        that.hq = {
                            currentPrice:data.current_price,//当前价
                            downPrice:data.down_price,//跌停价
                            upPrice:data.up_price,//涨停价
                            prePrice:data.pre_price,//昨收价
                            currentQty:data.current_qty,//最近成交量
                            buyArray:data.buy_array,//买档数组
                            sellArray:data.sell_array,//卖档数组
                            profitLoss:data.profit_loss,//涨跌价格
                            profitLossRate:data.profit_loss_rate,//涨跌比率
                            tradeTotal:data.trade_total,//总量
                            bestBuyQueue:data.best_buy_queue,//买一时间优先前50个摆单
                            bestSellQueue:data.best_sell_queue //卖一时间优先前50个摆单
                        };
                        var show = [];
                        var current = that.hq.upPrice;
                        while (current>=that.hq.downPrice){
                            var da = {
                                buy:'',
                                buyNum:'',
                                nowNum:'',
                                price:current.toFixed(2),
                                sellNum:'',
                                sell:'',
                                market:''
                            };
                            for(var i=0;i<that.hq.sellArray.length;i++){
                                if(that.hq.sellArray[i][0].toFixed(2)==current.toFixed(2)){
                                    da.sellNum = that.hq.sellArray[i][1];
                                }
                            }
                            for(var j=0;j<that.hq.buyArray.length;j++){
                                if(that.hq.buyArray[j][0].toFixed(2)==current.toFixed(2)){
                                    da.buyNum = that.hq.buyArray[j][1];
                                }
                            }
                            if(current.toFixed(2)==that.hq.currentPrice.toFixed(2)){
                                da.nowNum = that.hq.currentQty;
                            }
                            show.push(da);
                            current-=0.01;
                        }
                        that.showList = show;
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        createWebScoket:function() {
            var that = this;
            if ("WebSocket" in window)
            {
                // 打开一个 web socket
                var ws = new WebSocket("ws://192.168.10.163:8073/subscribe?sid="+global.userInfo.sid);
                ws.onopen = function()
                {
                    // Web Socket 已连接上，使用 send() 方法发送数据
                    ws.send("sub_hq_" + that.contractCode);
                };
                ws.onmessage = function (evt)
                {
                    var index_flag = evt.data.indexOf(":");
                    if (index_flag < 0) {
                        return;
                    }
                    var data = JSON.parse(evt.data.substring(index_flag + 1));
                    if(data){
                        that.hq = {
                            currentPrice:data.current_price,//当前价
                            downPrice:data.down_price,//跌停价
                            upPrice:data.up_price,//涨停价
                            prePrice:data.pre_price,//昨收价
                            currentQty:data.current_qty,//最近成交量
                            buyArray:data.buy_array,//买档数组
                            sellArray:data.sell_array,//卖档数组
                            profitLoss:data.profit_loss,//涨跌价格
                            profitLossRate:data.profit_loss_rate,//涨跌比率
                            tradeTotal:data.trade_total,//总量
                            bestBuyQueue:data.best_buy_queue,//买一时间优先前50个摆单
                            bestSellQueue:data.best_sell_queue //卖一时间优先前50个摆单
                        };
                        var show = [];
                        var current = that.hq.upPrice;
                        while (current>=that.hq.downPrice){
                            var da = {
                                buy:'',
                                buyNum:'',
                                nowNum:'',
                                price:current.toFixed(2),
                                sellNum:'',
                                sell:'',
                                market:''
                            };
                            for(var i=0;i<that.hq.sellArray.length;i++){
                                if(that.hq.sellArray[i][0].toFixed(2)==current.toFixed(2)){
                                    da.sellNum = that.hq.sellArray[i][1];
                                }
                            }
                            for(var j=0;j<that.hq.buyArray.length;j++){
                                if(that.hq.buyArray[j][0].toFixed(2)==current.toFixed(2)){
                                    da.buyNum = that.hq.buyArray[j][1];
                                }
                            }
                            if(current.toFixed(2)==that.hq.currentPrice.toFixed(2)){
                                da.nowNum = that.hq.currentQty;
                            }
                            show.push(da);
                            current-=0.01;
                        }
                        that.showList = show;
                    }
                };
                ws.onclose = function()
                {
                    // 关闭 websocket
                    console.log("连接已关闭...");
                };
            }
            else
            {
                // 浏览器不支持 WebSocket
                alert("您的浏览器不支持 WebSocket!");
            }
        },
        setNumber:function (event) {
            if(!this.isFixed){
                this.inputNumber = event.currentTarget.value;
            }
        },
        buyOrSell:function (action,price) {
            var that = this;
            var currPrice = 0;
            if(price){
                currPrice = price;
            }else{
                if(that.inputPrice!=''){
                    var reg = new RegExp('^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$');
                    if(!reg.test(that.inputPrice)){
                        alert('请输入正确的价格（非负小数）');
                    }else{
                        currPrice = that.inputPrice;
                    }

                }else{
                    alert('请选择委托价格');
                    return;
                }
            }
            if(that.inputNumber!=''){
                var reCode = new RegExp("^[1-9][0-9]*$");
                if(!reCode.test(Number(that.inputNumber))){
                    alert('委托数量必须为整数');
                    return;
                }
            }else{
                alert('请选择委托数量');
                return;
            }
            $.ajax({
                url: config.apiBasePath+'/order/v1/allow',
                type: "POST",
                data: JSON.stringify({client_id:that.clientId,contract_code:that.contractCode,exchange_code:that.exchangeCodes,price:currPrice,quantity:that.inputNumber,action:action,order_type:1,tif:1}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp, status, xhr) {
                    if(rsp.head.code == 0) {
                        alert('下单成功');
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
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
        showFifth:function () {
            var rever = this.hq.sellArray.reverse();
            dang = rever.concat(this.hq.buyArray);
            for(var i=0;i<dang.length;i++){
                var has = false;
                for(var j=0;j<this.showList.length;j++){
                    if(this.showList[j].price==dang[i][0]){
                        this.fifthList.push(this.showList[j]);
                        has=true;
                    }
                }
                if(!has){
                    var da = {
                        buy:'',
                        buyNum:'',
                        nowNum:'',
                        price:current.toFixed(2),
                        sellNum:'',
                        sell:'',
                        market:''
                    };
                    this.fifthList.push(da);
                }
            }
        },
        getRecordTotal:function (code) {
            var that = this;
            $.ajax({
                url: config.apiBasePath+'/hq/v1/recordTotal',
                type: "POST",
                data: JSON.stringify({"exchange_code":that.exchangeCodes.split(':')[0],"contract_code":that.contractCode,"last_line":0}),
                dataType: "json",
                headers:global.netHeader,
                success: function (rsp) {
                    if(rsp.head.code == 0) {
                        var data = rsp.body;
                        var tickArray = data.tick_array;
                        var fenjiaArr = [];//[["09:50:23", "2", 1, 9.01], ["09:50:14", "2", 2, 9.01]]
                        var priceArr = [];
                        for(var m=0;m<tickArray.length;m++){
                            priceArr.push(tickArray[m][3]);
                        }
                        priceArr = priceArr.unique();
                        for(var n = 0;n<priceArr.length;n++){
                            var total = 0;
                            var recordNumber = 0;
                            for(var a = 0;a<tickArray.length;a++){
                                if(tickArray[a][3] == priceArr[n]){
                                    total+=tickArray[a][2];
                                }
                            }
                            fenjiaArr.push({price:priceArr[n],market:total});
                        }
                        for(var i=0;i<that.showList.length;i++){
                            for(var j=0;j<fenjiaArr.length;j++){
                                if(fenjiaArr[j].price==that.showList[i].price){
                                    that.showList[i].market = fenjiaArr[j].market;
                                }
                            }
                        }
                    }else{
                        alert(rsp.head.msg);
                    }
                }
            });
        },
        goPrice:function (index) {
            var top1 = $('#tableWrap').offset().top;
            var maxTop = $('#fixTable').height()-$('#tableWrap').height();
            var center = $('#tableWrap').height()/2;
            var scrollTop = $('#tableWrap').scrollTop();
            if(index==-100){
                var top2 = $('#fixTable tr').eq(this.showList.length-1).offset().top;
                var top = top2-top1+scrollTop;
                if(top>maxTop){
                    top = maxTop;
                }
                $('#tableWrap').scrollTop(top);
            }else if(index>=-15&&index<0){
                var price = this.hq.sellArray[Math.abs(index)-1][0];
                var scrollTop = $('#tableWrap').scrollTop();
                var has = false;
                for(var i=0;i<this.showList.length;i++){
                    if(price.toFixed(2)==this.showList[i].price){
                        var top2 = $('#fixTable tr').eq(i).offset().top;
                        var top = top2-top1+scrollTop-center;
                        if(top>maxTop){
                            top = maxTop;
                        }else if(top<0){
                            top=0;
                        }
                        $('#tableWrap').scrollTop(top);
                        has=true;
                        break;
                    }
                }
                if(!has){
                    var price = this.hq.currentPrice;
                    var scrollTop = $('#tableWrap').scrollTop();
                    for(var i=0;i<this.showList.length;i++){
                        if(price.toFixed(2)==this.showList[i].price){
                            var top2 = $('#fixTable tr').eq(i).offset().top;
                            var top = top2-top1+scrollTop-center;
                            if(top>maxTop){
                                top = maxTop;
                            }else if(top<0){
                                top=0;
                            }
                            $('#tableWrap').scrollTop(top);
                            break;
                        }
                    }
                }
            }else if(index==0){
                var price = this.hq.currentPrice;
                var scrollTop = $('#tableWrap').scrollTop();
                for(var i=0;i<this.showList.length;i++){
                    if(price.toFixed(2)==this.showList[i].price){
                        var top2 = $('#fixTable tr').eq(i).offset().top;
                        var top = top2-top1+scrollTop-center;
                        if(top>maxTop){
                            top = maxTop;
                        }else if(top<0){
                            top=0;
                        }
                        $('#tableWrap').scrollTop(top);
                        break;
                    }
                }
            }else if(index>0&&index<=15){
                var price = this.hq.buyArray[index-1][0];
                var scrollTop = $('#tableWrap').scrollTop();
                var has = false;
                for(var i=0;i<this.showList.length;i++){
                    if(price.toFixed(2)==this.showList[i].price){
                        var top2 = $('#fixTable tr').eq(i).offset().top;
                        var top = top2-top1+scrollTop-center;
                        if(top>maxTop){
                            top = maxTop;
                        }else if(top<0){
                            top=0;
                        }
                        $('#tableWrap').scrollTop(top);
                        has = true;
                        break;
                    }
                }
                if(!has){
                    var price = this.hq.currentPrice;
                    var scrollTop = $('#tableWrap').scrollTop();
                    for(var i=0;i<this.showList.length;i++){
                        if(price.toFixed(2)==this.showList[i].price){
                            var top2 = $('#fixTable tr').eq(i).offset().top;
                            var top = top2-top1+scrollTop-center;
                            if(top>maxTop){
                                top = maxTop;
                            }else if(top<0){
                                top=0;
                            }
                            $('#tableWrap').scrollTop(top);
                            break;
                        }
                    }
                }
            }else{
                $('#tableWrap').scrollTop(0);
            }
        },
        goPercent:function (percent) {
            var top1 = $('#tableWrap').offset().top;
            var maxTop = $('#fixTable').height()-$('#tableWrap').height();
            var center = $('#tableWrap').height()/2;
            var scrollTop = $('#tableWrap').scrollTop();
            var price = this.hq.prePrice+this.hq.prePrice*percent/100;
            for(var i=0;i<this.showList.length;i++){
                if(price.toFixed(2)==this.showList[i].price){
                    var top2 = $('#fixTable tr').eq(i).offset().top;
                    var top = top2-top1+scrollTop-center;
                    if(top>maxTop){
                        top = maxTop;
                    }else if(top<0){
                        top=0;
                    }
                    $('#tableWrap').scrollTop(top);
                    break;
                }
            }
        },
        clearInput:function () {
            if(!this.isFixed) {
                this.inputNumber = '';
                this.inputPrice = '';
            }
        }
    }
});



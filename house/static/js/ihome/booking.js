//  返回前一个页面
function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

//  解析路由，获取路由中的参数
function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $('.error-msg').hide()
    var path = location.pathname
    var pa_list = path.split('/')
    var id = pa_list[3]
    days = '';
    amount = '';
    $.ajax({
       url:'/house/detail_info/'+ id +'/',
       dataType:'json',
       type:'GET',
       success:function(data){
           $('.house-text h3').html(data.data[0].title)
           $('.house-text p span').html(data.data[0].price)
           $('.house-info img').attr('src', '/static/media/' + data.data[0].images[0])
       }
    })

    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    $(".input-daterange").on("changeDate", function(){
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        if (startDate && endDate && startDate > endDate) {
            showErrorMsg();
        } else {
            var sd = new Date(startDate);
            var ed = new Date(endDate);
            days = (ed - sd)/(1000*3600*24) + 1;
            price = $(".house-text>p>span").html();
            amount = days * parseFloat(price);
            $(".order-amount>span").html(amount.toFixed(2) + "(共"+ days +"晚)");
        }
    });

    $('.submit-btn').on("click", function(){
         var start_date = $('#start-date').val()
         var end_date = $('#end-date').val()
         $.ajax({
            url:'/orders/order_create/',
            type:'POST',
            dataType:'json',
            data: {'sd': start_date, 'ed': end_date, 'house_id': id, 'days': days, 'amount': amount},
            success:function(data){
               console.log(data)
               if (data.code == 200){
                   location.href = '/orders/my_orders/';
               }
               if (data.code == 3001){
                   $('.error-msg').show()
               }
            }
         })
    })
})

//  将订单状态转换成中文
function status_ch(status){
    a = ''
    if (status == "WAIT_ACCEPT"){
       a = "待接单"
    }
    if (status == "WAIT_PAYMENT"){
       a = "待支付"
    }
    if (status == "PAID"){
       a = "已支付"
    }
    if (status == "WAIT_COMMENT"){
       a = "待评价"
    }
    if (status == "COMPLETE"){
       a = "已完成"
    }
    if (status == "CANCELED"){
       a = "已取消"
    }
    if (status == "REJECTED"){
       a = "已拒单"
    }
    return a
}
//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}
//  修改订单状态
function update_order_status(status,label){
     var order_id = label.attr("order-id");
     var reject_reason = $('#reject-reason').val()
     if (status == 'REJECTED' && reject_reason == ''){
           $('#reject-reason-err').show();
           return;
     }
     var data = {'order_id': order_id, 'status': status, 'reject_reason': reject_reason}
     $.ajax({
        url:'/orders/update_order_status/',
        type:'PATCH',
        data:data,
        dataType:'json',
        success:function(data){
            location.reload()
//            $('.accept-'+ order_id).hide()
//            $('.reject-'+ order_id).hide()
//            $('.status-'+ order_id).html('订单状态：'+ status_ch(status))
        }
     })
}

$(document).ready(function(){
    $('#reject-reason-err').hide()
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
//    客户订单数据渲染
    $.get('/orders/lorders_info/', function(data){
        if (data.code == 1011){
            var li = $('<li>')
            $('.orders-list').append(li)
            var div = $('<div>')
            div.attr('class', 'order-title')
            console.log(data.msg)
            li.append(div)
            var h3 = $('<h3>')
            h3.html(data.msg)
            div.append(h3)
            return
        }
        if (data.code == 200){
            for (i in data.data){
                var li = $('<li>')
                $('.orders-list').append(li)
                var div = $('<div>')
                div.attr('class', 'order-title')
                li.append(div)
                var h3 = $('<h3>')
                h3.html('订单编号：' + data.data[i].id)
                div.append(h3)
                var div1 = $('<div>')
                div1.attr('class', 'fr order-operate')
                div.append(div1)
                var div2 = $('<div>')
                div2.attr('class', 'order-content')
                li.append(div2)
                var img = $('<img>')
                img.attr('src', '/static/media/'+ data.data[i].image)
                div2.append(img)
                var div3 = $('<div>')
                div3.attr('class', 'order-text')
                div2.append(div3)
                var h33 = $('<h3>')
                h33.html(data.data[i].title)
                div3.append(h33)
                var ul1 = $('<ul>')
                div3.append(ul1)
                var li1 = $('<li>')
                li1.html('创建时间：'+ data.data[i].create_date)
                ul1.append(li1)
                var li2 = $('<li>')
                li2.html('入住时间：'+ data.data[i].begin_date)
                ul1.append(li2)
                var li3 = $('<li>')
                li3.html('离开时间：'+ data.data[i].end_date)
                ul1.append(li3)
                var li4 = $('<li>')
                li4.html('合计金额：$' + data.data[i].amount + '(共' + data.data[i].days + '晚)')
                ul1.append(li4)
                var li5 = $('<li>')
                li5.html('订单状态：'+ status_ch(data.data[i].status))
                li5.attr('class', 'status-'+ data.data[i].id)
                ul1.append(li5)
                var li6 = $('<li>')
                if (data.data[i].status == 'WAIT_ACCEPT'){
                    var button = $('<button>')
                    button.attr('type', 'button')
                    button.attr('class', 'btn btn-success order-accept accept-'+ data.data[i].id)
                    button.attr('data-toggle', 'modal')
                    button.attr('data-target', '#accept-modal')
                    button.attr('order-id', data.data[i].id)
                    button.html('接单')
                    div1.append(button)
                    var button1 = $('<button>')
                    button1.attr('type', 'button')
                    button1.attr('class', 'btn btn-danger order-reject reject-'+ data.data[i].id)
                    button1.attr('data-toggle', 'modal')
                    button1.attr('data-target', '#reject-modal')
                    button1.attr('order-id', data.data[i].id)
                    button1.html('拒单')
                    div1.append(button1)
                }
                if (data.data[i].status == "REJECTED"){
                    li6.html('拒单原因：'+ data.data[i].comment)
                    ul1.append(li6)
                }
                if (data.data[i].status == "COMPLETE" || data.data[i].status == "PAID" || data.data[i].status == "WAIT_COMMENT"){
                    // 用data.data[i].status in ["COMPLETE", "PAID", "WAIT_COMMENT"]无效
                    if (!data.data[i].comment){
                        li6.html('客户评价：暂未评价')
                    }else{
                        li6.html('客户评价：'+ data.data[i].comment)
                    }
                    ul1.append(li6)
                }
            }
            //    接单按钮点击
            $(".order-accept").on("click", function(){
                var orderId = $(this).attr("order-id");
                $(".modal-accept").attr("order-id", orderId);
            });
           //    拒单按钮点击
            $(".order-reject").on("click", function(){
                var orderId = $(this).attr("order-id");
                $(".modal-reject").attr("order-id", orderId);
            });
        }
    })
//    确认接单按钮点击
    $('.modal-accept').on("click", function(){
         update_order_status('WAIT_PAYMENT',$(this));
    });
//    拒单按钮下一步的确认按钮
    $('.modal-reject').on("click", function(){
         update_order_status('REJECTED',$(this))
    })
});
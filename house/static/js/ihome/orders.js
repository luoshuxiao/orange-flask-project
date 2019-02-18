//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框（为class="modal"的标签执行下列动作）
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}
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

$(document).ready(function(){
    $.get('/orders/my_orders_info/', function(data){
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
                var button = $('<button>')
                button.attr('type', 'button')
                button.attr('class', 'btn btn-success order-comment pay-order')
                button.attr('order-id', data.data[i].id)
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
                h33.html('订单')
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
                if (data.data[i].status == "COMPLETE" || data.data[i].status == "PAID" || data.data[i].status == "WAIT_COMMENT"){
                    if (!data.data[i].comment){
                        button.attr('data-toggle', 'modal')
                        button.attr('data-target', '#comment-modal')
                        button.html('发表评价')
                        button.attr('class', 'btn btn-success order-comment')
                        div1.append(button)
                        li6.html('我的评价：暂无评价')
                    }else{
                        li6.html('我的评价：'+ data.data[i].comment)
                    }
                    ul1.append(li6)
                }
                if (data.data[i].status == "REJECTED"){
                    li6.html('拒单原因：'+ data.data[i].comment)
                    ul1.append(li6)
                }
                if (data.data[i].status == "WAIT_PAYMENT"){
                    button.html('支付订单')
                    button.attr('style', 'margin-right:15px;')
                    div1.append(button)
                    var button1 = $('<button>')
                    button1.attr('type', 'button')
                    button1.attr('class', 'btn btn-success order-comment cancel-order')
                    button1.attr('order-id', data.data[i].id)
                    button1.html('取消订单')
                    div1.append(button1)
                }
            }
            $(".order-comment").on("click", function(){
                var orderId = $(this).attr("order-id");
                $(".btn-primary").attr("order-id", orderId);
            });
            // 取消订单按钮
            $('.cancel-order').on('click', function(){
                var order_id = $(this).attr("order-id")
                var cancel_order = confirm('确认要取消该订单吗？')
                if (cancel_order){
                    $.ajax({
                        url: '/orders/update_order_status/',
                        type:'PATCH',
                        dataType:'json',
                        data:{'order_id': order_id, 'status': "CANCELED"},
                        success:function(data){
                              //  局部修改标签刷新页面 （也可以用location.reload()刷新页面）
                             $('.pay-order').hide()
                             $('.cancel-order').hide()
                             $('.status-'+ order_id).html('订单状态：已取消')
                        }
                    })
                }
            })
            //  支付订单按钮
            $('.pay-order').on('click', function(){
                var order_id = $(this).attr("order-id")
                alert('支付功能尚未开发完成，敬请期待！')
            })
        }
    })
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
//  发表评论的确认按钮
    $('.btn-primary').on("click", function(){
        var order_id = $(".btn-primary").attr("order-id")
        var text = $('#comment').val()
        if (!text){
            location.reload();
            return;
        }
        $.ajax({
           url:'/orders/update_comment/',
           data:{'order_id': order_id, 'comment': text},
           dateType:'json',
           type:'PATCH',
           success:function(data){
               location.reload();
           }
        })
    })
});
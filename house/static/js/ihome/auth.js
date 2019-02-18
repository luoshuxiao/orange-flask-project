function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

//  页面加载完成后执行以下操作
$(document).ready(function(){
    $.get('/user/check_auth/', function(data){
        if (data.code == 200){
           $('#real-name').val(data.data[0])
           $('#real-name').attr('disabled', 'disabled')
           $('#id-card').val(data.data[1])
           $('#id-card').attr('disabled', 'disabled')
           $('.btn-success').hide()
        }
    })
    $('#form-auth').submit(function(e){
        e.preventDefault();
//        real_name = $('#real-name').val();
//        id_card = $('#id-card').val();
        $(this).ajaxSubmit({
            url:'/user/auth/',
            type:'POST',
            dataType:'json',
            success:function(data){
               if (data.code == 200){
                   showSuccessMsg();
                   location.href = '/user/my/';
                   return;
               }
               if (data.code == 3001){
                   $('#id_card_error span').html(data.msg);
                   $('#id_card_error').show();
                   return;
               }
               if (data.code == 3002){
                   $('#real_name_error span').html(data.msg);
                   $('#real_name_error').show();
                   return;
               }
            },
            error:function(data){
            }
        })
    })

})


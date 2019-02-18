function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    // $('.popup_con').fadeIn('fast');
    // $('.popup_con').fadeOut('fast');
    $.get('/house/area_facility_info/', function(data){
         var num = 1
         if (data.code == 200){
             for (var i in data.data[0]){
                var option = $('<option>')
                option.html(data.data[0][i])
                option.attr('value', num)
                $('#area-id').append(option)
                num++
             }
             var num = 1
             for (var i in data.data[1]){
                var li = $('<li>')
                var div = $('<div>')
                div.attr('class', 'checkbox')
                var label = $('<label>')
                var input = $('<input>')
                input.attr('type', 'checkbox')
                input.attr('name', 'facility')
                input.attr('value', num)
                var span = $('<span>')
                span.html(data.data[1][i])
                num++
                label.append(input)
                label.append(span)
                div.append(label)
                li.append(div)
                $('.house-facility-list').append(li)
             }
         }
    })
    $('#form-house-info').submit(function(e){
         e.preventDefault();
         $(this).ajaxSubmit({
             url:'/house/newhouse/',
             type:'POST',
             success:function(data){
                 console.log(data)
                 $('#form-house-info').hide();
                 $('#form-house-image').show();
                 $('#house-id').val(data.data);
             }
         })
    })
    $('#form-house-image').submit(function(e){
         e.preventDefault();
         $(this).ajaxSubmit({
             url:'/house/newhouse_img/',
             type:'PATCH',
             success:function(data){
                 var img = $('<img>')
                 img.attr('src', '/static/media/' + data.data)
                 $('.form-group').append(img)

             }
         })
    })
})
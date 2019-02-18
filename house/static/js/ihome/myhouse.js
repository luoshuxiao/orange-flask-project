
function houses_info(){
    $.ajax({
        url:'/house/myhouse_info/',
        type:'GET',
        dataType:'json',
        success:function(data){
           if (data.data == []){
              return;
           }
           if (data.data !=[]){
              var num = 1
              for (i in data.data){
                  li = $('<li>')
                  a = $('<a>')
                  a.attr('href', '/house/detail/'+ data.data[i].id + '/')
                  li.append(a)
                  div1 = $('<div>')
                  div1.attr('class', 'house-title')
                  h3 = $('<h3>')
                  h3.html('房屋:'+ num + '——' + data.data[i].title)
                  num++
                  div1.append(h3)
                  a.append(div1)
                  div2 = $('<div>')
                  div2.attr('class', 'house-content')
                  img = $('<img>')
                  img.attr('src', '/static/media/' + data.data[i].image)
                  div2.append(img)
                  a.append(div2)
                  div3 = $('<div>')
                  div3.attr('class', 'house-text')
                  div2.append(div3)
                  ul = $('<ul>')
                  li1 = $('<li>')
                  li1.html('位于：' + data.data[i].area)
                  li2 = $('<li>')
                  li2.html('价格：$' + data.data[i].price + '/晚')
                  li3 = $('<li>')
                  li3.html('发布时间：' + data.data[i].create_time)
                  ul.append(li1)
                  ul.append(li2)
                  ul.append(li3)
                  div3.append(ul)
                  $('#houses-list').append(li)
              }
           }
        }
    })
}

$(document).ready(function(){
    $.get('/user/check_auth/', function(data){
        if (data.code == 1008){
           $('#houses-list').hide()
           $(".auth-warn").show();
           return;
        }
        if (data.code == 200){
           $('#houses-list').show();
           $(".auth-warn").hide();
           houses_info();
           return;
        }
    })


})
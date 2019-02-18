//// 解析路由，获取路由中的参数
//function decodeQuery(){
//    var search = decodeURI(document.location.search);
//    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
//        values = item.split('=');
//        result[values[0]] = values[1];
//        return result;
//    }, {});
//}
$(document).ready(function(){
//   location.pathname 获取路由
//   location.search  获取路由问号以后的字符串（包括问号）
    var path = location.pathname
    var pa_list = path.split('/')
    id = pa_list[3]
    $.ajax({
       url:'/house/detail_info/'+ id + '/',
       dataType:'json',
       type:'GET',
       success:function(data){
           if (data.code == 200){
                if (data.data[1] != data.data[0].user_id){
                     $('.book-house').show()
                }
                //   轮播图片数据渲染
                for (var i in data.data[0].images){
                      var img = $('<img>')
                      var li = $('<li>')
                      li.attr('class', 'swiper-slide')
                      img.attr('src', '/static/media/' + data.data[0].images[i])
                      li.append(img)
                      $('.swiper-wrapper').append(li)
                }
                // 图片轮播
                var mySwiper = new Swiper ('.swiper-container', {
                    loop: true,
                    autoplay: 2000,
                    autoplayDisableOnInteraction: false,
                    pagination: '.swiper-pagination',
                    paginationType: 'fraction'
                })
                //  渲染数据 （未写完全，房屋设置和用户评论未写）
                $('.house-price span').html(data.data[0].price)
                $('.house-title').html(data.data[0].title)
                $('.landlord-name span').html(data.data[0].user_phone)
                $('.text-center li').html(data.data[0].address)
                $('#room_num').html(data.data[0].room_count)
                $('#person_num').html(data.data[0].capacity)
                $('#area_room').html(data.data[0].acreage)
                $('#bed_id').html(data.data[0].beds)
                $('#room_unit').html(data.data[0].unit)
                $('#deposit').html(data.data[0].deposit)
                $('#min_days_id').html(data.data[0].min_days)
                $('#max_days_id').html(data.data[0].max_days)
                $('.landlord-pic img').attr('src' ,'/static/media/'+ data.data[0].user_avatar)
           }
       }
    })
})

function bookingPage(){
     location.href = '/house/booking/'+id+'/';
}
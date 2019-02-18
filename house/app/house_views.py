import datetime
import os
import random

from flask import Blueprint, render_template, jsonify, request, session
from sqlalchemy import or_

from app.models import Area, House, Facility, HouseImage, Order
from utils.functions import login_required

# 创建蓝图对象
house = Blueprint('house', __name__)


@house.route('/index/', methods=['GET'])
def index():
    return render_template('index.html')


# 主页中的轮播图（随机生成）
@house.route('/index_house_image_random/', methods=['GET'])
def index_house_image_random():
    house = House.query.all()
    houses_info = []
    for i in range(3):
        a = random.choice(house)
        list = [a.id, a.index_image_url, a.title]
        house.remove(a)
        houses_info.append(list)
    return jsonify({'code': 200, 'msg': '请求成功', 'data': houses_info})


# 获取区域和房屋设施数据
@house.route('/area_facility_info/', methods=['GET'])
def area_facility_info():
    areas = Area.query.all()
    area_array = [area.name for area in areas]
    facilities = Facility.query.all()
    facility_array = [facility.name for facility in facilities]
    area_facility_list=[]
    area_facility_list.append(area_array)
    area_facility_list.append(facility_array)
    return jsonify({'code': 200, 'msg': '请求成功', 'data': area_facility_list})


@house.route('/myhouse/', methods=['GET'])
@login_required
def myhouse():
    return render_template('myhouse.html')


# 获取我的房源数据
@house.route('/myhouse_info/', methods=['GET'])
@login_required
def myhouse_info():
    id = session.get('user_id')
    houses = House.query.filter(House.user_id == id)
    houses_info = []
    for house in houses:
        houses_info.append(house.to_dict())
    return jsonify({'code': 200, 'msg': '请求成功', 'data': houses_info})


@house.route('/detail/<int:id>/', methods=['GET'])
def detail(id):
    return render_template('detail.html')


# 获取房屋所有信息
@house.route('/detail_info/<int:id>/', methods=['GET'])
def detail_info(id):
    house = House.query.filter(House.id == id).first()
    current_id = session.get('user_id')
    return jsonify({'code': 200, 'msg': '请求成功', 'data': [house.to_full_dict(), current_id]})


@house.route('/booking/<int:id>/', methods=['GET'])
@login_required
def booking(id):
    return render_template('booking.html')


@house.route('/newhouse/', methods=['GET'])
@login_required
def newhouse():
    return render_template('newhouse.html')


# 发布新房源，修改数据库中的数据
@house.route('/newhouse/', methods=['POST'])
@login_required
def newhouse_info():
    house = House()
    house.user_id = session.get('user_id')
    house.title = request.form.get('title')
    house.price = request.form.get('price')
    house.area_id = int(request.form.get('area_id'))
    house.address = request.form.get('address')
    house.room_count = request.form.get('room_count')
    house.acreage = request.form.get('acreage')
    house.unit = request.form.get('unit')
    house.capacity = request.form.get('capacity')
    house.beds = request.form.get('beds')
    house.deposit = request.form.get('deposit')
    house.min_days = request.form.get('min_days')
    house.max_days = request.form.get('max_days')
    house.add_update()
    facilities = request.form.getlist('facility')
    for facility_id in facilities:
        fac = Facility.query.filter(Facility.id == facility_id).first()
        house.facilities.append(fac)
    house.add_update()
    return jsonify({'code': 200, 'msg': '请求成功', 'data': house.id})


# 发布新房源添加数据库房源的图片（html中数据和图片写的是两个form表单，所以两个接口，
# 应该写成一个form一个接口，避免数据创建了，但是对应的图片没有创建）
@house.route('/newhouse_img/', methods=['PATCH'])
@login_required
def newhouse_img():
    id = request.form.get('house_id')
    image = request.files.get('house_image')
    #  获取绝对路径
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    MEDIA_DIR = os.path.join(os.path.join(os.path.join(BASE_DIR, 'house'), 'static'), 'media')
    #  保存图片文件到指定路径
    image.save(os.path.join(MEDIA_DIR, image.filename))
    # 更新数据库
    house = House.query.filter(House.id == id).first()
    if not house.index_image_url:
        house.index_image_url = image.filename
        house.add_update()
    house_image = HouseImage()
    house_image.url = image.filename
    house_image.house_id = id
    house_image.add_update()
    return jsonify({'code': 200, 'msg': '请求成功', 'data': image.filename})


@house.route('/search/', methods=['GET'])
def search():
    return render_template('search.html')


# 获取与搜索条件匹配的房源数据（区域、时间、排序）
@house.route('/area_house_info/', methods=['GET'])
def area_house_info():
    area_id = request.args.get('area_id')
    sort = request.args.get('sort_key')
    if not request.args.get('start_date'):
        start_date = 0
    else:
        # 将字符串时间转换成datetime.datetime时间
        start_date = datetime.datetime.strptime(request.args.get('start_date'), '%Y-%m-%d')
    if not request.args.get('end_date'):
        end_date = 0
    else:
        end_date = datetime.datetime.strptime(request.args.get('end_date'), '%Y-%m-%d')
    # 满足区域条件的房源
    if not area_id:
        houses_area = House.query.all()
    else:
        houses_area = House.query.filter(House.area_id == area_id).all()
    # 满足时间条件的房源
    orders = Order.query.all()
    orders_yes = Order.query.filter(or_(Order.begin_date.__gt__(end_date), Order.end_date.__lt__(start_date))).all()
    houses_no = [order.house for order in list(set(orders) - set(orders_yes))]
    houses_result = list(set(houses_area)-set(houses_no))
    if sort == 'new':
        # id从大到小（新上线的house的id更大）
        houses_result.sort(key=lambda house: house.id, reverse=True)
    if sort == 'booking':
        # 入住最多
        houses_result.sort(key=lambda house: house.order_count, reverse=True)
    if sort == 'price-inc':
        #  价格低到高
        houses_result.sort(key=lambda house: house.price)
    if sort == 'price-des':
        #  价格高到低
        houses_result.sort(key=lambda house: house.price, reverse=True)
    houses_list = [house.to_dict() for house in houses_result]
    return jsonify({'code': 200, 'msg': '请求成功', 'data': houses_list})
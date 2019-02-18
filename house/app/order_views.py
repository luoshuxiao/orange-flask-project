
from flask import Blueprint, render_template, request, jsonify, session

from app.models import Order, House
from utils.functions import login_required

# 生成蓝图对象
orders = Blueprint('orders', __name__)


@orders.route('/my_orders/', methods=['GET'])
@login_required
def my_orders():
    return render_template('orders.html')


# 获取我的订单数据
@orders.route('/my_orders_info/', methods=['GET'])
@login_required
def my_orders_info():
    user_id = session.get('user_id')
    order_list = [order.to_dict() for order in Order.query.filter(Order.user_id == user_id).all()]
    return jsonify({'code': 200, 'msg': '请求成功', 'data': order_list})


# 创建我的订单（预定房间）
@orders.route('/order_create/', methods=['POST'])
@login_required
def order_create():
    user_id = session.get('user_id')
    start_date = request.form.get('sd')
    end_date = request.form.get('ed')
    house_id = request.form.get('house_id')
    days = request.form.get('days')
    amount = request.form.get('amount')
    if not all([start_date, end_date]):
        return jsonify({'code': 3001, 'msg': '入住时间未填写完整'})
    order = Order()
    order.user_id = user_id
    order.begin_date = start_date
    order.end_date = end_date
    order.house_id = house_id
    order.days = days
    order.amount = amount
    order.house_price = House.query.filter(House.id == house_id).first().price
    order.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})


# 发表评论
@orders.route('/update_comment/', methods=['PATCH'])
@login_required
def update_comment():
    order_id = request.form.get('order_id')
    comment = request.form.get('comment')
    order = Order.query.filter_by(id=order_id).first()
    order.comment = comment
    order.status = "COMPLETE"
    order.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})


@orders.route('/lorders/', methods=['GET'])
@login_required
def lorders():
    return render_template('lorders.html')


# 获取客户订单数据
@orders.route('/lorders_info/', methods=['GET'])
@login_required
def lorders_info():
    user_id = session.get('user_id')
    ids = [house.id for house in House.query.filter_by(user_id=user_id).all()]
    order_info = [order.to_dict() for order in Order.query.filter(Order.house_id.in_(ids)).all()]
    if not order_info:
        return jsonify({'code': 1011, 'msg': '您的房源未被下单，暂无客户订单'})
    return jsonify({'code': 200, 'msg': '请求成功', 'data': order_info})


# 修改订单状态、创建拒单原因
@orders.route('/update_order_status/', methods=['PATCH'])
@login_required
def update_order_status():
    order_id = request.form.get('order_id')
    status = request.form.get('status')
    reject_reason = request.form.get('reject_reason')
    order = Order.query.filter_by(id=order_id).first()
    if reject_reason:
        order.comment = reject_reason
    order.status = status
    order.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})








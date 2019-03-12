# -*- coding: utf-8 -*-
# 与用户相关的视图函数


import os
import random
import re
import uuid

from flask import Blueprint, request, render_template, jsonify, session

from app.models import User
from utils.functions import login_required

user = Blueprint('user', __name__)


@user.route('/register/', methods=['GET'])
def register():
    return render_template('register.html')


@user.route('/register/', methods=['POST'])
def register_form():
    """注册"""
    mobile = request.form.get('mobile')
    password = request.form.get('passwd')
    imagecode = request.form.get('imagecode')
    password2 = request.form.get('passwd2')
    # 1. 验证参数是否填写
    if not all([mobile, imagecode, password, password2]):
        return jsonify({'code': 1001, 'msg': '请将信息填写完整'})
    # 2. 验证手机号是否正确(简单版)
    if not re.match('^1[3456789]\d{9}$', mobile):
        return jsonify({'code': 1002, 'msg': '请输入正确的手机号'})
    # 3. 验证图片验证码
    if session['img_code'] != imagecode:
        return jsonify({'code': 1003, 'msg': '验证码不正确'})
    # 4. 密码和确认密码是否一直
    if password2 != password:
        return jsonify({'code': 1004, 'msg': '密码不一致'})
    # 5. 验证手机号是否已经被注册
    user = User.query.filter(User.phone == mobile)
    if user.first():
        return jsonify({'code': 1005, 'msg': '该手机号已注册'})
    # 6. 创建注册信息
    user = User()
    user.phone = mobile
    user.name = mobile
    user.password = password
    user.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})


@user.route('/code/', methods=['GET'])
def get_code():
    """
    生成验证码
    方式一：后端生成图片，保存后，返回验证码图片地址（不推荐用，没必要保存图片）
    方式二：后端只生成随机参数，返回给页面，前端在页面中再生成图片
    :return: 验证码（字符）
    """
    s = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    code = ''
    for i in range(4):
        code += random.choice(s)
    session['img_code'] = code
    return jsonify({'code': 200, 'msg': '请求成功', 'data': code})


@user.route('/login/', methods=['GET'])
def login():
    return render_template('login.html')


@user.route('/login/', methods=['POST'])
def login_form():
    """登录"""
    mobile = request.form.get('mobile')
    password = request.form.get('password')
    user = User.query.filter_by(phone=mobile).first()
    if not all([mobile, password]):
        return jsonify({'code': 2003, 'msg': '请将登陆信息填写完整'})
    if user:
        if user.check_pwd(password):
            session['user_id'] = user.id
            return jsonify({'code': 200, 'msg': '请求成功'})
        return jsonify({'code': 2001, 'msg': '密码不正确'})
    return jsonify({'code': 2002, 'msg': '该手机号未注册，请先注册'})



@user.route('/logout/', methods=['GET'])
@login_required
def logout():
    """退出"""
    del session['user_id']
    return jsonify({'code': 200, 'msg': '请求成功'})


@user.route('/my/', methods=['GET'])
@login_required
def my():
    return render_template('my.html')


@user.route('/user_info/', methods=['GET'])
@login_required
def user_info():
    """
    获取用户信息
    :return: 用户信息
    """
    id = session.get('user_id')
    user = User.query.filter(User.id == id).first()
    return jsonify({'code': 200, 'msg': '请求成功', 'data': user.to_basic_dict()})


@user.route('/profile/', methods=['GET'])
@login_required
def profile():
    return render_template('profile.html')


@user.route('/update_avatar/', methods=['PATCH'])
@login_required
def update_avatar():
    """修改用户头像"""
    id = session.get('user_id')
    avatar = request.files.get('avatar')
    #  拼接服务器需要保存图片的绝对路径
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    HOUSR_DIR = os.path.join(BASE_DIR, 'house')
    STATIC_DIR = os.path.join(HOUSR_DIR, 'static')
    MEDIA_DIR = os.path.join(STATIC_DIR, 'media')
    #  生成uuid名字
    filename = str(uuid.uuid4())
    #  截取图片后缀
    a = avatar.mimetype.split('/')[-1:][0]
    #  生成图片的相对路径（uuid + 图片后缀）
    name = filename + '.' + a
    path = os.path.join(MEDIA_DIR, name)
    #  将图片保存在服务器path路径下
    avatar.save(path)
    #  更新数据库中avatar值
    user = User.query.filter(User.id == id).first()
    user.avatar = name
    user.add_update()
    return jsonify({'code': 200, 'msg': '请求成功', 'data': '/static/media/' + name})


@user.route('/update_name/', methods=['PATCH'])
@login_required
def update_name():
    """修改用户名"""
    name = request.form.get('name')
    id = session.get('user_id')
    u = User.query.filter(User.name == name).first()
    if u:
        return jsonify({'code': 1007, 'msg': '该用户名已存在'})
    user = User.query.filter(User.id == id).first()
    user.name = name
    user.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})


@user.route('/auth/', methods=['GET'])
@login_required
def auth():
    return render_template('auth.html')


@user.route('/check_auth/', methods=['GET'])
@login_required
def check_auth():
    """
    获取实名认证信息
    :return: 用户的实名信息
    """
    user = User.query.filter(User.id == session.get('user_id')).first()
    if not all([user.id_card, user.id_name]):
        return jsonify({'code': 1008, 'msg': '未实名认证'})
    return jsonify({'code': 200, 'msg': '请求成功', 'data': [user.id_name, user.id_card]})


@user.route('/check_login/', methods=['GET'])
def check_login():
    """
    获取登录的用户信息
    :return: 用户的手机号
    """
    id = session.get('user_id')
    if not id:
        return jsonify({'code': 1010, 'msg': '未登陆用户'})
    user = User.query.filter_by(id=id).first()
    return jsonify({'code': 200, 'msg': '请求成功', 'data': user.phone})


@user.route('/auth/', methods=['POST'])
@login_required
def auth_form():
    """修改实名认证信息"""
    real_name = request.form.get('real_name')
    id_card = request.form.get('id_card')
    id = session.get('user_id')
    if not real_name:
        return jsonify({'code': 3002, 'msg': '请填写真实姓名'})
    if not id_card:
        return jsonify({'code': 3001, 'msg': '请填写身份证号码'})
    user = User.query.filter(User.id == id).first()
    user.id_name = real_name
    user.id_card = id_card
    user.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})
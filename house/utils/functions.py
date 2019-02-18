
from functools import wraps

from flask import session, redirect, url_for


# 校验登陆状态的装饰器（未登录跳转登录页面）
def login_required(func):
    @wraps(func)  # 不修改被装饰函数的函数名
    def check_status(*args, **kwargs):
        if 'user_id' in session:
            return func(*args, **kwargs)
        return redirect(url_for('user.login'))
    return check_status
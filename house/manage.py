
from flask import Flask, render_template
from flask_script import Manager

from app.models import db
from app.house_views import house
from app.order_views import orders
from app.user_views import user

# 生成flask对象
app = Flask(__name__)


# 地址为域名或者ip加 /时，访问主页
@app.route('/')
def index_house():
    return render_template('index.html')


#  注册蓝图
app.register_blueprint(blueprint=house, url_prefix='/house')
app.register_blueprint(blueprint=user, url_prefix='/user')
app.register_blueprint(blueprint=orders, url_prefix='/orders')

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3306/house'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# 设置密钥（安全性相关功能需要加密，flask中的session，或者三方库的csrf,images,cookies等）
app.secret_key = 'sde23545kdgkj8784t'

# 注册flask项目启动命令管理对象
manage = Manager(app=app)

if __name__ == '__main__':
    # 启动项目
    manage.run()
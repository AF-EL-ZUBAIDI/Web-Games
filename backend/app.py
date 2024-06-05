from flask import Flask
from flask_cors import CORS
from routes.currency_routes import currency_bp
from routes.mines_routes import mines_bp
from routes.tictactoe_routes import tictactoe_bp
from routes.dice_routes import dice_bp
from routes.stopwatch_routes import stopwatch_bp
from routes.war_routes import war_bp

app = Flask(__name__, static_folder='../frontend/dist/frontend')
CORS(app)

app.register_blueprint(currency_bp, url_prefix='/api')
app.register_blueprint(mines_bp, url_prefix='/api')
app.register_blueprint(tictactoe_bp, url_prefix='/api')
app.register_blueprint(dice_bp, url_prefix='/api')
app.register_blueprint(stopwatch_bp, url_prefix='/api')
app.register_blueprint(war_bp, url_prefix='/api')


if __name__ == "__main__":
    app.run(debug=True)

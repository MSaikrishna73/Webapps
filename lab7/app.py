from flask import Flask, render_template, redirect, url_for, request, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from models import db, User
from flask import Flask, send_from_directory

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        user = User.query.filter_by(email=email).first()

        if user:
            flash('An account already exists with the provided email. Please provide a different email or log in.')
            return redirect(url_for('signup'))

        if password != confirm_password:
            flash('Passwords do not match')
            return redirect(url_for('signup'))

        if not password_criteria(password):
            flash('Password does not meet criteria')
            return redirect(url_for('signup'))

        new_user = User(
            first_name=first_name, 
            last_name=last_name, 
            email=email, 
            password=generate_password_hash(password, method='pbkdf2:sha256')
        )
        db.session.add(new_user)
        db.session.commit()

        flash('Thank you for signing up with us! Click here to login.')
        return redirect(url_for('thankyou'))

    return render_template('signup.html')

def password_criteria(password):
    return len(password) >= 8

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()

        if not user:
            flash('There is no account with this email. Please sign up.')
            return redirect(url_for('signup'))

        if not check_password_hash(user.password, password):
            flash('Please check your login details and try again.')
            return redirect(url_for('login'))

        login_user(user)
        return redirect(url_for('secret'))

    return render_template('login.html')

@app.route('/secret')
@login_required
def secret():
    return render_template('secretPage.html', name=current_user.first_name)

@app.route('/thankyou')
def thankyou():
    return render_template('thankyou.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/hidden/<path:filename>')
def hidden_files(filename):
    return send_from_directory('hidden', filename)

if __name__ == '__main__':
    app.run(debug=True)

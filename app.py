from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import io
import base64
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, ChatHistory

# Load environment variables
from dotenv import load_dotenv
from pathlib import Path

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fashion_stylist.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')
vision_model = genai.GenerativeModel('gemini-2.0-flash')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    
    # Return empty chat history for new sessions and pass username
    return render_template('index.html', chat_history=[], username=current_user.username)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Passwords do not match')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered')
            return redirect(url_for('register'))
        
        if User.query.filter_by(username=username).first():
            flash('Username already taken')
            return redirect(url_for('register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    # Clear user's chat history
    ChatHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    
    # Logout the user
    logout_user()
    return redirect(url_for('login'))

@app.route('/send_message', methods=['POST'])
@login_required
def send_message():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Create and save user message to history
        user_chat = ChatHistory(
            user_id=current_user.id,
            role='user',
            content=user_message
        )
        db.session.add(user_chat)
        
        # Add context for the fashion stylist role
        if not ChatHistory.query.filter_by(user_id=current_user.id).first():
            system_prompt = """You are a knowledgeable fashion stylist who provides clear, concise advice. Keep responses brief and focused on the most important recommendations.

            Format your responses in this style:
            1. One-line introduction acknowledging the context
            2. 2-3 key recommendations maximum
            3. One practical tip if relevant

            Keep responses extremely concise:
            - Maximum 2-3 sentences per point
            - Focus only on the most essential advice
            - Skip unnecessary details
            - Use simple, direct language
            
            Example format:
            "For a summer wedding in Jaipur, focus on lightweight fabrics and comfort:

            For Men:
            • Light cotton kurta-pajama in pastel shades
            • Add a simple Nehru jacket for formal events

            For Women:
            • Flowy georgette lehenga with sleeveless blouse
            • Lightweight chiffon saree for evening events

            Tip: Choose breathable fabrics and minimal jewelry to stay comfortable."

            Remember: Keep it short, specific, and actionable."""
            
            try:
                # Initialize chat with system prompt
                chat = model.start_chat(history=[])
                response = chat.send_message(system_prompt)
                response = chat.send_message(user_message)
            except Exception as e:
                print(f"Gemini API Error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': f'Gemini API Error: {str(e)}'
                }), 500
        else:
            # Get previous chat history
            chat_history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp).all()
            messages = []
            for msg in chat_history[-10:]:  # Get last 10 messages to avoid context length issues
                messages.append({
    "role": "user",
    "parts": [{"text": msg.content}]
})

                # messages.append({"role": msg.role, "content": msg.content})
            
            try:
                # Initialize chat with history
                chat = model.start_chat(history=messages)
                response = chat.send_message(user_message)
            except Exception as e:
                print(f"Gemini API Error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': f'Gemini API Error: {str(e)}'
                }), 500
        
        # Format the response text
        formatted_response = response.text
        # Ensure proper spacing and formatting
        lines = formatted_response.split('\n')
        formatted_lines = []
        for line in lines:
            line = line.strip()
            if line:
                # Add proper spacing after bullet points
                if line.startswith('•'):
                    line = '• ' + line[1:].strip()
                formatted_lines.append(line)
        formatted_response = '\n\n'.join(formatted_lines)
        formatted_response = formatted_response.strip()
        
        # Save bot response to history
        bot_chat = ChatHistory(
            user_id=current_user.id,
            role='bot',
            content=formatted_response
        )
        db.session.add(bot_chat)
        db.session.commit()
        
        # Get updated chat history
        chat_history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp).all()
        chat_history = [msg.to_dict() for msg in chat_history]
        
        return jsonify({
            'success': True,
            'response': formatted_response,
            'chat_history': chat_history
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze_image', methods=['POST'])
@login_required
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No selected file'
            }), 400

        # Read and process the image
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert RGBA to RGB if necessary
        if image.mode == 'RGBA':
            image = image.convert('RGB')

        # Convert image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        # Save user's image analysis request
        user_chat = ChatHistory(
            user_id=current_user.id,
            role='user',
            content='[Image Analysis Request]'
        )
        db.session.add(user_chat)

        # Prepare the prompt for fashion analysis
        prompt = """As a professional fashion stylist, analyze this outfit image in detail:

        1. 👗 Outfit Description:
        - Identify and describe each piece of clothing
        - Note the colors, patterns, and materials
        - Mention the overall style category

        2. 💫 Style Analysis:
        - Comment on the fit and proportion
        - Evaluate the color coordination
        - Assess the overall styling choices

        3. ✨ Recommendations:
        - Suggest potential improvements
        - Recommend alternative pieces
        - Propose complementary accessories

        4. 🎯 Styling Tips:
        - How to adapt this look for different occasions
        - Seasonal adaptations
        - Body type considerations

        5. 🔄 Trend Context:
        - Current fashion trends this follows
        - How to make it more contemporary
        - Timeless elements to keep

        Format your response with bullet points and be specific in your recommendations."""

        # Generate response using vision model
        response = vision_model.generate_content([
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(img_byte_arr).decode('utf-8')
            }
        ])
        
        # Format the response
        formatted_response = response.text
        # Ensure proper spacing and formatting
        lines = formatted_response.split('\n')
        formatted_lines = []
        for line in lines:
            line = line.strip()
            if line:
                # Add proper spacing after bullet points
                if line.startswith('•'):
                    line = '• ' + line[1:].strip()
                formatted_lines.append(line)
        formatted_response = '\n\n'.join(formatted_lines)
        formatted_response = formatted_response.strip()

        # Save bot's image analysis response
        bot_chat = ChatHistory(
            user_id=current_user.id,
            role='bot',
            content=formatted_response
        )
        db.session.add(bot_chat)
        db.session.commit()

        return jsonify({
            'success': True,
            'response': formatted_response
        })

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
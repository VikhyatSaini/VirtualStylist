# Virtual Stylist

An AI-powered virtual stylist application that provides personalized fashion recommendations using the Gemini 1.5 Pro API.

## Features

- Personalized fashion recommendations
- Style suggestions based on user input
- Modern and responsive UI
- Real-time AI-powered responses

## Prerequisites

- Python 3.8 or higher
- Gemini API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd virtual-stylist
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Add your Gemini API key to the `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Enter your style preferences, occasion, or what you're looking for in the text area
2. Click "Get Fashion Recommendations"
3. Wait for the AI to generate personalized recommendations
4. Review your fashion suggestions

## Technologies Used

- Flask (Python web framework)
- Gemini 1.5 Pro API
- Tailwind CSS
- JavaScript
- HTML5

## License

MIT 
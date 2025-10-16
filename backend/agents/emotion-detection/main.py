from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import logging
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add utils to path
sys.path.append(str(Path(__file__).parent))
from utils.face_tracker import AdvancedFaceTracker

# Load environment variables from backend root
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Emotion labels for FER-2013 dataset
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Initialize face tracker
face_tracker = AdvancedFaceTracker()

# TODO: Load your trained FER-2013 model here
# model = load_model('path/to/your/fer2013_model.h5')

@app.route('/')
def home():
    return jsonify({
        "service": "Emotion Detection API",
        "version": "1.0.0",
        "status": "running",
        "model": "FER-2013 (to be loaded)"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": False  # Will be True when model is loaded
    })

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_emotion():
    """Analyze facial emotion from image"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Get image from request (base64 encoded)
        image_data = data['image']
        
        # Decode base64 image
        try:
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return jsonify({'error': 'Failed to decode image'}), 400
                
        except Exception as e:
            logger.error(f"Image decoding error: {str(e)}")
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            logger.warning("No face detected in image")
            # Return neutral values when no face detected
            return jsonify({
                'emotion': 'Neutral',
                'confidence': 0.5,
                'metrics': {
                    'confident': 0.5,
                    'nervous': 0.3,
                    'stressed': 0.2,
                    'engaged': 0.6,
                    'neutral': 0.7
                },
                'face_detected': False
            })
        
        # Advanced face tracking
        tracking_data = face_tracker.analyze_frame(img)
        
        # Get largest face
        x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
        face = gray[y:y+h, x:x+w]
        
        # Resize to 48x48 for FER-2013 model
        face_resized = cv2.resize(face, (48, 48))
        face_normalized = face_resized / 255.0
        
        # TODO: Use your trained model for prediction
        # face_input = face_normalized.reshape(1, 48, 48, 1)
        # predictions = model.predict(face_input)[0]
        
        # For now, simulate predictions based on image statistics
        # This is a placeholder until you load your actual model
        mean_intensity = np.mean(face_normalized)
        std_intensity = np.std(face_normalized)
        
        # Generate mock predictions based on face characteristics
        # In production, replace this with actual model predictions
        predictions = np.array([
            0.05,  # Angry
            0.02,  # Disgust
            0.10,  # Fear (nervous)
            0.35,  # Happy (confident)
            0.08,  # Sad (stressed)
            0.15,  # Surprise (engaged)
            0.25   # Neutral
        ])
        
        # Add some randomness to simulate real predictions
        predictions += np.random.uniform(-0.05, 0.05, 7)
        predictions = np.clip(predictions, 0, 1)
        predictions /= predictions.sum()  # Normalize to sum to 1
        
        emotion_idx = np.argmax(predictions)
        emotion = emotion_labels[emotion_idx]
        confidence = float(predictions[emotion_idx])
        
        # Combine emotion data with tracking data
        result = {
            'emotion': emotion,
            'confidence': confidence,
            'metrics': {
                'confident': float(predictions[3]),  # Happy
                'nervous': float(predictions[2]),    # Fear
                'stressed': float(predictions[4]),   # Sad
                'engaged': float(predictions[5]),    # Surprise
                'neutral': float(predictions[6])     # Neutral
            },
            'face_detected': True,
            'all_emotions': {
                emotion_labels[i]: float(predictions[i]) 
                for i in range(len(emotion_labels))
            },
            'tracking': tracking_data if tracking_data else {
                'blink_count': 0,
                'head_pose': {'pitch': 0, 'yaw': 0, 'roll': 0, 'looking_at_camera': True},
                'gaze': {'horizontal': 'center', 'vertical': 'center'},
                'looking_at_camera': True,
                'face_detected': True
            }
        }
        
        logger.info(f"Analyzed emotion: {emotion} (confidence: {confidence:.2f})")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in emotion analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Emotion Detection Service on port 5000...")
    logger.warning("NOTE: Using mock predictions. Load your trained FER-2013 model for real predictions.")
    app.run(host='0.0.0.0', port=5000, debug=True)

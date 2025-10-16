import cv2
import numpy as np
from scipy.spatial import distance as dist

class AdvancedFaceTracker:
    """Advanced face tracking with blink detection, gaze estimation, and head pose"""
    
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.blink_counter = 0
        self.blink_threshold = 0.25
        self.frame_counter = 0
        
    def detect_blinks(self, eye_region):
        """Simple blink detection using eye region size changes"""
        if eye_region is None or eye_region.size == 0:
            return False
        
        # Check if eye region is significantly smaller (closed)
        eye_height = eye_region.shape[0]
        eye_width = eye_region.shape[1]
        
        if eye_height == 0 or eye_width == 0:
            return False
            
        aspect_ratio = eye_height / eye_width
        return aspect_ratio < self.blink_threshold
    
    def estimate_gaze_direction(self, face_region, eyes):
        """Calculate gaze position (left, right, center)"""
        if len(eyes) < 2:
            return {"horizontal": "center", "vertical": "center"}
        
        # Sort eyes by x position (left to right)
        eyes_sorted = sorted(eyes, key=lambda e: e[0])
        left_eye = eyes_sorted[0]
        right_eye = eyes_sorted[1]
        
        # Calculate center between eyes
        eye_center_x = (left_eye[0] + right_eye[0]) // 2
        face_center_x = face_region.shape[1] // 2
        
        dx = eye_center_x - face_center_x
        
        if abs(dx) > 20:
            horizontal = "right" if dx > 0 else "left"
        else:
            horizontal = "center"
            
        return {"horizontal": horizontal, "vertical": "center"}
    
    def estimate_head_pose(self, face_rect, frame_shape):
        """Estimate head pose angles (pitch, yaw, roll)"""
        x, y, w, h = face_rect
        frame_height, frame_width = frame_shape[:2]
        
        # Calculate face center position relative to frame center
        face_center_x = x + w // 2
        face_center_y = y + h // 2
        frame_center_x = frame_width // 2
        frame_center_y = frame_height // 2
        
        # Calculate yaw (horizontal rotation)
        dx = face_center_x - frame_center_x
        yaw = (dx / frame_width) * 60  # Scale to degrees
        
        # Calculate pitch (vertical rotation)
        dy = face_center_y - frame_center_y
        pitch = (dy / frame_height) * 40
        
        # Looking at camera if face is relatively centered
        looking_at_camera = abs(yaw) < 15 and abs(pitch) < 15
        
        return {
            "pitch": round(pitch, 1),
            "yaw": round(yaw, 1),
            "roll": 0,  # Simplified - roll detection requires more advanced methods
            "looking_at_camera": looking_at_camera
        }
    
    def analyze_frame(self, frame):
        """Complete frame analysis"""
        if frame is None or frame.size == 0:
            return None
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None
        
        # Get largest face
        face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = face
        face_region = gray[y:y+h, x:x+w]
        
        # Detect eyes
        eyes = self.eye_cascade.detectMultiScale(face_region, 1.1, 4)
        
        # Blink detection
        if len(eyes) >= 2:
            # Check both eyes for blinks
            blink_detected = False
            for (ex, ey, ew, eh) in eyes[:2]:
                eye_roi = face_region[ey:ey+eh, ex:ex+ew]
                if self.detect_blinks(eye_roi):
                    blink_detected = True
                    break
            
            if blink_detected:
                self.blink_counter += 1
        
        # Gaze direction
        gaze = self.estimate_gaze_direction(face_region, eyes)
        
        # Head pose
        head_pose = self.estimate_head_pose(face, frame.shape)
        
        self.frame_counter += 1
        
        return {
            "blink_count": self.blink_counter,
            "head_pose": head_pose,
            "gaze": gaze,
            "looking_at_camera": head_pose["looking_at_camera"],
            "face_detected": True,
            "frame_count": self.frame_counter
        }
    
    def reset_counters(self):
        """Reset tracking counters"""
        self.blink_counter = 0
        self.frame_counter = 0

"""ML-powered fit recommendation engine."""

import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
from pathlib import Path

from app.models.measurement import FitPreference


class FitRecommendationEngine:
    """AI-powered fit recommendation system."""
    
    def __init__(self, model_dir: str = "app/ml/models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.size_predictor: Optional[RandomForestClassifier] = None
        self.anomaly_detector: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained models if they exist."""
        try:
            size_model_path = self.model_dir / "size_predictor.joblib"
            anomaly_model_path = self.model_dir / "anomaly_detector.joblib"
            scaler_path = self.model_dir / "scaler.joblib"
            
            if size_model_path.exists():
                self.size_predictor = joblib.load(size_model_path)
            
            if anomaly_model_path.exists():
                self.anomaly_detector = joblib.load(anomaly_model_path)
            
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
                
        except Exception as e:
            print(f"Warning: Could not load models: {e}")
    
    def _save_models(self):
        """Save trained models."""
        if self.size_predictor:
            joblib.dump(self.size_predictor, self.model_dir / "size_predictor.joblib")
        
        if self.anomaly_detector:
            joblib.dump(self.anomaly_detector, self.model_dir / "anomaly_detector.joblib")
        
        if self.scaler:
            joblib.dump(self.scaler, self.model_dir / "scaler.joblib")
    
    def extract_features(self, measurements: Dict[str, float]) -> np.ndarray:
        """Extract feature vector from measurements."""
        # Key measurements for fit prediction
        features = [
            measurements.get('chest', 0),
            measurements.get('waist', 0),
            measurements.get('hip', 0),
            measurements.get('shoulder', 0),
            measurements.get('arm_length', 0),
            measurements.get('inseam', 0),
            measurements.get('neck', 0),
            measurements.get('sleeve_length', 0),
        ]
        return np.array(features).reshape(1, -1)
    
    def predict_size(self, measurements: Dict[str, float]) -> Tuple[str, float]:
        """
        Predict clothing size based on measurements.
        
        Returns:
            Tuple of (predicted_size, confidence_score)
        """
        if not self.size_predictor or not self.scaler:
            # Fallback to rule-based prediction
            return self._rule_based_size_prediction(measurements)
        
        features = self.extract_features(measurements)
        scaled_features = self.scaler.transform(features)
        
        # Get prediction and probability
        prediction = self.size_predictor.predict(scaled_features)[0]
        probabilities = self.size_predictor.predict_proba(scaled_features)[0]
        confidence = float(np.max(probabilities))
        
        return prediction, confidence
    
    def _rule_based_size_prediction(self, measurements: Dict[str, float]) -> Tuple[str, float]:
        """Fallback rule-based size prediction."""
        chest = measurements.get('chest', 0)
        waist = measurements.get('waist', 0)
        
        # Simple rule-based logic
        if chest < 90:
            size = "S"
        elif chest < 100:
            size = "M"
        elif chest < 110:
            size = "L"
        elif chest < 120:
            size = "XL"
        else:
            size = "XXL"
        
        # Lower confidence for rule-based
        confidence = 0.6
        
        return size, confidence
    
    def detect_anomalies(self, measurements: Dict[str, float]) -> Tuple[bool, float, List[str]]:
        """
        Detect anomalous measurements.
        
        Returns:
            Tuple of (is_anomaly, anomaly_score, suspicious_fields)
        """
        features = self.extract_features(measurements)
        
        if self.anomaly_detector and self.scaler:
            scaled_features = self.scaler.transform(features)
            prediction = self.anomaly_detector.predict(scaled_features)[0]
            score = self.anomaly_detector.score_samples(scaled_features)[0]
            
            is_anomaly = prediction == -1
            anomaly_score = float(-score)  # Convert to positive score
        else:
            # Fallback to rule-based anomaly detection
            is_anomaly, anomaly_score = self._rule_based_anomaly_detection(measurements)
        
        # Identify suspicious fields
        suspicious_fields = self._identify_suspicious_fields(measurements)
        
        return is_anomaly, anomaly_score, suspicious_fields
    
    def _rule_based_anomaly_detection(self, measurements: Dict[str, float]) -> Tuple[bool, float]:
        """Fallback rule-based anomaly detection."""
        anomalies = []
        
        # Check for unrealistic values
        chest = measurements.get('chest', 0)
        waist = measurements.get('waist', 0)
        hip = measurements.get('hip', 0)
        
        # Chest should be larger than waist (usually)
        if waist > chest + 10:
            anomalies.append("waist_larger_than_chest")
        
        # Hip should be similar to or larger than waist
        if waist > hip + 15:
            anomalies.append("waist_much_larger_than_hip")
        
        # Check for extreme values
        if chest > 150 or chest < 60:
            anomalies.append("extreme_chest")
        
        if waist > 150 or waist < 50:
            anomalies.append("extreme_waist")
        
        is_anomaly = len(anomalies) > 0
        anomaly_score = len(anomalies) * 0.3  # Simple scoring
        
        return is_anomaly, min(anomaly_score, 1.0)
    
    def _identify_suspicious_fields(self, measurements: Dict[str, float]) -> List[str]:
        """Identify which measurement fields look suspicious."""
        suspicious = []
        
        chest = measurements.get('chest', 0)
        waist = measurements.get('waist', 0)
        hip = measurements.get('hip', 0)
        shoulder = measurements.get('shoulder', 0)
        
        if waist > chest + 10:
            suspicious.append("waist")
        
        if chest > 150 or chest < 60:
            suspicious.append("chest")
        
        if waist > 150 or waist < 50:
            suspicious.append("waist")
        
        if shoulder > 60 or shoulder < 30:
            suspicious.append("shoulder")
        
        return suspicious
    
    def suggest_alterations(
        self, 
        measurements: Dict[str, float],
        fit_preference: FitPreference = FitPreference.REGULAR
    ) -> List[Dict[str, str]]:
        """
        Suggest alterations based on measurements and fit preference.
        
        Returns:
            List of alteration suggestions with descriptions
        """
        suggestions = []
        
        chest = measurements.get('chest', 0)
        waist = measurements.get('waist', 0)
        hip = measurements.get('hip', 0)
        
        # Chest-waist ratio analysis
        if chest > 0 and waist > 0:
            ratio = chest / waist
            
            if ratio > 1.3:
                suggestions.append({
                    "area": "torso",
                    "type": "tapering",
                    "description": "Consider tapering at waist for better fit",
                    "priority": "medium"
                })
        
        # Fit preference adjustments
        if fit_preference == FitPreference.SLIM:
            suggestions.append({
                "area": "overall",
                "type": "slimming",
                "description": "Reduce measurements by 2-3cm for slim fit",
                "priority": "high"
            })
        elif fit_preference == FitPreference.LOOSE:
            suggestions.append({
                "area": "overall",
                "type": "loosening",
                "description": "Add 3-5cm to measurements for comfortable loose fit",
                "priority": "high"
            })
        
        # Shoulder adjustments
        shoulder = measurements.get('shoulder', 0)
        if shoulder > 0:
            if shoulder < 40:
                suggestions.append({
                    "area": "shoulder",
                    "type": "padding",
                    "description": "Consider shoulder padding for better structure",
                    "priority": "low"
                })
        
        return suggestions
    
    def calculate_fit_confidence(
        self,
        measurements: Dict[str, float],
        previous_orders: List[Dict] = None
    ) -> float:
        """
        Calculate confidence score for fit recommendation.
        
        Args:
            measurements: Current measurements
            previous_orders: List of previous order data
        
        Returns:
            Confidence score between 0 and 1
        """
        confidence_factors = []
        
        # Factor 1: Measurement completeness
        required_fields = ['chest', 'waist', 'hip', 'shoulder', 'arm_length']
        complete_fields = sum(1 for field in required_fields if measurements.get(field, 0) > 0)
        completeness_score = complete_fields / len(required_fields)
        confidence_factors.append(completeness_score * 0.3)
        
        # Factor 2: Anomaly check
        is_anomaly, anomaly_score, _ = self.detect_anomalies(measurements)
        anomaly_confidence = 1.0 - anomaly_score if not is_anomaly else 0.5
        confidence_factors.append(anomaly_confidence * 0.3)
        
        # Factor 3: Historical data
        if previous_orders and len(previous_orders) > 0:
            history_confidence = min(len(previous_orders) * 0.2, 1.0)
            confidence_factors.append(history_confidence * 0.4)
        else:
            confidence_factors.append(0.2)  # Low confidence without history
        
        total_confidence = sum(confidence_factors)
        return round(total_confidence, 2)
    
    def train_size_predictor(self, training_data: List[Tuple[Dict, str]]):
        """
        Train the size prediction model.
        
        Args:
            training_data: List of (measurements_dict, size_label) tuples
        """
        if len(training_data) < 10:
            print("Warning: Insufficient training data (need at least 10 samples)")
            return
        
        # Extract features and labels
        X = np.array([self.extract_features(m).flatten() for m, _ in training_data])
        y = np.array([size for _, size in training_data])
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train classifier
        self.size_predictor = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.size_predictor.fit(X_scaled, y)
        
        # Train anomaly detector
        self.anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.anomaly_detector.fit(X_scaled)
        
        # Save models
        self._save_models()
        
        print(f"✅ Models trained on {len(training_data)} samples")


# Global instance
fit_engine = FitRecommendationEngine()

# ML Models Directory

This directory stores trained machine learning models:

- `size_predictor.joblib` - Random Forest classifier for size prediction
- `anomaly_detector.joblib` - Isolation Forest for measurement anomaly detection
- `scaler.joblib` - StandardScaler for feature normalization

Models are automatically loaded on startup if they exist.
To train new models, use the training endpoints or scripts.

"""ML API endpoints for fit recommendations."""

from typing import Annotated, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.measurement import FitPreference
from app.ml.fit_recommendation import fit_engine

router = APIRouter()


class MeasurementInput(BaseModel):
    """Input schema for measurements."""
    chest: float = Field(..., ge=0, le=200)
    waist: float = Field(..., ge=0, le=200)
    hip: float = Field(..., ge=0, le=200)
    shoulder: float = Field(..., ge=0, le=100)
    arm_length: float = Field(..., ge=0, le=150)
    sleeve_length: float = Field(0, ge=0, le=150)
    neck: float = Field(0, ge=0, le=100)
    inseam: float = Field(0, ge=0, le=150)


class SizePredictionResponse(BaseModel):
    """Response schema for size prediction."""
    predicted_size: str
    confidence: float
    fit_preference: str = "regular"


class AnomalyDetectionResponse(BaseModel):
    """Response schema for anomaly detection."""
    is_anomaly: bool
    anomaly_score: float
    suspicious_fields: List[str]
    message: str


class AlterationSuggestion(BaseModel):
    """Schema for alteration suggestion."""
    area: str
    type: str
    description: str
    priority: str


class FitRecommendationResponse(BaseModel):
    """Complete fit recommendation response."""
    predicted_size: str
    size_confidence: float
    is_anomaly: bool
    anomaly_score: float
    suspicious_fields: List[str]
    alterations: List[AlterationSuggestion]
    fit_confidence: float
    recommendations: List[str]


@router.post("/predict-size", response_model=SizePredictionResponse)
async def predict_size(
    measurements: MeasurementInput,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Predict clothing size based on measurements.
    
    Uses ML model if available, falls back to rule-based prediction.
    """
    measurements_dict = measurements.model_dump()
    
    predicted_size, confidence = fit_engine.predict_size(measurements_dict)
    
    return {
        "predicted_size": predicted_size,
        "confidence": confidence,
        "fit_preference": "regular"
    }


@router.post("/detect-anomalies", response_model=AnomalyDetectionResponse)
async def detect_anomalies(
    measurements: MeasurementInput,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Detect anomalous or suspicious measurements.
    
    Helps identify data entry errors or unusual body proportions.
    """
    measurements_dict = measurements.model_dump()
    
    is_anomaly, anomaly_score, suspicious_fields = fit_engine.detect_anomalies(
        measurements_dict
    )
    
    if is_anomaly:
        message = f"⚠️ Unusual measurements detected in: {', '.join(suspicious_fields)}"
    else:
        message = "✅ Measurements look normal"
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "suspicious_fields": suspicious_fields,
        "message": message
    }


@router.post("/suggest-alterations", response_model=List[AlterationSuggestion])
async def suggest_alterations(
    measurements: MeasurementInput,
    current_user: Annotated[User, Depends(get_current_user)],
    fit_preference: FitPreference = FitPreference.REGULAR,
):
    """
    Get alteration suggestions based on measurements and fit preference.
    """
    measurements_dict = measurements.model_dump()
    
    suggestions = fit_engine.suggest_alterations(measurements_dict, fit_preference)
    
    return suggestions


@router.post("/fit-recommendation", response_model=FitRecommendationResponse)
async def get_fit_recommendation(
    measurements: MeasurementInput,
    current_user: Annotated[User, Depends(get_current_user)],
    fit_preference: FitPreference = FitPreference.REGULAR,
):
    """
    Get complete fit recommendation including size, anomalies, and alterations.
    
    This is the main endpoint that combines all ML features.
    """
    measurements_dict = measurements.model_dump()
    
    # Size prediction
    predicted_size, size_confidence = fit_engine.predict_size(measurements_dict)
    
    # Anomaly detection
    is_anomaly, anomaly_score, suspicious_fields = fit_engine.detect_anomalies(
        measurements_dict
    )
    
    # Alteration suggestions
    alterations = fit_engine.suggest_alterations(measurements_dict, fit_preference)
    
    # Overall fit confidence
    fit_confidence = fit_engine.calculate_fit_confidence(measurements_dict)
    
    # Generate recommendations
    recommendations = []
    
    if is_anomaly:
        recommendations.append(
            f"⚠️ Please double-check measurements for: {', '.join(suspicious_fields)}"
        )
    
    if size_confidence < 0.7:
        recommendations.append(
            "💡 Consider getting professionally measured for better accuracy"
        )
    
    if fit_preference == FitPreference.SLIM:
        recommendations.append(
            "👔 Slim fit selected - garment will be tailored close to body"
        )
    elif fit_preference == FitPreference.LOOSE:
        recommendations.append(
            "👕 Loose fit selected - garment will have extra room for comfort"
        )
    
    if len(alterations) > 0:
        recommendations.append(
            f"✂️ {len(alterations)} alteration(s) suggested for optimal fit"
        )
    
    return {
        "predicted_size": predicted_size,
        "size_confidence": size_confidence,
        "is_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "suspicious_fields": suspicious_fields,
        "alterations": alterations,
        "fit_confidence": fit_confidence,
        "recommendations": recommendations
    }


@router.get("/health")
async def ml_health_check():
    """Check ML service health and model status."""
    return {
        "status": "healthy",
        "size_predictor_loaded": fit_engine.size_predictor is not None,
        "anomaly_detector_loaded": fit_engine.anomaly_detector is not None,
        "scaler_loaded": fit_engine.scaler is not None,
        "mode": "ml" if fit_engine.size_predictor else "rule-based"
    }

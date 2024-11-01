from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from multi_regression import load_regression_model, regression_date_predict
from isolation_forest import train_isolation_forest, detect_anomaly
from randomforest_classifier import load_classification_model, classify_weather
from minmax_regression import load_minmax_model, minmax_predict
import os

# Creating the FastAPI App
app = FastAPI()

# Define allowed origins
origins = [
    "http://localhost:3000",  # Frontend origin
]

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allows requests from specified origins
    allow_credentials=True,
    allow_methods=["*"],             # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allows all headers
)

# Function to train isolation forest model for each city
def train_isolation():
    for city_code in ['MEL', 'SYD', 'PER', 'BNE', 'DAR', 'HOB']:
        model_path = f'models/{city_code}_isolation_forest_model.joblib'
        scaler_path = f'models/{city_code}_scaler.joblib'
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):       # Check if training has been done before
            train_isolation_forest(city_code)
            print(f"Completed {city_code} Isolation Model Training")
        else:
            print(f"{city_code} Isolation Model and Scaler already trained.")

# Helper function to get the season
def get_season(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d')
    month = date.month
    day = date.day
    if (month == 12 and day >= 1) or (month in [1, 2]):
        return 'Summer'
    elif (month == 3 and day >= 1) or (month in [4, 5]):
        return 'Autumn'
    elif (month == 6 and day >= 1) or (month in [7, 8]):
        return 'Winter'
    elif (month == 9 and day >= 1) or (month in [10, 11]):
        return 'Spring'

# Load models at startup
print("Training multi-regression model")
multiregression_model = load_regression_model()
print("Multi-regression model training complete")
print("Training isolation forest models")
train_isolation()
print("Training classification model")
clf, label_encoder, accuracy = load_classification_model()
print("Classification model training completed")
print("Training Minimum and Maximum Temperature regression model")
minmax_model = load_minmax_model()
print("Minimum and Maximum Temperature regression model training completed")

# Request models
class MinMaxRequest(BaseModel):
    city_code: str
    date: str
    rainfall: float
    humidity: float
    pressure: float
    wind_gust_speed: float
    uv_index: float

class AnomalyRequest(BaseModel):
    city_code: str
    date: str
    mintemp: float
    maxtemp: float
    rainfall: float
    humidity: float
    pressure: float
    wind_gust_speed: float
    uv_index: float

class ClassificationRequest(BaseModel):
    city_code: str
    date: str

# Endpoints
@app.post("/predict_minmax")
async def predict_minmax(req: MinMaxRequest):
    try:
        target_date = datetime.strptime(req.date, '%Y-%m-%d')
        dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]
        predictions = {}

        for day in dates_range:
            day_str = day.strftime('%Y-%m-%d')
            prediction = minmax_predict(day_str, req.city_code, req.rainfall, req.humidity, req.pressure, req.wind_gust_speed, req.uv_index, minmax_model)
            predictions[day_str] = prediction

        return {"status": "success", "data": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_anomaly")
async def predict_anomaly(req: AnomalyRequest):
    try:
        target_date = datetime.strptime(req.date, '%Y-%m-%d')
        dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]
        anomalies = {}

        for day in dates_range:
            day_str = day.strftime('%Y-%m-%d')
            weather_data = {
                'Date': day_str,
                'MinTemp': req.mintemp,
                'MaxTemp': req.maxtemp,
                'Rainfall': req.rainfall,
                'WindGustSpeed': req.wind_gust_speed,
                'Humidity': req.humidity,
                'Pressure': req.pressure,
                'UVIEF': req.uv_index
            }
            anomaly = detect_anomaly(weather_data, req.city_code)
            anomalies[day_str] = {"anomaly": "Yes" if anomaly['anomaly_label'] < 0 else "No", "score": anomaly['anomaly_score']}
        
        return {"status": "success", "data": anomalies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classification_predict")
async def classification_predict(req: ClassificationRequest):
    try:
        target_date = datetime.strptime(req.date, '%Y-%m-%d')
        dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]
        classifications = {}

        for day in dates_range:
            day_str = day.strftime('%Y-%m-%d')
            prediction = regression_date_predict(day_str, req.city_code, multiregression_model)
            anomaly = detect_anomaly(prediction, req.city_code)
            season = get_season(day_str)
            classification = classify_weather(
                clf, label_encoder, accuracy,
                min_temp=prediction['MinTemp'],
                max_temp=prediction['MaxTemp'],
                humidity=prediction['Humidity'],
                windspeed=prediction['WindGustSpeed'],
                uv=prediction['UVIEF'],
                season=season,
                anomaly_score=anomaly['anomaly_score']
            )
            classifications[day_str] = {
                "day_forecast": classification['day_forecast'],
                "day_reliability": classification['day_reliability'],
                "night_forecast": classification['night_forecast'],
                "night_reliability": classification['night_reliability']
            }

        return {"status": "success", "data": classifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
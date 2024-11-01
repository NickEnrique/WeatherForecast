import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

def train_isolation_forest(city_code):
    # Load data and filter by city code
    df = pd.read_csv('dataset/combined_weather_data.csv')
    df = df[df['CityCode'] == city_code].copy()

    # Convert Date column to datetime and extract day of the year
    df['Date'] = pd.to_datetime(df['Date'])
    df['DayOfYear'] = df['Date'].dt.dayofyear

    # Interpolate numeric columns only and handle object columns if needed
    numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
    df[numeric_columns] = df[numeric_columns].interpolate(method='linear')
    
    # Add 'DayOfYear' to the list of numeric columns for scaling
    numeric_columns = list(numeric_columns) + ['DayOfYear']
    
    # Fill any remaining NaN values with median (for numeric columns only)
    df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
    
    # Standardize the data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[numeric_columns])

    # Prepare and train the isolation forest model using the numeric features
    isolation_model = IsolationForest(contamination=0.05, random_state=42)
    isolation_model.fit(scaled_data)
    
    # Save the trained model and scaler using joblib
    joblib.dump(isolation_model, f'models/{city_code}_isolation_forest_model.joblib')
    joblib.dump(scaler, f'models/{city_code}_scaler.joblib')

def detect_anomaly(weather_data, city_code):
    try:
        model = joblib.load(f'models/{city_code}_isolation_forest_model.joblib')
        scaler = joblib.load(f'models/{city_code}_scaler.joblib')
    except FileNotFoundError:
        print(f"Model or scaler for {city_code} not found.")
        return None

    # Add DayOfYear to the input features
    features = ['MinTemp', 'MaxTemp', 'Rainfall', 'WindGustSpeed', 'Humidity', 'Pressure', 'UVIEF', 'DayOfYear']
    
    # Convert the date to day of the year
    weather_data['DayOfYear'] = pd.to_datetime(weather_data['Date']).dayofyear
    weather_data.pop('Date')  # Remove the date column after extracting 'DayOfYear'

    # Create a DataFrame with the features and scale it
    new_input_df = pd.DataFrame([weather_data], columns=features)
    new_input_scaled = scaler.transform(new_input_df)

    # Calculate anomaly score and label
    anomaly_score = model.decision_function(new_input_scaled)[0]
    anomaly_label = model.predict(new_input_scaled)[0]

    return {
        'anomaly_label': anomaly_label,
        'anomaly_score': anomaly_score
    }
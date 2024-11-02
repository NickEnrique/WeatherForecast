import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# MultiOutput Regression Model Training Function
def train_regression_model():
    # Load data from a CSV file
    df = pd.read_csv('dataset/combined_weather_data.csv')
    df = df.dropna(subset=['MinTemp', 'MaxTemp', 'Rainfall', 'WindGustSpeed', 'Humidity', 'Pressure', 'UVIEF'])

    # Convert Date column to datetime
    df['Date'] = pd.to_datetime(df['Date'])

    # Extract date-related features
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    df['DayOfYear'] = df['Date'].dt.dayofyear

    # Remove original Date column
    df.drop('Date', axis=1, inplace=True)

    # Convert CityCode to one-hot encoded columns
    df = pd.get_dummies(df, columns=['CityCode'])

    # Define input features and target variables
    X = df.drop(columns=['MinTemp', 'MaxTemp', 'Rainfall', 'WindGustSpeed', 'Humidity', 'Pressure', 'UVIEF'])
    y = df[['MinTemp', 'MaxTemp', 'Rainfall', 'WindGustSpeed', 'Humidity', 'Pressure', 'UVIEF']]

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and fit the model
    regr = MultiOutputRegressor(RandomForestRegressor(n_estimators=325, random_state=42))
    regr.fit(X_train, y_train)

    joblib.dump(regr, 'models/multi_regression_model.joblib')
    return regr

# Load existing model if exists, else train the model
def load_regression_model():
    return joblib.load('models/multi_regression_model.joblib') if os.path.exists('models/multi_regression_model.joblib') else train_regression_model()

# MultiOutput Regression Model Predictor Function
def regression_date_predict(date, city_code, model):
    # Extracting date-related features from the input
    date = pd.to_datetime(date)
    year, month, day, day_of_year = date.year, date.month, date.day, date.dayofyear

    # Create a dictionary with input data
    input_data = {
        'Year': [year], 
        'Month': [month], 
        'Day': [day], 
        'DayOfYear': [day_of_year]
    }

    # One-hot encode the city code
    feature_names = model.feature_names_in_
    for code in feature_names:
        input_data[code] = [1 if code.endswith(city_code) else 0]

    # Convert to DataFrame and reindex to match the order of features in the model
    input_data_df = pd.DataFrame(input_data)
    input_data_df = input_data_df.reindex(columns=feature_names, fill_value=0)

    # Make prediction using the trained model
    prediction = model.predict(input_data_df)

    # Return the prediction
    return {
        'Date': date,
        'MinTemp': prediction[0][0],
        'MaxTemp': prediction[0][1],
        'Rainfall': prediction[0][2],
        'WindGustSpeed': prediction[0][3],
        'Humidity': prediction[0][4],
        'Pressure': prediction[0][5],
        'UVIEF': prediction[0][6]
    }

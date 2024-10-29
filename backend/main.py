from multi_regression import train_regression_model, load_regression_model, regression_date_predict
from isolation_forest import train_isolation_forest, detect_anomaly
from randomforest_classifier import train_classification_model, load_classification_model, classify_weather
from minmax_regression import train_minmax_model, load_minmax_model, minmax_predict
from datetime import datetime, timedelta
import os

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

def train_isolation():
    for city_code in ['MEL', 'SYD', 'PER', 'BNE', 'DAR', 'HOB']:
        model_path = f'models/{city_code}_isolation_forest_model.joblib'
        scaler_path = f'models/{city_code}_scaler.joblib'
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            train_isolation_forest(city_code)
            print(f"Completed {city_code} Isolation Model Training")
        else:
            print(f"{city_code} Isolation Model and Scaler already trained.")
   
def choose_city():
    cities = ['melbourne', 'sydney', 'perth', 'brisbane', 'darwin', 'hobart']
    city = input("Select city (melbourne, sydney, perth, brisbane, darwin, hobart): ").lower()
    if city not in cities:
        print("Invalid city selected.")
        return None

    city_codes = {
        'melbourne': 'MEL', 'sydney': 'SYD', 'perth': 'PER',
        'brisbane': 'BNE', 'darwin': 'DAR', 'hobart': 'HOB'
    }
    return city_codes[city]

def predict_minmax(city_code, date, model, rainfall, humidity, pressure, wind_gust_speed, uv_index):
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\n--- Min-Max Temperature Predictions for Trend Dates ---")
    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')
        prediction = minmax_predict(day_str, city_code, rainfall, humidity, pressure, wind_gust_speed, uv_index, model)

        if day == target_date:
            print(f"\n--- Full Details for {day_str} ---")
            print(f"Predicted minimum temperature: {prediction['MinTemp']}°C")
            print(f"Predicted maximum temperature: {prediction['MaxTemp']}°C")
        else:
            print(f"\n{day_str} - Min Temp: {prediction['MinTemp']}°C, Max Temp: {prediction['MaxTemp']}°C")

def predict_anomaly(city_code, date, mintemp, maxtemp, rainfall, humidity, pressure, wind_gust_speed, uv_index):
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\n--- Anomaly Detection Results for Trend Dates ---")
    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')
        weather_data = {
            'Date': day_str,
            'MinTemp': mintemp,
            'MaxTemp': maxtemp,
            'Rainfall': rainfall,
            'WindGustSpeed': wind_gust_speed,
            'Humidity': humidity,
            'Pressure': pressure,
            'UVIEF': uv_index
        }
        anomaly = detect_anomaly(weather_data, city_code)
        is_anomalous = "Yes" if anomaly['anomaly_label'] < 0 else "No"

        if day == target_date:
            print(f"\n--- Full Anomaly Details for {day_str} ---")
            print(f"Anomaly: {is_anomalous}")
            print(f"Anomaly Score: {anomaly['anomaly_score']}")
        else:
            print(f"\n{day_str} - Anomaly: {is_anomalous}, Score: {anomaly['anomaly_score']}")

def classification_predict(city_code, date, model, clf, label_encoder, accuracy):
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\nFetching weather classification predictions...")

    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')
        prediction = regression_date_predict(day_str, city_code, model)
        anomaly = detect_anomaly(prediction, city_code)
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

        if day == target_date:
            print(f"\n--- Full Weather Details for {day_str} ---")
            print(f"Min Temp: {prediction['MinTemp']}°C")
            print(f"Max Temp: {prediction['MaxTemp']}°C")
            print(f"Humidity: {prediction['Humidity']}%")
            print(f"Wind Speed: {prediction['WindGustSpeed']} km/h")
            print(f"UV Index: {prediction['UVIEF']}")
            print(f"Day Forecast: {classification['day_forecast']} with reliability {classification['day_reliability']}%")
            print(f"Night Forecast: {classification['night_forecast']} with reliability {classification['night_reliability']}%")
        else:
            print(f"\n--- {day_str} ---")
            print(f"Day Forecast: {classification['day_forecast']}")
            print(f"Night Forecast: {classification['night_forecast']}")

def main():
    print("Training multi-regression model...")
    multiregression_model = load_regression_model()

    print("Training isolation forest models...")
    train_isolation()
    
    print("Training classification model...")
    clf, label_encoder, accuracy = load_classification_model()
    
    print("Training Min-Max regression model...")
    minmax_model = load_minmax_model()

    again = True
    while again:
        user_choice = input("Choose a model to use:\n1. Multi-regression model for Min-Max Temperature\n2. Anomaly Detection\n3. Weather Classification Model\nYour input: ")

        if user_choice == "1":
            city_code = choose_city()
            if city_code is None:
                continue

            date = input("Enter a date (YYYY-MM-DD): ")
            rainfall = input("Enter rainfall percentage: ")
            humidity = input("Enter humidity percentage: ")
            pressure = input("Enter pressure value: ")
            wind_gust_speed = input("Enter windspeed value: ")
            uv_index = input("Enter UV index value: ")

            predict_minmax(city_code, date, minmax_model, rainfall, humidity, pressure, wind_gust_speed, uv_index)

        elif user_choice == "2":
            city_code = choose_city()
            if city_code is None:
                continue

            date = input("Enter a date (YYYY-MM-DD): ")
            mintemp = input("Enter minimum temperature: ")
            maxtemp = input("Enter maximum temperature: ")
            rainfall = input("Enter rainfall percentage: ")
            humidity = input("Enter humidity percentage: ")
            pressure = input("Enter pressure value: ")
            wind_gust_speed = input("Enter windspeed value: ")
            uv_index = input("Enter UV index value: ")

            predict_anomaly(city_code, date, mintemp, maxtemp, rainfall, humidity, pressure, wind_gust_speed, uv_index)

        elif user_choice == "3":
            city_code = choose_city()
            if city_code is None:
                continue

            date = input("Enter a date (YYYY-MM-DD): ")
            classification_predict(city_code, date, multiregression_model, clf, label_encoder, accuracy)

        choice = input("Do you want to use another model (Y/N)? ")
        if choice.upper() == "N":
            again = False

if __name__ == '__main__':
    main()

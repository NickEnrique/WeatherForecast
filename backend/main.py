from multi_regression import train_regression_model, load_regression_model, regression_date_predict
from isolation_forest import train_isolation_forest, detect_anomaly
from randomforest_classifier import train_classification_model, load_classification_model, classify_weather
from minmax_regression import train_minmax_model, load_minmax_model, minmax_predict
from datetime import datetime, timedelta
import os

# Supporting function to retrieve season from inputted date based on Australian season
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

# Function to train the isolation forest model for each city
def train_isolation():

    # Loop through each city code
    for city_code in ['MEL', 'SYD', 'PER', 'BNE', 'DAR', 'HOB']:
        model_path = f'models/{city_code}_isolation_forest_model.joblib'
        scaler_path = f'models/{city_code}_scaler.joblib'

        # Checking if model has been trained previously
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            # Training the model if not trained yet
            train_isolation_forest(city_code)
            print(f"Completed {city_code} Isolation Model Training")
        else:
            print(f"{city_code} Isolation Model and Scaler already trained.")

# Function to ask users to input a city and encode it to the city codes
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

# Function to use the min max temperature regression predictor
def predict_minmax(city_code, date, model, rainfall, humidity, pressure, wind_gust_speed, uv_index):

    # Setting a date range for previous and following 5 days from the inputted date
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\n--- Min-Max Temperature Predictions for Trend Dates ---")
    # Loop through each date in the date range
    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')

        # Using the minmax temperature model predictor
        prediction = minmax_predict(day_str, city_code, rainfall, humidity, pressure, wind_gust_speed, uv_index, model)
        
        # Printing the results
        if day == target_date:
            print(f"\n--- Full Details for {day_str} ---")
            print(f"Predicted minimum temperature: {prediction['MinTemp']}°C")
            print(f"Predicted maximum temperature: {prediction['MaxTemp']}°C")
        else:
            print(f"\n{day_str} - Min Temp: {prediction['MinTemp']}°C, Max Temp: {prediction['MaxTemp']}°C")

# Function to use the anomaly detection predictor
def predict_anomaly(city_code, date, mintemp, maxtemp, rainfall, humidity, pressure, wind_gust_speed, uv_index):
    # Setting a date range for previous and following 5 days from the inputted date
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\n--- Anomaly Detection Results for Trend Dates ---")
    # Loop through each date in the date range
    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')

        # Converting the inputs into a single list data
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

        # Using the anomaly detection predictor
        anomaly = detect_anomaly(weather_data, city_code)
        is_anomalous = "Yes" if anomaly['anomaly_label'] < 0 else "No"

        # Printing the results
        if day == target_date:
            print(f"\n--- Full Anomaly Details for {day_str} ---")
            print(f"Anomaly: {is_anomalous}")
            print(f"Anomaly Score: {anomaly['anomaly_score']}")
        else:
            print(f"\n{day_str} - Anomaly: {is_anomalous}, Score: {anomaly['anomaly_score']}")

def classification_predict(city_code, date, model, clf, label_encoder, accuracy):
    # Setting a date range for previous and following 5 days from the inputted date
    target_date = datetime.strptime(date, '%Y-%m-%d')
    dates_range = [target_date + timedelta(days=i) for i in range(-5, 6)]

    print("\nFetching weather classification predictions...")
    # Loop through each date in the date range
    for day in dates_range:
        day_str = day.strftime('%Y-%m-%d')

        # First using the multi-output regression model to get data for all variables based on date and city only
        prediction = regression_date_predict(day_str, city_code, model)

        # Using the regression output for input of the anomaly detection model
        anomaly = detect_anomaly(prediction, city_code)

        # Getting the season of the inputted date
        season = get_season(day_str)

        # Using output from both regression and anomaly detection model as inputs for the classifier model
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

        # Printing the results, if it is the inputted date, print the specific details
        if day == target_date:
            print(f"\n--- Full Weather Details for {day_str} ---")
            print(f"Min Temp: {prediction['MinTemp']}°C")
            print(f"Max Temp: {prediction['MaxTemp']}°C")
            print(f"Humidity: {prediction['Humidity']}%")
            print(f"Wind Speed: {prediction['WindGustSpeed']} km/h")
            print(f"UV Index: {prediction['UVIEF']}")
            print(f"Day Forecast: {classification['day_forecast']} with reliability {classification['day_reliability']}%")
            print(f"Night Forecast: {classification['night_forecast']} with reliability {classification['night_reliability']}%")
        else:       # If not the inputted date, just print the forecasted weather type
            print(f"\n--- {day_str} ---")
            print(f"Day Forecast: {classification['day_forecast']}")
            print(f"Night Forecast: {classification['night_forecast']}")

# Main execution code
def main():
    # Training all the models first one the code is executed
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
        # Asking user to choose which model to use
        user_choice = input("Choose a model to use:\n1. Multi-regression model for Min-Max Temperature\n2. Anomaly Detection\n3. Weather Classification Model\nYour input: ")

        # User chooses the MinMax Regression Model
        if user_choice == "1":
            city_code = choose_city()
            if city_code is None:
                continue
            
            # User inputs all the needed variables for the model predictor input
            date = input("Enter a date (YYYY-MM-DD): ")
            rainfall = input("Enter rainfall percentage: ")
            humidity = input("Enter humidity percentage: ")
            pressure = input("Enter pressure value: ")
            wind_gust_speed = input("Enter windspeed value: ")
            uv_index = input("Enter UV index value: ")

            # Predicting the MinMax Temperature
            predict_minmax(city_code, date, minmax_model, rainfall, humidity, pressure, wind_gust_speed, uv_index)

        # User chooses the Anomaly Detection Model
        elif user_choice == "2":
            city_code = choose_city()
            if city_code is None:
                continue
            
            # User inputs all the needed variables for the model predictor input
            date = input("Enter a date (YYYY-MM-DD): ")
            mintemp = input("Enter minimum temperature: ")
            maxtemp = input("Enter maximum temperature: ")
            rainfall = input("Enter rainfall percentage: ")
            humidity = input("Enter humidity percentage: ")
            pressure = input("Enter pressure value: ")
            wind_gust_speed = input("Enter windspeed value: ")
            uv_index = input("Enter UV index value: ")

            # Retrieving the Anomaly Detection Values
            predict_anomaly(city_code, date, mintemp, maxtemp, rainfall, humidity, pressure, wind_gust_speed, uv_index)

        # User chooses the Weather Classification Model
        elif user_choice == "3":
            city_code = choose_city()
            if city_code is None:
                continue
            
            # User inputs the date that is used for the classification model
            date = input("Enter a date (YYYY-MM-DD): ")

            # Getting the result of the Classified Weather
            classification_predict(city_code, date, multiregression_model, clf, label_encoder, accuracy)

        choice = input("Do you want to use another model (Y/N)? ")
        if choice.upper() == "N":
            again = False

if __name__ == '__main__':
    main()

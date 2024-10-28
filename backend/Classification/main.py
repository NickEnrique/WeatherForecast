import multi_regression
import isolation_forest
import randomforest_classifier
import humidity_predictor
import windgust_predictor
from datetime import datetime

# Convert date input (YYYY-MM-DD) into season (Summer, Autumn, Winter, Spring) based on Australia's Seasons.
def get_season(date_str):
   # Parse the input date string to a datetime object
    date = datetime.strptime(date_str, '%Y-%m-%d')
    month = date.month
    day = date.day
    
    # Define date ranges for each season in Australia
    if (month == 12 and day >= 1) or (month in [1, 2]):  # Summer
        return 'Summer'
    elif (month == 3 and day >= 1) or (month in [4, 5]):  # Autumn
        return 'Autumn'
    elif (month == 6 and day >= 1) or (month in [7, 8]):  # Winter
        return 'Winter'
    elif (month == 9 and day >= 1) or (month in [10, 11]):  # Spring
        return 'Spring'


# Main execution script
def main():
    cities = ['melbourne', 'sydney', 'perth', 'brisbane', 'darwin', 'hobart']

    # Get user input
    city = input("Select city (melbourne, sydney, perth, brisbane, darwin, hobart): ").lower()
    if city not in cities:
        print("Invalid city selected.")
        return

    date = input("Enter a date (YYYY-MM-DD): ")

    # Step 1: Regression Prediction
    regression_result = multi_regression.regression_date_predict(date, city)

    # Step 2: Humidity Prediction
    humidity_input = {
        'MinTemp': regression_result['MinTemp'],
        'MaxTemp': regression_result['MaxTemp'],
        'Pressure': regression_result['Pressure'],
        'UVIEF': regression_result['UVIEF']
    }

    predicted_humidity = humidity_predictor.predict_humidity(date, city, humidity_input)

    #Step 3: WindGustSpeed Prediction

    windgust_input = {
        'MinTemp': regression_result['MinTemp'],
        'MaxTemp': regression_result['MaxTemp'],
        'Pressure': regression_result['Pressure'],
        'UVIEF': regression_result['UVIEF']
    }

    predicted_windgust = windgust_predictor.predict_windgust(date, city, windgust_input, predicted_humidity)

    # Step 4: Anomaly Detection
    anomaly_input = regression_result.copy()
    anomaly_input['Humidity'] = predicted_humidity
    anomaly_input['WindGustSpeed'] = predicted_windgust
    
    anomaly_result = isolation_forest.detect_anomaly(anomaly_input, city)

    # Assigning results from regression and isolation forest to variables to be used in the classification model
    min_temp = regression_result['MinTemp']
    max_temp = regression_result['MaxTemp']
    uv = regression_result['UVIEF']
    anomaly_score = anomaly_result['anomaly_score']

    # Convert date input into season
    season = get_season(date)

    # Step 5: Classification Result
    classification_result = randomforest_classifier.classify_weather(
        min_temp, max_temp, predicted_humidity, predicted_windgust, uv, season, anomaly_score
    )

    print(f"Forecasted Weather for {date} in {city}:")

    print(f"Minimum Temperature: {round(regression_result['MinTemp'], 2)}°C")
    print(f"Maximum Temperature: {round(regression_result['MaxTemp'], 2)}°C")
    print(f"Humidity: {round(predicted_humidity, 2)}%")
    print(f"Average Windspeed: {round(predicted_windgust, 2)} km/h")
    print(f"UV Index: {round(regression_result['UVIEF'], 2)}")

    print("\nClassification Model Output:")
    print(f"Night Forecast: {classification_result['night_forecast']}")
    print(f"Night Reliability: {classification_result['night_reliability']:.2f}%")
    print(f"Day Forecast: {classification_result['day_forecast']}")
    print(f"Day Reliability: {classification_result['day_reliability']:.2f}%")


if __name__ == '__main__':
    main()
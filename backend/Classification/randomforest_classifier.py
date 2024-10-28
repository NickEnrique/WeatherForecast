# Creating a function to execute classification model

def classify_weather(min_temp, max_temp, humidity, windspeed, uv, season, anomaly_score):
    # Import libraries for the random forest classifier and metrics
    import pandas as pd
    from sklearn.preprocessing import LabelEncoder
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import accuracy_score, classification_report

    # Load the dataset with semicolon as a delimiter
    train_data = pd.read_csv('dataset/train_weather_data.csv', delimiter=';')
    test_data = pd.read_csv('dataset/test_weather_data.csv', delimiter=';')

    # Separate features and target variable where Weather is the target variable
    X_train = train_data.drop('Weather', axis=1)
    y_train = train_data['Weather']
    X_test = test_data.drop('Weather', axis=1)
    y_test = test_data['Weather']

    # Convert categorical Season data into numerical format using LabelEncoder
    label_encoder = LabelEncoder()
    X_train['Season'] = label_encoder.fit_transform(X_train['Season'])
    X_test['Season'] = label_encoder.transform(X_test['Season'])

    # Train the Random Forest classifier
    clf = RandomForestClassifier(n_estimators=96, random_state=42)  # Random Forest with 96 trees and 42 as the random seed
    clf.fit(X_train, y_train)

    # Evaluate the model based on accuracy
    accuracy = accuracy_score(y_test, clf.predict(X_test))

    # Example new forecast input for a day
    night_input = [[min_temp, humidity, windspeed, uv, season]]
    day_input = [[max_temp, humidity, windspeed, uv, season]]

    # Encode the season for both inputs
    night_input[0][4] = label_encoder.transform([night_input[0][4]])[0]
    day_input[0][4] = label_encoder.transform([day_input[0][4]])[0]

    # Make predictions
    night_forecast = clf.predict(night_input)
    day_forecast = clf.predict(day_input)

    # Calculate Reliability Scores based on Anomaly Scores and Accuracy
    def calculate_reliability(accuracy, anomaly_score):
        if anomaly_score < 0:  # Anomaly detected
            reliability_adjustment = max(0, 1 + score)  # Scale between 0 and 1
            reliability = (accuracy * 100) * reliability_adjustment  # Adjust reliability down
        else:  # Normal data
            reliability = accuracy * 100  # Full accuracy for normal data
        return reliability

    night_reliability = calculate_reliability(accuracy, anomaly_score)
    day_reliability = calculate_reliability(accuracy, anomaly_score)

    return {
        'night_forecast': night_forecast[0],
        'night_reliability': night_reliability,
        'day_forecast': day_forecast[0],
        'day_reliability': day_reliability
    }
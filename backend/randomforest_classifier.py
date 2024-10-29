import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

def train_classification_model():
    # Load the training data
    train_data = pd.read_csv('dataset/train_weather_data.csv', delimiter=';')
    test_data = pd.read_csv('dataset/test_weather_data.csv', delimiter=';')

    # Split features and target
    X_train = train_data.drop('Weather', axis=1)
    y_train = train_data['Weather']
    X_test = test_data.drop('Weather', axis=1)
    y_test = test_data['Weather']

    # Encode the 'Season' column
    label_encoder = LabelEncoder()
    X_train['Season'] = label_encoder.fit_transform(X_train['Season'])
    X_test['Season'] = label_encoder.transform(X_test['Season'])

    # Train the model
    clf = RandomForestClassifier(n_estimators=96, random_state=42)
    clf.fit(X_train, y_train)

    # Calculate accuracy on test data
    accuracy = accuracy_score(y_test, clf.predict(X_test))

    joblib.dump(clf, 'models/classification_model.joblib')
    joblib.dump(label_encoder, 'models/label_encoder.joblib')
    joblib.dump(accuracy, 'models/accuracy.joblib')
    return clf, label_encoder, accuracy

def load_classification_model():
    clf_path, encoder_path, accuracy_path = 'models/classification_model.joblib', 'models/label_encoder.joblib', 'models/accuracy.joblib'
    if os.path.exists(clf_path) and os.path.exists(encoder_path) and os.path.exists(accuracy_path):
        clf, encoder, accuracy = joblib.load(clf_path), joblib.load(encoder_path), joblib.load(accuracy_path)
        return clf, encoder, accuracy  # Placeholder accuracy if not recalculated
    else:
        return train_classification_model()


def classify_weather(clf, label_encoder, accuracy, min_temp, max_temp, humidity, windspeed, uv, season, anomaly_score):
    # Define feature names
    min_feature_names = ['MinTemp', 'Humidity', 'WindSpeed', 'UV', 'Season']
    max_feature_names = ['MaxTemp', 'Humidity', 'WindSpeed', 'UV', 'Season']

    # Prepare input for predictions
    night_input = pd.DataFrame([[min_temp, humidity, windspeed, uv, season]], columns=min_feature_names)
    day_input = pd.DataFrame([[max_temp, humidity, windspeed, uv, season]], columns=max_feature_names)

    # Encode the 'Season' feature in the input data
    night_input['Season'] = label_encoder.transform(night_input['Season'])
    day_input['Season'] = label_encoder.transform(day_input['Season'])

    # Make predictions
    night_forecast = clf.predict(night_input)
    day_forecast = clf.predict(day_input)

    # Calculate reliability
    def calculate_reliability(accuracy, anomaly_score):
        reliability_adjustment = max(0, 1 + anomaly_score) if anomaly_score < 0 else 1
        return min(100, accuracy * 100 * reliability_adjustment)

    night_reliability = calculate_reliability(accuracy, anomaly_score)
    day_reliability = calculate_reliability(accuracy, anomaly_score)

    return {
        'night_forecast': night_forecast[0],
        'night_reliability': night_reliability,
        'day_forecast': day_forecast[0],
        'day_reliability': day_reliability
    }


import os  # Used to change working directory and ensure script works on all devices 
import pandas as pd
import seaborn as sns
from sklearn.ensemble import IsolationForest
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt


# Function to add trace for each feature
def addTrace(fig, row, feature, df):
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df[feature],
        mode='markers',
        marker=dict(color=df['anomaly'].map({'1': 'blue', '-1': 'red'})),
        hoverinfo='text',
        text=df.apply(lambda row: f"Date: {row['DateRecorded']}<br>{feature}: {row[feature]}<br>Anomaly Score: {row['anomaly_score']}", axis=1),
        showlegend=False
    ), row=row, col=1)


script_dir = os.path.dirname(os.path.abspath(__file__))  # Get path of current script 
cities = ['sydney','melbourne','darwin','perth','brisbane','hobart']

for city in cities:  # Loop through and generate graph for each city
    df = pd.read_csv(os.path.join(script_dir, f'dataset/{city}_final.csv'))

    # Convert Date column to datetime type 
    df['Date'] = pd.to_datetime(df['Date'])

    # filling in missing data and dropping columns as necessary
    if city == 'sydney': 
        # Drop rows for Sydney from 2009 to 2010
        # Due to a significant amount of data missing for WindGustSpeed
        df = df[(df['Date'].dt.year < 2009) | (df['Date'].dt.year > 2010)]
    elif city == 'melbourne':
        # Drop rows for Melbourne for the year 2015
        # Due to significant amount of data missing for Humidity and Pressure
        df = df[df['Date'].dt.year != 2015]

    df = df.interpolate(method='linear') # Use linear interpolation to fill in data

    # Check for remaining NaN values after interpolation
    if df.isnull().values.any():
        df.fillna(df.median(), inplace=True)  # Fill remaining missing values with median imputation

    # Create a correlation matrix to determine features to use
    corr_matrix = df.drop(columns=['Date']).corr()  # Exclude Date column as it is irrelevant
    plt.figure(figsize=(10, 8))
    # Create a heatmap
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
    # Display the plot
    plt.show()

    # Features to use for anomaly detection
    features = ['MinTemp', 'MaxTemp', 'Rainfall', 'Humidity', 'WindGustSpeed', 'Pressure', 'UVIEF']
    X = df[features]

    # Standardizing values for better performance
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Fit the Isolation Forest model with adjusted contamination
    model = IsolationForest(contamination=0.03, random_state=42, n_estimators=200)
    model.fit(X_scaled)
    df['anomaly_score'] = model.decision_function(X_scaled)
    df['anomaly'] = model.predict(X_scaled)

    # Format date for hover data
    df['DateRecorded'] = df['Date'].dt.strftime('%d/%m/%Y')

    # Create a subplot figure with 7 rows and 1 column
    fig = make_subplots(rows=7, cols=1,
                        subplot_titles=('Minimum Temperature', 'Maximum Temperature', 'Rainfall', 
                                        'Wind Gust Speed', 'Pressure', 'Humidity', 'UV'),
                        vertical_spacing=0.05)
    
    # Change 'anomaly' data type to str to use as color key
    df['anomaly'] = df['anomaly'].astype(str)

    # Loop through features and add traces using the defined function
    for i, feature in enumerate(features):
        addTrace(fig, i + 1, feature, df)

    # Create dummy scatter traces for custom legend
    fig.add_trace(go.Scatter(x=[None], y=[None], mode='markers', marker=dict(color='blue'), name='Non-anomaly', showlegend=True))
    fig.add_trace(go.Scatter(x=[None], y=[None], mode='markers', marker=dict(color='red'), name='Anomaly', showlegend=True))

    # Update layout
    fig.update_layout(title_text=f'{city.capitalize()} Weather Data With Anomaly Detection (2009 - 2024)', height=2000)

    fig.show()

    # Visualise the distribution of the weather variables
    for i, feature in enumerate(features):
        sns.histplot(df[feature], bins=30, kde=True)
        plt.title(f'Distribution of {feature}')
        plt.xlabel(feature)
        plt.ylabel('Frequency')
        plt.show()

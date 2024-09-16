import plotly.express as px
import pandas as pd

def get_df(data_path):
    df = pd.read_csv(data_path, sep=';', skiprows=lambda i: i % 1000 != 0)
    return df

def gen_charts(df):
    # Load the data    
    print(len(df))
    # Create a scatter plot of the data
    fig = px.scatter(
        df,
        x='Timestamp',
        y=df.columns[1:],
        labels={
            "value": "Values (Units Vary)",
            "Timestamp": "Time Elapsed (s)",
            "variable": "ROS Topic",
        },
        title="Dynamics Data",
    ).update_traces(visible='legendonly')
    fig.write_html('test.html', include_plotlyjs=False, full_html=False)

if __name__ == "__main__":
    dfs = []
    for f in [
        "src/static/data/dynamics/accelerator_pedal_cmd.csv",
        "src/static/data/dynamics/accelerator_pedal_report.csv",
        "src/static/data/dynamics/brake_2_report.csv",
        "src/static/data/dynamics/brake_cmd.csv",
        "src/static/data/dynamics/command.csv",
        "src/static/data/dynamics/steering_report.csv",
        "src/static/data/dynamics/pt_report.csv",
        "src/static/data/dynamics/steering_cmd.csv",
        "src/static/data/dynamics/tire_report.csv",
        "src/static/data/dynamics/tire_temp_report.csv",
        "src/static/data/dynamics/wheel_speed_report.csv",
    ]:
        dfs.append(get_df(f))
    df = dfs[0]
    for i in range(1, len(dfs)):
        df = df.merge(dfs[i], how='outer', on='Timestamp')
    df["Timestamp"] = df["Timestamp"].transform(lambda x: x - x.min())
    df["Timestamp"] = df["Timestamp"].transform(lambda x: x / 1000000000)

    gen_charts(df)

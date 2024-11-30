import pandas as pd

# Load the dataset
file_path = '/Users/acrymonic/Documents/Hackathons/adg332/Final_Persons_And_Recommenders.csv'
df = pd.read_csv(file_path)

# Define the function to identify reciprocal or circular recommendations
def find_reciprocal_recommendations(row, df):
    recommended_id = row['ID']
    recommenders = eval(row['Recommenders ID']) if isinstance(row['Recommenders ID'], str) else row['Recommenders ID']
    
    reciprocals = []
    for rec_id in recommenders:
        # Check if the recommender's recommenders list contains the current ID
        matching_rows = df.loc[df['ID'] == rec_id, 'Recommenders ID']
        if not matching_rows.empty:
            rec_recommenders = eval(matching_rows.values[0])
            if recommended_id in rec_recommenders:
                reciprocals.append(rec_id)
    
    # Calculate the score
    if len(reciprocals) > 0:
        score = len(reciprocals) / len(recommenders)  # Proportion of circular recommendations
    else:
        score = 0  # No circular recommendations
    
    circular_recs = ", ".join(map(str, reciprocals)) if reciprocals else ""
    return circular_recs, score

# Apply the function to each row in the dataframe
df[['circular/reciprocal', 'circular_score']] = df.apply(
    lambda row: pd.Series(find_reciprocal_recommendations(row, df)), axis=1
)

# Save the updated dataframe to a new CSV file
output_file_path = '/Users/acrymonic/Documents/Hackathons/adg332/output.csv'
df.to_csv(output_file_path, index=False)

print(f"Updated file with scores saved to: {output_file_path}")

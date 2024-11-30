import pandas as pd

# Load the provided CSV files
influence_df = pd.read_csv('32.csv')
fraud_df = pd.read_csv('FRAUD.csv')

# Ensure that the ID column is the same type in both DataFrames for proper merging
influence_df['ID'] = pd.to_numeric(influence_df['ID'], errors='coerce')
fraud_df['ID'] = pd.to_numeric(fraud_df['ID'], errors='coerce')

# Merging the two DataFrames on the 'ID' column
merged_df = pd.merge(influence_df, fraud_df, on='ID', how='inner')

# Calculating the final_scores with the specified weights
merged_df['final_scores'] = (0.4 * merged_df['Final Influence Score']) + (0.6 * merged_df['Final_Fraud_Score'])

# Selecting only the necessary columns for the output
final_output_df = merged_df[['ID', 'final_scores']]

print(final_output_df.max())
print(final_output_df.head())
# Save the result to a new CSV file
final_output_df.to_csv('score.csv', index=False)

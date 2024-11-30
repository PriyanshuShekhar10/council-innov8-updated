import pandas as pd

# Load the provided CSV files
fraud_detection_df = pd.read_csv('fraud_detection_results.csv')
circular_score_df = pd.read_csv('output_final.csv')

# Converting the ID column in fraud_detection_df to numeric for proper merging
fraud_detection_df['ID'] = pd.to_numeric(fraud_detection_df['ID'], errors='coerce')

# Merging the two DataFrames on the 'ID' column
merged_df = pd.merge(fraud_detection_df, circular_score_df, on='ID', how='inner')

# Calculating the Final_Fraud_Score
merged_df['Final_Fraud_Score'] = (0.8 * merged_df['FraudScore']) + (0.2 * merged_df['circular_score'])

# Selecting only the necessary columns for the output
final_output_df = merged_df[['ID', 'Final_Fraud_Score']]

# Save the result to a new CSV file
final_output_df.to_csv('FRAUD.csv', index=False)

import pandas as pd
import networkx as nx
from sklearn.preprocessing import MinMaxScaler

# Load the datasets
resume_df = pd.read_csv('final-dict-sorted-k2.csv')
job_title_scores_df = pd.read_csv('unique_first_job_titles_with_scores.csv')
recommenders_df = pd.read_csv('Final_Persons_And_Recommenders.csv')
cluster_df = pd.read_csv('community_assignments.csv')

# Convert job titles to lower case for comparison
job_title_scores_df['First Job Title'] = job_title_scores_df['First Job Title'].str.lower()

# Function to match job title in resume content and assign a position influence score
def assign_position_influence(resume_content):
    if pd.isnull(resume_content):  # Check for missing or NaN resume content
        return 0
    resume_content = str(resume_content).lower()  # Ensure the resume content is a string and convert to lower case
    for _, row in job_title_scores_df.iterrows():
        if row['First Job Title'] in resume_content:
            return row['Influence Score']
    return 0  # Return 0 if no match is found

# Apply the function to calculate position influence scores
resume_df['Position Influence Score'] = resume_df['Resume Content'].apply(assign_position_influence)

# Normalize the position influence score to be between 0 and 1
scaler = MinMaxScaler()
resume_df['Position Influence Score'] = scaler.fit_transform(resume_df[['Position Influence Score']])

# Merge with recommenders dataframe to include 'Recommenders ID'
merged_df = pd.merge(resume_df[['ID', 'Position Influence Score']], recommenders_df, on='ID')

# Convert ID column to integers (dropping NaN values)
merged_df['ID'] = merged_df['ID'].fillna(0).astype(int)

# Initialize a directed graph for nodal analysis
G = nx.DiGraph()

# Add nodes and edges based on recommendations
for index, row in merged_df.iterrows():
    person_id = row['ID']
    recommenders = eval(row['Recommenders ID'])  # Convert the string list to an actual list
    for recommender in recommenders:
        G.add_edge(recommender, person_id)

# Map cluster information using correct column names
cluster_dict = cluster_df.set_index('Node')['Community'].to_dict()

# Add edges between nodes if they belong to the same community (cluster)
for index, row in merged_df.iterrows():
    person_id = row['ID']
    person_cluster = cluster_dict.get(person_id, None)
    if person_cluster:
        for recommender in eval(row['Recommenders ID']):
            recommender_cluster = cluster_dict.get(recommender, None)
            if person_cluster == recommender_cluster:
                G.add_edge(person_id, recommender)

# Calculate centrality measures for nodal analysis
degree_centrality = nx.degree_centrality(G)
betweenness_centrality = nx.betweenness_centrality(G)
closeness_centrality = nx.closeness_centrality(G)
eigenvector_centrality = nx.eigenvector_centrality(G, max_iter=500)

# Normalize the centrality measures
merged_df['Degree Centrality'] = merged_df['ID'].map(degree_centrality).fillna(0)
merged_df['Betweenness Centrality'] = merged_df['ID'].map(betweenness_centrality).fillna(0)
merged_df['Closeness Centrality'] = merged_df['ID'].map(closeness_centrality).fillna(0)
merged_df['Eigenvector Centrality'] = merged_df['ID'].map(eigenvector_centrality).fillna(0)
merged_df[['Degree Centrality', 'Betweenness Centrality', 'Closeness Centrality', 'Eigenvector Centrality']] = \
    scaler.fit_transform(merged_df[['Degree Centrality', 'Betweenness Centrality', 'Closeness Centrality', 'Eigenvector Centrality']])

# Calculate nodal influence score as a weighted sum of centrality measures
merged_df['Nodal Influence Score'] = (0.25 * merged_df['Degree Centrality'] +
                                      0.25 * merged_df['Betweenness Centrality'] +
                                      0.25 * merged_df['Closeness Centrality'] +
                                      0.25 * merged_df['Eigenvector Centrality'])

# Normalize the nodal influence score to be between 0 and 1
merged_df['Nodal Influence Score'] = scaler.fit_transform(merged_df[['Nodal Influence Score']])

# Combine the position influence score with the nodal influence score (weights: 0.65 for position, 0.35 for nodal)
merged_df['Final Influence Score'] = (0.65 * merged_df['Position Influence Score'] +
                                      0.35 * merged_df['Nodal Influence Score'])

# Normalize the final influence score to ensure it's between 0 and 1
merged_df['Final Influence Score'] = scaler.fit_transform(merged_df[['Final Influence Score']])

# Handle any NaN values by filling them with 0
merged_df[['Position Influence Score', 'Nodal Influence Score', 'Final Influence Score']] = merged_df[['Position Influence Score', 'Nodal Influence Score', 'Final Influence Score']].fillna(0)

# Identify the range of IDs expected
all_ids = pd.Series(range(merged_df['ID'].min(), merged_df['ID'].max() + 1))

# Identify missing IDs
missing_ids = all_ids[~all_ids.isin(merged_df['ID'])]

# Create a DataFrame for missing IDs and assign 0 influence scores
missing_df = pd.DataFrame({
    'ID': missing_ids,
    'Position Influence Score': 0,
    'Nodal Influence Score': 0,
    'Final Influence Score': 0
})

# Append the missing IDs DataFrame to the merged DataFrame
final_df = pd.concat([merged_df, missing_df], ignore_index=True).sort_values(by='ID')

# Save the final results
output_final_path = '32.csv'
final_df[['ID', 'Final Influence Score']].to_csv(output_final_path, index=False)

print(f"Final influence scores with all sequential IDs have been saved to {output_final_path}")

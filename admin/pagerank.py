import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import dash_cytoscape as cyto
import networkx as nx
import pandas as pd
import matplotlib.colors as mcolors

# Load and prepare the dataset
df = pd.read_csv(r'D:\Hackathons\council-innov8\admin\final-dict-sorted-k2.csv')

# Create the graph
G = nx.DiGraph()

for index, row in df.iterrows():
    candidate = str(row['ID'])  # Convert ID to string
    recommenders = row['Recommenders ID']

    if isinstance(recommenders, float) and pd.isna(recommenders):
        continue

    if isinstance(recommenders, str):
        try:
            recommenders = eval(recommenders)
        except:
            continue

    if isinstance(recommenders, list):
        for recommender in recommenders:
            recommender = str(recommender)  # Convert recommender to string
            if not G.has_node(recommender):
                G.add_node(recommender)
            if not G.has_node(candidate):
                G.add_node(candidate)
            G.add_edge(recommender, candidate)

# Calculate PageRank and Community Detection
pagerank_scores = nx.pagerank(G)
communities = list(nx.algorithms.community.greedy_modularity_communities(G))
community_map = {node: i for i, community in enumerate(communities) for node in community}

# Assign colors to communities
colors = list(mcolors.CSS4_COLORS.values())  # Use CSS4 colors for variety
color_map = {i: colors[i % len(colors)] for i in range(len(communities))}

# Convert the network to a format compatible with Dash Cytoscape
def generate_cytoscape_elements(G, community=None):
    elements = []

    if community is not None:
        nodes = [n for n in G.nodes() if community_map.get(n) == community]
        edges = [(u, v) for u, v in G.edges() if u in nodes and v in nodes]
    else:
        nodes = G.nodes()
        edges = G.edges()

    for node in nodes:
        if node not in pagerank_scores or node not in community_map:
            continue  # Skip nodes that don't have PageRank or community info
        elements.append({
            'data': {
                'id': str(node), 
                'label': f'{node}', 
                'pagerank': pagerank_scores.get(node, 0),
                'weight': pagerank_scores.get(node, 0)
            },
            'position': {'x': 20 * int(node) if node.isdigit() else 20, 'y': 20 * int(node) if node.isdigit() else 20},
            'classes': f'c{community_map[node]}',
            'style': {
                'background-color': color_map[community_map[node]],  # Assign a color to the node based on community
            }
        })

    for u, v in edges:
        if G.has_node(u) and G.has_node(v):
            elements.append({
                'data': {'source': str(u), 'target': str(v)}
            })

    return elements

# Initialize the Dash app
app = dash.Dash(__name__)

# Layout of the Dash app
app.layout = html.Div([
    dcc.Dropdown(
        id='community-dropdown',
        options=[{'label': f'Community {i}', 'value': i} for i in range(len(communities))],
        value=0,
        clearable=False
    ),
    cyto.Cytoscape(
    id='network-graph',
    layout={
        'name': 'cose',  # Use the force-directed layout for a more natural clustering
        'nodeRepulsion': 20000000,  # Keeps nodes at a reasonable distance
        'idealEdgeLength': 200,  # Adjust for moderately spaced connections
        'edgeElasticity': 0.1,
        'gravity': 1.0,
        'padding': 100
    },
    style={'width': '100%', 'height': '800px'},
    elements=generate_cytoscape_elements(G, community=0),
    stylesheet=[
        {
            'selector': 'node',
            'style': {
                'label': 'data(label)',
                'font-size': '8px',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': 'mapData(pagerank, 0, 0.1, yellow, red)',  # Retain original color mapping
                'width': 'mapData(pagerank, 0, 0.1, 20, 60)',
                'height': 'mapData(pagerank, 0, 0.1, 20, 60)',
                'border-width': 2,
                'border-color': '#333',
                'background-opacity': 0.7  # Slight opacity for a softer appearance
            }
        },
        {
            'selector': 'edge',
            'style': {
                'width': 1.5,  # Slightly thinner edges for clarity
                'line-color': 'mapData(weight, 0, 1, #ccc, #444)',  # Retain original edge color mapping
                'curve-style': 'straight'  # Straight edges for cleaner appearance
            }
        },
        {
            'selector': ':selected',
            'style': {
                'background-color': '#FF5733',  # Highlight selected node with a strong color
                'line-color': '#FF5733',
                'target-arrow-color': '#FF5733',
                'source-arrow-color': '#FF5733',
                'border-width': 2,
                'border-color': '#333'
            }
        }
    ]
)





])

# Callback to update the graph based on the selected community
@app.callback(
    Output('network-graph', 'elements'),
    [Input('community-dropdown', 'value')]
)
def update_graph(selected_community):
    return generate_cytoscape_elements(G, community=selected_community)

# Save community assignments to a CSV file
community_df = pd.DataFrame({
    'Node': list(community_map.keys()),
    'Community': list(community_map.values())
})
community_df.to_csv('community_assignments.csv', index=False)

# Run the Dash app
if __name__ == '__main__':
    app.run_server(debug=True)

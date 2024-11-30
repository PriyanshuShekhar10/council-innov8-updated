import torch
import pandas as pd
import re
import logging
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import spacy
from tqdm import tqdm

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Attempt to load spaCy model for NLP tasks
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logging.error("spaCy model 'en_core_web_sm' not found. Please install it using the command 'python -m spacy download en_core_web_sm'")
    exit(1)

# Check if a GPU is available
device = 0 if torch.cuda.is_available() else -1

# Load transformer model for vagueness and suspicious content detection
model_name = "textattack/bert-base-uncased-yelp-polarity"  # Example, use a model suited for your task
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

vagueness_pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer, device=device)

# Function to calculate vagueness score using a transformer model
def calculate_vagueness_score(text, max_length=512):
    # Tokenize the text and split into chunks that fit within the max length
    tokens = tokenizer(text, truncation=False, return_tensors='pt')
    input_ids = tokens['input_ids'][0]
    
    # Split input into chunks of max_length tokens
    chunks = [input_ids[i:i + max_length] for i in range(0, len(input_ids), max_length)]
    
    scores = []
    for chunk in chunks:
        chunk_text = tokenizer.decode(chunk, skip_special_tokens=True)
        result = vagueness_pipeline(chunk_text)
        score = result[0]['score'] if result[0]['label'] == 'NEGATIVE' else 1 - result[0]['score']
        scores.append(score)
    
    # Average the scores of all chunks
    return sum(scores) / len(scores)

# Function to detect suspicious patterns using a combination of spaCy and regex
def detect_suspicious_patterns(text, suspicious_patterns):
    detected_patterns = []
    doc = nlp(text)
    
    # Apply pre-defined regex patterns
    for pattern_name, pattern_regex in suspicious_patterns.items():
        if re.search(pattern_regex, text.lower()):
            detected_patterns.append(pattern_name)
    
    # Additional suspicious pattern detection using NLP techniques
    for ent in doc.ents:
        if ent.label_ == "DATE" and any(word in ent.text.lower() for word in ["young", "early", "rapid"]):
            detected_patterns.append("Improbable Date-Related Claim")
        if ent.label_ == "ORG" and "executive" in text.lower() and "intern" in text.lower():
            detected_patterns.append("Contradictory Job Title")

    # Suspicious score based on the number of patterns detected
    sus_score = len(detected_patterns) / (len(suspicious_patterns) + 2)  # Adding extra weight for NLP checks
    return detected_patterns, sus_score

def main():
    # File paths
    input_file = '/Users/acrymonic/Documents/Hackathons/adg332/Filtered_Resumes.csv'  # Replace with your actual input file path
    output_file = 'vague.csv'  # Replace with your actual output file path

    try:
        resumes_df = pd.read_csv(input_file)
    except Exception as e:
        logging.error(f"Error loading input file: {e}")
        return
    
    if 'data' not in resumes_df.columns:
        logging.error("Input file must contain a 'data' column with resume text.")
        return
    
    # Example suspicious patterns (can be expanded or modified)
    suspicious_patterns = {
        "Young executive title": r'\b(?:chief|executive|director|head)\b.*\b(?:age|years old)\b.*\b\d{1,2}\b',
        "Many roles in short time period": r'\b(?:manager|director|executive|head|chief)\b',
        "Improbable career progression": r'\b(?:promoted|advanced)\b.*(?:rapidly|quickly|within \d+ months)\b',
        "Inconsistent education timeline": r'\b(?:completed|earned|graduated)\b.*\b(?:degree|certification)\b.*(?:in a very short time|in an unusually short period)\b'
    }

    # Apply the vagueness score and suspicious pattern detection to the dataset
    tqdm.pandas(desc="Processing resumes")
    resumes_df['vagueness_score'] = resumes_df['data'].progress_apply(lambda text: calculate_vagueness_score(text))
    resumes_df['suspicious_patterns'], resumes_df['sus_score'] = zip(*resumes_df['data'].progress_apply(lambda text: detect_suspicious_patterns(text, suspicious_patterns)))
    
    # Save the dataset with the vagueness score and suspicious patterns to a new CSV file
    try:
        resumes_df[['id', 'vagueness_score', 'sus_score', 'suspicious_patterns']].to_csv(output_file, index=False)
        logging.info(f"Analysis results saved to {output_file}")
    except Exception as e:
        logging.error(f"Error saving output file: {e}")

# Run the main function
if __name__ == "__main__":
    main()

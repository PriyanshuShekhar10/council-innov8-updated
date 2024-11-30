import pandas as pd
import openai
import re
from tqdm import tqdm

# Load your dataset
df = pd.read_csv('finset.csv')
df=df.head(4)

# Define your OpenAI API key
openai.api_key = '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'  # Replace with your actual API key

# Define a dataset of vague or suspicious words/phrases
vague_words = [
    "results-driven", "self-starter", "strong work ethic", "proven track record", "excellent track record",
    "works well under pressure", "detail-oriented", "synergy", "leveraged", "passion for excellence",
    "outside the box thinker", "results-focused", "successful", "extensive experience", "thought leader",
    "delivered results", "committed to", "outstanding leadership", "deep understanding", "recognized as",
    "top performer", "subject matter expert", "impressive", "effective communicator", "dynamic leader",
    "adaptable", "proactive approach", "leading expert", "highly effective", "proven ability",
    "seasoned professional", "strategically driven", "recognized authority", "proven expertise",
    "innovative approach", "transformational leader", "visionary leader", "exceptional talent", 
    "recognized expert", "experienced in", "responsible for overseeing", "in charge of", "responsible for managing",
    "handled", "played a role in", "assisted with", "coordinated", "pioneered", "strategic thinker",
    "customer-centric", "cross-functional", "data-driven", "proven success", "operational excellence",
    "collaborative", "innovative solutions", "best practices", "industry-leading", "global mindset",
    "growth-oriented", "customer-focused", "client-focused", "scalable solutions", "goal-oriented",
    "value proposition", "business acumen", "market-driven", "competitive advantage", "brand loyalty",
    "visionary thinking", "ROI-focused", "influential", "client engagement", "project management",
    "growth strategy", "customer satisfaction", "digital transformation", "innovative mindset",
    "diverse experience", "organizational skills", "high-impact", "effective leadership", "customer engagement",
    "continuous improvement", "result-oriented", "resourceful", "outcome-focused", "dynamic thinker",
    "industry expertise", "proven leadership"
]

def extract_score(response_text):
    """
    Extract the score from the OpenAI response.
    This function searches for numeric values between 0.0 and 1.0 in the response text.
    It handles cases like "1." as well as "1.0".
    """
    matches = re.findall(r'\b([01]\.?[0-9]*)\b', response_text)
    if matches:
        return float(matches[-1])
    else:
        print(f"Debug: Score not found in the response. Response was: {response_text}")
        raise ValueError("Score not found in the response")

def calculate_vagueness_score(resume_content):
    """
    Calculate an objective vagueness score based on the presence of vague words/phrases.
    """
    count = 0
    for word in vague_words:
        count += len(re.findall(rf'\b{re.escape(word)}\b', resume_content.lower()))
    
    max_possible_count = len(resume_content.split())  # Using word count as a rough denominator
    vagueness_score = min(count / max_possible_count, 1)  # Normalize the score to be between 0 and 1
    return vagueness_score

def calculate_suspicion_score(resume_content):
    """
    Calculate an objective suspicion score based on patterns in the resume content.
    This includes detecting frequent job changes, unrealistic career progression, and employment gaps.
    """
    suspicion_score = 0

    # Check for frequent job changes
    job_changes = len(re.findall(r'\bjob\b|\bposition\b', resume_content.lower()))
    if job_changes > 5:  # Arbitrary threshold; adjust based on average number of jobs in a typical career
        suspicion_score += 0.3

    # Check for unrealistic career progression (e.g., becoming an executive in early 20s)
    years_experience = len(re.findall(r'\byears? of experience\b', resume_content.lower()))
    if "executive" in resume_content.lower() and years_experience < 5:
        suspicion_score += 0.3

    # Check for employment gaps (simple heuristic: check for words like "gap year" or missing years)
    employment_gaps = len(re.findall(r'\bgap year\b|\b(unemployed|break)\b', resume_content.lower()))
    if employment_gaps > 0:
        suspicion_score += 0.3

    # Check for overly broad claims (e.g., without specifics)
    broad_claims = len(re.findall(r'\bhandled\b|\bmanaged\b|\bresponsible for\b', resume_content.lower()))
    if broad_claims > 3 and job_changes == 0:  # Many broad claims without job changes could indicate fabrication
        suspicion_score += 0.1

    return min(suspicion_score, 1)  # Ensure the score is between 0 and 1

def analyze_resume_and_recommendation(resume_content, recommendation_content):
    # Refined matching logic to discriminate more between strong, moderate, and weak matches
    alignment_prompt = f"""
    You are a highly intelligent assistant specializing in human resources and recruitment. 
    Evaluate the alignment between the resume content and the recommendations provided. 
    Consider subtle differences between strong, moderate, and weak matches. Assess whether the skills, experiences, 
    and achievements listed in the resume are genuinely reflected, supported, or possibly exaggerated in the recommendations. 
    Also, evaluate if the recommendation content might be too generic or if it provides specific insights into the candidate's performance.
    Provide a score from 0 to 1, where 0 indicates no alignment and 1 indicates perfect alignment. Make sure to include the score at the end.
    
    Resume Content: {resume_content}
    Recommendation Content: {recommendation_content}
    """
    alignment_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a highly intelligent assistant specializing in human resources."},
            {"role": "user", "content": alignment_prompt}
        ]
    )
    match_score = extract_score(alignment_response['choices'][0]['message']['content'].strip())

    # Enhanced vagueness detection with expanded criteria and objective analysis
    vagueness_prompt = f"""
    You are a language analysis expert. Carefully analyze the following resume for vague or suspicious wording. 
    Pay attention to phrases that might indicate a lack of specific achievements, such as "great potential," "incredible enthusiasm," 
    "dynamic team player," "proven track record," "results-oriented professional," "motivated self-starter," or "strategic thinker." 
    Also consider if the language is overly positive without providing concrete examples of success, or if it relies on buzzwords and lacks substance.
    Provide a score from 0 to 1, where 0 indicates highly specific and credible content, and 1 indicates extremely vague or suspicious content. Make sure to include the score at the end.
    
    Resume Content: {resume_content}
    """
    vagueness_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in analyzing language for clarity and substance."},
            {"role": "user", "content": vagueness_prompt}
        ]
    )
    subjective_vagueness_score = extract_score(vagueness_response['choices'][0]['message']['content'].strip())

    # Objective vagueness score based on predefined vague words/phrases
    objective_vagueness_score = calculate_vagueness_score(resume_content)

    # Combine subjective and objective vagueness scores
    combined_vagueness_score = (subjective_vagueness_score + objective_vagueness_score) / 2

    # Enhanced suspicion detection with additional logic
    suspicion_prompt = f"""
    You are a forensic resume analyst. Evaluate the following resume for suspicious patterns. 
    Consider factors like the likelihood of a candidate holding an executive position at an unusually young age, 
    frequent job changes that might indicate instability, unusually rapid career progression, gaps in employment, 
    or claims that seem too good to be true. Also, look for inconsistencies in job titles, dates, or responsibilities that don't logically add up. 
    Consider if the resume uses a lot of buzzwords without concrete evidence or if it overstates achievements compared to industry norms.
    Provide a score from 0 to 1, where 0 indicates no suspicion and 1 indicates highly suspicious content. Make sure to include the score at the end.
    
    Resume Content: {resume_content}
    """
    suspicion_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in forensic analysis of resumes."},
            {"role": "user", "content": suspicion_prompt}
        ]
    )
    subjective_suspicion_score = extract_score(suspicion_response['choices'][0]['message']['content'].strip())

    # Objective suspicion score based on predefined logic
    objective_suspicion_score = calculate_suspicion_score(resume_content)

    # Combine subjective and objective suspicion scores
    combined_suspicion_score = (subjective_suspicion_score + objective_suspicion_score) / 2

    # Adjusted LLM-based fraud score with weighted logic
    llm_score = (0.2 * match_score + 0.3 * (1 - combined_vagueness_score) + 0.5 * (1 - combined_suspicion_score))

    return match_score, combined_vagueness_score, combined_suspicion_score, llm_score


tqdm.pandas()

# Apply the function to each row in the dataframe
df['Match Score'], df['Vagueness Score'], df['Suspicion Score'], df['LLM Score'] = zip(
    *df.apply(lambda row: analyze_resume_and_recommendation(row['Resume Content'], row['Recommendation Content']), axis=1)
)

# Save the results to a new CSV file
df.to_csv('fraudout_full_dataset.csv', index=False)

print("Analysis complete for the entire dataset. Results saved to fraudout_full_dataset.csv.")

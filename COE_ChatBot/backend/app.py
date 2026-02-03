from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import os
from datetime import datetime
import json
import hashlib
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from typing import List, Dict, Tuple
import logging

app = Flask(__name__, static_folder='../frontend', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
CORS(app, supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentence Transformer for better semantic matching
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load knowledge base
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    KNOWLEDGE_BASE = json.load(f)

# Precompute embeddings for all questions
QUESTION_EMBEDDINGS = {}
for category, items in KNOWLEDGE_BASE.items():
    if isinstance(items, list):
        for item in items:
            if 'question' in item:
                QUESTION_EMBEDDINGS[item['question']] = model.encode(item['question'])

# Feedback storage
FEEDBACK_FILE = 'feedback_data.json'

def load_feedback():
    """Load existing feedback data"""
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_feedback(feedback_data):
    """Save feedback data"""
    existing_feedback = load_feedback()
    existing_feedback.append(feedback_data)
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(existing_feedback, f, indent=2)

def preprocess_query(query: str) -> str:
    """Clean and normalize user query"""
    query = query.lower().strip()
    query = re.sub(r'[^\w\s?]', '', query)
    return query

def extract_keywords(query: str) -> List[str]:
    """Extract important keywords from query"""
    # Remove common words
    stop_words = {'is', 'are', 'the', 'a', 'an', 'what', 'how', 'when', 'where', 'can', 'do', 'does', 'i', 'my', 'me'}
    words = query.lower().split()
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    return keywords

def find_best_match(query: str, threshold: float = 0.5) -> Tuple[Dict, float, str]:
    """Find best matching answer using semantic similarity"""
    query_embedding = model.encode(query)
    
    best_match = None
    best_score = 0
    best_category = ""
    
    for category, items in KNOWLEDGE_BASE.items():
        if isinstance(items, list):
            for item in items:
                if 'question' in item:
                    # Calculate semantic similarity
                    similarity = cosine_similarity(
                        [query_embedding], 
                        [QUESTION_EMBEDDINGS[item['question']]]
                    )[0][0]
                    
                    # Convert numpy float32 to Python float
                    similarity = float(similarity)
                    
                    if similarity > best_score:
                        best_score = similarity
                        best_match = item
                        best_category = category
    
    # If similarity too low, try keyword matching
    if best_score < threshold:
        keywords = extract_keywords(query)
        for category, items in KNOWLEDGE_BASE.items():
            if isinstance(items, list):
                for item in items:
                    question_lower = item.get('question', '').lower()
                    answer_lower = item.get('answer', '').lower()
                    
                    keyword_matches = sum(1 for kw in keywords if kw in question_lower or kw in answer_lower)
                    keyword_score = keyword_matches / max(len(keywords), 1)
                    
                    if keyword_score > best_score:
                        best_score = keyword_score
                        best_match = item
                        best_category = category
    
    return best_match, float(best_score), best_category

def format_response(match: Dict, category: str, confidence: float) -> Dict:
    """Format the response with rich content"""
    response = {
        'answer': match.get('answer', ''),
        'category': category,
        'confidence': round(float(confidence) * 100, 2),  # Ensure float conversion
        'related_links': match.get('links', []),
        'additional_info': match.get('additional_info', []),
        'steps': match.get('steps', []),
        'important_notes': match.get('important_notes', []),
        'timestamp': datetime.now().isoformat()
    }
    
    return response

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        user_query = data.get('message', '').strip()
        
        if not user_query:
            return jsonify({
                'error': 'Empty query',
                'suggestion': 'Please ask a question about examinations, certificates, or policies.'
            }), 400
        
        # Preprocess query
        processed_query = preprocess_query(user_query)
        
        # Find best match
        match, confidence, category = find_best_match(processed_query)
        
        if match and confidence > 0.3:
            response = format_response(match, category, confidence)
            
            # Store in session for feedback
            if 'conversation_history' not in session:
                session['conversation_history'] = []
            
            conversation_id = hashlib.md5(
                f"{user_query}{datetime.now().isoformat()}".encode()
            ).hexdigest()
            
            session['conversation_history'].append({
                'id': conversation_id,
                'query': user_query,
                'response': response,
                'timestamp': datetime.now().isoformat()
            })
            
            response['conversation_id'] = conversation_id
            return jsonify(response)
        else:
            # No good match found
            return jsonify({
                'answer': "I apologize, but I couldn't find a specific answer to your question. Here's what I can help you with:",
                'suggestions': [
                    "Examination policies and procedures",
                    "Certificate applications (Transcripts, Duplicates)",
                    "Malpractice rules and penalties",
                    "Grade cards and results",
                    "Review, revaluation, and retotaling",
                    "Examination fees and payments",
                    "Online examination procedures",
                    "E-Sanad attestation services"
                ],
                'confidence': round(float(confidence) * 100, 2),  # Ensure float conversion
                'contact_info': {
                    'office': 'Controller of Examinations',
                    'location': '14th Floor, University Building, SRM Nagar',
                    'phone': '+91-44-2741 7211, 7225',
                    'email': 'coe@srmist.edu.in'
                }
            }), 200
            
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'An error occurred processing your request',
            'message': 'Please try again or contact support'
        }), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback for a response"""
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        rating = data.get('rating')  # 1-5 or thumbs up/down
        comments = data.get('comments', '')
        
        feedback_data = {
            'conversation_id': conversation_id,
            'rating': rating,
            'comments': comments,
            'timestamp': datetime.now().isoformat()
        }
        
        # Find the conversation in session
        if 'conversation_history' in session:
            for conv in session['conversation_history']:
                if conv['id'] == conversation_id:
                    feedback_data['query'] = conv['query']
                    feedback_data['response'] = conv['response']
                    break
        
        save_feedback(feedback_data)
        
        # If rating is good, potentially update knowledge base
        if rating >= 4:
            logger.info(f"Positive feedback received for query: {feedback_data.get('query', 'N/A')}")
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your feedback!'
        })
        
    except Exception as e:
        logger.error(f"Error in feedback endpoint: {str(e)}")
        return jsonify({
            'error': 'Failed to submit feedback'
        }), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """Get query suggestions"""
    try:
        category = request.args.get('category', 'all')
        
        suggestions = []
        for cat, items in KNOWLEDGE_BASE.items():
            if category == 'all' or category == cat:
                if isinstance(items, list):
                    suggestions.extend([item.get('question', '') for item in items[:5]])
        
        return jsonify({
            'suggestions': suggestions[:10]
        })
        
    except Exception as e:
        logger.error(f"Error in suggestions endpoint: {str(e)}")
        return jsonify({'error': 'Failed to get suggestions'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
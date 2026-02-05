from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import os
from datetime import datetime
import json
import hashlib
import math
import string
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from typing import List, Dict, Tuple
import logging
import difflib

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

# Load knowledge base
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    KNOWLEDGE_BASE = json.load(f)

# Initialize TF-IDF Vectorizer
# Prepare corpus for TF-IDF
ALL_QUESTIONS = []
ALL_ITEMS = []
ALL_CATEGORIES = []

for category, items in KNOWLEDGE_BASE.items():
    if isinstance(items, list):
        for item in items:
            if 'question' in item:
                ALL_QUESTIONS.append(item['question'])
                ALL_ITEMS.append(item)
                ALL_CATEGORIES.append(category)

# Fit vectorizer on startup
try:
    if ALL_QUESTIONS:
        # Add custom stop words to English stop words (like 'held' to avoid greedy matching on common verbs)
        custom_stop_words = list(ENGLISH_STOP_WORDS) + ['held', 'get', 'make', 'do', 'does']
        vectorizer = TfidfVectorizer(stop_words=custom_stop_words)
        TFIDF_MATRIX = vectorizer.fit_transform(ALL_QUESTIONS)
        logger.info(f"TF-IDF Matrix created with {len(ALL_QUESTIONS)} questions.")
    else:
        TFIDF_MATRIX = None
        vectorizer = None
        logger.warning("Knowledge base appears empty or malformed.")
except Exception as e:
    logger.error(f"Error creating TF-IDF matrix: {e}")
    TFIDF_MATRIX = None
    vectorizer = None

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



def extract_keywords(query: str) -> List[str]:
    """Extract important keywords from query"""
    # Remove common words
    stop_words = {'is', 'are', 'the', 'a', 'an', 'what', 'how', 'when', 'where', 'can', 'do', 'does', 'i', 'my', 'me'}
    words = query.lower().split()
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    return keywords

def preprocess_query(query: str) -> str:
    """Clean and normalize query"""
    # 1. Basic clean
    query = query.lower().translate(str.maketrans('', '', string.punctuation))
    
    # 2. Explicit Typo Correction
    TYPO_MAP = {
        'reult': 'results',
        'resul': 'results',
        'result': 'results',
        'marks': 'results',
        'score': 'results',
        'xam': 'exam',
        'exam': 'examination',
        'cert': 'certificate',
        'malprac': 'malpractice',
        'hld': 'held',
        'arrear': 'arrears',
        'fees': 'fee',
        'exams': 'examination',
        'certificates': 'certificate',
        'transcripts': 'transcript',
        'mark': 'results',
        'points': 'results'
    }
    
    words = query.split()
    corrected_words = [TYPO_MAP.get(w, w) for w in words]
    return " ".join(corrected_words)

def find_best_match(query: str, threshold: float = 0.2) -> Tuple[Dict, float, str]:
    """Find best matching answer using TF-IDF similarity with Critical Keyword Enforcement"""
    if TFIDF_MATRIX is None or not ALL_QUESTIONS:
        logger.warning("TF-IDF Matrix is None or Empty")
        return None, 0.0, ""

    try:
        # 1. Transform query to vector
        query_vec = vectorizer.transform([query])
        
        # 2. Calculate similarities against all questions
        similarities = cosine_similarity(query_vec, TFIDF_MATRIX).flatten()
        
        # 3. Get top ALL candidates (not just one) to check for context
        # Get indices of top 5 matches
        top_indices = np.argsort(similarities)[::-1][:5]
        
        # Define CRITICAL KEYWORDS that usually change the context entirely
        # If user says these, the answer MUST contain related terms
        critical_contexts = {
            'malpractice': ['malpractice', 'punishment', 'caught', 'cheating', 'mobile', 'copy'],
            'arrear': ['arrear', 'fail', 'supplementary', 'backlog'],
            'absent': ['absent', 'miss', 'sick', 'medical'],
            'fee': ['fee', 'payment', 'paid', 'fine'],
            'revaluation': ['revaluation', 'review', 'retotaling'],
            'transcript': ['transcript'],
            'duplicate': ['duplicate', 'lost'],
            'convocation': ['convocation', 'degree', 'rank', 'medal']
        }
        
        query_lower = query.lower()
        active_critical_context = None
        
        # Check if query has any critical keyword
        for context, keywords in critical_contexts.items():
            if any(k in query_lower for k in keywords):
                active_critical_context = keywords
                logger.info(f"Critical context detected: {context}")
                break
        
        best_match = None
        best_score = 0.0
        best_category = ""
        
        for idx in top_indices:
            score = float(similarities[idx])
            question_text = ALL_QUESTIONS[idx].lower()
            
            # Context Validation
            if active_critical_context:
                # If we are in a critical context, the candidate question MUST typically share some context
                # OR be very broadly relevant. 
                # We enforce that if the User said "malpractice", the Matched Question shouldn't be about "Result declaration" generic
                
                # Check if matched question contains at least one relevant keyword from the active context
                has_context = any(k in question_text for k in active_critical_context)
                
                if not has_context:
                    # Penalize heavily if context is missing
                    logger.info(f"Skipping match '{ALL_QUESTIONS[idx]}' (Score: {score}) - Missing critical context.")
                    continue
            
            if score > best_score:
                best_score = score
                best_match = ALL_ITEMS[idx]
                best_category = ALL_CATEGORIES[idx]
                
        # If we found a valid match after filtering
        if best_match and best_score >= threshold:
            logger.info(f"TF-IDF Match found: '{best_match.get('question')}' with score {best_score}")
            return best_match, best_score, best_category

        # --- FALLBACK: Strict Keyword Matching ---
        # If TF-IDF failed (often due to specific wording differences), try specific keyword scoring
        
        logger.info("Falling back to fuzzy keyword matching...")
        
        query_words = preprocess_query(query).split()
        stop = {'how', 'do', 'i', 'why', 'what', 'when', 'where', 'to', 'for', 'a', 'an', 'the', 'is', 'are', 'can', 'if', 'held', 'get', 'my', 'be', 'will'}
        
        best_fuzzy_match = None
        max_overlap_score = 0
        best_idx_cat = -1
        
        for idx, question in enumerate(ALL_QUESTIONS):
            question_lower = question.lower()
            
            # Check context again for fuzzy match
            if active_critical_context:
                has_context = any(k in question_lower for k in active_critical_context)
                if not has_context: continue

            # Keyword Overlap Logic
            q_keywords = [w for w in question_lower.split() if w not in stop and len(w) > 2]
            user_keywords = [w for w in query_words if w not in stop and len(w) > 2]
            
            if not q_keywords or not user_keywords: continue
            
            matches = 0
            for u_word in user_keywords:
                # Exact match or very close fuzzy match
                if u_word in q_keywords:
                    matches += 1.0
                else:
                     # Check for singular/plural or close fuzzy
                     close = difflib.get_close_matches(u_word, q_keywords, n=1, cutoff=0.70)
                     if close: matches += 0.8
            
            # Calculate a normalized score for this question (Matches / Total Question Keywords)
            # This favors shorter, specific questions that match well
            overlap_score = matches / (len(q_keywords) + 0.5) 
            
            if overlap_score > max_overlap_score:
                max_overlap_score = overlap_score
                best_fuzzy_match = ALL_ITEMS[idx]
                best_idx_cat = idx

        if best_fuzzy_match and max_overlap_score > 0.3: # Threshold for keyword fallback
             logger.info(f"Fuzzy Overlap Match: '{best_fuzzy_match['question']}' (Score: {max_overlap_score})")
             return best_fuzzy_match, 0.5, ALL_CATEGORIES[best_idx_cat]
             
        return None, 0.0, ""

    except Exception as e:
        logger.error(f"Error in find_best_match: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None, 0.0, ""

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
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
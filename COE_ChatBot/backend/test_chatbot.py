import requests
import json
import time

URL = "http://localhost:5000/api/chat"

# Comprehensive Test Suite
TEST_CASES = [
    # 1. Typos & fuzzy variations
    {"query": "How do I regstr?", "keyword": "registration", "desc": "Typo: 'regstr'"},
    {"query": "provisional certifcate", "keyword": "provisional", "desc": "Typo: 'certifcate'"},
    {"query": "exm fee", "keyword": "fee", "desc": "Abbr: 'exm'"},
    {"query": "transcripttt", "keyword": "transcripts", "desc": "Repeated chars"},
    
    # 2. Natural Language Questions
    {"query": "I lost my certificate, what do I do?", "keyword": "duplicate", "desc": "NL: Lost certificate"},
    {"query": "can i bring my phone?", "keyword": "mobile", "desc": "NL: Phone rule"},
    {"query": "when will results be out?", "keyword": "declared", "desc": "NL: Results timing"},
    {"query": "is attendance compulsory?", "keyword": "attendance", "desc": "NL: Attendance policy"},
    
    # 3. The "Malpractice" Edge Case (Greedy Match check)
    {"query": "when will i get my result if i was held up for malpractice", "keyword": "malpractice", "desc": "Edge: Malpractice + Held"},
    
    # 4. Ambiguous / Short Queries
    {"query": "results", "keyword": "results", "desc": "Short: 'results'"},
    {"query": "fees", "keyword": "fees", "desc": "Short: 'fees'"},
    {"query": "review", "keyword": "review", "desc": "Short: 'review'"},
    
    # 5. Stop Word Trap
    {"query": "how do i get it", "keyword": "sorry", "desc": "Trap: Stop words only (should fail gracefully)"} 
]

def run_tests():
    print(f"{'TEST DESCRIPTION':<40} | {'STATUS':<8} | {'RESPONSE SNIPPET'}")
    print("-" * 80)
    
    passes = 0
    fails = 0
    
    for test in TEST_CASES:
        payload = {"message": test["query"]}
        try:
            response = requests.post(URL, json=payload, headers={"Content-Type": "application/json"})
            data = response.json()
            answer = data.get("answer", "").lower()
             
            # Special case for "Trap" test - expect failure/apology
            if test["desc"].startswith("Trap"):
                success = "sorry" in answer or "apologize" in answer or "couldn't find" in answer
            else:
                success = test["keyword"] in answer
                
            status = "PASS" if success else "FAIL"
            if success:
                passes += 1
            else:
                fails += 1
                
            print(f"{test['desc']:<40} | {status:<8} | {answer[:30]}...")
            if not success:
                print(f"   [!] Expected keyword '{test['keyword']}' not found.")
                print(f"   [!] Actual Response: {answer}")
                
        except Exception as e:
            print(f"{test['desc']:<40} | ERROR    | {str(e)}")
            fails += 1
            
    print("-" * 80)
    print(f"Total Tests: {len(TEST_CASES)}")
    print(f"Passed: {passes}")
    print(f"Failed: {fails}")

if __name__ == "__main__":
    # Wait a sec for server to be fully ready if it just restarted
    time.sleep(1)
    run_tests()

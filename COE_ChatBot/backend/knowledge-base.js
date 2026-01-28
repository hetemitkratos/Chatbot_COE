// Knowledge Base for SRM COE Chatbot
const knowledgeBase = {
    // Examination Rules and Regulations
    examRules: {
        keywords: ['exam rules', 'examination rules', 'conduct', 'regulations', 'attendance', 'eligibility', 'exam policy'],
        content: {
            attendance: `**Attendance Requirements:**
• Students must achieve minimum attendance percentage as prescribed in respective regulations
• If a student doesn't appear for all courses during end semester examinations, they must submit an appeal to the Vice-Chancellor within two weeks with valid reasons (medical grounds)
• Attendance requirement must be satisfied for appearing in examinations`,

            enrollment: `**Course Enrollment:**
• Registration for examination is mandatory with prescribed fee for each course
• Only eligible students are permitted to complete course enrollment
• Course enrollment is done using ERP software through online by student or faculty advisor
• A copy of course enrollment must be submitted to office of COE signed by student, Faculty advisor/HOD and Head of Institution`,

            hallTickets: `**Hall Tickets:**
• Hall tickets are printed and distributed at least one week prior to examinations
• Can also be downloaded from student portal
• Students must bring Hall Ticket and Identity Card to all examinations
• Display them on desk throughout examination
• For non-possession of Hall Ticket, duplicate can be issued by collecting fine (for one session only)
• For lost hall ticket, approach COE office and pay necessary fee for duplicate`,

            examTiming: `**Examination Timing:**
• Students should be in examination hall at least half an hour before commencement
• Entry allowed only during first half an hour after commencement in rare situations
• Late students don't get extra time
• Students must remain seated until all answer scripts are collected`,

            prohibited: `**Prohibited Items:**
• Mobile phones, programmable calculators, electronic gadgets STRICTLY PROHIBITED
• Smart watches NOT allowed
• Any material notes pertaining to examination NOT allowed
• Hall superintendents should NOT collect and keep mobiles during examination`,

            answerScripts: `**Answer Scripts:**
• Use only bar-coded answer scripts issued in examination hall
• Write registration number, subject code, subject title and date properly
• Shade appropriate boxes/circles using BALL POINT PEN
• Do NOT write register number or name inside answer book
• Do NOT tear any pages from answer book
• Rough working may be done in last page and must be crossed out`
        }
    },

    // Malpractice and Punishments
    malpractice: {
        keywords: ['malpractice', 'punishment', 'cheating', 'unfair means', 'mobile phone', 'copying', 'expelled'],
        content: {
            mobilePhone: `**Mobile Phone Possession:**
• Particular examination will be CANCELLED
• Question of returning confiscated mobile/electronic gadget decided case by case
**Note:** This applies even if phone is switched off`,

            writingDetails: `**Writing Candidate's Name/Special Markings:**
• Writing name/register number in unauthorized spaces
• Any special marking, using color pencils/sketch pens/shades
• Tearing off or spoiling stationary
**Punishment:** Particular Subject will be CANCELLED`,

            materialPossession: `**Material Related to Examination:**
If material is RELEVANT to examination:
• ALL Examinations taken up in the session will be CANCELLED

If material is NOT relevant to examination:
• Particular subject will be CANCELLED

This includes: writings on desk, body parts, scale, calculator, handkerchief, hall ticket, electronic devices`,

            helping: `**Helping Others/Getting Help:**
• Writing on question paper or passing question paper/answer book to others
**Punishment:** Particular subject will be CANCELLED`,

            takingScript: `**Taking Away Answer Script:**
• ALL examinations taken up in the session will be CANCELLED`,

            manhandling: `**Manhandling/Injuring Examination Personnel:**
1. ALL examinations in session CANCELLED
2. Debarred for THREE YEARS`,

            impersonation: `**Impersonation:**
For students on roll:
1. ALL examinations in session CANCELLED
2. Debarred for THREE YEARS (both impersonator and beneficiary)

For past students/outsiders:
1. ALL examinations in session CANCELLED  
2. Debarred for THREE YEARS`,

            tampering: `**Tampering with Hall Tickets/Certificates:**
1. ALL examinations in session CANCELLED
2. Debarred for THREE YEARS`,

            additionalSheets: `**Insertion of Additional Sheets:**
• Insertion of additional sheets, graph sheets, drawing sheets
• Use of answer books not issued at examination hall
**Punishment:**
1. ALL examinations in session CANCELLED
2. Debarred for ONE YEAR`,

            destroying: `**Destroying Evidence:**
• Destroying or attempting to destroy evidence of malpractice
**Punishment:** ALL examinations in session CANCELLED`,

            repeat: `**Repeat Offender:**
• If malpractice case already exists and student indulges again
**Punishment:**
1. ALL examinations in session CANCELLED
2. Debarred for THREE YEARS`
        }
    },

    // Certificates and Transcripts
    certificates: {
        keywords: ['certificate', 'transcript', 'grade card', 'marksheet', 'provisional', 'degree', 'consolidated'],
        content: {
            onlineApplication: `**Online Certificate Application Process:**

**Step 1: Registration**
• Go to: https://evarsity.srmist.edu.in/esanad/
• Enter Register Number, DOB (DDMMYYYY) and Captcha
• Enter Mobile number and Email ID (one time registration)

**Step 2: Application**
• Select "e-SANAD Verification/Attestation" menu
• Select Application Type and Document Type
• Check Terms and Conditions

**Step 3: Payment**
• Fee: ₹500/- for Attestation (Per Application)
• Fee: ₹500/- for Verification (Per Application)
• Choose Payment Method
• Note down SRM TransID after successful payment`,

            transcriptProcess: `**Transcript Application:**
1. Enter number of sets required
2. Choose if you want transcripts in sealed envelope
3. Formula: (Sets required × 2) = Unsealed + Sealed per envelope
4. Select mode of collection:
   - Self Collection
   - Courier
   - Authorized Person
5. Upload required documents (.pdf only, max 3MB)
6. Agree to Terms and Conditions
7. Proceed to payment`,

            consolidatedGrade: `**Consolidated Grade Card:**
• Issued after successful completion of all prescribed courses
• Distributed through Head of Institution
• Available in student portal
• Can apply for duplicate if lost`,

            provisionalCertificate: `**Provisional Certificate:**
• Issued after successful completion of programme
• Valid until original degree is prepared
• Issued by Controller of Examinations
• Bears signature of COE
• Can be issued prior to convocation on request with fee`,

            degreeCertificate: `**Degree Certificate:**
• Issued during convocation
• Bears signatures of Vice Chancellor and Registrar
• For IN-ABSENTIA, sent by post with proper documentation
• Can be obtained prior to convocation by applying to COE with fee
• Requires permission from Registrar and Vice-Chancellor`,

            duplicateCertificates: `**Duplicate Certificates:**
Can apply for duplicate of:
• Mark sheets/Grade cards
• Consolidated grade card
• Consolidated mark sheets  
• Degree certificate

**Process:**
• Obtain application form
• Pay necessary fees
• Submit supporting documents (FIR copy if lost)
• Apply through proper channel`
        }
    },

    // Examination Procedures
    examProcedures: {
        keywords: ['exam procedure', 'how to', 'examination process', 'exam schedule', 'time table', 'results'],
        content: {
            timeTable: `**Examination Time Table:**
• Time table prepared by COE based on academic schedules
• Gets approval from Registrar and Vice-Chancellor
• Communicated to students at least 2 months prior to exams
• Available on University website: www.srmist.edu.in/controller-of-examinations/examination-time-tables/`,

            fees: `**Examination Fees:**
• Prescribed fee for each course appearing in mark sheet/grade sheet
• Fee dues raised online 6 weeks before exams
• Payment through student portal
• Late applications accepted with minimum fine
• No refund if:
  - Student fails to present for examination
  - Declared ineligible subsequently
  - Name withdrawn for non-payment of dues
  - Rusticated or expelled`,

            internalAssessment: `**Internal Assessment:**
• Marks collected from faculty through online transfer
• Also collected via OMR sheets for certain departments
• OMR sheets distributed 2 weeks prior to exams
• Duly filled sheets collected within a week from commencement
• Must satisfy passing minimum in IA (if prescribed) to appear in exam
• Improvement in IA marks permitted only if provision in regulations`,

            results: `**Result Declaration:**
• Results declared within 15 working days from last exam date
• Uploaded on university website
• Available for about 10 days from declaration
• Results passing board comprises Dean/Head as Chairman and senior Professors
• Grace marks up to 5 marks awarded for failures
• Moderation marks recommended by BOS Chairman (max 10% for tough papers)`,

            evaluation: `**Answer Script Evaluation:**
• Central valuation camp organized
• Senior faculty appointed as Camp Officers and Chief Examiners
• Answer keys collected and checked by Chief Examiners
• Maximum 50-60 answer scripts evaluated per faculty per day
• Coding and decoding done using OMR bar code reader under COE supervision
• Answer scripts stored for one year (two semesters)`
        }
    },

    // Review, Revaluation, Retotaling
    grievances: {
        keywords: ['review', 'revaluation', 'retotaling', 'grievance', 'rechecking', 'marks', 'score'],
        content: {
            reviewProcess: `**Review of Answer Scripts:**
• Apply within 7 days from result declaration
• Apply through: www.srmist.edu.in/controller-of-examinations/review-revaluation-retotalling/
• Or email: coe@srmist.edu.in
• Review dates fixed and intimated in advance
• Students and faculty who evaluated sit together
• If marks modified, faculty gives proper explanation
• Revised marks/grades declared if needed
• Results intimated through Head of Institution`,

            revaluation: `**Revaluation Process:**
• Apply within 7 days from result declaration  
• COE arranges for revaluation
• Examiners selected from approved panel (who haven't corrected previously)
• If revaluation mark differs by >10%, third examiner evaluates
• Average of nearest two marks taken as final
• Results within 10 working days from application
• NOT permitted for practical/clinical/viva voce examinations`,

            retotaling: `**Retotaling Process:**
• Apply within 7 days from result declaration
• COE arranges for retotaling
• Nominated person rechecks total marks
• If answer left uncorrected, COE arranges examiner for evaluation
• Results within 10 working days from application
• NOT permitted for practical/clinical/viva voce examinations`
        }
    },

    // Special Provisions
    specialProvisions: {
        keywords: ['special', 'disability', 'scribe', 'amanuensis', 'writer', 'extra time', 'medical'],
        content: {
            amanuensis: `**Amanuensis/Scribe Provision:**

**Eligibility:**
• Blind candidates
• Permanently disabled to write
• Temporarily disabled (fracture, dislocation)

**Requirements:**
• Medical certificate from Medical College Professor or Civil Surgeon
• Scribe must be lesser qualified than candidate
• For UG: Scribe max Higher Secondary level with <55% marks
• For PG: Scribe max UG level (not relevant discipline) with <55% marks
• For blind: Scribe one grade lower with <50% marks
• Scribe cannot be blood relative or from same faculty

**Extra Time:**
• Up to one hour extra time may be allowed for disabled persons
• One hour extra automatically allowed for blind persons

**Documents Required:**
• Original/Attested copy of degree certificate
• Identification card

**Not Permitted:**
• For practical courses`,

            medicalGrounds: `**Medical Grounds - Special Cases:**

**Contagious Diseases:**
• Students with chicken pox, mumps, Madras eye
• Isolated and allowed to take exams in separate hall
• Separate hall superintendent assigned

**Participation Exemptions:**
• Students eligible for regular exams but couldn't attend due to:
  - Sudden demise of father/mother/spouse/children
  - Met with accident  
  - National/international sports meet representing institution
  - National/international conference representing institution
• Can take exam in subsequent semester (considered first appearance)
• Eligible for ranks and medals`,

            dyslexia: `**Dyslexia/Physical Disability:**
• Students with Dyslexia or physical disability
• May be exempted from language papers
• Additional one hour for writing theory exam may be considered
• Must submit physical disability certificate through proper channel`
        }
    },

    // Supplementary Examinations
    supplementary: {
        keywords: ['supplementary', 'arrear', 'failed', 'backlog', 'semester back'],
        content: {
            finalSemester: `**Supplementary Examinations (Final Semester Only):**

**Applicability:**
• Only for final semester courses
• Only for UG programmes under:
  - Faculty of Engineering and Technology
  - Faculty of Science and Humanities  
  - Faculty of Management

**Schedule:**
• Conducted within 2 months from final semester result declaration
• Provides employment opportunities to students

**Not Available For:**
• Non-final semester courses
• Other faculties (unless specified in regulations)`
        }
    },

    // Migration and Documents
    migration: {
        keywords: ['migration', 'transfer', 'leaving', 'TC', 'transfer certificate'],
        content: {
            migrationCertificate: `**Migration Certificate:**

**When Required:**
• When student passes final/part of examination
• When leaving university mid-course

**Process:**
• Apply on prescribed form
• Pay prescribed fee
• For mid-course leaving: deposit fee for remaining course

**Issuance:**
• Issued by University as per guidelines
• Cannot be issued if dues pending`
        }
    },

    // Convocation
    convocation: {
        keywords: ['convocation', 'graduation', 'degree ceremony', 'medals', 'ranks'],
        content: {
            convocationProcess: `**Convocation:**

**Schedule:**
• Held annually
• Date notified by Registrar at least 3 weeks in advance
• Published in newspapers and university website

**Degree Conferment:**
• Degrees issued during convocation
• Can opt for IN-ABSENTIA (sent by post)
• Prior to convocation degree available on request with fee

**Academic Costumes:**
Different colored robes for different programmes

**Contact:**
Office of Controller of Examinations for convocation queries`,

            ranksAndMedals: `**Ranks and Medals:**

**Eligibility:**
• First Class or First Class with Distinction holders only
• Must complete courses in First Appearance for entire programme
• No detention or absence in any course
• No break of study during programme

**Distribution:**
• 1 rank (Gold Medal) for every 50 students or less
• 2 ranks (Gold & Silver) for 100 students  
• Maximum 3 ranks (Gold, Silver, Bronze) irrespective of strength

**Special Cases (Eligible for Medals):**
Students absent from regular exam due to:
• Sudden demise of father/mother/spouse/children
• Accident
• National/international sports meet
• National/international conference
(Permitted to take exam in subsequent semester as first appearance)

**Tie Cases:**
• If two or more students secure same percentage/CGPA
• ALL students get medals and ranks`
        }
    },

    // Contact Information
    contact: {
        keywords: ['contact', 'email', 'phone', 'address', 'reach', 'help'],
        content: {
            coeContact: `**Office of Controller of Examinations - Contact:**

**Address:**
SRM Institute of Science and Technology
14th Floor, University Building
SRM Nagar, Potheri – 603203
Chengalpattu District, Tamil Nadu

**Phone:**
+91-44-2741 7211
+91-44-2741 7225

**Email:**
• General Queries: coe@srmist.edu.in
• Certificate Verification: cv.coe@srmist.edu.in

**e-SANAD Support:**
Same as above

**Working Hours:**
Monday - Saturday (except public holidays)

**Website:**
www.srmist.edu.in/controller-of-examinations/`
        }
    },

    // Research and Patents
    research: {
        keywords: ['research', 'patent', 'publication', 'phd', 'scholar'],
        content: {
            patents: `**Patents at SRMIST:**

• SRMIST received National Intellectual Property Award 2018
• Category: "Top Indian Academic Institution for Patents & Commercialization"
• 833 patents filed and 784 published
• Patents filed across multiple departments
• Center for Intellectual Asset Protection (CIAP) manages IP

**For Patent Support:**
Contact CIAP through COE office`,

            research: `**Research at SRMIST:**

• 30,177 papers published by faculty (SCOPUS)
• 2,40,441 citations received
• Current H-index: 145
• 3,800+ research scholars pursuing doctoral programs
• Major funded projects from DST, DBT, DRDO, ICMR
• Annual research expenditure: ₹73.50 Crores

**Research Facilities:**
• Sir CV Raman Research Park
• High-Performance Computing facilities
• State-of-the-art laboratories
• Centre of Excellence in multiple domains`
        }
    },

    // Online Examination Guidelines
    onlineExam: {
        keywords: ['online exam', 'codetantra', 'remote exam', 'virtual exam', 'online test'],
        content: {
            onlineExamRules: `**Online End Semester Examination Guidelines:**

**Duration:**
• Extended from 90 minutes to 120 minutes
• For all programmes under Faculty of Engineering and Technology

**Navigation:**
• Navigation among questions enabled
• Can move forward or backward
• Can answer questions in any order
• "Jump to" feature available for quick navigation

**Answer Upload:**
• Do NOT use laptop camera for uploading answers
• Use mobile phone to scan and upload
• Do NOT click camera button in interface
• Use mobile camera to scan document
• Once uploaded in mobile, hit "SYNC" button in laptop
• Can preview or remove document before proceeding

**Finish Button:**
• Click FINISH after answering all questions
• FINISH button NOT enabled for first 30 minutes
• Enabled only after 30 minutes from commencement

**Technical Support:**
Contact COE for any technical issues during online exam`
        }
    }
};

// Search function to find relevant information
function searchKnowledge(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    let confidence = 0;

    // Search through all categories
    for (const [category, data] of Object.entries(knowledgeBase)) {
        // Check if query matches keywords
        const keywordMatch = data.keywords.some(keyword => 
            queryLower.includes(keyword.toLowerCase())
        );

        if (keywordMatch) {
            // If keywords match, search through content
            for (const [key, value] of Object.entries(data.content)) {
                // Check if any word in the query appears in the key or value
                const words = queryLower.split(' ');
                const relevanceScore = words.filter(word => 
                    word.length > 3 && (
                        key.toLowerCase().includes(word) || 
                        value.toLowerCase().includes(word)
                    )
                ).length;

                if (relevanceScore > 0) {
                    results.push({
                        category,
                        key,
                        content: value,
                        relevance: relevanceScore
                    });
                }
            }
            confidence += 20;
        }
    }

    // Sort results by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return {
        results: results.slice(0, 3), // Return top 3 results
        confidence: Math.min(confidence, 100)
    };
}

// Question patterns and direct responses
const quickResponses = {
    greeting: {
        patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
        responses: [
            "Hello! 👋 I'm here to help you with examination-related queries. What would you like to know?",
            "Hi there! 😊 Feel free to ask me anything about examinations, certificates, or policies.",
            "Hey! Welcome to SRM COE Assistant. How can I assist you today?"
        ]
    },
    thanks: {
        patterns: ['thank', 'thanks', 'appreciate'],
        responses: [
            "You're welcome! 😊 Feel free to ask if you have any more questions.",
            "Happy to help! Let me know if you need anything else.",
            "Glad I could assist! Don't hesitate to ask more questions."
        ]
    },
    bye: {
        patterns: ['bye', 'goodbye', 'see you', 'exit'],
        responses: [
            "Goodbye! 👋 Feel free to return whenever you have questions.",
            "See you! Hope I was helpful. Come back anytime!",
            "Take care! Remember, I'm here whenever you need assistance."
        ]
    }
};

// Function to check for quick responses
function checkQuickResponse(query) {
    const queryLower = query.toLowerCase();
    
    for (const [type, data] of Object.entries(quickResponses)) {
        for (const pattern of data.patterns) {
            if (queryLower.includes(pattern)) {
                return data.responses[Math.floor(Math.random() * data.responses.length)];
            }
        }
    }
    
    return null;
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { knowledgeBase, searchKnowledge, checkQuickResponse };
}
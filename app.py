from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re
import os

app = Flask(__name__)

# Allow CORS from your frontend's domain (both localhost and production)
CORS(app, resources={r"/*": {"origins": ["https://iitmrshv2-six.vercel.app", "http://localhost:3000"]}}, supports_credentials=True)
# Configure Gemini API
genai.configure(api_key=os.getenv("GENAI_API_KEY"))
model = genai.GenerativeModel("models/gemini-1.5-flash")

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    data = request.json
    topic = data.get("topic")

    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    try:
        prompt = f"""
        Generate 10 quiz questions about {topic}. 
        Each question should have a correct answer. 
        Format the response as a JSON array of objects, each with 'question' and 'correct_answer' keys.
        """
        
        response = model.generate_content(prompt)
        print("API Response:", response.text)

        clean_response_text = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", response.text.strip(), flags=re.MULTILINE)
        questions_and_answers = json.loads(clean_response_text)
        
        return jsonify({"questions_and_answers": questions_and_answers})
    except json.JSONDecodeError as jde:
        print(f"JSON decode error: {jde}")
        return jsonify({"error": "The response from the AI was not in JSON format"}), 500
    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({"error": "Failed to generate questions"}), 500

@app.route('/generate_feedback', methods=['POST'])
def generate_feedback():
    data = request.json
    quiz_content = data.get("quiz_content")

    if not quiz_content:
        return jsonify({"error": "No quiz content provided"}), 400

    try:
        quiz_data = json.loads(quiz_content)
        
        formatted_quiz = f"Topic: {quiz_data['topic']}\nQuestions and Answers:\n"
        for q, ua, ca in zip(quiz_data['questions'], quiz_data['user_answers'], quiz_data['correct_answers']):
            formatted_quiz += f"\nQ: {q}\nUser's Answer: {ua}\nCorrect Answer: {ca}\n"

        prompt = f"""
        Based on the following quiz results, provide feedback:
        {formatted_quiz}
        
        Format the response as a JSON object with the following structure:
        {{
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...],
            "recommendations": ["recommendation1", "recommendation2", ...],
            "performanceByTopic": [
                {{"subtopic": "subtopic1", "score": score1}},
                {{"subtopic": "subtopic2", "score": score2}},
                ...
            ],
            "overallScore": overall_score
        }}
        Ensure all scores are between 0 and 100.
        """
        
        response = model.generate_content(prompt)
        print("API Response (Feedback):", response.text)

        clean_response_text = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", response.text.strip(), flags=re.MULTILINE)
        feedback = json.loads(clean_response_text)
        
        return jsonify({"feedback": feedback})
    except json.JSONDecodeError as jde:
        print("JSON decode error in feedback response:", jde)
        return jsonify({"error": "The response from the AI was not in valid JSON format"}), 500
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return jsonify({"error": f"Failed to generate feedback: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    quiz_content = data.get("quiz_content")

    if not quiz_content:
        return jsonify({"error": "No quiz content provided"}), 400

    try:
        quiz_data = json.loads(quiz_content)
        
        formatted_quiz = f"Topic: {quiz_data['topic']}\nQuestions and Answers:\n"
        for q, ua, ca in zip(quiz_data['questions'], quiz_data['userAnswers'], quiz_data['correctAnswers']):
            formatted_quiz += f"\nQ: {q}\nUser's Answer: {ua}\nCorrect Answer: {ca}\n"

        prompt = f"""
        Based on the following quiz performance, predict the user's future performance:
        {formatted_quiz}
        
        Provide a prediction as a percentage (0-100) of how well the user is likely to perform in future quizzes on this topic.
        Also provide a detailed explanation of your prediction, including:
        1. Key strengths observed
        2. Areas for improvement
        3. Factors considered in the prediction
        4. Confidence level in the prediction

        Format the response as a JSON object with the following structure:
        {{
            "prediction": numeric_value,
            "explanation": "Detailed explanation here",
            "strengths": ["strength1", "strength2", ...],
            "areasForImprovement": ["area1", "area2", ...],
            "factorsConsidered": ["factor1", "factor2", ...],
            "confidenceLevel": "High/Medium/Low"
        }}
        """
        
        response = model.generate_content(prompt)
        print("API Response (Prediction):", response.text)

        clean_response_text = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", response.text.strip(), flags=re.MULTILINE)
        prediction_data = json.loads(clean_response_text)
        
        return jsonify(prediction_data)
    except json.JSONDecodeError as jde:
        print("JSON decode error in prediction response:", jde)
        return jsonify({"error": "The response from the AI was not in valid JSON format"}), 500
    except Exception as e:
        print(f"Error generating prediction: {e}")
        return jsonify({"error": f"Failed to generate prediction: {str(e)}"}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get("message")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = model.generate_content(message)
        print("API Response (Chat):", response.text)

        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"error": f"Failed to generate response: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

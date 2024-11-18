# Cache Memory Learning Assistant

Cache Memory Learning Assistant is an AI-powered platform designed to help users improve their knowledge and skills in various topics. It integrates interactive chat features, adaptive question generation, personalized feedback, and predictive analytics to enhance the learning experience.

---

## Features Overview

### 1. **Chat**
- **Description**: Engage in interactive conversations with AI for enhanced learning experiences.
- **Key Functionality**:
  - Users can type questions or statements.
  - The AI provides contextual responses to user queries.
- **Deployed Link**: [Start Chatting](https://iitmrshv2-six.vercel.app/chat)

---

### 2. **Question**
- **Description**: Test your knowledge with adaptive questions tailored to your learning progress.
- **Key Functionality**:
  - Input a topic of interest.
  - The system generates a quiz of 10 adaptive questions based on the selected topic.
  - The AI ensures questions are relevant to the user's inputs.
- **Deployed Link**: [Get Questions](https://iitmrshv2-six.vercel.app/question)

---

### 3. **Feedback**
- **Description**: Receive personalized feedback on your performance and areas for improvement.
- **Key Functionality**:
  - Displays strengths, weaknesses, and recommendations.
  - Users can review their performance subtopic-wise and overall score.
  - Includes interactive bar charts and pie charts for better data visualization.
  - Option to proceed to the Prediction Page for further insights.
- **Deployed Link**: [View Feedback](https://iitmrshv2-six.vercel.app/feedback)

---

### 4. **Prediction**
- **Description**: Get AI-powered predictions on your future performance based on your learning patterns.
- **Key Functionality**:
  - Predicts your score in future quizzes for the same topic.
  - Provides an explanation of the prediction, highlighting:
    - Strengths
    - Areas for improvement
    - Confidence level in the prediction
  - Factors considered in generating the prediction.
- **Deployed Link**: [See Predictions](https://iitmrshv2-six.vercel.app/prediction)

---

## Technical Details

### **Frontend**
- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: TailwindCSS with custom components for UI/UX.
- **Frontend Deployed Link**: [Frontend on Vercel](https://iitmrshv2-six.vercel.app/)

### **Backend**
- **Framework**: Flask (Python)
- **Endpoints**:
  1. **`/chat`**: Processes and responds to user queries.
  2. **`/generate_questions`**: Generates quiz questions for a given topic.
  3. **`/generate_feedback`**: Provides personalized feedback based on quiz results.
  4. **`/predict`**: Predicts future performance based on quiz answers.
- **Backend Deployed Link**: [Backend on Render](https://iitmrsh-2.onrender.com)

--

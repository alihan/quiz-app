const question = document.querySelector("#question");
const choices = Array.from(document.querySelectorAll(".choice-text"));
const progressText = document.querySelector("#progressText");
const scoreText = document.querySelector("#score");
const progressBarFull = document.querySelector("#progressBarFull");
const SCORE_POINTS = 100;
const MAX_QUESTIONS = 10;
let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];

function trim(str) {
  return JSON.stringify(str).replace(/(&quot\;|&#039;)/g, "'");
}

fetch("https://opentdb.com/api.php?amount=10&type=multiple")
  .then((response) => response.json())
  .then((data) => {
    questions = data.results.map((data) => {
      const formattedQuestion = {
        question: data.question,
      };
      const answerChoices = [...data.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        data.correct_answer
      );
      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });
      return formattedQuestion;
    });
    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

function startGame() {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
}

function getNewQuestion() {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("/end.html");
  }
  questionCounter++;
  progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = JSON.parse(trim(currentQuestion.question));

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
}

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;

    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    let classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
    if (classToApply === "correct") {
      incrementScore(SCORE_POINTS);
    }
    selectedChoice.parentElement.classList.add(classToApply);
    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

function incrementScore(num) {
  score += num;
  scoreText.innerText = score;
}

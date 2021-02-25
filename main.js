$(document).ready(function() {
  const quizTitle = $('#quiz-title');
  const quizDescription = $('#quiz-description');
  const answerResult = $('#answer-result');

  const questionTitle = $('#question-title');
  const questionForm = $('#question-form');
  const possibleAnswersList = $('#possible-answers-list');
  
  function equals(a, b) {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    return uniqueValues.size === a.length;
  }

  function getQuiz() {
    return fetch('http://proto.io/en/jobs/candidate-questions/quiz.json')
      .then(response => response.json())
  }

  function getScoreBasedMessages() {
    return fetch('http://proto.io/en/jobs/candidate-questions/result.json')
      .then(response => response.json())
  }

  function startQuiz(quizData) {
    const { title, description, questions } = quizData;
    const totalPoints = questions.reduce((acc, currentQuestion) => acc + currentQuestion.points, 0);

    quizTitle.html(title);
    quizDescription.html(description);

    let earnedPoints = 0;
    let currentQuestion = 0;

    function validate(correctAnswer, rewardPoints) {
      const userAnswer = $('input:checked').map((_index, item) => item.id);
      const successfulAnswer = equals(correctAnswer, userAnswer);

      if (successfulAnswer) {
        answerResult.css({ display: 'block' }).html('Correct');
        earnedPoints += rewardPoints;
      } else {
        answerResult.css({ display: 'block' }).html('Wrong');
        correctAnswer.map(aId => $(`li[id=${aId}]`).css({ backgroundColor: '#17eb3b' }));
      }

      setTimeout(() => {
        if (++currentQuestion >= questions.length) {
          const successPercentage = (100 / totalPoints) * earnedPoints;
          getScoreBasedMessages().then(data => renderResult(data.results, successPercentage));
        } else {
          renderQuestion(questions[currentQuestion])
        }
      }, 500);
      return false;
    }

    function renderTrueFalse(possibleAnswers, correctAnswer, rewardPoints) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer}><input type="radio" name="true-false" id=${possibleAnswer}>${possibleAnswer}</li>`);
      });
      questionForm.submit(() => validate(correctAnswer, rewardPoints));
    }

    function renderSingleChoice(possibleAnswers, correctAnswer, rewardPoints) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer.a_id}><input type="radio" name="single-choice" id=${possibleAnswer.a_id}>${possibleAnswer.caption}</li>`)
      });
      questionForm.submit(() => validate(correctAnswer, rewardPoints));
    }

    function renderMultipleChoice(possibleAnswers, correctAnswer, rewardPoints) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer.a_id}><input type="checkbox" id=${possibleAnswer.a_id}>${possibleAnswer.caption}</li>`)
      });
      questionForm.submit(() => validate(correctAnswer, rewardPoints));
    }

    function renderQuestion(questionData) {
      const {
        title,
        question_type,
        possible_answers,
        correct_answer,
        points,
      } = questionData;
      
      answerResult.css({ display: 'none' });
      possibleAnswersList.empty();
      questionForm.off('submit');
      
      questionTitle.html(title);
  
      switch(question_type) {
        case 'mutiplechoice-single': // TODO Fix typo
          renderSingleChoice(possible_answers, [correct_answer.toString()], points);
          break;
        case 'mutiplechoice-multiple': // TODO Fix typo
          renderMultipleChoice(possible_answers, correct_answer.map(a => a.toString()), points);
          break;
        case 'truefalse':
          renderTrueFalse([true, false], [correct_answer.toString()], points);
          break;
        default:
          console.log('Ta-Daaaa');
          break;
      }
    }

    function renderResult(scoreBasedResults, successPercentage) {
      console.log(scoreBasedResults.find(result => successPercentage > result.minpoints && successPercentage <= result.maxpoints));
    }

    renderQuestion(questions[currentQuestion]);
  }

  getQuiz().then(startQuiz);
})

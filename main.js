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

  function startQuiz(quizData) {
    const { title, description, questions } = quizData;
    quizTitle.html(title);
    quizDescription.html(description);

    let earnedPoints = 0;
    let currentQuestion = 0;

    function validate(correctAnswer, rewardPoints) {
      const userAnswer = $('input:checked').map((_index, item) => item.id);
      const successfulAnswer = equals(correctAnswer, userAnswer);
      answerResult.css({ display: 'block' });

      if (successfulAnswer) {
        earnedPoints += rewardPoints;
        answerResult.html('Correct');
        console.log(earnedPoints);
      } else {
        answerResult.html('Wrong');
        correctAnswer.map(aId => $(`li[id=${aId}]`).css({ backgroundColor: '#17eb3b' }));
      }
      setTimeout(() => renderQuestion(questions[++currentQuestion]), 3000);
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
        case 'mutiplechoice-single':
          renderSingleChoice(possible_answers, [correct_answer.toString()], points);
          break;
        case 'mutiplechoice-multiple':
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

    renderQuestion(questions[currentQuestion]);
  }

  getQuiz().then(startQuiz);
})

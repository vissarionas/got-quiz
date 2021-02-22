$(document).ready(function() {
  const quizTitle = $('#quiz-title');
  const quizDescription = $('#quiz-description');
  const answerResult = $('#answer-result');

  const questionTitle = $('#question-title');
  const questionForm = $('#question-form');
  const possibleAnswersList = $('#possible-answers-list');
  
  const equals = (a, b) => {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    return uniqueValues.size === a.length;
  };

  function startQuiz(questions) {
    let currentQuestion = 0;

    function validate(correctAnswer) {
      const userSelection = $('input:checked').map((_index, item) => item.id);
      const successfulAnswer = equals(correctAnswer, userSelection);

      answerResult.css({ display: 'block' });
      if (successfulAnswer) {
        answerResult.html('Correct');
      } else {
        answerResult.html('Wrong');
        correctAnswer.map(aId => $(`li[id=${aId}]`).css({ backgroundColor: '#17eb3b' }));
      }
      setTimeout(() => renderQuestion(++currentQuestion), 3000);
      return false;
    }

    function renderTrueFalse(possibleAnswers, correctAnswer) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer}><input type="radio" name="true-false" id=${possibleAnswer}>${possibleAnswer}</li>`);
      });
      questionForm.submit(() => validate(correctAnswer));
    }

    function renderSingleChoice(possibleAnswers, correctAnswer) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer.a_id}><input type="radio" name="single-choice" id=${possibleAnswer.a_id}>${possibleAnswer.caption}</li>`)
      });
      questionForm.submit(() => validate(correctAnswer));
    }

    function renderMultipleChoice(possibleAnswers, correctAnswer) {
      possibleAnswers.map((possibleAnswer) => {
        possibleAnswersList.append(`<li id=${possibleAnswer.a_id}><input type="checkbox" id=${possibleAnswer.a_id}>${possibleAnswer.caption}</li>`)
      });
      questionForm.submit(() => validate(correctAnswer));
    }

    function renderQuestion(questionIndex) {
      const {
        title,
        question_type,
        possible_answers,
        correct_answer,
      } = questions[questionIndex];
      
      answerResult.css({ display: 'none' });
      possibleAnswersList.empty();
      questionForm.off('submit');
      
      questionTitle.html(title);
  
      switch(question_type) {
        case 'mutiplechoice-single':
          renderSingleChoice(possible_answers, [correct_answer.toString()]);
          break;
        case 'mutiplechoice-multiple':
          renderMultipleChoice(possible_answers, correct_answer.map(a => a.toString()));
          break;
        case 'truefalse':
          renderTrueFalse([true, false], [correct_answer.toString()]);
          break;
        default:
          console.log('Ta-Daaaa');
          break;
      }
    }

    renderQuestion(currentQuestion);
  }

  fetch('http://proto.io/en/jobs/candidate-questions/quiz.json')
    .then(response => response.json())
    .then((data) => {
      const { title, description, questions } = data;
      quizTitle.html(title);
      quizDescription.html(description);
      startQuiz(questions);
    });
})

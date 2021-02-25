$(document).ready(function() {
  const quizTitle = $('#quiz-title');
  const quizDescription = $('#quiz-description');

  const main = $('main');
  
  function equals(a, b) {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    return uniqueValues.size === a.length;
  }

  function getQuiz() {
    return fetch('http://proto.io/en/jobs/candidate-questions/quiz.json')
      .then(response => response.json())
  }

  function getScoreBasedResults() {
    return fetch('http://proto.io/en/jobs/candidate-questions/result.json')
      .then(response => response.json())
  }

  function startQuiz(quizData) {
    const { title, description, questions } = quizData;
    quizTitle.html(title);
    quizDescription.html(description);

    const totalPoints = questions.reduce((acc, currentQuestion) => acc + currentQuestion.points, 0);
    let earnedPoints = 0;
    let currentQuestion = 0;

    function validate(correctAnswer, rewardPoints) {
      const userAnswer = $('input:checked').map((_index, item) => item.id);
      const successfulAnswer = equals(correctAnswer, userAnswer);

      if (successfulAnswer) {
        $('#answer-result').css({ display: 'block' }).html('Correct');
        earnedPoints += rewardPoints;
      } else {
        $('#answer-result').css({ display: 'block' }).html('Wrong');
        correctAnswer.map(aId => $(`li[id=${aId}]`).css({ backgroundColor: '#17eb3b' }));
      }

      setTimeout(() => {
        if (++currentQuestion >= questions.length) {
          const successPercentage = (100 / totalPoints) * earnedPoints;
          getScoreBasedResults().then(data => renderResult(data.results, successPercentage));
        } else {
          renderQuestion(questions[currentQuestion])
        }
      }, 500);
      return false;
    }

    function renderPossibleAnswers(questionData) {
      const {
        possible_answers,
        correct_answer,
        question_type,
        points,
      } = questionData;

      $('#possible-answers').empty();
      possible_answers.map((answer) => {
        $('#possible-answers').append(`<li id=${answer.a_id}><input type="${question_type === 'mutiplechoice-multiple' ? 'checkbox' : 'radio'}" name="${question_type}" id=${answer.a_id}>${answer.caption}</li>`);
      });
      $('#question-form').submit(() => validate(correct_answer, points));
    }

    function renderQuestion(questionData) {
      const normalizedQuestionData = {
        ...questionData,
        correct_answer: questionData.question_type === 'mutiplechoice-multiple'
          ? questionData.correct_answer.map(a => a.toString())
          : [questionData.correct_answer.toString()],
        possible_answers: questionData.possible_answers || [{ a_id: 'true', caption: 'True' }, { a_id: 'false', caption: 'False' }],
      }
      
      $('#answer-result').css({ display: 'none' });
      $('#question-form').off('submit');
      
      const questionDiv = $('<div></div>')
        .append(`<h3>${normalizedQuestionData.title}</h3>`)
        .append('<form id="question-form"><ul id="possible-answers"></ul><button type="submit">Next</button></form>')
        .append('<p id="answer-result"></p>');

      main.empty().append(questionDiv);
      renderPossibleAnswers(normalizedQuestionData);
    }

    function renderResult(scoreBasedResults, successPercentage) {
      const result = scoreBasedResults.find(result => successPercentage > result.minpoints && successPercentage <= result.maxpoints);
      const resultDiv = $('<div></div>')
        .append(`<p>${successPercentage}</p>`)
        .append(`<p>${result.message}</p>`);

      main.empty().append(resultDiv);
    }

    renderQuestion(questions[currentQuestion]);
  }

  getQuiz().then(startQuiz);
})

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
      }, 3000);
      return false;
    }

    function renderPossibleAnswers(questionData) {
      const {
        possible_answers,
        correct_answer,
        question_type,
        points,
      } = questionData;

      function toggleButtonEnablement() {
        const selectedInputs = $('input:checked');
        $('button:contains("Next")').prop('disabled', !selectedInputs.length);
      }

      $('#possible-answers').empty();

      possible_answers.map((answer) => {
        const answerListItem = $('<li>', { id: answer.a_id, class: 'answer-list-item' })
          .append($(`<label>${answer.caption}</label>`)
          .append($('<input>', {
            type: question_type === 'mutiplechoice-multiple' ? 'checkbox' : 'radio',
            name: question_type,
            id: answer.a_id,
          })).change(toggleButtonEnablement));
        $('#possible-answers').append(answerListItem);
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

      const title = $(`<h3>${normalizedQuestionData.title}</h3>`);
      const image = $('<img>', { src: normalizedQuestionData.img, alt: 'Question image' });
      const form = $('<form>', { id: 'question-form' })
        .append($('<ul>', { id: 'possible-answers' }))
        .append($('<button>', { type: 'submit', text: 'Next', disabled: true }));
      const result = $('<p>', { id: 'answer-result' });

      const questionDiv = $('<div>', { id: 'main-content' })
        .append(title)
        .append(image)
        .append(form)
        .append(result);

      main.empty().append(questionDiv);
      renderPossibleAnswers(normalizedQuestionData);
    }

    function renderResult(scoreBasedResults, successPercentage) {
      const result = scoreBasedResults.find(result => successPercentage > result.minpoints && successPercentage <= result.maxpoints);
      const resultDiv = $('<div>', { id: 'main-content' })
        .append(`<h1>${successPercentage}% Success</h1>`)
        .append(`<h2>${result.message}</h2>`);

      main.empty().append(resultDiv);
    }

    renderQuestion(questions[currentQuestion]);
  }

  getQuiz().then(startQuiz);
})

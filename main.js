$(document).ready(function() {
  const quizTitle = $('#quiz-title');
  const quizDescription = $('#quiz-description');

  const questionTitle = $('#question-title');
  const questionForm = $('#question-form');
  const possibleAnswers = $('#possible-answers');
  
  function startQuiz(questions) {
    let currentQuestion = 0;

    function renderQuestion(questionIndex) {
      possibleAnswers.empty();
      questionTitle.html(questions[questionIndex].title);
  
      switch(questions[questionIndex].question_type) {
        case 'mutiplechoice-single':
          questions[questionIndex].possible_answers.map((possibleAnswer) => {
            possibleAnswers.append(`<li><input type="checkbox" id=${possibleAnswer.a_id}/>${possibleAnswer.caption}</li>`)
          });
          break;
        case 'mutiplechoice-multiple':
          questions[questionIndex].possible_answers.map((possibleAnswer) => {
            possibleAnswers.append(`<li><input type="checkbox" id=${possibleAnswer.a_id}/>${possibleAnswer.caption}</li>`)
          });
          break;
        case 'truefalse':
          const form = possibleAnswers.append('<form></form>');
          ['true', 'false'].map(booleanValue => form.append(`<label>${booleanValue}</label><input type="radio" name="true-false" id=${booleanValue}/>`))
          break;
        default:
          break;
      }
    }

    renderQuestion(currentQuestion);
    
    function handleSubmit() {
      renderQuestion(++currentQuestion)
      return false;
    }
    
    questionForm.submit(handleSubmit);
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

import React, { Component } from 'react';
import Answer from './Answer.jsx';
import axios from 'axios';
import NewAnswer from './NewAnswer.jsx';
import _ from 'lodash';
import $ from 'jquery';
const api = 'http://52.26.193.201:3000/qa';

class Question extends Component {
    constructor(props) {
        super(props);
        const answers = Object.values(this.props.question.answers);
        //add an answer_id property to be consistent with subsequent calls to the answers endpoint
        answers.forEach(answer => answer.answer_id = answer.id);
        this.state = {
            answers: answers,
            showAllAnswers: false,
            showPopup: false,
            helpfulness: this.props.question.question_helpfulness
        }
        this.showMoreOrLess = this.showMoreOrLess.bind(this);
        this.isHelpful = this.isHelpful.bind(this);
        this.refreshAnswers = this.refreshAnswers.bind(this);
    }

    componentDidUpdate (prevProps) {
        if (!_.isEqual(this.props.question.answers, prevProps.question.answers)) {
            const answers = Object.values(this.props.question.answers);
            answers.forEach(answer => answer.answer_id = answer.id);
            this.setState({answers: answers});
        }
    }

    renderAnswers() {
        let activeAnswers;
        if (this.state.showAllAnswers === false) {
            activeAnswers = this.sortAnswers(this.state.answers).slice(0, 2);
        } else {
            activeAnswers = this.sortAnswers(this.state.answers);
        }
        return activeAnswers.map(answer => {
            return (
                <Answer
                    key={answer.answer_id}
                    answer={answer}/>
            )
        });
    }

    showMoreOrLess() {
        this.setState({ showAllAnswers: !this.state.showAllAnswers });
    }

    isHelpful(e) {  //Mostly working but there is a weird bug like 10% of the time where the put req doesn't send 
        const { question_id } = this.props.question;
        axios.put(`${api}/question/${question_id}/helpful`)
            .then(() => {
                this.setState({helpfulness: this.state.helpfulness + 1});
            });
        //clear onClick listener
        e.target.classList.remove('clickable');
        this.isHelpful = () => {};
    }

    sortAnswers(answers) { //There is probably a better way to do this...
        const sellerQs = answers.filter(answer => answer.answerer_name === 'Seller')
            .sort((a, b) => b.helpfulness - a.helpfulness);
        const nonSellerQs = answers.filter(answer => answer.answerer_name !== 'Seller')
            .sort((a, b) => b.helpfulness - a.helpfulness);
        return sellerQs.concat(nonSellerQs);
    }

    togglePopup(e, data) {
        this.setState({ showPopup: !this.state.showPopup }, () => {
            if (this.state.showPopup) {
                $(document).on('keydown', (e) => {
                    if (e.key === 'Escape') {
                        $(document).off('keydown');
                        this.togglePopup();
                    }
                })
            }
        }); 
        if (data) {
            const { question_id } = this.props.question;
            axios.post(`${api}/${question_id}/answers`, data)
                .then((res) => {
                    this.refreshAnswers(this.state.answers.length + 1);
                    alert('Thanks for your answer!');
                })
        }
    }

    refreshAnswers(answerCount = this.state.answers.length) {
        const { question_id } = this.props.question;
        const pages = Math.ceil(answerCount / 5);
        let currentPage = 0;
        let promises = [];
        while (currentPage < pages) {
            currentPage++;
            promises.push(fetch(`${api}/${question_id}/answers?page=${currentPage}`)
                .then(res => res.json())
            );
        }
        Promise.all(promises)
            .then((newAnswers) => {
                this.setState({ answers: newAnswers.reduce((acc, val) => acc.concat(val.results), []) });
            });
    }

    render() {
        const question = this.props.question;
        return (
            <div className="question" data-selector={`question ${question.question_id}`} data-testid="question">
                <div className="q-main">
                    <p className="text-main bold">Q: {question.question_body}
                    <span className="highlight">{question.body_match}</span>
                    {question.body_tail}
                </p>
                    <div className="text-sub">
                        <span data-selector={`question ${question.question_id} helpful`}>Helpful? <span className="clickable" onClick={this.isHelpful}  data-testid="helpful">Yes</span> ({this.state.helpfulness})</span>
                        <span className="divider-bar">|</span>
                        <span className="clickable" onClick={this.togglePopup.bind(this)} data-selector={`question ${question.question_id} add answer`}>Add Answer</span>
                    </div>
                </div>
                {this.state.showPopup && <NewAnswer togglePopup={this.togglePopup.bind(this)} />}
                {this.state.answers.length > 0 &&
                    <div>
                        {this.renderAnswers()}
                        {this.state.answers.length <= 2 ? null :
                            <div className="text-reg load-more" onClick={this.showMoreOrLess} data-selector={`question ${question.question_id} show all answers`} data-testid="loadMore">
                                {!this.state.showAllAnswers && 'LOAD MORE ANSWERS'}
                                {this.state.showAllAnswers && 'SHOW LESS'}
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}

export default Question;
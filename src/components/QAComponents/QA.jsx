import React, { Component } from 'react';
import Question from './Question.jsx';
import NewQuestion from './NewQuestion.jsx';
import axios from 'axios';
import $ from 'jquery';
import _ from 'lodash';
const api = 'http://52.26.193.201:3000/qa';

class QA extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            questions: [],
            activeQuestions: [],
            currentPage: 0,
            moreToLoad: true,
            loadingQuestions: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.fetchQuestions = this.fetchQuestions.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.togglePopup = this.togglePopup.bind(this);
        this.refresh = this.refresh.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.highlightText = this.highlightText.bind(this);
    }

    fetchQuestions(page, cb = () => { }) {
        fetch(`${api}/${this.props.productId}?count=4&page=${page + 1}`)
            .then((res) => {
                res.json().then((data) => {
                    this.setState({
                        questions: this.state.questions.concat(data.results),
                        currentPage: page + 1,
                        moreToLoad: data.results.length > 0
                    }, () => {
                        cb()
                    });
                })
            });
    }

    componentDidMount() {
        this.scrollHandler();
        this.fetchQuestions(this.state.currentPage, () => {
            this.setState({ activeQuestions: this.state.questions }); //initialize active questions to all questions
        });
    }

    componentDidUpdate(prevProps) {
        //clear scroll listener when all questions loaded
        if (this.state.moreToLoad === false) {
            $('.questions-container').off('scroll');
        }
        if (this.props.productId !== prevProps.productId) {
            $('.questions-container').off('scroll');
            this.scrollHandler();
            this.setState({ questions: [] }, () => {
                this.fetchQuestions(0, () => {
                    this.setState({ activeQuestions: this.state.questions, searchTerm: '' }); //initialize active questions to all questions
                });
            })
        }
    }


    handleChange(e) {
        this.setState({ searchTerm: e.target.value }, () => {
            if (this.state.searchTerm.length > 2) {
                this.applyFilter()
            } else if (!_.isEqual(this.state.questions, this.state.activeQuestions)) {
                this.setState({ activeQuestions: this.state.questions });
            }
        });
    }

    applyFilter() {
        const searchTerm = this.state.searchTerm.length > 2 ? this.state.searchTerm.toLowerCase() : '';
        let filteredQs = this.state.questions.filter(question => {
            return question.question_body.toLowerCase().includes(searchTerm) ? true :
                Object.values(question.answers).some(answer => answer.body.toLowerCase().includes(searchTerm));
        }).map(question => {
            let newQ = _.cloneDeep(question);
            if (newQ.question_body.toLowerCase().includes(searchTerm)) {
                this.highlightText(newQ);
            } 
            for (let answer in newQ.answers) {
                if (newQ.answers[answer].body.toLowerCase().includes(searchTerm)) {
                    this.highlightText(newQ.answers[answer]);
                }
            }
            return newQ;
        });
        this.setState({ activeQuestions: this.sortByHelpfulness(filteredQs) });
    }

    highlightText(item) {
        const searchTerm = this.state.searchTerm.toLowerCase();
        const body = item.body || item.question_body;
        const start = body.toLowerCase().indexOf(searchTerm);
        const end = searchTerm.length;
        item.body_match = body.substr(start, end);
        item.body_tail = body.substr(start + end);
        if (item.body) {
            item.body = body.substr(0, start);
        } else {
            item.question_body = body.substr(0, start);
        }
    }

    refresh() {
        this.setState({
            questions: [],
            activeQuestions: []
        }, () => {
            const { currentPage } = this.state;
            let tempPage = 0;
            while (tempPage < currentPage) {
                this.fetchQuestions(tempPage, this.applyFilter); //using Promise.all here might be more performant...
                tempPage++;
            }
        });
    }

    sortByHelpfulness(questionArr) {
        return questionArr.sort((a, b) => b.question_helpfulness - a.question_helpfulness);
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
            axios.post(`${api}/${this.props.productId}`, data)
                .then((res) => {
                    this.setState({
                        showUserQuestion: true,
                        userQuestion: data.body
                    }, this.refresh)
                })
        }
    }

    scrollHandler() {
        const { loadMore } = this;
        const boundSetState = this.setState.bind(this);
        $('.questions-container').on('scroll', function(e) {
            if($(this).scrollTop() + $(this).innerHeight() > $(this)[0].scrollHeight - 1) {
                loadMore();
                boundSetState({loadingQuestions: true});
                //force a 100ms delay between fetches so that the same data isn't rendered twice
                setTimeout(() => boundSetState({loadingQuestions: false}), 100);
            }
        });
    }

    loadMore() {
        if(this.state.loadingQuestions === false){
            this.fetchQuestions(this.state.currentPage, this.applyFilter);
        }
    }

    render() {
        return (
            <div data-widget={`Q&A-${this.props.productId}`}>
                <p className="text-main" data-selector="qa-title">QUESTIONS & ANSWERS</p>
                {!!this.state.questions.length && 
                    <form className="searchQuestions" data-selector="qa-search">
                        <input type="text"
                            className="q-search"
                            placeholder="HAVE A QUESTION? SEARCH FOR ANSWERS."
                            value={this.state.searchTerm}
                            onChange={this.handleChange}
                        />
                    </form>
                }
                {this.state.showUserQuestion &&
                    <div className="text-reg" data-selector="question-added-confirmation">
                        <p>Thanks for adding a question!</p>
                        <p>You asked: "{this.state.userQuestion}"</p>
                    </div>}
                <div className="questions-container">
                    {this.state.activeQuestions.map((question) => <Question
                        question={question}
                        key={question.question_id}
                        updateParent={this.refresh.bind(this)} />)}
                    {!this.state.questions.length && 
                        <p className="text-reg" data-selector="no-questions">Be the first to ask a question about this product!</p>
                    }
                </div>
                <button onClick={this.togglePopup} data-selector="new-question">ASK A QUESTION +</button>
                {this.state.showPopup && <NewQuestion togglePopup={this.togglePopup} />}
            </div>
        )
    }
}

export default QA;
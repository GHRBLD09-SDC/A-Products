import React from 'react'
import ReviewList from './ReviewList.jsx'
import Ratings from './Ratings.jsx';
import NewReview from './NewReview.jsx'
const url = 'http://52.26.193.201:3000/reviews/';

class Reviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      more: false,
      reviews: [],
      meta: {},
      page: 1,
      sort: 'helpful',
      charsLeft: 50,
      starFilters: [],
      currentRating: 0,
      search: ''
    };

    this.updateState = this.updateState.bind(this);
    this.markHelpful = this.markHelpful.bind(this);
    this.force = this.force.bind(this);
    this.submitReview = this.submitReview.bind(this);
  }

  getReviews() {
    fetch(url + this.props.productInfo.id + `/list?page=${this.state.page}&sort=${this.state.sort}`)
      .then((response) => {
        // console.log(this.state);
        return response.json();
      })
      .then((result) => {
        if (!this.state.reviews.length) {
          this.setState({
            reviews: result.results
          }, () => { console.log('this.state.reviews', this.state.reviews)} );
        } else if (JSON.stringify(this.state.reviews) !== JSON.stringify(result.results)) {
          this.setState({
            reviews: this.state.reviews.concat(result.results)
          }, () => {
            // console.log('Reviews retrieved and state updated successfully!');
          })
        }
      })
      .catch((err) => {
        console.error(err);
      })
  }

  getMeta() {
    fetch(url + this.props.productInfo.id + `/meta`)
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        this.setState({
          meta: result
        }, () => {
        })
      })
      .catch((err) => {
        console.error(err);
      })
  }

  markHelpful(rid) {
    fetch(url + 'helpful/' + rid, {
      method: 'PUT'
    })
    .then(() => {
      this.forceUpdate();
      // console.log('refresh')
    })
    .catch((err) => {
      console.error(err);
    })
  }

  reportReview(rid) {
    fetch(url + 'report/' + rid, {
      method: 'PUT'
    })
    .then(() => {
      // console.log('reported, refresh and this review should be gone')
    })
    .catch((err) => {
      console.error(err);
    })
  }

  submitReview(review) {
    fetch(url + this.props.productInfo.id, {
      method: 'POST',
      body: JSON.stringify(review),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      this.getMeta();
      // console.log('New review added', response.status)
    })
    .catch((err) => {
      console.error(err);
    })
  }

  force() {
    this.forceUpdate();
    // console.log('updated');
  }

  updateState(obj, update) {
    this.setState(obj, () => {
      if (update) {
        this.getReviews();
      }
    });
  }

  componentDidMount() {
    this.getReviews();
    this.getMeta();
  }

  componentDidUpdate(prevProps) {
    if (this.props.productInfo.id !== prevProps.productInfo.id) {
      this.setState({
        reviews: [],
        meta: {},
        more: false
      }, () => {
        this.getReviews();
        this.getMeta();
        this.render();
      })
    }
  }

  render() {
    return (this.state.meta.hasOwnProperty('characteristics') ? this.renderReviews() : (
      <div>Loading Ratings & Reviews...</div>
    ));
  }

  renderReviews() {
    return (
      <div id='reviews' data-widget={'reviews' + this.props.productInfo.id}>
        <Ratings state={this.state}
        update={this.updateState}/>
        <ReviewList state={this.state} 
        update={this.updateState} 
        helpful={this.markHelpful} 
        report={this.reportReview} 
        total={this.state.meta.recommended['0'] && this.state.meta.recommended['1'] ? this.state.meta.recommended['0'] + this.state.meta.recommended['1'] : (this.state.meta.recommended['0'] ? this.state.meta.recommended['0'] : (this.state.meta.recommended['1'] ? this.state.meta.recommended['1'] : 0))}/>
        <NewReview state={this.state}
        update={this.updateState}
        pname={this.props.productInfo.name} 
        force={this.force} 
        submit={this.submitReview} />
      </div>
    )
  }
}

export default Reviews;
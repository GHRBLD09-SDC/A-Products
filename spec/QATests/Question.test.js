import React from 'react';
import Question from '../../src/components/QAComponents/Question';
import data from './SampleData';
import renderer from 'react-test-renderer';
import { render, fireEvent, wait } from '@testing-library/react';
import axios from 'axios';

const sampleQ = data.questions.results[0];

describe('Question Component', () => {
    it('Loads two answers upon initial render', () => {
        const { getAllByTestId } = render(<Question question={sampleQ} />);
        const answers = getAllByTestId('answer');
        expect(answers.length).toBe(2);
    });

    it('Loads additional questions when the \'Load More\' button is clicked', () => {
        const { getAllByTestId, getByTestId } = render(<Question question={sampleQ} />);
        const loadMoreButton = getByTestId('loadMore')
        fireEvent.click(loadMoreButton);
        const answers = getAllByTestId('answer');
        expect(answers.length).toBe(3);
    });

    //this works sometimes idk
    xit('Sends a PUT request when the \'helpful\' button is clicked', async () => {
        let initialHelpfulness;
        await axios.get('http://52.26.193.201:3000/qa/5/?page=1?count=4')
            .then(res => {
                initialHelpfulness = res.data.results[0].question_helpfulness;
                console.log('initially',initialHelpfulness);
            })
            .then(() => {
                const { getByTestId } = render(<Question question={sampleQ} />);
                const helpfulButton = getByTestId('helpful');
                fireEvent.click(helpfulButton);
            })
            .then(setTimeout(() => {
                axios.get('http://52.26.193.201:3000/qa/5/?page=1?count=4')
                .then(res => {
                    const finalHelpfulness = res.data.results[0].question_helpfulness;
                    console.log(`initial: ${initialHelpfulness}, final: ${finalHelpfulness}`);
                    expect(finalHelpfulness).toBe(initialHelpfulness + 1);
                })
            }), 2000)

            // .then(() => {
            //     return axios.get('http://52.26.193.201:3000/qa/5/?page=1?count=4')})
            // .then(res => {
            //     const finalHelpfulness = res.data.results[0].question_helpfulness;
            //     console.log(`initial: ${initialHelpfulness}, final: ${finalHelpfulness}`);
            //     expect(finalHelpfulness).toBe(initialHelpfulness + 1);
            // })
    })
})
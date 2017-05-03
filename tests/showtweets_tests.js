const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const nock = require('nock');

const tweetMessages =
[
    {
        "created_at": "2017-04-25T15:09:10.609Z",
        "text": "���� ������^^"
    },
    {
        "created_at": "2016-04-25T15:09:10.609Z",
        "text": "Hello, world!"
    }
]


describe('showTweets', () =>
{
	afterEach(() =>
	{
		nock.cleanAll();
		console.log.restore();
		console.error.restore();
	});
	
	describe('Positive tests', () =>
	{
		it('������ �������� ����� �� �������', done =>
		{
			const log = sinon.stub(console, 'log');
			const error = sinon.stub(console, 'error');
			nock ('https://api.twitter.com')
			.get('/1.1/search/tweets.json?q=%23urfu-testing-2016')
			.reply(200, tweetMessages);
			const formatDate = sinon.stub();
			formatDate.withArgs(tweetMessages[0].created_at).returns('25 ������ � 15:09');
			formatDate.withArgs(tweetMessages[1].created_at).returns('25 ����� 2016 ���� � 15:09');
			formatDate.throws('Invalid arguments');
			const showTweets = proxyquire('../showTweets', {
				'./formatDate': formatDate});
			showTweets(() =>
            {
                assert(log.calledWith('25 ������ � 15:09'));
                assert(log.calledWith('���� ������ ��� ��������^^'));
                assert(log.calledWith('25 ����� 2016 ���� � 15:09'));
                assert(log.calledWith('Hello, world!'));
                assert(!error.called);
                done();
            });
		});
	});
	describe('Negative tests', () => 
	{
		it('������ ��������� ������, ���� ��� ������ != 200', done =>
		{
			const log = sinon.stub(console, 'log');
			const error = sinon.stub(console, 'error');
			nock ('https://api.twitter.com')
			.get('/1.1/search/tweets.json?q=%23urfu-testing-2016')
			.reply(500, 'Internal server error');
			const showTweets = require('../showTweets');
			showTweets(() =>
			{
				assert(!log.called);
				assert(error.calledOnce);
				done();
			});
		});
		it('������ ��������� ������, ���� �������� ���������� ����', done =>
		{
			const log = sinon.stub(console, 'log');
			const error = sinon.stub(console, 'error');
			const InvalidBody = '����� ������ ����������';
			nock ('https://api.twitter.com')
			.get('/1.1/search/tweets.json?q=%23urfu-testing-2016')
			.reply(200, InvalidBody);
			const showTweets = require('../showTweets');
			showTweets(() =>
			{
				assert(!log.called);
				assert(error.calledOnce);
				done();
			});
		});
		it('������ ��������� ������, ���� ������ ��� � �������', done =>
		{
			const log = sinon.stub(console, 'log');
			const error = sinon.stub(console, 'error');
			nock ('https://api.twitter.com')
			.get('/1.1/search/tweets.json?q=%23urfu-testing-2016')
			.replyWithError('������ ����� ������ ��');
			const showTweets = require('../showTweets');
			showTweets(() =>
			{
				assert(!log.called);
				assert(error.calledOnce);
				done();
			});
		});
		
	});
})






















import { expect } from 'chai';
import sinon from 'sinon';
import reviewService from '../src/services/review.service.js';
import reviewRepository from '../src/repositories/review.repository.js';
import Book from '../src/entities/book.entity.js';

describe('ReviewService', () => {

    // ============================================
    // createReview()
    // ============================================
    describe('createReview()', () => {
        afterEach(() => sinon.restore());

        it('throws if rating is invalid (less than 1)', async () => { 
            try {
                await reviewService.createReview('user-1', 'book-1', 0, 'comment'); 
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Rating must be between 1 and 5'); 
            }
        });

        it('throws if rating is invalid (greater than 5)', async () => {
            try {
                await reviewService.createReview('user-1', 'book-1', 6, 'comment');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Rating must be between 1 and 5'); 
            }
        });

        it('throws if book not found', async () => {
            sinon.stub(Book, 'findByPk').resolves(null);

            try {
                await reviewService.createReview('user-1', 'book-1', 4, 'comment');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book not found');
            }
        });

        it('throws if book is not visible', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                isActive: false,
                addedById: 'user-2'
            });

            try {
                await reviewService.createReview('user-1', 'book-1', 4, 'comment');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book is not available');
            }
        });

        it('throws if user tries to review their own book', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                isActive: true,
                addedById: 'user-1'
            });

            try {
                await reviewService.createReview('user-1', 'book-1', 4, 'comment');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('You cannot review your own book');
            }
        });

        it('throws if user already reviewed this book', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                isActive: true,
                addedById: 'user-2'
            });

            sinon.stub(reviewRepository, 'createReview').rejects(new Error('You already reviewed this book'));

            try {
                await reviewService.createReview('user-1', 'book-1', 4, 'comment');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('You already reviewed this book');
            }
        });

        it('creates review successfully', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                isActive: true,
                addedById: 'user-2'
            });

            sinon.stub(reviewRepository, 'createReview').resolves({
                id: 'review-1',
                userId: 'user-1',
                bookId: 'book-1',
                rating: 4.5,
                comment: 'Great book!'
            });

            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 4.5,
                totalReviews: 1
            });

            sinon.stub(Book, 'update').resolves([1]);

            const review = await reviewService.createReview('user-1', 'book-1', 4.5, 'Great book!');

            expect(review.rating).to.equal(4.5);
            expect(review.comment).to.equal('Great book!');
        });
    });

    // ============================================
    // updateReview()
    // ============================================
    describe('updateReview()', () => {
        afterEach(() => sinon.restore());

        it('throws if review not found', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves(null);

            try {
                await reviewService.updateReview('review-1', 'user-1', { rating: 5 });
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Review not found');
            }
        });

        it('throws if user is not the author', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-2',
                bookId: 'book-1',
                rating: 4
            });

            try {
                await reviewService.updateReview('review-1', 'user-1', { rating: 5 });
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('You are not authorized to update this review');
            }
        });

        it('throws if new rating is invalid', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-1',
                bookId: 'book-1',
                rating: 4
            });

            try {
                await reviewService.updateReview('review-1', 'user-1', { rating: 10 });
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Rating must be between 1 and 5');
            }
        });

        it('updates review successfully', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-1',
                bookId: 'book-1',
                rating: 4
            });

            sinon.stub(reviewRepository, 'updateReview').resolves({
                id: 'review-1',
                userId: 'user-1',
                bookId: 'book-1',
                rating: 5,
                comment: 'Updated comment'
            });

            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 4.8,
                totalReviews: 5
            });

            sinon.stub(Book, 'update').resolves([1]);

            const review = await reviewService.updateReview('review-1', 'user-1', { 
                rating: 5, 
                comment: 'Updated comment' 
            });

            expect(review.rating).to.equal(5);
            expect(review.comment).to.equal('Updated comment');
        });
    });

    // ============================================
    // deleteReview()
    // ============================================
    describe('deleteReview()', () => {
        afterEach(() => sinon.restore());

        it('throws if review not found', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves(null);

            try {
                await reviewService.deleteReview('review-1', 'user-1', false);
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Review not found');
            }
        });

        it('throws if user is not the author and not admin', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-2',
                bookId: 'book-1'
            });

            try {
                await reviewService.deleteReview('review-1', 'user-1', false);
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('You are not authorized to delete this review');
            }
        });

        it('allows admin to delete any review', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-2',
                bookId: 'book-1'
            });

            sinon.stub(reviewRepository, 'deleteReview').resolves(1);

            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 0,
                totalReviews: 0
            });

            sinon.stub(Book, 'update').resolves([1]);

            const result = await reviewService.deleteReview('review-1', 'user-1', true);

            expect(result.message).to.equal('Review deleted successfully');
            expect(result.reviewId).to.equal('review-1');
        });

        it('allows author to delete their own review', async () => {
            sinon.stub(reviewRepository, 'getReviewById').resolves({
                id: 'review-1',
                userId: 'user-1',
                bookId: 'book-1'
            });

            sinon.stub(reviewRepository, 'deleteReview').resolves(true); 

            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 0,
                totalReviews: 0
            });

            const updateStub = sinon.stub(Book, 'update').resolves([1]);

            const result = await reviewService.deleteReview('review-1', 'user-1', false);

            expect(result.message).to.equal('Review deleted successfully');
            expect(result.reviewId).to.equal('review-1'); 
            expect(updateStub.calledOnce).to.be.true; 
        });
    });

    // ============================================
    // getBookReviews()
    // ============================================
    describe('getBookReviews()', () => {
        afterEach(() => sinon.restore());

        it('throws if book not found', async () => {
            sinon.stub(Book, 'findByPk').resolves(null);

            try {
                await reviewService.getBookReviews('book-1', { limit: 10, offset: 0 });
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book not found');
            }
        });

        it('returns book reviews successfully', async () => {
            sinon.stub(Book, 'findByPk').resolves({ id: 'book-1' });

            sinon.stub(reviewRepository, 'getBookReviews').resolves({
                rows: [
                    { id: 'review-1', rating: 4, comment: 'Good' },
                    { id: 'review-2', rating: 5, comment: 'Excellent' }
                ],
                count: 2
            });

            const result = await reviewService.getBookReviews('book-1', { limit: 10, offset: 0 });

            expect(result.reviews).to.have.lengthOf(2);
            expect(result.total).to.equal(2);
            expect(result.page).to.equal(1);
        });
    });
    // ============================================
    // recalculateBookRating()
    // ============================================
    describe('recalculateBookRating()', () => {
        afterEach(() => sinon.restore());

        it('should recalculate and update book average rating', async () => {
            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 4.3,
                totalReviews: 10
            });

            const updateStub = sinon.stub(Book, 'update').resolves([1]);

            const result = await reviewService.recalculateBookRating('book-1');

            expect(result.averageRating).to.equal(4.3);
            expect(result.totalReviews).to.equal(10);
            
            expect(updateStub.calledOnce).to.be.true;
            expect(updateStub.firstCall.args[0]).to.deep.equal({ averageRating: 4.3 });
        });

        it('should handle zero reviews correctly', async () => {
            sinon.stub(reviewRepository, 'calculateAverageRating').resolves({
                averageRating: 0,
                totalReviews: 0
            });

            const updateStub = sinon.stub(Book, 'update').resolves([1]);

            const result = await reviewService.recalculateBookRating('book-1');

            expect(result.averageRating).to.equal(0);
            expect(result.totalReviews).to.equal(0);
            
            expect(updateStub.firstCall.args[0]).to.deep.equal({ averageRating: 0 });
        });
    });
});
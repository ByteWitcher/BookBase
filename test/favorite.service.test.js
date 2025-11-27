import { expect } from 'chai';
import sinon from 'sinon';
import favoriteService from '../src/services/favorite.service.js';
import favoriteRepository from '../src/repositories/favorite.repository.js';
import Book from '../src/entities/book.entity.js';

describe('FavoriteService', () => {

    // addToFavorites()
    describe('addToFavorites()', () => {
        afterEach(() => sinon.restore());

        it('throws if book not found', async () => {
            sinon.stub(Book, 'findByPk').resolves(null);

            try {
                await favoriteService.addToFavorites('user-1', 'book-1');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book not found');
            }
        });

        it('throws if book is not visible', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                title: 'Test Book',
                isActive: false
            });

            try {
                await favoriteService.addToFavorites('user-1', 'book-1');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book is not available');
            }
        });

        it('adds book to favorites successfully', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                title: 'Test Book',
                isActive: true
            });

            sinon.stub(favoriteRepository, 'addFavorite').resolves({
                userId: 'user-1',
                bookId: 'book-1'
            });

            const result = await favoriteService.addToFavorites('user-1', 'book-1');

            expect(result.message).to.equal('Book added to favorites');
            expect(result.bookId).to.equal('book-1');
        });

        it('throws if book already in favorites', async () => {
            sinon.stub(Book, 'findByPk').resolves({
                id: 'book-1',
                title: 'Test Book',
                isActive: true
            });

            sinon.stub(favoriteRepository, 'addFavorite').rejects(new Error('Book already in favorites'));

            try {
                await favoriteService.addToFavorites('user-1', 'book-1');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Book already in favorites');
            }
        });
    });

    // removeFromFavorites()
    describe('removeFromFavorites()', () => {
        afterEach(() => sinon.restore());

        it('throws if favorite not found', async () => {
            sinon.stub(favoriteRepository, 'removeFavorite').resolves(0);

            try {
                await favoriteService.removeFromFavorites('user-1', 'book-1');
                throw new Error('Expected error');
            } catch (err) {
                expect(err.message).to.equal('Favorite not found');
            }
        });

        it('removes favorite successfully', async () => {
            sinon.stub(favoriteRepository, 'removeFavorite').resolves(1);

            const result = await favoriteService.removeFromFavorites('user-1', 'book-1');

            expect(result.message).to.equal('Book removed from favorites');
            expect(result.bookId).to.equal('book-1');
        });
    });

    // getUserFavorites()
    
    describe('getUserFavorites()', () => {
    afterEach(() => sinon.restore());

    it('returns empty array if no favorites', async () => {
        // Maintenant on simule le format { rows: [], count: 0 }
        sinon.stub(favoriteRepository, 'getUserFavorites').resolves({
            rows: [],
            count: 0
        });

        const result = await favoriteService.getUserFavorites('user-1', { limit: 10, offset: 0 });

        expect(result.favorites).to.deep.equal([]);
        expect(result.total).to.equal(0);
        expect(result.page).to.equal(1);
        expect(result.totalPages).to.equal(0);
    });

    it('returns user favorites successfully', async () => {
        // Format findAndCountAll
        sinon.stub(favoriteRepository, 'getUserFavorites').resolves({
            rows: [
                { book: { id: 'book-1', title: 'Book 1' } },
                { book: { id: 'book-2', title: 'Book 2' } }
            ],
            count: 2
        });

        const result = await favoriteService.getUserFavorites('user-1', { limit: 10, offset: 0 });

        expect(result.favorites).to.have.lengthOf(2);
        expect(result.total).to.equal(2);
        expect(result.page).to.equal(1);
        expect(result.totalPages).to.equal(1);
    });

    it('calculates pagination correctly', async () => {
    sinon.stub(favoriteRepository, 'getUserFavorites').resolves({
        rows: [
            { book: { id: 'book-11', title: 'Book 11' } },
            { book: { id: 'book-12', title: 'Book 12' } } 
        ],
        count: 25
    });

    const result = await favoriteService.getUserFavorites('user-1', { limit: 10, offset: 10 });

    expect(result.favorites).to.have.lengthOf(2); 
    expect(result.total).to.equal(25);
    expect(result.page).to.equal(2);
    expect(result.totalPages).to.equal(3);
    });
});
});

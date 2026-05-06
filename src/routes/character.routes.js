const characterController = require('../controllers/character.controller');
const ROLES = require('../enums/roles');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

const characterRoutes = [
    // Public endpoints
    {
        url: '/characters',
        method: 'GET',
        handler: characterController.getAllCharactersController,
    },
    {
        url: '/characters/:character_id',
        method: 'GET',
        handler: characterController.getCharacterByIdController,
    },
    {
        url: '/characters/:character_id/books/:book_id',
        method: 'GET',
        handler: characterController.getBookByIdController,
    },

    // Admin only endpoints
    {
        url: '/characters',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.createCharacterController,
    },
    {
        url: '/characters/:character_id',
        method: 'PUT',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.updateCharacterController,
    },
    {
        url: '/characters/:character_id/books',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.addBookToCharacterController,
    },
    {
        url: '/characters/:character_id/books/:book_id',
        method: 'PUT',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.updateBookController,
    },
    {
        url: '/characters/:character_id/books',
        method: 'DELETE',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.removeBookFromCharacterController,
    }
];

module.exports = characterRoutes;
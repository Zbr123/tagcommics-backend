const characterController = require('../controllers/character.controller');
const ROLES = require('../enums/roles');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

const characterRoutes = [
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
        url: '/characters',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.createCharacterController,
    }
];

module.exports = characterRoutes;
const characterController = require('../controllers/character.controller');
const ROLES = require('../enums/roles');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

const characterRoutes = [
    {
        url: '/characters',
        method: 'GET',
        handler: characterController.getAllCharactersController,
        schema: {
            description: 'Get all characters with their associated comics',
            tags: ['Characters'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    character_id: { type: 'string' },
                                    character_name: { type: 'string' },
                                    description: { type: 'string' },
                                    total_books_appeared_in: { type: 'integer' },
                                    image: { type: 'string' },
                                    tags: { type: 'array', items: { type: 'string' } },
                                    first_appearance: { type: 'string' },
                                    creator: { type: 'string' },
                                    alignment: { type: 'string' },
                                    comics: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                comic_id: { type: 'string' },
                                                title: { type: 'string' },
                                                issue_number: { type: 'integer' },
                                                series_name: { type: 'string' },
                                                cover_image_url: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        url: '/characters/:character_id',
        method: 'GET',
        handler: characterController.getCharacterByIdController,
        schema: {
            description: 'Get a single character by ID with their associated comics',
            tags: ['Characters'],
            params: {
                type: 'object',
                properties: {
                    character_id: { type: 'string', format: 'uuid' }
                },
                required: ['character_id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                character_id: { type: 'string' },
                                character_name: { type: 'string' },
                                description: { type: 'string' },
                                total_books_appeared_in: { type: 'integer' },
                                image: { type: 'string' },
                                tags: { type: 'array', items: { type: 'string' } },
                                first_appearance: { type: 'string' },
                                creator: { type: 'string' },
                                alignment: { type: 'string' },
                                comics: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            comic_id: { type: 'string' },
                                            title: { type: 'string' },
                                            issue_number: { type: 'integer' },
                                            series_name: { type: 'string' },
                                            cover_image_url: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        url: '/characters',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: characterController.createCharacterController,
        schema: {
            description: 'Create a new character (Admin only)',
            tags: ['Characters'],
            body: {
                type: 'object',
                properties: {
                    character_name: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    first_appearance: { type: 'string' },
                    creator: { type: 'string' },
                    alignment: { type: 'string' }
                },
                required: ['character_name']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                character_id: { type: 'string' },
                                character_name: { type: 'string' },
                                description: { type: 'string' },
                                total_books_appeared_in: { type: 'integer' },
                                image: { type: 'string' },
                                tags: { type: 'array', items: { type: 'string' } },
                                first_appearance: { type: 'string' },
                                creator: { type: 'string' },
                                alignment: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }
];

module.exports = characterRoutes;
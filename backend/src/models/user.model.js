// Importuje scentralizowaną instancję Knex, nie tworząc nowej.
const knex = require('../config/database');

// Znajduje użytkownika po jego firebase_uid.
const findByFirebaseId = (firebaseUid) => {
  return knex('users').where({ firebase_uid: firebaseUid }).first();
};

const create = (userData) => {
  return knex('users').insert(userData).returning('*');
};

module.exports = {
  findByFirebaseId,
  create,
};
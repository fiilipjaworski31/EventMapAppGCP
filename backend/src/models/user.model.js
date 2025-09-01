// Importuje scentralizowaną instancję Knex, nie tworząc nowej.
const knex = require('../config/database');

// Znajduje użytkownika po jego firebase_uid.
const findByFirebaseId = (firebaseUid) => {
  return knex('users').where({ firebase_uid: firebaseUid }).first();
};

module.exports = {
  findByFirebaseId,
};
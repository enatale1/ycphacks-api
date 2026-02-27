'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.removeConstraint(
          'Prize',
          'Prize_ibfk_2'
      );

      await queryInterface.addConstraint('Prize', {
          fields: ['categoryId'],
          type: 'foreign key',
          name: 'Prize_categoryId_fkey',
          references: {
              table: 'HackCategory',
              field: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
      });
  },

  async down (queryInterface, Sequelize) {
      // Remove CASCADE constraint
      await queryInterface.removeConstraint(
          'Prize',
          'Prize_categoryId_fkey'
      );

      // Recreate original FK without cascade
      await queryInterface.addConstraint('Prize', {
          fields: ['categoryId'],
          type: 'foreign key',
          name: 'Prize_ibfk_2',
          references: {
              table: 'HackCategory',
              field: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
      });
  }
};

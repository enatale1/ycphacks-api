'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. User
    await queryInterface.createTable('User', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      firstName: { type: Sequelize.STRING(50), allowNull: false },
      lastName: { type: Sequelize.STRING(50), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('participant','staff','oscar'), defaultValue: 'participant' },
      phoneNumber: { type: Sequelize.STRING(20), allowNull: false },
      age: { type: Sequelize.INTEGER, allowNull: false },
      gender: { type: Sequelize.STRING(50), allowNull: true },
      country: { type: Sequelize.STRING(50), allowNull: false },
      tShirtSize: { type: Sequelize.STRING(5), allowNull: false },
      dietaryRestrictions: { type: Sequelize.STRING(255), allowNull: true },
      school: { type: Sequelize.STRING(255), allowNull: false },
      major: { type: Sequelize.STRING(255), allowNull: true },
      graduationYear: { type: Sequelize.INTEGER, allowNull: true },
      levelOfStudy: { type: Sequelize.STRING(100), allowNull: false },
      hackathonsAttended: { type: Sequelize.INTEGER, defaultValue: 0 },
      pronouns: { type: Sequelize.STRING(255), allowNull: true },
      linkedInUrl: { type: Sequelize.STRING(255), allowNull: true },
      checkIn: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      mlhCodeOfConduct: { type: Sequelize.BOOLEAN, allowNull: false },
      mlhPrivacyPolicy: { type: Sequelize.BOOLEAN, allowNull: false },
      mlhEmails: { type: Sequelize.BOOLEAN, defaultValue: false },
      isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      isBanned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 2. Event
    await queryInterface.createTable('Event', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      eventName: { type: Sequelize.STRING(100), allowNull: false },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: false },
      canChange: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 3. Analytics
    await queryInterface.createTable('Analytics', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      year: { type: Sequelize.INTEGER, allowNull: false },
      gender: { type: Sequelize.STRING(50), allowNull: true },
      country: { type: Sequelize.STRING(100), allowNull: true },
      school: { type: Sequelize.STRING(255), allowNull: true },
      hackathonsAttended: { type: Sequelize.INTEGER, allowNull: true },
      numOfParticipants: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 4. AuditLog
    await queryInterface.createTable('AuditLog', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      tableName: { type: Sequelize.STRING(255), allowNull: false },
      recordId: { type: Sequelize.INTEGER, allowNull: false },
      action: { type: Sequelize.ENUM('CREATE','UPDATE','DELETE'), allowNull: false },
      oldValue: { type: Sequelize.JSON, allowNull: true },
      newValue: { type: Sequelize.JSON, allowNull: true },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 5. SponsorTier
    await queryInterface.createTable('SponsorTier', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      tier: { type: Sequelize.CHAR(255), allowNull: false },
      lowerThreshold: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER, allowNull: true },
      height: { type: Sequelize.INTEGER, allowNull: true },
    });

    // 6. Image
    await queryInterface.createTable('Image', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      url: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 7. Sponsor
    await queryInterface.createTable('Sponsor', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      sponsorName: { type: Sequelize.STRING(255), allowNull: false },
      sponsorWebsite: { type: Sequelize.STRING(255), allowNull: false },
      sponsorImageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Image', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true }
    });

    // 8. Team
    await queryInterface.createTable('Team', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Event', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      teamName: { type: Sequelize.STRING(100), allowNull: false },
      projectName: { type: Sequelize.STRING(100), allowNull: true },
      projectDescription: { type: Sequelize.STRING(255), allowNull: true },
      presentationLink: { type: Sequelize.STRING(255), allowNull: true },
      githubLink: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 9. Hardware
    await queryInterface.createTable('Hardware', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      hardwareName: { type: Sequelize.STRING(100), allowNull: false },
      serial: { type: Sequelize.STRING(255), allowNull: false },
      whoHasId: { type: Sequelize.INTEGER, allowNull: true },
      description: { type: Sequelize.STRING(255), allowNull: true },
      functional: { type: Sequelize.BOOLEAN, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 10. HardwareImage
    await queryInterface.createTable('HardwareImage', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      imageUrl: { type: Sequelize.STRING(255), allowNull: false },
      hardwareId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Hardware', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 11. HackCategory
    await queryInterface.createTable('HackCategory', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      categoryName: { type: Sequelize.STRING(100), allowNull: false },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Event', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 12. Prize
    await queryInterface.createTable('Prize', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Event', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      prizeName: { type: Sequelize.STRING(100), allowNull: false },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'HackCategory', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      placement: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 13. EventParticipant
    await queryInterface.createTable('EventParticipant', {
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Event', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'User', key: 'id' },
        onUpdate: 'CASCADE',
        primaryKey: true
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Team', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // 14. EventSponsor
    await queryInterface.createTable('EventSponsor', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      sponsorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Sponsor', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sponsorTierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'SponsorTier', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Event', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse order to satisfy FK constraints
    await queryInterface.dropTable('EventSponsor');
    await queryInterface.dropTable('EventParticipant');
    await queryInterface.dropTable('Prize');
    await queryInterface.dropTable('HackCategory');
    await queryInterface.dropTable('HardwareImage');
    await queryInterface.dropTable('Hardware');
    await queryInterface.dropTable('Team');
    await queryInterface.dropTable('Sponsor');
    await queryInterface.dropTable('Image');
    await queryInterface.dropTable('SponsorTier');
    await queryInterface.dropTable('AuditLog');
    await queryInterface.dropTable('Analytics');
    await queryInterface.dropTable('Activity');
    await queryInterface.dropTable('Event');
    await queryInterface.dropTable('User');
  }
};

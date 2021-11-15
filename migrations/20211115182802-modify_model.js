"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.changeColumn("SkillCohortResources", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.changeColumn("SkillCohortParticipants", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.changeColumn("SkillCohortGroupings", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      // queryInterface.changeColumn(
      //   "SkillCohortGroupingMembers",
      //   "SkillCohortGroupingId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortGroupings",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortGroupingMembers",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResourceResponses",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResourceResponses",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortResourceResponseId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResourceResponses",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortResourceResponseId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResourceResponses",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // return await Promise.all([
    //   queryInterface.removeColumn("SkillCohortResources", "SkillCohortId"),
    //   queryInterface.removeColumn("SkillCohortParticipants", "SkillCohortId"),
    //   queryInterface.removeColumn("SkillCohortGroupings", "SkillCohortId"),
    //   queryInterface.removeColumn(
    //     "SkillCohortGroupingMembers",
    //     "SkillCohortGroupingId"
    //   ),
    // ]);
    return Promise.all([
      queryInterface.changeColumn("SkillCohortResources", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.changeColumn("SkillCohortParticipants", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.changeColumn("SkillCohortGroupings", "SkillCohortId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "SkillCohorts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      // queryInterface.changeColumn(
      //   "SkillCohortGroupingMembers",
      //   "SkillCohortGroupingId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortGroupings",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortGroupingMembers",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResourceResponses",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResourceResponses",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseAssessments",
      //   "SkillCohortResourceResponseId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResourceResponses",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortParticipantId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortParticipants",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortResourceId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResources",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
      // queryInterface.changeColumn(
      //   "SkillCohortResponseRatings",
      //   "SkillCohortResourceResponseId",
      //   {
      //     type: Sequelize.INTEGER,
      //     allowNull: true,
      //     references: {
      //       model: "SkillCohortResourceResponses",
      //       key: "id",
      //     },
      //     onUpdate: "CASCADE",
      //     onDelete: "CASCADE",
      //   }
      // ),
    ]);
  },
};

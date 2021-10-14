const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const moment = require('moment-timezone')
const qs = require('query-string')

const SkillCohortResponseAssessment = db.SkillCohortResponseAssessment

const SkillCohortResourceResponseAssessmentController = () => {
    const create = async (req, res) => {
        const { body } = req

        try {
            const skillCohortResourceResponseAssessment = await SkillCohortResponseAssessment.create({
                ...body
            })

            return res.status(HttpCodes.OK).json({ skillCohortResourceResponseAssessment })
        } catch(error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const getAllAssessmentByIds = async (req, res) => {
        const { resourceId: SkillCohortResourceId, participantId: SkillCohortParticipantId } = req.params
        const { ids } = req.query
        const parsedIds = qs.parse(`ids=${ids}`, {arrayFormat: 'comma'})

        try {
            const allSkillCohortResourceResponseAssessments = await SkillCohortResponseAssessment.findAll({
                where: {
                    SkillCohortResourceId,
                    SkillCohortParticipantId,
                    SkillCohortResourceResponseId: {
                        [Op.in]: parsedIds.ids
                    }
                }
            })

            return res.status(HttpCodes.OK).json({ allSkillCohortResourceResponseAssessments })
        } catch(error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const upsertAssessment = async (req, res) => {
        const { body } = req

        try {
            const [skillCohortResourceResponseAssessment, isCreated] = await SkillCohortResponseAssessment.upsert(body.payload, {
                returning: true
            })

            const allSkillCohortResourceResponseAssessments = await SkillCohortResponseAssessment.findAll({
                where: {
                    SkillCohortResourceId: skillCohortResourceResponseAssessment.SkillCohortResourceId,
                    SkillCohortParticipantId: skillCohortResourceResponseAssessment.SkillCohortParticipantId,
                }
            })

            return res.status(HttpCodes.OK).json({ allSkillCohortResourceResponseAssessments })
        } catch(error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    return {
        create,
        getAllAssessmentByIds,
        upsertAssessment
    }
}

module.exports = SkillCohortResourceResponseAssessmentController
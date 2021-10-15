const db = require("../models");
const { Op } = require("sequelize");
const moment = require('moment-timezone') 
const { chunk, shuffle, compact, isEmpty } = require('lodash')
const HttpCodes = require("http-codes");

const SkillCohortParticipantController = require('./SkillCohortParticipantController')
const SkillCohortController = require('./SkillCohortController')

const SkillCohortGrouping = db.SkillCohortGrouping
const SkillCohortGroupingMember = db.SkillCohortGroupingMember

const SkillCohortGroupingsController = () => {

    const createSkillCohortGroups = async () => {
        try {
            const allSkillCohorts = await SkillCohortController().getAllActiveSkillCohorts()
            const jaggedListOfSkillCohortParticipants = await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohort(allSkillCohorts)

            const groupedSkillCohortParticipants = jaggedListOfSkillCohortParticipants.map(listOfSkillCohortParticipants => {
                const length = listOfSkillCohortParticipants.length

                if (length > 0) {
                    const remainder = length % 5
                    const shuffledListOfSkillCohortParticipants = shuffle(listOfSkillCohortParticipants)

                    if (remainder >= 3) {
                        return chunk(shuffledListOfSkillCohortParticipants, 3)
                    } else {
                        const remainderSkillCohortParticipant = shuffledListOfSkillCohortParticipants.slice(length - remainder, length)
                        const splicedListOfSkillCohortParticipants = shuffledListOfSkillCohortParticipants.splice(0, length - remainder)
                        const chunkedListOfSkillCohortParticipants = chunk(splicedListOfSkillCohortParticipants, 5)

                        if (!isEmpty(chunkedListOfSkillCohortParticipants)) {
                            chunkedListOfSkillCohortParticipants[0].push(...remainderSkillCohortParticipant)
                        } else {
                            chunkedListOfSkillCohortParticipants.push(remainderSkillCohortParticipant)
                        }

                        return chunkedListOfSkillCohortParticipants
                    }
                }
            })

            const compactGroupedSkillCohortParticipants = compact(groupedSkillCohortParticipants)
            const dateToday = moment().tz("Americas/Los_Angeles")

            compactGroupedSkillCohortParticipants.map((jaggedParticipants) => {
                const SkillCohortId = jaggedParticipants[0][0].dataValues.SkillCohortId
                const skillCohort = allSkillCohorts.find((skillCohort) => skillCohort.id === SkillCohortId)
                const startDate = moment(skillCohort.dataValues.startDate).tz("America/Los_Angeles")
                const currentWeekNumber = dateToday.diff(startDate, "weeks") + 1

                jaggedParticipants.map(async (listOfParticipants, y) => {
                    const skillCohortGroup = await SkillCohortGrouping.create({
                        SkillCohortId,
                        currentWeekNumber,
                        groupNumber: y + 1,
                    })

                    listOfParticipants.map(async (participant) => {
                        const ParticipantId = participant.dataValues.id
                        const UserId = participant.dataValues.UserId

                        await SkillCohortGroupingMember.create({
                            UserId,
                            SkillCohortGroupingId: skillCohortGroup.id,
                            SkillCohortParticipantId: ParticipantId,
                            numberOfCommentStrike: 0,
                            numberOfAssessmentStrike: 0,
                        })
                    })
                })
            })
        } catch (error) {
            console.log(error)
        }
    }

    const getAll = async (req, res) => {
        const { cohortId: SkillCohortId, currentWeekNumber } = req.params

        try {
            allSkillCohortGroupings = await SkillCohortGrouping.findAll({
                where: {
                    SkillCohortId,
                    currentWeekNumber
                },
                include: {
                    model: SkillCohortGroupingMember,
                }
            })

            return res.status(HttpCodes.OK).json({ allSkillCohortGroupings })
        } catch(error) {
            console.error(error)

            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const get = async (req, res) => {
        const { groupId } = req.params

        try {
            const skillCohortGrouping = await SkillCohortGrouping.findOne({
                where: {
                    id: groupId
                }
            })
            
            if (!skillCohortGrouping) {
                return res.status(HttpCodes.BAD_REQUEST).json({
                    msg: "Grouping not found"
                })
            }

            return res.status(HttpCodes.OK).json({ skillCohortGrouping })
        } catch(error) {
            console.error(error)

            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const update = async (req, res) => {
        const { body } = req
        const { groupId } = req.params

        try {
            const skillCohortGrouping = await SkillCohortGrouping.findOne({
                where: {
                    id: groupId
                }
            })

            if (!skillCohortGrouping) {
                return res.status(HttpCodes.BAD_REQUEST).json({
                    msg: "Not found"
                })
            }

            const [numberOfAffectedRows, affectedRows] = await SkillCohortGrouping.update(body, {
                where: {
                    id: groupId
                }
            })

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
        } catch(error) {
            console.error(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    return {
        createSkillCohortGroups,
        getAll,
        get,
        update
    }
}

module.exports = SkillCohortGroupingsController
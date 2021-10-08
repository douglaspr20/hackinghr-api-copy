const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");

const SkillCohortResources = db.SkillCohortResources

const SkillCohortResourcesController = () => {
    const create = async (req, res) => {
        const { body } = req

        try {
            const skillCohortResource = await SkillCohortResources.create({...body})
            
            return res.status(HttpCodes.OK).json({ skillCohortResource })
        } catch(error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const getAll = async (req, res) => {
        const { startDate } = req.query
        const { skillCohortId } = req.params

        let where = {
            SkillCohortId: skillCohortId
        }

        try {
            if (startDate) {
                where = {
                    ...where,
                    releaseDate: {
                        [Op.gte]: startDate
                    }
                }
            }
            
            const skillCohortResources = await SkillCohortResources.findAll({
                where,
                order: [["releaseDate"]]
            })

            return res.status(HttpCodes.OK).json({ skillCohortResources })
        } catch(error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal Server error",
                error
            })
        }
    }

    const get = async (req, res) => {
        const { resourceId } = req.params

        if (resourceId) {
            try {
                const skillCohortResource = await SkillCohortResources.findOne({
                    where: {
                        id: resourceId
                    }
                })

                if (!skillCohortResource) {
                    return res.status(HttpCodes.BAD_REQUEST).json({ msg: "Bad Request: Skill Cohort Resource not found."})
                }

                return res.status(HttpCodes.OK).json({ skillCohortResource })
            } catch(error) {
                console.log(error)
                return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error."})
            }
        }
    }

    const remove = async (req, res) => {
        const { resourceId } = req.params

        if (resourceId) {
            try {
                await SkillCohortResources.destroy({
                    where: {
                        id: resourceId
                    }
                })
                return res.status(HttpCodes.OK).json({})
            }catch (error) {
                console.log(error)
                return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error"})
            }
        }

        return res.status(HttpCodes.BAD_REQUEST).json({ msg: "Bad Request: Skill Cohort id is wrong."})
    }

    const update = async (req, res) => {
        const { resourceId } = req.params
        const reqSkillCohortResource = req.body

        if (resourceId) {
            try {
                const [numberOfAffectedRows, affectedRows] = await SkillCohortResources.update(
                    reqSkillCohortResource,
                    {
                        where: { id: resourceId },
                        returning: true,
                        plain: true
                    }
                )

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            } catch(error) {
                console.log(error)
                return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
            }
        }
    }

    return {
        create,
        getAll,
        get,
        remove,
        update
    }
}

module.exports = SkillCohortResourcesController
const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");

const SkillCohort = db.SkillCohort

const SkillCohortController = () => {
    const create = async (req, res) => {
        const { body } = req

        try {
            let skillCohortInfo = {
                ...body
            }
            
            if (skillCohortInfo.image) {
                skillCohortInfo.image = await s3Service().getSkillCohortImageUrl(
                    "",
                    skillCohortInfo.image
                );
            } 

            const skillCohort = await SkillCohort.create(skillCohortInfo)

            return res.status(HttpCodes.OK).json({ skillCohort })
        } catch (error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal server error",
                error
            })
        }
    }

    const get = async (req, res) => {
        const { id } = req.params

        if(id) {
            try {
                const skillCohort = await SkillCohort.findOne({
                    where: {
                        id
                    }
                })

                if (!skillCohort) {
                    return res.status(HttpCodes.BAD_REQUEST).json({ msg: "Bad Request: Skill Cohort not found."})
                }

                return res.status(HttpCodes.OK).json({ skillCohort })
            } catch (error) {
                console.log(error)
                return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error."})
            }
        }
    }

    const getAll = async (req, res) => {
        const filter = req.query
        let where = {}

        try {
            if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
                where = {
                    ...where,
                    categories: {
                        [Op.overlap]: JSON.parse(filter.topics)
                    },
                }
            }

            const skillCohorts = await SkillCohort.findAll({
                where,
                order: [["title"]],
            })
            
            return res.status(HttpCodes.OK).json({ skillCohorts })
        } catch (error) {
            console.log(error)
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                msg: "Internal Server error",
                error
            })
        }
    }

    const update = async (req, res) => {
        const { id } = req.params
        const reqSkillCohort = req.body

        if (id) {
            try {
                const skillCohortInfo = {
                    ...reqSkillCohort
                }

                const fetchedSkillCohort = await SkillCohort.findOne({
                    where: {
                        id
                    }
                })

                if (!fetchedSkillCohort) {
                    return res.status(HttpCodes.BAD_GATEWAY).json({ msg: "Bad Request: Skill Cohort not found."})
                }

                if (reqSkillCohort.image && !isValidURL(reqSkillCohort.image)) {
                    skillCohortInfo.image = await s3Service().getSkillCohortImageUrl(
                        "",
                        reqSkillCohort.image
                    )

                    if (fetchedSkillCohort.image) {
                        await s3Service().deleteUserPicture(fetchedSkillCohort.image);
                    }
                }

                if (fetchedSkillCohort.image && !reqSkillCohort.image) {
                    await s3Service().deleteUserPicture(fetchedSkillCohort.image);
                }

                const [numberOfAffectedRows, affectedRows] = await SkillCohort.update(
                    skillCohortInfo,
                    {
                        where: { id },
                        returning: true,
                        plain: true
                    }
                )

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            } catch (error) {
                console.log(error)
                return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
            }
        }
    }

    const remove = async (req, res) => {
        const { id } = req.params

        if (id) {
            try {
                await SkillCohort.destroy({
                    where: {
                        id,
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

    return {
        create,
        getAll,
        get,
        remove,
        update,
    }
}

module.exports = SkillCohortController


const db = require('../models');
const HttpCodes = require('http-codes');
const smtpService = require('../services/smtp.service');
const { EmailContent } = require('../enum');

const SkillCohortParticipant = db.SkillCohortParticipant;
const SkillCohort = db.SkillCohort;

const SkillCohortParticipantController = () => {
	/**
	 * Create a skill cohort participant
	 * @param {*} req
	 * @param {*} res
	 */
	const create = async (req, res) => {
		const { SkillCohortId, UserId } = req.body;
		const { user } = req;

		try {
			const skillCohortParticipant = await SkillCohortParticipant.create({
				SkillCohortId,
				UserId,
			});
			const skillCohort = await SkillCohort.findOne({
				where: {
					id: SkillCohortId,
				},
			});

			if (skillCohort) {
				const mailOptions = {
					from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
					to: user.email,
					subject: `Confirmation`,
					html: EmailContent.JOIN_COHORT_EMAIL(user, skillCohort),
					contentType: 'text/html',
				};

				await smtpService().sendMail(mailOptions);

				return res
					.status(HttpCodes.OK)
					.json({ skillCohortParticipant });
			}

			return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
				msg: 'Internal server error',
				error,
			});
		} catch (error) {
			console.log(error);
			return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
				msg: 'Internal server error',
				error,
			});
		}
	};

	/**
	 * Get a skill cohort participant
	 * @param {*} req
	 * @param {*} res
	 */
	const get = async (req, res) => {
		const { skillCohortId, userId } = req.params;

		try {
			const skillCohortParticipant = await SkillCohortParticipant.findOne(
				{
					where: {
						SkillCohortId: skillCohortId,
						UserId: userId,
					},
				},
			);

			if (!skillCohortParticipant) {
				return res.status(HttpCodes.BAD_REQUEST).json({
					msg: 'Bad Request: Skill Cohort Participant not found.',
				});
			}

			return res.status(HttpCodes.OK).json({ skillCohortParticipant });
		} catch (error) {
			return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
				msg: 'Internal server error',
				error,
			});
		}
	};

	/**
	 * Get all skill cohort participants
	 * @param {*} req
	 * @param {*} res
	 */
	const getAll = async (req, res) => {
		const { skillCohortId } = req.params;

		let where = {};
		try {
			if (skillCohortId) {
				where = {
					SkillCohortId: skillCohortId,
				};
			}

			const allSkillCohortParticipants =
				await SkillCohortParticipant.findAll({
					where,
					include: db.User,
				});

			return res
				.status(HttpCodes.OK)
				.json({ allSkillCohortParticipants });
		} catch (error) {
			console.log(error);
			return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
				msg: 'Internal Server error',
				error,
			});
		}
	};

	/**
	 * Get all participants in a skill cohort
	 * @param {*} req
	 * @param {*} res
	 */
	const getParticipantInAllCohortById = async (req, res) => {
		const { userId } = req.params;

		let where = {};
		try {
			if (userId) {
				where = {
					UserId: userId,
					hasAccess: 'TRUE',
				};
			}

			const allSkillCohortParticipants =
				await SkillCohortParticipant.findAll({
					where,
					include: db.User,
				});

			return res
				.status(HttpCodes.OK)
				.json({ allSkillCohortParticipants });
		} catch (error) {
			console.log(error);
			return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
				msg: 'Internal Server error',
				error,
			});
		}
	};

	/**
	 * Get each of all skill cohort participants by the given skill cohort resources
	 * @param {*} skillCohortResources
	 */
	const getAllParticipantsByListOfSkillCohortResources = async (
		skillCohortResources,
	) => {
		const participants = skillCohortResources.map((resource) => {
			const id = resource.SkillCohortId;

			return SkillCohortParticipant.findAll({
				where: {
					SkillCohortId: id,
					hasAccess: 'TRUE',
				},
				include: db.User,
			});
		});

		return Promise.all(participants);
	};

	/**
	 * Get all participants by the list of skill cohort
	 * @param {*} allSkillCohorts
	 */
	const getAllParticipantsByListOfSkillCohort = async (allSkillCohorts) => {
		const participants =
			allSkillCohorts.map((skillCohort) => {
				return SkillCohortParticipant.findAll({
					where: {
						SkillCohortId: skillCohort.id,
						hasAccess: 'TRUE',
					},
					include: db.User,
					raw: true,
					nest: true,
				});
			}) || [];

		return Promise.all(participants);
	};

	/**
	 * Increment comment strike
	 * @param {*} participant
	 * @param {*} SkillCohortId
	 */
	const incrementCommentStrike = async (participant, SkillCohortId) => {
		try {
			await SkillCohortParticipant.increment(
				{
					numberOfCommentStrike: +1,
				},
				{
					where: {
						SkillCohortId,
						id: participant.id,
					},
				},
			);
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Increment assessment strike
	 * @param {*} participant
	 * @param {*} SkillCohortId
	 */
	const incrementAssessmentStrike = async (participant, SkillCohortId) => {
		try {
			await SkillCohortParticipant.increment(
				{
					numberOfAssessmentStrike: +1,
				},
				{
					where: {
						SkillCohortId,
						id: participant.id,
					},
				},
			);
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Remove participant access
	 * @param {*} participant
	 * @param {*} SkillCohortId
	 */
	const removeParticipantAccess = async (participant, SkillCohortId) => {
		try {
			await SkillCohortParticipant.update(
				{
					hasAccess: 'FALSE',
				},
				{
					where: {
						SkillCohortId,
						id: participant.id,
					},
				},
			);
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Reset strike counters
	 */
	const resetCounter = async () => {
		try {
			SkillCohortParticipant.update(
				{
					numberOfCommentStrike: 0,
					numberOfAssessmentStrike: 0,
				},
				{
					where: {
						hasAccess: 'TRUE',
					},
				},
			);
		} catch (error) {
			console.log(error);
		}
	};

	return {
		create,
		get,
		getAll,
		getAllParticipantsByListOfSkillCohortResources,
		getParticipantInAllCohortById,
		getAllParticipantsByListOfSkillCohort,
		incrementCommentStrike,
		removeParticipantAccess,
		resetCounter,
		incrementAssessmentStrike,
	};
};

module.exports = SkillCohortParticipantController;

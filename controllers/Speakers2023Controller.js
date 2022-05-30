const db = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");

const User = db.User;
const SpeakersPanel = db.SpeakerPanel;
const SpeakerMemberPanel = db.SpeakerMemberPanel

const SpeakersController = () => {

    const addNewPanelSpeaker = async (req, res) => {
        const { panels } = req.body;

        const { OwnerId, description, endDate, startDate, timeZone, panelName } = panels

        try {

            const user = await User.findOne({
                where: { id: OwnerId, role: "admin" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.NOT_FOUND)
                .json({ msg: "You must to be admin" });
            }

            await SpeakersPanel.create({
                OwnerId, 
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName
            })

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const allPanelSpeakers = async (req, res) => {
        const { id } = req.user.dataValues;

        try {

            const { dataValues: user } = await User.findOne({
                where: { id: id, speakersAuthorization: "accepted" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.NOT_FOUND)
                .json({ msg: "Host user not found" });
            }

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const addUserSpeakerToPanel = async (req, res) => {
        const { data } = req.body;

        const { id } = req.user.dataValues;

        let panelsSpeakers

        try {

            const user = await User.findOne({
                where: { id: id }
            });

            if (user) {

                if(user.dataValues.role === "admin"){
                    await data?.usersNames.map(async (idMap) => {
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: idMap, SpeakersPanelId: data.idPanel},
                        })

                        const panel = await SpeakersPanel.findOne({
                            where: {id: data.idPanel},
                        })
                         
                        const user = await User.findOne({
                            where: {id: idMap},
                        })

                        if(!userReadyJoin){

                            await Promise.resolve(
                                (() => {
                                  let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.dataValues.email,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user.dataValues.firstName,panel.dataValues.panelName),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user.dataValues.firstName,
                                        panel.dataValues,
                                    ),
                                  };
                       
                                  return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );

                            await SpeakerMemberPanel.create({
                                UserId: idMap, 
                                SpeakersPanelId: data.idPanel, 
                                isModerator: data.bul, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
        
                    panelsSpeakers = await SpeakersPanel.findAll({
                        order: [["id", "DESC"]],
                        include: [
                            {
                                model: SpeakerMemberPanel,
                                include: [
                                    {
                                        model: User,
                                        attributes: [
                                            "id",
                                            "firstName",
                                            "lastName",
                                            "titleProfessions",
                                            "img",
                                            "abbrName"
                                        ],
                                    }
                                ]
                            }
                        ],
                    })
                }else{
                    const userReadyJoin = await SpeakerMemberPanel.findOne({
                        where: { UserId: id, SpeakersPanelId: data.idPanel},
                    })

                    if(userReadyJoin){
                        return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: "You are ready join to this panel." });
                    }

                    const userLimit = await SpeakerMemberPanel.findAll({
                        where: { UserId: id },
                    })

                    if(userLimit.length > 1){
                        return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: "User can't join to more of two panels." });
                    }

                    const panel = await SpeakersPanel.findOne({
                        where: {id: data.idPanel},
                    })
                     
                    const user = await User.findOne({
                        where: {id: id},
                    })

                    await Promise.resolve(
                        (() => {
                          let mailOptions = {
                            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                            to: user.dataValues.email,
                            subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user.dataValues.firstName,panel.dataValues.panelName),
                            html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                user.dataValues.firstName,
                                panel.dataValues,
                            ),
                          };
               
                          return smtpService().sendMailUsingSendInBlue(mailOptions);
                        })()
                    );

                    await SpeakerMemberPanel.create({
                        UserId: data?.usersNames[0], 
                        SpeakersPanelId: data.idPanel, 
                        isModerator: data.bul, 
                    })
        
                    panelsSpeakers = await SpeakersPanel.findAll({
                        order: [["id", "DESC"]],
                        include: [
                            {
                                model: SpeakerMemberPanel,
                                include: [
                                    {
                                        model: User,
                                        attributes: [
                                            "id",
                                            "firstName",
                                            "lastName",
                                            "titleProfessions",
                                            "img",
                                            "abbrName"
                                        ],
                                    }
                                ]
                            }
                        ],
                    })
                }

            }else{
                return res
                    .status(HttpCodes.NOT_FOUND)
                    .json({ msg: "User not found" });
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const removeUserSpeakerToPanel = async (req, res) => {
        const { UserId } = req.body;

        const { id } = req.user.dataValues;

        try {

            const user = await User.findOne({
                where: { id: id, role: "admin" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.NOT_FOUND)
                .json({ msg: "You must to be admin" });
            }

            await SpeakerMemberPanel.destroy({
                where:{ id: UserId}
            })

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    return {
        addNewPanelSpeaker,
        allPanelSpeakers,
        addUserSpeakerToPanel,
        removeUserSpeakerToPanel
    }
}

module.exports = SpeakersController;